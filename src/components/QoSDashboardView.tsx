import React, { useState, useMemo } from 'react';
import { 
  BarChart2, 
  Activity, 
  Zap, 
  Sliders, 
  ShieldAlert, 
  CheckCircle, 
  Info,
  PhoneCall,
  Clock,
  Radio,
  ArrowDownRight
} from 'lucide-react';

export const QoSDashboardView: React.FC = () => {
  // E-Model (ITU-T G.107) Simulation State
  const [delayMs, setDelayMs] = useState<number>(45); // One-way delay
  const [jitterMs, setJitterMs] = useState<number>(8); // Interarrival jitter
  const [packetLoss, setPacketLoss] = useState<number>(0.2); // Loss %
  const [codec, setCodec] = useState<'EVS-SWB' | 'AMR-WB' | 'AMR-NB' | 'G.711'>('EVS-SWB');

  // Compute R-Factor and MOS Score using simplified E-Model formula
  const { rFactor, mosScore, qualityGrade, gradeColor } = useMemo(() => {
    // Base R0 according to codec
    let r0 = 93.2;
    let ie = 0; // Equipment impairment factor
    let bpl = 1.0; // Packet loss robustness factor

    if (codec === 'EVS-SWB') {
      r0 = 96.0;
      ie = 2.0;
      bpl = 25.0; // Highly resilient PLC
    } else if (codec === 'AMR-WB') {
      r0 = 93.0;
      ie = 6.0;
      bpl = 18.0;
    } else if (codec === 'AMR-NB') {
      r0 = 85.0;
      ie = 12.0;
      bpl = 10.0;
    } else {
      // G.711
      r0 = 93.2;
      ie = 0.0;
      bpl = 4.3;
    }

    // Delay impairment Id
    const effectiveDelay = delayMs + Math.max(0, jitterMs * 1.5);
    let id = 0;
    if (effectiveDelay > 100) {
      id = 0.024 * effectiveDelay + 0.11 * (effectiveDelay - 177.3) * (effectiveDelay > 177.3 ? 1 : 0);
    }

    // Packet loss impairment Ie-eff
    const ieEff = ie + (95 - ie) * (packetLoss / (packetLoss + bpl));

    // Jitter penalty if > 20ms (Buffer underflow/overflow)
    let jitterPenalty = 0;
    if (jitterMs > 20) {
      jitterPenalty = (jitterMs - 20) * 1.2;
    }

    const calculatedR = Math.max(0, Math.min(100, r0 - id - ieEff - jitterPenalty));

    // Convert R to MOS (ITU-T G.107)
    let mos = 1.0;
    if (calculatedR <= 0) {
      mos = 1.0;
    } else if (calculatedR >= 100) {
      mos = 4.5;
    } else {
      mos = 1 + 0.035 * calculatedR + calculatedR * (calculatedR - 60) * (100 - calculatedR) * 7e-6;
      mos = Math.max(1.0, Math.min(4.5, mos));
    }

    let grade: 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Bad' = 'Good';
    let color = 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30';

    if (mos >= 4.2) {
      grade = 'Excellent';
      color = 'text-cyan-400 bg-cyan-950/40 border-cyan-500/30';
    } else if (mos >= 3.8) {
      grade = 'Good';
      color = 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30';
    } else if (mos >= 3.1) {
      grade = 'Fair';
      color = 'text-amber-400 bg-amber-950/40 border-amber-500/30';
    } else if (mos >= 2.5) {
      grade = 'Poor';
      color = 'text-orange-400 bg-orange-950/40 border-orange-500/30';
    } else {
      grade = 'Bad';
      color = 'text-rose-400 bg-rose-950/40 border-rose-500/30';
    }

    return {
      rFactor: Number(calculatedR.toFixed(1)),
      mosScore: Number(mos.toFixed(2)),
      qualityGrade: grade,
      gradeColor: color,
    };
  }, [delayMs, jitterMs, packetLoss, codec]);

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 space-y-6">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-1">
          <BarChart2 className="w-5 h-5 text-cyan-400" />
          <h2 className="text-lg font-bold text-white tracking-tight">
            QoS 성능 지표 &amp; VoLTE vs VoNR 벤치마크 가이드
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-400">
          3GPP 5QI=1 음성 품질 기준, 패킷 지터(Jitter &lt;20ms) 임계값 및 5G VoNR 기술 개선 효과와 긴급전화(eCall) 성능 데이터를 제공합니다.
        </p>
      </div>

      {/* 4G VoLTE vs 5G VoNR Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Jitter */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-bl-full pointer-events-none" />
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-semibold uppercase tracking-wider">패킷 지터 (Jitter)</span>
              <Activity className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-2xl font-bold text-cyan-300 font-mono">~3.5 ms</span>
              <span className="text-xs text-slate-500 font-mono">(5G VoNR)</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
              <ArrowDownRight className="w-4 h-4" />
              <span>4G VoLTE (~18ms) 대비 <strong>80% 감소</strong></span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-800 text-[11px] text-slate-400">
            기준 임계값: <strong>&lt; 20 ms</strong> (초과 시 버퍼 오버플로우/무음 발생)
          </div>
        </div>

        {/* Card 2: Call Setup Time */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-bl-full pointer-events-none" />
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-semibold uppercase tracking-wider">호 설정 시간 (Setup Time)</span>
              <Clock className="w-4 h-4 text-blue-400" />
            </div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-2xl font-bold text-blue-300 font-mono">~1.1 초</span>
              <span className="text-xs text-slate-500 font-mono">(VoNR Native)</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
              <ArrowDownRight className="w-4 h-4" />
              <span>4G VoLTE (~2.5초) 대비 <strong>56% 단축</strong></span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-800 text-[11px] text-slate-400">
            5G SBA HTTP/2 시그널링 및 전용 5QI=5 경로 활용
          </div>
        </div>

        {/* Card 3: Emergency Call (eCall) */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full pointer-events-none" />
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-semibold uppercase tracking-wider">긴급전화 (eCall / 119)</span>
              <PhoneCall className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-2xl font-bold text-emerald-300 font-mono">ARP = 1</span>
              <span className="text-xs text-slate-500 font-mono">(최우선 순위)</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
              <CheckCircle className="w-4 h-4" />
              <span>네트워크 혼잡 시 Pre-emption 수용</span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-800 text-[11px] text-slate-400">
            E-P-CSCF 전용 라우팅 및 99.999% 접속 신뢰도
          </div>
        </div>

        {/* Card 4: Audio Codec Fidelity */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-bl-full pointer-events-none" />
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-semibold uppercase tracking-wider">HD 음성 대역폭 (EVS)</span>
              <Radio className="w-4 h-4 text-purple-400" />
            </div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-2xl font-bold text-purple-300 font-mono">50Hz~14kHz</span>
              <span className="text-xs text-slate-500 font-mono">(SWB)</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-purple-300 font-medium">
              <Zap className="w-4 h-4" />
              <span>AMR-WB 대비 가청 영역 2배 확장</span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-800 text-[11px] text-slate-400">
            JBM(지터 버퍼 관리) + PLC 패킷 보정 내장
          </div>
        </div>
      </div>

      {/* Interactive ITU-T G.107 E-Model MOS Calculator */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-800 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-cyan-400" />
              <h3 className="text-base font-bold text-white">
                ITU-T G.107 E-Model 통화 품질 (MOS) 인터랙티브 시뮬레이터
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              지터, 지연, 패킷 손실, 코덱 파라미터를 조절하여 실시간 R-Factor 및 MOS 체감 품질을 계산합니다.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[11px] text-slate-400 block">체감 통화 품질 등급</span>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold font-mono border ${gradeColor}`}>
                {qualityGrade} (MOS {mosScore})
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Controls: Sliders (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            {/* Codec Selection */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">
                음성 코덱 (Codec Profile)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { name: 'EVS-SWB', desc: '5G/VoLTE (32kHz HD)' },
                  { name: 'AMR-WB', desc: '4G VoLTE (16kHz)' },
                  { name: 'AMR-NB', desc: '3G 레거시 (8kHz)' },
                  { name: 'G.711', desc: 'PSTN 유선망 (64k)' },
                ].map((item) => (
                  <button
                    key={item.name}
                    onClick={() => setCodec(item.name as any)}
                    className={`p-2.5 rounded-lg border text-left transition-all ${
                      codec === item.name
                        ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-300 shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <div className="text-xs font-bold font-mono">{item.name}</div>
                    <div className="text-[10px] text-slate-500">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Jitter Slider */}
            <div>
              <div className="flex items-center justify-between text-xs font-medium mb-1.5">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-cyan-400" />
                  패킷 지터 (Interarrival Jitter)
                </span>
                <span className={`font-mono font-bold ${jitterMs > 20 ? 'text-rose-400' : 'text-cyan-300'}`}>
                  {jitterMs} ms {jitterMs > 20 && '(임계값 초과!)'}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={50}
                step={1}
                value={jitterMs}
                onChange={(e) => setJitterMs(Number(e.target.value))}
                className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                <span>0 ms (최상)</span>
                <span className="text-cyan-400 font-semibold">20 ms (3GPP 권고 임계값)</span>
                <span>50 ms (심각)</span>
              </div>
            </div>

            {/* Delay Slider */}
            <div>
              <div className="flex items-center justify-between text-xs font-medium mb-1.5">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-400" />
                  단방향 전송 지연 (One-Way Delay)
                </span>
                <span className="font-mono font-bold text-blue-300">
                  {delayMs} ms
                </span>
              </div>
              <input
                type="range"
                min={10}
                max={300}
                step={5}
                value={delayMs}
                onChange={(e) => setDelayMs(Number(e.target.value))}
                className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-blue-400"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                <span>10 ms</span>
                <span className="text-blue-400 font-semibold">100 ms (5QI=1 Delay Budget)</span>
                <span>300 ms</span>
              </div>
            </div>

            {/* Packet Loss Slider */}
            <div>
              <div className="flex items-center justify-between text-xs font-medium mb-1.5">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                  패킷 손실률 (Packet Loss Rate)
                </span>
                <span className={`font-mono font-bold ${packetLoss > 1.0 ? 'text-rose-400' : 'text-slate-200'}`}>
                  {packetLoss}% {packetLoss > 1.0 && '(품질 저하 경고)'}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={5}
                step={0.1}
                value={packetLoss}
                onChange={(e) => setPacketLoss(Number(e.target.value))}
                className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-rose-400"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                <span>0.0% (무손실)</span>
                <span className="text-amber-400 font-semibold">1.0% (허용 한계치)</span>
                <span>5.0% (호 절단 위험)</span>
              </div>
            </div>
          </div>

          {/* Right Visual Gauge & Output (5 cols) */}
          <div className="lg:col-span-5 bg-slate-950 border border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center text-center space-y-4">
            <div className="relative flex items-center justify-center">
              {/* Circular Gauge Ring */}
              <div className="w-40 h-40 rounded-full border-8 border-slate-800 flex flex-col items-center justify-center relative shadow-inner">
                <div 
                  className={`w-36 h-36 rounded-full border-4 flex flex-col items-center justify-center ${
                    mosScore >= 4.0 ? 'border-cyan-400/80 shadow-lg shadow-cyan-500/20' :
                    mosScore >= 3.5 ? 'border-emerald-400/80 shadow-lg shadow-emerald-500/20' :
                    mosScore >= 3.0 ? 'border-amber-400/80' : 'border-rose-500/80'
                  }`}
                >
                  <span className="text-3xl font-black font-mono text-white tracking-tight">
                    {mosScore}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    MOS SCORE
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-1 w-full">
              <div className="flex items-center justify-between text-xs px-4 py-1.5 bg-slate-900 rounded-lg border border-slate-800 font-mono">
                <span className="text-slate-400">R-Factor 지수:</span>
                <span className="font-bold text-cyan-300">{rFactor} / 100</span>
              </div>

              <div className="flex items-center justify-between text-xs px-4 py-1.5 bg-slate-900 rounded-lg border border-slate-800 font-mono">
                <span className="text-slate-400">5QI=1 적합성:</span>
                <span className={`font-bold ${jitterMs <= 20 && packetLoss <= 1.0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {jitterMs <= 20 && packetLoss <= 1.0 ? '3GPP Pass' : 'VOC 위험 (Fail)'}
                </span>
              </div>
            </div>

            {/* Diagnostic advice message */}
            <div className="text-[11px] text-slate-400 leading-relaxed text-left bg-slate-900/60 p-3 rounded-lg border border-slate-800/80 w-full">
              <div className="flex items-center gap-1 text-cyan-400 font-semibold mb-1">
                <Info className="w-3.5 h-3.5" />
                <span>품질 분석 진단:</span>
              </div>
              {jitterMs > 20 ? (
                <span className="text-rose-300">
                  ⚠️ 지터가 20ms를 초과하여 수신측 JBM 버퍼에서 패킷 폐기가 발생합니다. 기지국 SPS 스케줄링 및 무선 간섭(SINR)을 점검하세요.
                </span>
              ) : packetLoss > 1.0 ? (
                <span className="text-amber-300">
                  ⚠️ 패킷 손실률이 1%를 초과하여 음성 뭉개짐이 발생합니다. EVS 코덱의 PLC(Packet Loss Concealment)를 활성화하십시오.
                </span>
              ) : (
                <span className="text-emerald-300">
                  ✅ 3GPP 표준 권고 기준을 충족하며 우수한 HD 음질(MOS 4.0 이상)을 제공하는 최적의 상태입니다.
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
