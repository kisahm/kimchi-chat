// Tauri command bindings for desktop app integration

export interface ChatMessage {
  role: string;
  content: string;
}

export interface ChatStreamEvent {
  event: 'model' | 'delta' | 'error';
  data?: {
    model?: string;
    delta?: string;
    error?: string;
  };
}

// Detect if running in Tauri environment
export function isTauri(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}

// Chat streaming via Tauri
export async function chatStream(
  messages: ChatMessage[],
  model: string | undefined,
  apiKey: string,
  baseUrl: string,
  onModel: (model: string) => void,
  onDelta: (delta: string) => void,
  onError: (error: string) => void,
  signal?: AbortSignal
): Promise<void> {
  if (!isTauri()) {
    throw new Error('Tauri not available');
  }

  // Dynamic import to avoid errors in web mode
  const { invoke } = await import('@tauri-apps/api/core');
  const { Channel } = await import('@tauri-apps/api/core');

  return new Promise((resolve, reject) => {
    let isAborted = false;

    const channel = new Channel<ChatStreamEvent>();
    
    channel.onmessage = (event: ChatStreamEvent) => {
      if (isAborted) return;

      switch (event.event) {
        case 'model':
          if (event.data?.model) {
            onModel(event.data.model);
          }
          break;
        case 'delta':
          if (event.data?.delta) {
            onDelta(event.data.delta);
          }
          break;
        case 'error':
          onError(event.data?.error || 'Unknown error');
          break;
      }
    };

    const invokePromise = invoke('chat', {
      messages,
      model: model || null,
      apiKey,
      baseUrl,
      onEvent: channel,
    });

    // Handle abort
    if (signal) {
      signal.addEventListener('abort', () => {
        isAborted = true;
        // Note: Tauri commands can't be cancelled once invoked,
        // but we stop processing events
        reject(new Error('Aborted'));
      });
    }

    invokePromise
      .then(() => {
        if (!isAborted) {
          resolve();
        }
      })
      .catch((err: Error) => {
        if (!isAborted) {
          reject(err);
        }
      });
  });
}
