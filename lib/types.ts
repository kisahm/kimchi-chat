export type Role = 'user' | 'assistant' | 'system';

export interface Message {
  id: string;
  role: Role;
  content: string;
  createdAt: number;
  isStreaming?: boolean;
  model?: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  model: string;
  createdAt: number;
  updatedAt: number;
}

export interface Settings {
  apiKey: string;
  baseUrl: string;
  selectedModel: string;
}

export interface KimchiModel {
  id: string;
  object: string;
  created?: number;
  owned_by?: string;
}
