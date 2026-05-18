import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Conversation, Settings, Message } from './types';

const DEFAULT_SETTINGS: Settings = {
  apiKey: '',
  baseUrl: 'https://llm.cast.ai/openai/v1',
  selectedModel: 'auto',
};

interface Store {
  settings: Settings;
  conversations: Conversation[];
  activeConversationId: string | null;
  setSettings: (s: Partial<Settings>) => void;
  createConversation: () => Conversation;
  setActiveConversation: (id: string | null) => void;
  deleteConversation: (id: string) => void;
  renameConversation: (id: string, title: string) => void;
  addMessage: (conversationId: string, message: Message) => void;
  updateMessage: (conversationId: string, messageId: string, content: string, isStreaming?: boolean) => void;
  updateMessageModel: (conversationId: string, messageId: string, model: string) => void;
  getActiveConversation: () => Conversation | null;
}

function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      settings: DEFAULT_SETTINGS,
      conversations: [],
      activeConversationId: null,

      setSettings: (s) =>
        set((state) => ({ settings: { ...state.settings, ...s } })),

      createConversation: () => {
        const conv: Conversation = {
          id: generateId(),
          title: 'New Chat',
          messages: [],
          model: get().settings.selectedModel,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        set((state) => ({
          conversations: [conv, ...state.conversations],
          activeConversationId: conv.id,
        }));
        return conv;
      },

      setActiveConversation: (id) => set({ activeConversationId: id }),

      deleteConversation: (id) =>
        set((state) => {
          const remaining = state.conversations.filter((c) => c.id !== id);
          const newActive =
            state.activeConversationId === id
              ? (remaining[0]?.id ?? null)
              : state.activeConversationId;
          return { conversations: remaining, activeConversationId: newActive };
        }),

      renameConversation: (id, title) =>
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === id ? { ...c, title } : c
          ),
        })),

      addMessage: (conversationId, message) =>
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === conversationId
              ? {
                  ...c,
                  messages: [...c.messages, message],
                  updatedAt: Date.now(),
                  title:
                    c.title === 'New Chat' && message.role === 'user'
                      ? message.content.slice(0, 50)
                      : c.title,
                }
              : c
          ),
        })),

      updateMessage: (conversationId, messageId, content, isStreaming) =>
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === conversationId
              ? {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === messageId
                      ? { ...m, content, isStreaming: isStreaming ?? false }
                      : m
                  ),
                  updatedAt: Date.now(),
                }
              : c
          ),
        })),

      updateMessageModel: (conversationId, messageId, model) =>
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === conversationId
              ? { ...c, messages: c.messages.map((m) => m.id === messageId ? { ...m, model } : m) }
              : c
          ),
        })),

      getActiveConversation: () => {
        const { conversations, activeConversationId } = get();
        return conversations.find((c) => c.id === activeConversationId) ?? null;
      },
    }),
    {
      name: 'kimchi-chat-store',
    }
  )
);
