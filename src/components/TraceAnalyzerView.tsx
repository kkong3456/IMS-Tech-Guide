import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  FileSearch, 
  Upload, 
  Play, 
  Copy, 
  Check, 
  AlertTriangle, 
  CheckCircle2, 
  RotateCcw,
  Sparkles,
  Terminal
} from 'lucide-react';
import { SAMPLE_LOGS } from '../data/sampleLogs';
import { SampleLog } from '../types';

export const TraceAnalyzerView: React.FC = () => {
  const [selectedSample, setSelectedSample] = useState<SampleLog | null>(SAMPLE_LOGS[0]);
  const [logText, setLogText] = useState<string>(SAMPLE_LOGS[0].logText);
  const [category, setCategory] = useState<string>(SAMPLE_LOGS[0].category);
  const [deviceType, setDeviceType] = useState<string>(SAMPLE_LOGS[0].deviceType);
  const [networkMode, setNetworkMode] = useState<string>(SAMPLE_LOGS[0].networkMode);
  
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const handleSelectSample = (sample: SampleLog) => {
    setSelectedSample(sample);
    setLogText(sample.logText);
    setCategory(sample.category);
    setDeviceType(sample.deviceType);
    setNetworkMode(sample.networkMode);
    setAnalysisResult(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setLogText(content);
      setSelectedSample(null);
    };
    reader.readAsText(file);
  };

  const handleRunAnalysis = async () => {
    if (!logText.trim()) {
      alert('분석할 SIP/네트워크 로그를 입력해 주세요.');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      const response = await fetch('/api/analyze-log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          logContent: logText,
          category,
          deviceType,
          networkMode,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || '진단 분석 실패');
      }

      setAnalysisResult(data.analysis);
    } catch (err: any) {
      console.error('Analysis error:', err);
      setAnalysisResult(`⚠️ 진단 중 오류가 발생했습니다: ${err.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopyReport = async () => {
    if (!analysisResult) return;
    try {
      await navigator.clipboard.writeText(analysisResult);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 space-y-6">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <FileSearch className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-bold text-white tracking-tight">
                SIP 시그널링 &amp; VOC 로그 심층 진단기
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400">
              Wireshark SIP 메시지, Diameter Cx 트레이스, 5G EPS Fallback 시그널링, RTCP Jitter 지표 로그를 AI가 3GPP 규격 기준으로 즉시 분석합니다.
            </p>
          </div>

          {/* Sample Selectors */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-400 font-medium">샘플 트레이스:</span>
            {SAMPLE_LOGS.map((sample) => (
              <button
                key={sample.id}
                onClick={() => handleSelectSample(sample)}
                className={`px-2.5 py-1 rounded-md text-xs font-mono transition-all ${
                  selectedSample?.id === sample.id
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700'
                }`}
              >
                {sample.id.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid: Input Column & Analysis Column */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Trace Input & Configuration (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Metadata Parameters */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" /> 환경 파라미터 설정
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  이슈 분류
                </label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                  placeholder="예: Equipment / SIP Auth"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  단말 칩셋 / 모델
                </label>
                <input
                  type="text"
                  value={deviceType}
                  onChange={(e) => setDeviceType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                  placeholder="예: Snapdragon 8 Gen 3"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                망 환경
              </label>
              <select
                value={networkMode}
                onChange={(e) => setNetworkMode(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
              >
                <option value="5G SA (Option 2)">5G SA (Option 2 - VoNR Native)</option>
                <option value="5G SA with EPS Fallback">5G SA with EPS Fallback (VoLTE)</option>
                <option value="5G NSA (Option 3x)">5G NSA (Option 3x - VoLTE)</option>
                <option value="4G VoLTE (LTE-A)">4G VoLTE (LTE-A E-UTRAN)</option>
                <option value="PSTN / MGCF Interworking">PSTN / MGCF 유선 연동망</option>
              </select>
            </div>
          </div>

          {/* Trace Text Area */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">
                로그 / SIP 패킷 텍스트
              </span>
              <label className="cursor-pointer text-xs flex items-center gap-1 text-cyan-400 hover:text-cyan-300">
                <Upload className="w-3.5 h-3.5" />
                <span>파일 업로드</span>
                <input
                  type="file"
                  accept=".txt,.log"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            <textarea
              rows={14}
              value={logText}
              onChange={(e) => setLogText(e.target.value)}
              placeholder="Wireshark SIP 메시지, Diameter 로그, RTCP 리포트, 5G NGAP 시그널링 로그를 붙여넣으세요..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs font-mono text-cyan-300 placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 leading-relaxed resize-none"
            />

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={handleRunAnalysis}
                disabled={isAnalyzing || !logText.trim()}
                className="flex-1 py-2.5 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium text-xs sm:text-sm rounded-lg flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all"
              >
                {isAnalyzing ? (
                  <>
                    <span className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin"></span>
                    <span>3GPP 규격 기반 진단 중...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>AI 결함 진단 실행</span>
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  setLogText('');
                  setAnalysisResult(null);
                  setSelectedSample(null);
                }}
                className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                title="입력 내용 초기화"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: AI Diagnostic Report (7 cols) */}
        <div className="lg:col-span-7">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col h-full min-h-[500px]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">
                  전문가 기술 진단 보고서 (AI Diagnostic Report)
                </h3>
              </div>

              {analysisResult && (
                <button
                  onClick={handleCopyReport}
                  className="flex items-center gap-1 text-xs px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">복사 완료</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>보고서 복사</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Diagnostic Content */}
            <div className="flex-1 overflow-y-auto">
              {isAnalyzing ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                    <span className="w-6 h-6 border-2 border-cyan-400/20 border-t-cyan-400 rounded-full animate-spin"></span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-200">
                      SIP 시그널링 및 네트워크 프로토콜 분석 중
                    </p>
                    <p className="text-xs text-slate-400">
                      3GPP TS 23.228 / TS 24.229 / TS 23.501 규격과 대조하여 근본 원인을 도출하고 있습니다.
                    </p>
                  </div>
                </div>
              ) : analysisResult ? (
                <div className="prose prose-invert prose-sm max-w-none text-slate-200 prose-headings:text-cyan-300 prose-code:text-cyan-300 prose-code:bg-slate-950 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-pre:bg-slate-950 prose-pre:border prose-pre:border-slate-800">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {analysisResult}
                  </ReactMarkdown>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-500 space-y-3">
                  <AlertTriangle className="w-10 h-10 text-slate-600" />
                  <div>
                    <p className="text-sm font-medium text-slate-400">
                      진단할 로그를 입력하고 'AI 결함 진단 실행'을 클릭하세요.
                    </p>
                    <p className="text-xs text-slate-600 mt-1">
                      상단의 샘플(LOG-1, LOG-2, LOG-3, LOG-4)을 선택하여 사전 등록된 장애 케이스를 즉시 분석해 볼 수 있습니다.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Reference Footer */}
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                자동 원인 규명 &amp; 현장 조치 체크리스트 생성
              </span>
              <span>Gemini 3.7 Flash Diagnostic Engine</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
