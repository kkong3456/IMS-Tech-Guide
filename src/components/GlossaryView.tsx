import React, { useState, useMemo } from 'react';
import { 
  BookOpen, 
  Search, 
  Tag, 
  Layers, 
  MessageSquare, 
  ExternalLink, 
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Cpu
} from 'lucide-react';
import { GLOSSARY_ITEMS } from '../data/glossaryData';
import { GlossaryItem } from '../types';

interface GlossaryViewProps {
  onAskAI: (termPrompt: string) => void;
}

export const GlossaryView: React.FC<GlossaryViewProps> = ({ onAskAI }) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeItem, setActiveItem] = useState<GlossaryItem | null>(GLOSSARY_ITEMS[0]);

  const categories = ['All', 'Core Architecture', 'Signaling & Protocol', 'Terminal & Modem', 'QoS & VOC', '5G Evolution & SBA'];

  const filteredItems = useMemo(() => {
    return GLOSSARY_ITEMS.filter((item) => {
      const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        item.term.toLowerCase().includes(q) ||
        item.fullForm.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.specification.toLowerCase().includes(q) ||
        (item.interfaces && item.interfaces.some(i => i.toLowerCase().includes(q)));

      return matchesCat && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 space-y-6">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <BookOpen className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-bold text-white tracking-tight">
                3GPP IMS &amp; VoLTE/VoNR 기술 용어 및 규격 사전
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400">
              P-CSCF/I-CSCF/S-CSCF, HSS, Cx Diameter, 5G SBA N5/Npcf, EPS Fallback, 5QI=1, EVS 코덱 등 표준 정의를 검색하세요.
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="용어, 규격(TS), 인터페이스 검색..."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-sans"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 mt-4 overflow-x-auto pb-1 text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {cat === 'All' ? '전체 보기' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Term List (5 cols) & Detail View (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: List */}
        <div className="lg:col-span-5 space-y-2 max-h-[650px] overflow-y-auto pr-1">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-xl text-slate-500 text-xs">
              검색 조건에 일치하는 IMS 용어가 없습니다.
            </div>
          ) : (
            filteredItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveItem(item)}
                className={`w-full text-left p-3 rounded-xl border transition-all flex flex-col justify-between gap-1.5 ${
                  activeItem?.id === item.id
                    ? 'bg-cyan-950/40 border-cyan-500/60 shadow-md text-white'
                    : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800/60 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-cyan-300 font-mono">
                      {item.term}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono border border-slate-700">
                      {item.specification.split(' ')[0] || '3GPP'}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {item.category}
                  </span>
                </div>
                <div className="text-xs text-slate-400 line-clamp-1">
                  {item.fullForm}
                </div>
              </button>
            ))
          )}
        </div>

        {/* Right Column: Detail Card */}
        <div className="lg:col-span-7">
          {activeItem ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5 shadow-xl sticky top-20">
              {/* Header */}
              <div className="flex items-start justify-between pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-white font-mono">
                      {activeItem.term}
                    </span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-medium">
                      {activeItem.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-1">
                    {activeItem.fullForm}
                  </p>
                </div>

                <button
                  onClick={() =>
                    onAskAI(
                      `3GPP 규격 기반으로 '${activeItem.term}' (${activeItem.fullForm})의 동작 원리 및 관련 인터페이스(시그널링 흐름)와 장애 발생 시 점검 포인트를 상세히 설명해 주세요.`
                    )
                  }
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-semibold shadow-md shadow-cyan-500/20 transition-all flex-shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI에게 질의하기</span>
                </button>
              </div>

              {/* Specification & Standards */}
              <div className="flex items-center gap-2 text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span className="text-slate-400 font-medium">3GPP 표준 규격:</span>
                <span className="font-mono text-emerald-300 font-semibold bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30">
                  {activeItem.specification}
                </span>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  개요 및 정의
                </h4>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-950/60 p-3.5 rounded-lg border border-slate-800">
                  {activeItem.description}
                </p>
              </div>

              {/* Key Role */}
              <div>
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  주요 핵심 기능 및 역할
                </h4>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-950/60 p-3.5 rounded-lg border border-slate-800">
                  {activeItem.keyRole}
                </p>
              </div>

              {/* Interfaces & Protocols */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {activeItem.interfaces && activeItem.interfaces.length > 0 && (
                  <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800">
                    <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">
                      연동 인터페이스 (Interfaces)
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {activeItem.interfaces.map((intf, idx) => (
                        <span
                          key={idx}
                          className="text-xs font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-cyan-300"
                        >
                          {intf}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {activeItem.protocols && activeItem.protocols.length > 0 && (
                  <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800">
                    <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">
                      적용 프로토콜 (Protocols)
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {activeItem.protocols.map((proto, idx) => (
                        <span
                          key={idx}
                          className="text-xs font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-blue-300"
                        >
                          {proto}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Practical Tip */}
              {activeItem.practicalTip && (
                <div className="bg-cyan-950/30 border border-cyan-500/30 p-3.5 rounded-lg">
                  <div className="text-xs font-bold text-cyan-300 flex items-center gap-1.5 mb-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>현장 엔지니어 트러블슈팅 팁</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {activeItem.practicalTip}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-xl text-slate-500 text-sm">
              왼쪽 목록에서 용어를 선택하면 상세 3GPP 규격 및 인터페이스 정보를 확인할 수 있습니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
