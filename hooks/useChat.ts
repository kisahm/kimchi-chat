'use client';
import { useCallback, useRef } from 'react';
import OpenAI from 'openai';
import { useStore } from '@/lib/store';
import { getKimchiClient } from '@/lib/kimchi-client';
import { Message } from '@/lib/types';

function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function useChat() {
  const { settings, addMessage, updateMessage, createConversation, activeConversationId, getActiveConversation } = useStore();
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (content: string, conversationId?: string) => {
      let convId = conversationId ?? activeConversationId;
      if (!convId) {
        const conv = createConversation();
        convId = conv.id;
      }

      const userMsg: Message = {
        id: generateId(),
        role: 'user',
        content,
        createdAt: Date.now(),
      };
      addMessage(convId, userMsg);

      const assistantMsgId = generateId();
      const assistantMsg: Message = {
        id: assistantMsgId,
        role: 'assistant',
        content: '',
        createdAt: Date.now(),
        isStreaming: true,
      };
      addMessage(convId, assistantMsg);

      const conv = getActiveConversation();
      const history = conv
        ? conv.messages
            .filter((m) => !m.isStreaming && m.id !== assistantMsgId)
            .map((m) => ({ role: m.role, content: m.content }))
        : [];
      history.push({ role: 'user', content });

      const model =
        settings.selectedModel === 'auto' ? undefined : settings.selectedModel;

      abortRef.current = new AbortController();

      try {
        const client = getKimchiClient(settings.apiKey, settings.baseUrl);
        const stream = await client.chat.completions.create(
          {
            model: model ?? 'gpt-4o',
            messages: history as OpenAI.ChatCompletionMessageParam[],
            stream: true,
          },
          { signal: abortRef.current.signal }
        );

        let accumulated = '';
        for await (const chunk of stream) {
          const delta = chunk.choices[0]?.delta?.content ?? '';
          accumulated += delta;
          updateMessage(convId!, assistantMsgId, accumulated, true);
        }
        updateMessage(convId!, assistantMsgId, accumulated, false);
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') {
          // User stopped generation
        } else {
          const msg = err instanceof Error ? err.message : 'Unknown error';
          updateMessage(convId!, assistantMsgId, `Error: ${msg}`, false);
        }
      }
    },
    [settings, addMessage, updateMessage, createConversation, activeConversationId, getActiveConversation]
  );

  const stopGeneration = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const isStreaming = useCallback(() => {
    const conv = getActiveConversation();
    return conv?.messages.some((m) => m.isStreaming) ?? false;
  }, [getActiveConversation]);

  return { sendMessage, stopGeneration, isStreaming };
}
