import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  Send, 
  RotateCcw, 
  Copy, 
  Check, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Download, 
  MessageSquare,
  AlertCircle,
  Database,
  Search,
  Trash2,
  Star,
  X,
  ExternalLink,
  Plus,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ChatMessage, SavedQuery } from '../types';

const INITIAL_MESSAGE: ChatMessage = {
  id: 'welcome-msg',
  role: 'assistant',
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  content: `안녕하세요! **IMS(IP Multimedia Subsystem) 및 VoLTE/VoNR 무선 음성 통신 기술 가이드**입니다.

3GPP 국제 표준 규격(TS 23.228, TS 24.229, TS 23.501/502, TS 26.114)을 기반으로 다음과 같은 기술 영역에 대해 심층 상담을 제공합니다:

* 🏢 **장비 및 아키텍처:** P-CSCF, I-CSCF, S-CSCF, HSS/UDM Cx Diameter 연동, MGCF/IM-MGW PSTN 연동, 5G SA SBA 구조
* 📱 **단말 및 규격:** Snapdragon/Exynos 모뎀 스택, SIP REGISTER Digest AKA 절차, SR-VCC 및 EPS Fallback
* 📡 **무선 환경:** 5G NSA(Option 3x) vs SA(Option 2) 음성 경로, eMBB 슬라이싱 및 긴급전화(eCall) 최우선 순위
* 📊 **품질 VOC 및 지표:** 패킷 지터(Jitter <20ms), 패킷 손실, EVS/AMR-WB 코덱 최적화, MOS/R-Factor 분석

궁금하신 IMS 기술 이슈, SIP 에러 코드(401/403/488 등), 또는 VOC 품질 문제에 대해 질문해 주세요.`,
  suggestedQuestions: [
    'S-CSCF 가입자 인증 실패 시 HSS Cx 인터페이스 점검 포인트는?',
    '5G SA 환경에서 VoNR 통화 중 끊김 VOC 발생 시 EPS Fallback 분석법',
    '단말 VoLTE 등록 실패 시 Wireshark 패킷에서 확인해야 할 SIP 헤더는?',
    '음성 통화 시 지터(Jitter) 20ms 임계값의 기술적 의미와 5G 개선 효과는?'
  ]
};

interface ChatViewProps {
  initialPrompt?: string | null;
  onClearInitialPrompt?: () => void;
}

