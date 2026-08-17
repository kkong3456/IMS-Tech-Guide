import express from "express";
import path from "path";
import fs from "fs";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: "5mb" }));

// Persistent User Queries Storage (질의사항 전용 저장소 - 답변은 저장하지 않음)
const DATA_DIR = path.join(process.cwd(), "data");
const QUERIES_FILE = path.join(DATA_DIR, "saved_queries.json");

try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
} catch (err) {
  console.warn("Could not create data directory, using memory fallback if needed:", err);
}

interface SavedQuery {
  id: string;
  query: string;
  timestamp: string;
  category?: string;
  starred?: boolean;
}

function loadSavedQueries(): SavedQuery[] {
  try {
    if (fs.existsSync(QUERIES_FILE)) {
      const data = fs.readFileSync(QUERIES_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Error reading saved_queries.json:", err);
  }
  return [];
}

function saveQueriesToFile(queries: SavedQuery[]) {
  try {
    fs.writeFileSync(QUERIES_FILE, JSON.stringify(queries, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing saved_queries.json:", err);
  }
}

// Helper to auto-categorize or record user query
function recordUserQuery(queryText: string): SavedQuery {
  const queries = loadSavedQueries();
  const trimmed = queryText.trim();
  
  // Categorize based on keywords
  let category = "일반/기타";
  if (/s-cscf|i-cscf|p-cscf|hss|cx|diameter|mgcf|im-mgw|sba/i.test(trimmed)) {
    category = "장비/아키텍처";
  } else if (/sip|register|invite|401|403|488|단말|chipset|snapdragon|exynos|sr-vcc/i.test(trimmed)) {
    category = "단말/프로토콜";
  } else if (/5g sa|5g nsa|vonr|volte|eps fallback|handover|slicing|긴급전화|ecall/i.test(trimmed)) {
    category = "무선망/5G";
  } else if (/jitter|지터|mos|packet loss|손실|evs|amr|품질|voc|qci|5qi/i.test(trimmed)) {
    category = "품질VOC/QoS";
  }

  const newEntry: SavedQuery = {
    id: `query-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    query: trimmed,
    timestamp: new Date().toISOString(),
    category,
    starred: false,
  };

  // Add to beginning
  queries.unshift(newEntry);
  // Keep last 500 queries
  if (queries.length > 500) {
    queries.length = 500;
  }

  saveQueriesToFile(queries);
  return newEntry;
}

// Lazy initialization for Gemini Client
let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not configured.");
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

const IMS_SYSTEM_INSTRUCTION = `당신은 무선 음성 통신 및 IMS(IP Multimedia Subsystem) 최고 기술 전문가이자 시니어 텔레콤 솔루션 아키텍트인 'IMS 테크-가이드(IMS Tech-Guide)'입니다.

3GPP 국제 표준 규격(TS 23.228, TS 24.229, TS 23.501, TS 23.502, TS 26.114, 3GPP Rel-15~Rel-18)과 4G VoLTE 및 5G VoNR 아키텍처에 완벽히 정통하여, 통신사 네트워크 엔지니어, 단말 개발자, 무선망 최적화 전문가, 품질 VOC 분석관들에게 정확하고 심도 깊은 기술적 답변을 제공합니다.

다음 4가지 핵심 전문 영역을 포괄하여 구체적이고 체계적인 해결책을 제시하세요:
1. **장비 및 아키텍처 (Equipment):**
   - IMS Core 구성요소: P-CSCF(Gm/Rx 연동, SIP 압축/보안), I-CSCF(HSS Cx UAR/LIR 쿼리 및 라우팅), S-CSCF(가입자 등록, 서비스 트리거, iFC, SIP 세션 제어).
   - 가입자 관리: HSS/UDM 연동, Cx/Zh 인터페이스(Diameter/HTTP/2 SBA), IMS-AKA 인증(RAND, AUTN, XRES, CK, IK).
   - PSTN/레거시 연동: MGCF(SIP ↔ ISUP/BICC), IM-MGW(RTP ↔ TDM/PCM 베어러 변환).
   - 5G SA SBA 통합: N5/Npcf를 통한 PCF 연동, SMF/UPF를 통한 5QI=1/5QI=5 QoS Flow 제어, UDM/AUSF 연동.

2. **단말 및 규격 (Terminal):**
   - 단말 칩셋(Snapdragon 8 Gen 2/3, MediaTek Dimensity, Exynos)의 VoLTE/VoNR 모뎀 프로토콜 스택.
   - 단말 등록: SIP REGISTER → 401 Unauthorized (Digest AKA Challenge) → 2nd REGISTER(RES 포함) → 200 OK, IPSec ESP Security Association 구축.
   - 음성 연속성: SR-VCC(Single Radio Voice Call Continuity, 4G->3G/2G), EPS Fallback(5G SA -> 4G E-UTRA Handover or Redirection with Measurement), VoNR Native Call.

3. **무선 환경 (Wireless Environment):**
   - 5G 망 구성: NSA (Option 3x: LTE MeNB + NR SgNB, EPC Core, VoLTE 기본) vs SA (Option 2: gNB + 5GC, VoNR 기본).
   - 네트워크 슬라이싱: eMBB 슬라이스 내 IMS APN 분리, 긴급전화(Emergency Call/eCall) 전용 E-P-CSCF 및 긴급 세션 ARP(Allocation and Retention Priority) 최우선 처리.
   - 핸드오버: VoNR to VoLTE Handover (N26 인터페이스 기반 핸드오버 vs N26 없는 Redirection) 및 품질 저하 시 Fast Return.

4. **품질 VOC 및 성능 지표 (Quality VOC):**
   - 핵심 QoS KPI: Jitter(지터 임계값 <20ms 권장, 5G VoNR 시 4G 대비 최대 80% 감소), Packet Loss Rate (<1%), Round Trip Time / Delay (<100ms), Throughput.
   - 음성 코덱: EVS (Enhanced Voice Services, 5.9~128kbps, SWB/FB), AMR-WB (12.65kbps G.722.2), AMR-NB.
   - MOS(Mean Opinion Score) 품질 분석 및 E-model (ITU-T G.107) 기반 R-factor 분석.
   - 긴급전화 품질: 4G VoLTE 대비 5G SA eCall 성능(호 설정 시간 단축 2.5s -> 1.2s 이하) 및 신뢰도.

답변 작성 가이드라인:
- **구조화된 형식**: 기술적 원인 요약, 3GPP 표준 메커니즘, SIP/Diameter 시그널링 흐름(필요시 ASCII/Mermaid Call-Flow 다이어그램), 현장 트러블슈팅 체크리스트(Wireshark 패킷 필터, 인터페이스 로그 확인 포인트)를 단계별로 명확히 작성하세요.
- **실전 문제 해결 중심**: 모호한 답변 대신 구체적인 SIP 응답 코드(예: 401, 403 Forbidden, 488 Not Acceptable Here, 500 Server Internal Error), 3GPP 인터페이스(Cx, Gm, Mw, Rx, N5), AV(Authentication Vector) 파라미터 등을 명시하세요.
- **가독성**: 중요한 용어는 굵은 글씨로 강조하고, 코드 블록이나 표를 적극적으로 활용해 깔끔한 기술 보고서 스타일로 답변하세요.`;

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "IMS Tech-Guide Backend",
    model: "gemini-3.7-flash",
    timestamp: new Date().toISOString(),
  });
});

// GET /api/queries - Retrieve all saved user questions (질의사항 목록 조회)
app.get("/api/queries", (_req, res) => {
  try {
    const queries = loadSavedQueries();
    res.json({ queries });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || "Failed to load queries" });
  }
});

// POST /api/queries - Manually save a user question (질의사항 개별 저장)
app.post("/api/queries", (req, res) => {
  try {
    const { query } = req.body;
    if (!query || typeof query !== "string" || !query.trim()) {
      return res.status(400).json({ error: "query text is required" });
    }
    const saved = recordUserQuery(query);
    res.json({ success: true, query: saved });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || "Failed to save query" });
  }
});

// DELETE /api/queries/:id - Delete a specific user question
app.delete("/api/queries/:id", (req, res) => {
  try {
    const { id } = req.params;
    let queries = loadSavedQueries();
    queries = queries.filter((q) => q.id !== id);
    saveQueriesToFile(queries);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || "Failed to delete query" });
  }
});

// DELETE /api/queries - Clear all saved user questions
app.delete("/api/queries", (_req, res) => {
  try {
    saveQueriesToFile([]);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || "Failed to clear queries" });
  }
});

// PATCH /api/queries/:id/star - Toggle star on a saved query
app.patch("/api/queries/:id/star", (req, res) => {
  try {
    const { id } = req.params;
    const queries = loadSavedQueries();
    const target = queries.find((q) => q.id === id);
    if (target) {
      target.starred = !target.starred;
      saveQueriesToFile(queries);
      res.json({ success: true, starred: target.starred });
    } else {
      res.status(404).json({ error: "Query not found" });
    }
  } catch (error: any) {
    res.status(500).json({ error: error?.message || "Failed to update query" });
  }
});

// SSE Streaming Chat Endpoint
app.post("/api/chat/stream", async (req, res) => {
  try {
    const { messages, contextData } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "messages array is required" });
    }

    // Auto-save latest user question to persistent backend store (답변은 저장하지 않음!)
    const latestUserMsg = [...messages].reverse().find((m: { role: string }) => m.role === "user");
    if (latestUserMsg && latestUserMsg.content) {
      recordUserQuery(latestUserMsg.content);
    }

    // Set headers for Server-Sent Events
    res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders?.();

    // Prepare contents for Gemini
    const contents = messages.map((msg: { role: string; content: string }) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

    let systemInstruction = IMS_SYSTEM_INSTRUCTION;
    if (contextData) {
      systemInstruction += `\n\n[추가 기술 진단 컨텍스트 데이터]\n${JSON.stringify(contextData, null, 2)}`;
    }

    const responseStream = await getAI().models.generateContentStream({
      model: "gemini-3.1-flash-lite",
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
        topP: 0.95,
      },
    });

    for await (const chunk of responseStream) {
      if (chunk.text) {
        res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`);
      }
    }

    res.write(`data: [DONE]\n\n`);
    res.end();
  } catch (error: any) {
    console.error("Gemini stream error:", error);
    const errorMessage = error?.message || "Internal server error during generation";
    if (!res.headersSent) {
      res.status(500).json({ error: errorMessage });
    } else {
      res.write(`data: ${JSON.stringify({ error: errorMessage })}\n\n`);
      res.write(`data: [DONE]\n\n`);
      res.end();
    }
  }
});

