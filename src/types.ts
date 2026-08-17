export type ChatRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: string;
  category?: 'equipment' | 'terminal' | 'wireless' | 'qos' | 'general';
  suggestedQuestions?: string[];
  isStreaming?: boolean;
}

export interface ScenarioPreset {
  id: string;
  title: string;
  category: 'equipment' | 'terminal' | 'wireless' | 'qos';
  categoryLabel: string;
  badgeColor: string;
  iconName: string;
  summary: string;
  prompt: string;
  keyPoints: string[];
}

export interface GlossaryItem {
  id: string;
  term: string;
  fullForm: string;
  category: 'Core Architecture' | 'Signaling & Protocol' | 'Terminal & Modem' | 'QoS & VOC' | '5G Evolution & SBA';
  specification: string;
  description: string;
  keyRole: string;
  interfaces?: string[];
  protocols?: string[];
  practicalTip?: string;
}

export interface SampleLog {
  id: string;
  title: string;
  category: string;
  deviceType: string;
  networkMode: string;
  description: string;
  logText: string;
  expectedRootCause: string;
}

export interface QoSMetrics {
  callSetupTimeMs: number;
  jitterMs: number;
  packetLossPercent: number;
  roundTripDelayMs: number;
  codec: string;
  mosScore: number;
  rFactor: number;
  qualityLevel: 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Bad';
}

export interface SavedQuery {
  id: string;
  query: string;
  timestamp: string;
  category?: string;
  starred?: boolean;
}

