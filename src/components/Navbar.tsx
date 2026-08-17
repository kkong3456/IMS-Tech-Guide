import React from 'react';
import { MessageSquare, FileSearch, BarChart2, BookOpen, Network, Cpu, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  activeTab: 'chat' | 'analyzer' | 'qos' | 'glossary' | 'architecture';
  setActiveTab: (tab: 'chat' | 'analyzer' | 'qos' | 'glossary' | 'architecture') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white">
              <Network className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-white tracking-tight">IMS Tech-Guide</h1>
                <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-mono font-medium">
                  VoLTE / VoNR
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                3GPP Rel-15~18 무선 음성 통신 전문 기술 상담 &amp; VOC 진단
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              id="nav-chat-btn"
              onClick={() => setActiveTab('chat')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'chat'
                  ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>전문가 상담</span>
            </button>

            <button
              id="nav-analyzer-btn"
              onClick={() => setActiveTab('analyzer')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'analyzer'
                  ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <FileSearch className="w-4 h-4" />
              <span>SIP/VOC 진단기</span>
            </button>

            <button
              id="nav-qos-btn"
              onClick={() => setActiveTab('qos')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'qos'
                  ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <BarChart2 className="w-4 h-4" />
              <span>QoS/MOS 지표</span>
            </button>

            <button
              id="nav-glossary-btn"
              onClick={() => setActiveTab('glossary')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'glossary'
                  ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>규격 사전</span>
            </button>

            <button
              id="nav-architecture-btn"
              onClick={() => setActiveTab('architecture')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'architecture'
                  ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Cpu className="w-4 h-4" />
              <span>아키텍처 맵</span>
            </button>
          </nav>

          {/* Engine Status Badge */}
          <div className="hidden lg:flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Gemini 3.7 Flash</span>
            </div>
            <div className="flex items-center gap-1 text-slate-500 text-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
              <span>3GPP Compliant</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
