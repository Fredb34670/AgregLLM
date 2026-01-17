export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: number;
}

export interface Conversation {
  id: string;
  title: string;
  url: string;
  llm: string;
  capturedAt: number;
  messages: Message[];
  summary?: string;
  tags?: string[];
}
