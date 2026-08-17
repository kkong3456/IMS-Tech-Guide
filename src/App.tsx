/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { ChatView } from './components/ChatView';
import { TraceAnalyzerView } from './components/TraceAnalyzerView';
import { QoSDashboardView } from './components/QoSDashboardView';
import { GlossaryView } from './components/GlossaryView';
import { ArchitectureView } from './components/ArchitectureView';

export default function App() {
  const [activeTab, setActiveTab] = useState<'chat' | 'analyzer' | 'qos' | 'glossary' | 'architecture'>('chat');
  const [prefilledChatPrompt, setPrefilledChatPrompt] = useState<string | null>(null);

  const handleAskAIFromOtherViews = (prompt: string) => {
    setPrefilledChatPrompt(prompt);
    setActiveTab('chat');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Navigation */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 w-full">
        {activeTab === 'chat' && (
          <ChatView
            initialPrompt={prefilledChatPrompt}
            onClearInitialPrompt={() => setPrefilledChatPrompt(null)}
          />
        )}
        {activeTab === 'analyzer' && <TraceAnalyzerView />}
        {activeTab === 'qos' && <QoSDashboardView />}
        {activeTab === 'glossary' && <GlossaryView onAskAI={handleAskAIFromOtherViews} />}
        {activeTab === 'architecture' && <ArchitectureView onAskAI={handleAskAIFromOtherViews} />}
      </main>

      {/* Persistent Status Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 py-2.5 px-4 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            <span>IMS Tech-Guide Core Engine v2.4 (3GPP Rel-18 Ready)</span>
          </div>
          <div>
            <span>Target: 4G VoLTE / 5G VoNR / IMS Architecture &amp; Quality VOC</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
