import React, { useState } from 'react';
import { 
  Cpu, 
  Layers, 
  ArrowRight, 
  ShieldCheck, 
  Smartphone, 
  Radio, 
  Server, 
  Database, 
  PhoneCall, 
  Sparkles,
  Info,
  GitBranch
} from 'lucide-react';

interface ArchitectureViewProps {
  onAskAI: (prompt: string) => void;
}

export const ArchitectureView: React.FC<ArchitectureViewProps> = ({ onAskAI }) => {
  const [selectedFlow, setSelectedFlow] = useState<'reg' | 'vonr' | 'eps' | 'pstn'>('reg');
  const [selectedNode, setSelectedNode] = useState<string>('p-cscf');

  const nodesInfo: Record<string, {
    name: string;
    fullName: string;
    role: string;
    interfaces: string;
    protocols: string;
    spec: string;
  }> = {
    ue: {
      name: 'UE (User Equipment)',
      fullName: '4G VoLTE / 5G VoNR Mobile Terminal',
      role: 'SIP User Agent(UA) 클라이언트로 음성 코덱(EVS/AMR-WB) 인코딩/디코딩, Digest AKA 연산 및 IPSec 터널 유지',
      interfaces: 'Gm (to P-CSCF), Uu (to gNodeB/eNodeB)',
      protocols: 'SIP, SDP, RTP/RTCP, 3GPP NAS',
      spec: '3GPP TS 24.229 / TS 26.114'
    },
    ran: {
      name: 'RAN (gNodeB / eNodeB)',
      fullName: '5G NR Next Generation NodeB / 4G LTE eNodeB',
      role: '무선 자원 스케줄링(Semi-Persistent Scheduling), RSRP/SINR 측정 보고 수신, B1/B2 Measurement 기반 Handover 및 EPS Fallback 수행',
      interfaces: 'Uu (to UE), N2/N3 (to 5GC), S1-MME/S1-U (to EPC), Xn/X2 (Inter-BS)',
      protocols: 'NR RRC, NGAP, S1-AP, GTP-U',
      spec: '3GPP TS 38.300 / TS 36.300'
    },
    '5gc': {
      name: '5GC / EPC Transport',
      fullName: 'AMF / SMF / UPF (5G Core) & MME / SGW / PGW',
      role: '5QI=1/5QI=5 QoS Flow 수립, 사용자 평면 음성 RTP 패킷 전송, N26 인터페이스를 통한 5G-4G 인터워킹 제어',
      interfaces: 'N1/N2/N3/N4/N6, N26 (AMF ↔ MME)',
      protocols: 'NGAP, PFCP, GTP-U, HTTP/2 SBA',
      spec: '3GPP TS 23.501 / TS 23.502'
    },
    'p-cscf': {
      name: 'P-CSCF',
      fullName: 'Proxy-Call Session Control Function',
      role: '단말의 최초 접점 프록시 서버. SIP 시그널링 압축/보안(IPSec ESP SA), PCF/PCRF와 Rx/N5 인터페이스를 통해 5QI=1 QoS Flow 동적 정책 제어',
      interfaces: 'Gm (UE ↔ P-CSCF), Mw (P-CSCF ↔ I/S-CSCF), N5/Rx (P-CSCF ↔ PCF/PCRF)',
      protocols: 'SIP/SDP, Diameter Rx, HTTP/2 N5 SBA',
      spec: '3GPP TS 23.228 / TS 29.514'
    },
    'i-cscf': {
      name: 'I-CSCF',
      fullName: 'Interrogating-Call Session Control Function',
      role: '외부 인바운드 SIP 메시지 수신 및 HSS와 Cx UAR/LIR 쿼리를 통해 최적의 S-CSCF를 질의 및 배정, 네트워크 토폴로지 은폐(THIG)',
      interfaces: 'Mw (I-CSCF ↔ P/S-CSCF), Cx (I-CSCF ↔ HSS)',
      protocols: 'SIP/SDP, Diameter Cx',
      spec: '3GPP TS 23.228 / TS 29.228'
    },
    's-cscf': {
      name: 'S-CSCF',
      fullName: 'Serving-Call Session Control Function',
      role: 'IMS 코어의 중앙 세션 제어 엔진. 가입자 등록 관리, HSS Cx MAR/SAR 연동으로 IMS-AKA 인증 벡터 획득, iFC(초기 필터 기준) 기반 서비스 트리거',
      interfaces: 'Mw (S-CSCF ↔ P/I-CSCF), Cx (S-CSCF ↔ HSS), ISC (S-CSCF ↔ AS), Mg (S-CSCF ↔ MGCF)',
      protocols: 'SIP/SDP, Diameter Cx',
      spec: '3GPP TS 23.228 / TS 24.229'
    },
    hss: {
      name: 'HSS / UDM',
      fullName: 'Home Subscriber Server / Unified Data Management',
      role: '가입자 프로파일(IMPI, IMPU, iFC), 암호화 키 및 IMS-AKA 인증 벡터(RAND, AUTN, XRES, CK, IK) 마스터 저장소',
      interfaces: 'Cx (HSS ↔ I/S-CSCF), Sh (HSS ↔ AS), Nudm (UDM in 5GC)',
      protocols: 'Diameter, HTTP/2 JSON SBA',
      spec: '3GPP TS 29.228 / TS 29.503'
    },
    pcf: {
      name: 'PCF / PCRF',
      fullName: 'Policy Control Function / Policy and Charging Rules Function',
      role: 'P-CSCF로부터 SIP 세션 미디어(SDP) 정보를 수신하여 5QI=1(Voice GBR 48k) 및 5QI=5(Signaling) 정책 규칙을 SMF/UPF에 하달',
      interfaces: 'N5/Rx (PCF ↔ P-CSCF), N7/Gx (PCF ↔ SMF/PGW)',
      protocols: 'HTTP/2 SBA (Npcf), Diameter (Gx/Rx)',
      spec: '3GPP TS 29.512 / TS 29.514'
    },
    mgcf: {
      name: 'MGCF & IM-MGW',
      fullName: 'Media Gateway Control Function & IMS-Media Gateway',
      role: 'IMS All-IP 망과 기존 서킷 교환망(PSTN/ISDN) 간 SIP ↔ ISUP/BICC 시그널링 변환 및 RTP ↔ TDM(PCM-64k) 음성 베어러 트랜스코딩',
      interfaces: 'Mg (MGCF ↔ S-CSCF), Mn (MGCF ↔ IM-MGW), PSTN E1/T1 Trunk',
      protocols: 'SIP, ISUP, H.248 (MEGACO), RTP',
      spec: '3GPP TS 29.163 / TS 29.332'
    }
  };

  const currentNode = nodesInfo[selectedNode] || nodesInfo['p-cscf'];

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 space-y-6">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Cpu className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-bold text-white tracking-tight">
                3GPP IMS Core &amp; VoNR/VoLTE 엔드-투-엔드 아키텍처 맵
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400">
              P-CSCF, I-CSCF, S-CSCF, HSS/UDM, PCF, MGCF 및 무선 전송망의 연동 구조와 핵심 시그널링 흐름을 시각적으로 탐색하세요.
            </p>
          </div>

          {/* Flow Mode Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setSelectedFlow('reg')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                selectedFlow === 'reg'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              1. 가입자 등록(AKA)
            </button>
            <button
              onClick={() => setSelectedFlow('vonr')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                selectedFlow === 'vonr'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              2. 5G VoNR 호 설정
            </button>
            <button
              onClick={() => setSelectedFlow('eps')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                selectedFlow === 'eps'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              3. EPS Fallback
            </button>
            <button
              onClick={() => setSelectedFlow('pstn')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                selectedFlow === 'pstn'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              4. PSTN 유선망 연동
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Visual Map (8 cols) & Entity Inspector (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Visual Architecture Topology (8 cols) */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              네트워크 엔티티 토폴로지 (노드를 클릭하여 상세 정보 확인)
            </span>
            <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
              {selectedFlow === 'reg' && '시그널링: SIP REGISTER → 401 Challenge → 200 OK'}
              {selectedFlow === 'vonr' && '시그널링: SIP INVITE → N5 PCF Auth → 5QI=1 GBR'}
              {selectedFlow === 'eps' && '시그널링: INVITE → gNB Measure → N26 Fallback to 4G'}
              {selectedFlow === 'pstn' && '시그널링: S-CSCF Mg → MGCF ISUP IAM → PSTN'}
            </span>
          </div>

          {/* Interactive Topology Graph */}
          <div className="space-y-6 py-2">
            {/* Level 1: Terminal & Access */}
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setSelectedNode('ue')}
                className={`p-3 rounded-xl border text-center transition-all ${
                  selectedNode === 'ue'
                    ? 'bg-cyan-950/50 border-cyan-400 ring-2 ring-cyan-500/30 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <Smartphone className="w-5 h-5 mx-auto mb-1 text-amber-400" />
                <div className="text-xs font-bold font-mono">단말 (UE)</div>
                <div className="text-[10px] text-slate-500">VoLTE / VoNR</div>
              </button>

              <button
                onClick={() => setSelectedNode('ran')}
                className={`p-3 rounded-xl border text-center transition-all ${
                  selectedNode === 'ran'
                    ? 'bg-cyan-950/50 border-cyan-400 ring-2 ring-cyan-500/30 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <Radio className="w-5 h-5 mx-auto mb-1 text-emerald-400" />
                <div className="text-xs font-bold font-mono">RAN (gNB / eNB)</div>
                <div className="text-[10px] text-slate-500">5G NR / 4G LTE</div>
              </button>

              <button
                onClick={() => setSelectedNode('5gc')}
                className={`p-3 rounded-xl border text-center transition-all ${
                  selectedNode === '5gc'
                    ? 'bg-cyan-950/50 border-cyan-400 ring-2 ring-cyan-500/30 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <Server className="w-5 h-5 mx-auto mb-1 text-blue-400" />
                <div className="text-xs font-bold font-mono">5GC / EPC</div>
                <div className="text-[10px] text-slate-500">UPF / AMF / SGW</div>
              </button>
            </div>

            {/* Downward Interface Arrow */}
            <div className="flex justify-around text-slate-600 text-[11px] font-mono">
              <span className="flex items-center gap-1 text-cyan-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                Gm (SIP/SDP) <ArrowRight className="w-3 h-3 rotate-90 inline" />
              </span>
              <span className="flex items-center gap-1 text-blue-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                N3 / S1-U (GTP-U) <ArrowRight className="w-3 h-3 rotate-90 inline" />
              </span>
              <span className="flex items-center gap-1 text-emerald-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                N5 / Rx (Diameter/SBA) <ArrowRight className="w-3 h-3 rotate-90 inline" />
              </span>
            </div>

            {/* Level 2: IMS Core Edge & Control */}
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setSelectedNode('p-cscf')}
                className={`p-3 rounded-xl border text-center transition-all ${
                  selectedNode === 'p-cscf'
                    ? 'bg-cyan-950/50 border-cyan-400 ring-2 ring-cyan-500/30 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <Server className="w-5 h-5 mx-auto mb-1 text-cyan-400" />
                <div className="text-xs font-bold font-mono">P-CSCF</div>
                <div className="text-[10px] text-slate-500">SIP Proxy / IPSec</div>
              </button>

              <button
                onClick={() => setSelectedNode('i-cscf')}
                className={`p-3 rounded-xl border text-center transition-all ${
                  selectedNode === 'i-cscf'
                    ? 'bg-cyan-950/50 border-cyan-400 ring-2 ring-cyan-500/30 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <Server className="w-5 h-5 mx-auto mb-1 text-indigo-400" />
                <div className="text-xs font-bold font-mono">I-CSCF</div>
                <div className="text-[10px] text-slate-500">Routing / S-CSCF 배정</div>
              </button>

              <button
                onClick={() => setSelectedNode('s-cscf')}
                className={`p-3 rounded-xl border text-center transition-all ${
                  selectedNode === 's-cscf'
                    ? 'bg-cyan-950/50 border-cyan-400 ring-2 ring-cyan-500/30 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <Server className="w-5 h-5 mx-auto mb-1 text-purple-400" />
                <div className="text-xs font-bold font-mono">S-CSCF</div>
                <div className="text-[10px] text-slate-500">세션 제어 / iFC</div>
              </button>
            </div>

            {/* Level 3: Policy, Subscriber DB & PSTN Interworking */}
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setSelectedNode('pcf')}
                className={`p-3 rounded-xl border text-center transition-all ${
                  selectedNode === 'pcf'
                    ? 'bg-cyan-950/50 border-cyan-400 ring-2 ring-cyan-500/30 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <ShieldCheck className="w-5 h-5 mx-auto mb-1 text-rose-400" />
                <div className="text-xs font-bold font-mono">PCF / PCRF</div>
                <div className="text-[10px] text-slate-500">5QI=1 QoS 정책</div>
              </button>

              <button
                onClick={() => setSelectedNode('hss')}
                className={`p-3 rounded-xl border text-center transition-all ${
                  selectedNode === 'hss'
                    ? 'bg-cyan-950/50 border-cyan-400 ring-2 ring-cyan-500/30 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <Database className="w-5 h-5 mx-auto mb-1 text-emerald-400" />
                <div className="text-xs font-bold font-mono">HSS / UDM</div>
                <div className="text-[10px] text-slate-500">Cx / AKA 인증 DB</div>
              </button>

              <button
                onClick={() => setSelectedNode('mgcf')}
                className={`p-3 rounded-xl border text-center transition-all ${
                  selectedNode === 'mgcf'
                    ? 'bg-cyan-950/50 border-cyan-400 ring-2 ring-cyan-500/30 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <PhoneCall className="w-5 h-5 mx-auto mb-1 text-amber-400" />
                <div className="text-xs font-bold font-mono">MGCF / IM-MGW</div>
                <div className="text-[10px] text-slate-500">PSTN ISUP / TDM</div>
              </button>
            </div>
          </div>

          {/* Flow Step-by-Step Description */}
          <div className="mt-4 pt-3 border-t border-slate-800 bg-slate-950/80 p-3 rounded-lg text-xs text-slate-300 space-y-1">
            <span className="text-cyan-400 font-bold block mb-1">
              📌 선택된 시나리오 시그널링 단계:
            </span>
            {selectedFlow === 'reg' && (
              <ol className="list-decimal list-inside space-y-0.5 text-slate-400">
                <li>UE가 P-CSCF로 초기 <strong>SIP REGISTER</strong> 전송 (Gm)</li>
                <li>I-CSCF가 HSS에 <strong>Cx UAR(User-Auth-Request)</strong> 전송하여 S-CSCF 배정</li>
                <li>S-CSCF가 HSS에 <strong>Cx MAR</strong> 전송하여 Auth Vector(RAND, AUTN) 획득 후 <strong>401 Challenge</strong> 회신</li>
                <li>UE가 2차 REGISTER(RES 포함) 전송 → S-CSCF 검증 후 <strong>200 OK</strong> 수락 &amp; IPSec SA 수립</li>
              </ol>
            )}
            {selectedFlow === 'vonr' && (
              <ol className="list-decimal list-inside space-y-0.5 text-slate-400">
                <li>UE가 P-CSCF로 <strong>SIP INVITE</strong> (EVS/AMR-WB SDP 포함) 발신</li>
                <li>P-CSCF가 <strong>N5 (Npcf_PolicyAuthorization)</strong> 호출 → PCF가 5QI=1 QoS Flow 승인</li>
                <li>SMF/UPF를 통해 gNodeB에 5QI=1 전용 무선 베어러(GBR 48k) 개설</li>
                <li>착신측 <strong>180 Ringing → 200 OK</strong> 수신 후 단말 간 엔드-투-엔드 RTP 음성 패킷 전송</li>
              </ol>
            )}
            {selectedFlow === 'eps' && (
              <ol className="list-decimal list-inside space-y-0.5 text-slate-400">
                <li>5G SA 단말이 VoNR 발신 시 5G NR 커버리지 약화 감지 (B1/B2 Measurement)</li>
                <li>gNB가 5GC AMF에 <strong>NGAP Handover Required</strong> (Target: 4G eNB) 전송</li>
                <li>AMF-MME 간 <strong>N26 인터페이스</strong>를 통해 4G EPC로 음성 세션 핸드오버</li>
                <li>단말이 4G LTE 망에서 QCI=1 VoLTE로 음성 통화 지속 (통화 종료 후 5G Fast Return)</li>
              </ol>
            )}
            {selectedFlow === 'pstn' && (
              <ol className="list-decimal list-inside space-y-0.5 text-slate-400">
                <li>S-CSCF가 착신 전화번호(E.164) 분석 후 <strong>Mg 인터페이스</strong>를 통해 MGCF로 SIP INVITE 전달</li>
                <li>MGCF가 SIP INVITE를 <strong>ISUP IAM (Initial Address Message)</strong>으로 변환하여 PSTN 교환기 전송</li>
                <li>MGCF가 H.248 프로토콜로 IM-MGW를 제어하여 IP RTP 패킷을 TDM PCM 64k 베어러로 트랜스코딩</li>
                <li>PSTN에서 ISUP ACM/ANM 회신 시 MGCF가 SIP 180 Ringing / 200 OK로 역변환</li>
              </ol>
            )}
          </div>
        </div>

        {/* Right Column: Node Details Inspector (4 cols) */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-base font-bold text-white font-mono block">
                  {currentNode.name}
                </span>
                <span className="text-xs text-slate-400">
                  {currentNode.fullName}
                </span>
              </div>
            </div>

            {/* Standard Spec */}
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-xs">
              <span className="text-slate-400 font-medium block mb-0.5">3GPP 표준 규격</span>
              <span className="font-mono text-cyan-300 font-semibold">{currentNode.spec}</span>
            </div>

            {/* Key Roles */}
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                주요 역할 및 기능
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-lg border border-slate-800">
                {currentNode.role}
              </p>
            </div>

            {/* Interfaces & Protocols */}
            <div className="space-y-2 text-xs">
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 font-medium block mb-0.5">연동 인터페이스</span>
                <span className="font-mono text-emerald-300">{currentNode.interfaces}</span>
              </div>

              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 font-medium block mb-0.5">핵심 프로토콜</span>
                <span className="font-mono text-blue-300">{currentNode.protocols}</span>
              </div>
            </div>
          </div>

          {/* Ask AI Action */}
          <div className="mt-4 pt-3 border-t border-slate-800">
            <button
              onClick={() =>
                onAskAI(
                  `IMS 아키텍처에서 '${currentNode.name}' (${currentNode.fullName})의 상세 시그널링 흐름, 인터페이스 규격 및 장애 발생 시 현장 트러블슈팅 절차를 설명해 주세요.`
                )
              }
              className="w-full py-2 px-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md shadow-cyan-500/20 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>'{currentNode.name}' AI 심층 상담하기</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