// Standard non-streaming Chat Endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const { messages, contextData } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "messages array is required" });
    }

    // Auto-save latest user question to persistent backend store (답변은 저장하지 않음!)
    const latestUserMsg = [...messages].reverse().find((m: { role: string }) => m.role === "user");
    if (latestUserMsg && latestUserMsg.content) {
      recordUserQuery(latestUserMsg.content);
    }

    const contents = messages.map((msg: { role: string; content: string }) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

    let systemInstruction = IMS_SYSTEM_INSTRUCTION;
    if (contextData) {
      systemInstruction += `\n\n[추가 기술 진단 컨텍스트 데이터]\n${JSON.stringify(contextData, null, 2)}`;
    }

    const response = await getAI().models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({ reply: response.text });
  } catch (error: any) {
    console.error("Gemini API error:", error);
    res.status(500).json({ error: error?.message || "Failed to generate AI response" });
  }
});

// Log & SIP Packet Diagnostic Analysis Endpoint
app.post("/api/analyze-log", async (req, res) => {
  try {
    const { logContent, category, deviceType, networkMode } = req.body;

    if (!logContent) {
      return res.status(400).json({ error: "logContent is required" });
    }

    const prompt = `다음은 무선 음성 통신(IMS/VoLTE/VoNR) 환경에서 캡처된 로그 또는 문제 상황입니다.
분류: ${category || "General IMS Issue"}
단말 환경: ${deviceType || "미지정"}
망 환경: ${networkMode || "5G SA / 4G VoLTE"}

[입력된 로그/패킷 데이터]:
\`\`\`
${logContent}
\`\`\`

위 데이터를 분석하여 다음 형식의 전문 기술 진단 보고서를 작성해 주십시오:
1. **문제 요약 및 심각도 (Issue Summary & Severity)** (위험도: High/Medium/Low)
2. **원인 분석 (Root Cause Analysis)**: 3GPP 규격, SIP 응답 코드, Diameter 메시지, 무선 무선품질(RSRP/SINR/Jitter) 측면에서 구체적 실패 지점 규명
3. **영향 받는 IMS 엔티티 (Affected Entities)**: (예: P-CSCF, S-CSCF, HSS, UE, gNB, eNB, UPF)
4. **단계별 조치 가이드 (Step-by-Step Resolution Guide)**: 엔지니어가 현장에서 실행할 수 있는 점검 체크리스트 및 설정 변경 가이드
5. **예방 및 모니터링 방안 (Preventative Monitoring)**: 재발 방지를 위한 KPI 임계값 설정 및 알람 기준`;

    const response = await getAI().models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: prompt,
      config: {
        systemInstruction: IMS_SYSTEM_INSTRUCTION,
        temperature: 0.4,
      },
    });

    res.json({ analysis: response.text });
  } catch (error: any) {
    console.error("Log analyze error:", error);
    res.status(500).json({ error: error?.message || "Failed to analyze log" });
  }
});

// Setup Vite middleware for dev or static files for prod
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`IMS Tech-Guide Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Fatal error during server startup:", err);
  process.exit(1);
});
