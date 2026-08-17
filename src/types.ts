// Shared domain types for GenAI Mentor.

export type Sender = 'user' | 'assistant';

export interface Message {
  id: string;
  text: string;
  sender: Sender;
  timestamp: number; // epoch milliseconds
}

export interface Session {
  id: string;
  title: string;
  createdAt: number; // epoch milliseconds
  updatedAt: number; // epoch milliseconds
  messages: Message[];
}

export type Theme = 'dark' | 'light';
export type FontScale = 'compact' | 'comfortable' | 'spacious';

export interface Settings {
  theme: Theme;
  fontScale: FontScale;
}

export type ViewId = 'chat' | 'history' | 'settings' | 'analytics';
