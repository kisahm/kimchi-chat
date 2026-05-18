'use client';
import { useCallback, useRef } from 'react';
import { useStore } from '@/lib/store';
import { Message } from '@/lib/types';

function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function useChat() {
  const { settings, addMessage, updateMessage, updateMessageModel, createConversation, activeConversationId, getActiveConversation } = useStore();
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
            .filter((m) => !m.isStreaming && m.id !== assistantMsgId && m.id !== userMsg.id)
            .map((m) => ({ role: m.role, content: m.content }))
        : [];
      history.push({ role: 'user', content });

      const model = settings.selectedModel === 'auto' ? undefined : settings.selectedModel;

      abortRef.current = new AbortController();

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: history,
            model,
            apiKey: settings.apiKey,
            baseUrl: settings.baseUrl,
          }),
          signal: abortRef.current.signal,
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
          updateMessage(convId!, assistantMsgId, `Error: ${err.error ?? res.statusText}`, false);
          return;
        }

        const reader = res.body!.getReader();
        const decoder = new TextDecoder();
        let accumulated = '';
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const data = line.slice(6).trim();
            if (data === '[DONE]') break;
            try {
              const parsed = JSON.parse(data);
              if (parsed.error) {
                updateMessage(convId!, assistantMsgId, `Error: ${parsed.error}`, false);
                return;
              }
              if (parsed.model) {
                updateMessageModel(convId!, assistantMsgId, parsed.model);
              }
              if (parsed.delta) {
                accumulated += parsed.delta;
                updateMessage(convId!, assistantMsgId, accumulated, true);
              }
            } catch {
              // ignore malformed chunks
            }
          }
        }

        updateMessage(convId!, assistantMsgId, accumulated, false);
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') {
          const conv = getActiveConversation();
          const msg = conv?.messages.find((m) => m.id === assistantMsgId);
          updateMessage(convId!, assistantMsgId, msg?.content ?? '', false);
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