export const ChatView: React.FC<ChatViewProps> = ({ initialPrompt, onClearInitialPrompt }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  
  // Saved Queries Drawer State
  const [showQueriesDrawer, setShowQueriesDrawer] = useState(false);
  const [savedQueries, setSavedQueries] = useState<SavedQuery[]>([]);
  const [querySearch, setQuerySearch] = useState('');
  const [queryCategoryFilter, setQueryCategoryFilter] = useState('All');
  const [isLoadingQueries, setIsLoadingQueries] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Fetch saved queries from backend
  const fetchSavedQueries = async () => {
    try {
      setIsLoadingQueries(true);
      const res = await fetch('/api/queries');
      if (res.ok) {
        const data = await res.json();
        setSavedQueries(data.queries || []);
      }
    } catch (err) {
      console.error('Failed to fetch saved queries:', err);
    } finally {
      setIsLoadingQueries(false);
    }
  };

  // Initial fetch of saved queries
  useEffect(() => {
    fetchSavedQueries();
  }, []);

  // Trigger initial prompt if provided
  useEffect(() => {
    if (initialPrompt && initialPrompt.trim()) {
      handleSendMessage(initialPrompt);
      onClearInitialPrompt?.();
    }
  }, [initialPrompt]);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Handle TTS
  const handleToggleSpeak = (msg: ChatMessage) => {
    if (!('speechSynthesis' in window)) {
      alert('이 브라우저는 음성 합성을 지원하지 않습니다.');
      return;
    }

    if (speakingId === msg.id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = msg.content
      .replace(/```[\s\S]*?```/g, '코드 블록 생략')
      .replace(/[*#_`>]/g, '')
      .replace(/\[(.*?)\]\(.*?\)/g, '$1');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'ko-KR';
    utterance.rate = 1.05;
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);

    setSpeakingId(msg.id);
    window.speechSynthesis.speak(utterance);
  };

  // Copy message
  const handleCopyMessage = async (msg: ChatMessage) => {
    try {
      await navigator.clipboard.writeText(msg.content);
      setCopiedId(msg.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  // Send message
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputPrompt).trim();
    if (!text || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const assistantMessageId = `asst-${Date.now()}`;
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputPrompt('');
    setIsLoading(true);

    // Placeholder assistant message for streaming
    const streamingAssistantMessage: ChatMessage = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isStreaming: true,
    };

    setMessages((prev) => [...prev, streamingAssistantMessage]);

    try {
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      if (!response.body) {
        throw new Error('ReadableStream not supported');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let accumulatedText = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.replace('data: ', '').trim();
            if (dataStr === '[DONE]') {
              break;
            }
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.text) {
                accumulatedText += parsed.text;
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessageId
                      ? { ...msg, content: accumulatedText }
                      : msg
                  )
                );
              } else if (parsed.error) {
                accumulatedText += `\n\n[오류 발생: ${parsed.error}]`;
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessageId
                      ? { ...msg, content: accumulatedText }
                      : msg
                  )
                );
              }
            } catch {
              // Non-JSON line or keep-alive
            }
          }
        }
      }

      // Generate suggested follow-up questions
      const suggestions = [
        '해당 문제 해결을 위한 Wireshark 필터 예시를 보여줘',
        '관련 3GPP 표준 규격(TS 번호 및 절)을 알려줘',
        '코어망(P/I/S-CSCF)과 기지국 간 추가 확인 파라미터는?'
      ];

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? { ...msg, isStreaming: false, suggestedQuestions: suggestions }
            : msg
        )
      );

      // Refresh saved queries from backend since the backend auto-saved this query
      fetchSavedQueries();
    } catch (err: any) {
      console.error('Chat error:', err);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? {
                ...msg,
                content: `⚠️ 통신 오류가 발생했습니다: ${err.message || '알 수 없는 오류'}\n다시 시도하거나 질문을 구체화해 주세요.`,
                isStreaming: false,
              }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Reset conversation
  const handleResetChat = () => {
    if (window.confirm('대화 내역을 초기화하시겠습니까? (백엔드에 저장된 질의사항은 유지됩니다)')) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setSpeakingId(null);
      setMessages([INITIAL_MESSAGE]);
    }
  };

  // Export conversation to markdown file
  const handleExportChat = () => {
    const exportContent = messages
      .map(
        (m) =>
          `### [${m.role === 'user' ? '👤 엔지니어 질문' : '🤖 IMS Tech-Guide 전문가 답변'}] (${m.timestamp})\n\n${m.content}\n\n---`
      )
      .join('\n\n');

    const blob = new Blob([exportContent], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `IMS_Tech_Consultation_${new Date().toISOString().slice(0, 10)}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Delete saved query
  const handleDeleteQuery = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/queries/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSavedQueries((prev) => prev.filter((q) => q.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete query:', err);
    }
  };

  // Toggle star
  const handleToggleStar = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/queries/${id}/star`, { method: 'PATCH' });
      if (res.ok) {
        const data = await res.json();
        setSavedQueries((prev) =>
          prev.map((q) => (q.id === id ? { ...q, starred: data.starred } : q))
        );
      }
    } catch (err) {
      console.error('Failed to toggle star:', err);
    }
  };

  // Clear all saved queries
  const handleClearAllQueries = async () => {
    if (window.confirm('Are you sure you want to delete all saved queries?')) {
      try {
        const res = await fetch('/api/queries', { method: 'DELETE' });
        if (res.ok) {
          setSavedQueries([]);
        }
      } catch (err) {
        console.error('Failed to clear queries:', err);
      }
    }
  };

  // Export saved queries to file
  const handleExportSavedQueries = () => {
    const textContent = savedQueries
      .map((q, idx) => `[${idx + 1}] (${q.timestamp.slice(0, 19).replace('T', ' ')}) [${q.category || 'General'}]\n${q.query}\n`)
      .join('\n----------------------------------------\n\n');

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `IMS_User_Queries_Log_${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Key press
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Filtered queries
  const filteredQueries = savedQueries.filter((q) => {
    const matchesSearch = q.query.toLowerCase().includes(querySearch.toLowerCase());
    const matchesCat = queryCategoryFilter === 'All' || q.category === queryCategoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="flex flex-col h-[calc(100vh-4.2rem)] max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-3 gap-3">
      {/* Main Full-Height Chat Messages Window */}
      <div className="flex-1 bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden flex flex-col shadow-2xl backdrop-blur-sm relative">
        {/* Messages Header Bar */}
        <div className="px-4 py-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></div>
            <div>
              <span className="text-sm font-bold text-white tracking-tight">
                Real-Time IMS Technical Consultation
              </span>
              <span className="text-[11px] text-slate-400 font-mono ml-2 hidden sm:inline">
                ({messages.length} messages)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Saved Queries Button (Targeted Element) */}
            <button
              onClick={() => {
                fetchSavedQueries();
                setShowQueriesDrawer(true);
              }}
              title="View Saved User Queries"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700/80 text-cyan-300 border border-slate-700 text-xs font-semibold shadow-sm transition-all"
            >
              <Database className="w-3.5 h-3.5 text-cyan-400" />
              <span>Saved Queries</span>
              <span className="px-1.5 py-0.2 rounded-full bg-cyan-950 text-cyan-300 text-[10px] font-mono border border-cyan-500/40">
                {savedQueries.length}
              </span>
            </button>

            {/* Export Markdown */}
            <button
              onClick={handleExportChat}
              title="Export Consultation Session (Markdown)"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-colors"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Reset Chat */}
            <button
              onClick={handleResetChat}
              title="Reset Chat History"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Message List */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-600 to-blue-700 flex-shrink-0 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-cyan-500/20 mt-1">
                    IMS
                  </div>
                )}

                <div
                  className={`max-w-[90%] md:max-w-[82%] rounded-2xl p-4 sm:p-5 text-sm leading-relaxed shadow-md ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-br-xs'
                      : 'bg-slate-950/90 border border-slate-800 text-slate-200 rounded-bl-xs'
                  }`}
                >
                  {/* Header / Timestamp */}
                  <div className="flex items-center justify-between gap-3 mb-2 pb-1.5 border-b border-slate-700/40 text-[11px] opacity-80">
                    <span className="font-semibold tracking-wide">
                      {msg.role === 'user' ? '👤 현장 엔지니어 질의' : '🤖 IMS Tech-Guide 전문가'}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono">{msg.timestamp}</span>
                      {msg.role === 'assistant' && (
                        <div className="flex items-center gap-1.5 ml-1">
                          <button
                            onClick={() => handleCopyMessage(msg)}
                            title="답변 복사"
                            className="hover:text-cyan-300 transition-colors p-0.5"
                          >
                            {copiedId === msg.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <button
                            onClick={() => handleToggleSpeak(msg)}
                            title={speakingId === msg.id ? '음성 중지' : '음성 읽기 (TTS)'}
                            className="hover:text-cyan-300 transition-colors p-0.5"
                          >
                            {speakingId === msg.id ? (
                              <VolumeX className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                            ) : (
                              <Volume2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Message Content with Markdown */}
                  <div className="prose prose-invert prose-sm max-w-none break-words prose-p:my-2 prose-headings:text-cyan-300 prose-headings:my-2.5 prose-code:bg-slate-900 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-cyan-300 prose-code:font-mono prose-pre:bg-slate-900 prose-pre:border prose-pre:border-slate-800 prose-table:my-2.5 prose-th:bg-slate-900 prose-th:px-3 prose-th:py-1.5 prose-td:px-3 prose-td:py-1.5 prose-li:my-0.5">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content}
                    </ReactMarkdown>
                    {msg.isStreaming && (
                      <span className="inline-block w-2 h-4 bg-cyan-400 animate-pulse ml-1 align-middle" />
                    )}
                  </div>

                  {/* Follow-up Suggested Question Chips */}
                  {msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && !msg.isStreaming && (
                    <div className="mt-3 pt-2.5 border-t border-slate-800/80">
                      <p className="text-[11px] text-slate-400 font-medium mb-1.5 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-cyan-400" /> 추천 후속 질의:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.suggestedQuestions.map((q, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSendMessage(q)}
                            disabled={isLoading}
                            className="text-left text-xs px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700/80 text-cyan-300 hover:border-cyan-400 hover:bg-slate-800 transition-colors"
                          >
                            + {q}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex-shrink-0 flex items-center justify-center text-slate-300 text-xs font-bold mt-1">
                    ENG
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && messages[messages.length - 1]?.role === 'user' && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-600 to-blue-700 flex items-center justify-center text-white text-xs font-bold animate-pulse">
                IMS
              </div>
              <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 text-xs text-slate-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                <span>3GPP 규격 및 VoLTE/VoNR 아키텍처 기반 심층 분석 중...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-slate-950 border-t border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-end gap-2"
          >
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                id="chat-input-textarea"
                rows={2}
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="IMS 장비(S-CSCF/HSS), 단말 SIP REGISTER, 5G VoNR 끊김, 지터(Jitter) 품질 VOC에 관해 질문하세요... (Enter로 전송, Shift+Enter로 줄바꿈)"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 resize-none font-sans"
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              id="send-chat-btn"
              disabled={isLoading || !inputPrompt.trim()}
              className="h-11 px-5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl font-medium text-sm flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-500/25 transition-all flex-shrink-0"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">질의 전송</span>
            </button>
          </form>

          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 px-1">
            <span className="flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400/90 font-medium">User queries auto-saved to backend</span>
              <span className="text-slate-500">(Questions only / AI answers not saved)</span>
            </span>
            <span className="hidden sm:inline">3GPP TS 23.228 / TS 24.229 / TS 23.501</span>
          </div>
        </div>
      </div>

      {/* Saved Queries Drawer / Modal (질의사항 관리자) */}
      <AnimatePresence>
        {showQueriesDrawer && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl p-4 sm:p-6 text-slate-200"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-cyan-400" />
                  <div>
                    <h3 className="text-sm font-bold text-white">Saved Queries Vault</h3>
                    <p className="text-[11px] text-slate-400">
                      User questions only are persisted on backend ({savedQueries.length} saved)
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowQueriesDrawer(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Search & Category Filter */}
              <div className="py-3 space-y-2 border-b border-slate-800">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={querySearch}
                    onChange={(e) => setQuerySearch(e.target.value)}
                    placeholder="Search saved queries..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="flex items-center gap-1 overflow-x-auto text-[11px] pb-0.5">
                  {['All', '장비/아키텍처', '단말/프로토콜', '무선망/5G', '품질VOC/QoS', '일반/기타'].map(
                    (cat) => (
                      <button
                        key={cat}
                        onClick={() => setQueryCategoryFilter(cat)}
                        className={`px-2 py-0.5 rounded whitespace-nowrap transition-colors ${
                          queryCategoryFilter === cat
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                            : 'text-slate-400 hover:text-slate-200 bg-slate-950 border border-slate-800'
                        }`}
                      >
                        {cat === 'All' ? 'All' : cat}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Queries List */}
              <div className="flex-1 overflow-y-auto py-3 space-y-2.5">
                {isLoadingQueries ? (
                  <div className="p-8 text-center text-xs text-slate-500">Loading saved queries...</div>
                ) : filteredQueries.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500 bg-slate-950 rounded-xl border border-slate-800">
                    No saved queries found. Questions you ask will be recorded here automatically.
                  </div>
                ) : (
                  filteredQueries.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col justify-between gap-2 group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-900 text-cyan-300 border border-slate-700">
                          {item.category || 'General'}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => handleToggleStar(item.id, e)}
                            title="Favorite"
                            className={`p-1 rounded hover:bg-slate-800 transition-colors ${
                              item.starred ? 'text-amber-400' : 'text-slate-500'
                            }`}
                          >
                            <Star className="w-3.5 h-3.5 fill-current" />
                          </button>
                          <button
                            onClick={(e) => handleDeleteQuery(item.id, e)}
                            title="Delete"
                            className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <p className="text-xs text-slate-200 line-clamp-3 leading-relaxed font-sans">
                        {item.query}
                      </p>

                      <div className="flex items-center justify-between pt-1 border-t border-slate-900 text-[10px] text-slate-500 font-mono">
                        <span>{item.timestamp.slice(0, 16).replace('T', ' ')}</span>
                        <button
                          onClick={() => {
                            setShowQueriesDrawer(false);
                            handleSendMessage(item.query);
                          }}
                          className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-sans font-semibold text-[11px]"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Send this query</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Drawer Footer Actions */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                <button
                  onClick={handleExportSavedQueries}
                  disabled={savedQueries.length === 0}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs disabled:opacity-40"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Export TXT</span>
                </button>

                <button
                  onClick={handleClearAllQueries}
                  disabled={savedQueries.length === 0}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-rose-400 hover:bg-rose-950/40 text-xs border border-rose-900/50 disabled:opacity-40"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear All</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
