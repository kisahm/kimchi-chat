import { NextRequest } from 'next/server';
import OpenAI from 'openai';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function resolveModel(client: OpenAI, requestedModel: string | undefined): Promise<string> {
  // If a specific model was chosen, use it
  if (requestedModel && requestedModel !== 'auto') return requestedModel;

  // Auto: pick the first available model from the API
  try {
    const models = await client.models.list();
    const first = models.data[0]?.id;
    if (first) return first;
  } catch {
    // fall through to hardcoded default
  }
  return 'kimi-k2.6';
}

export async function POST(req: NextRequest) {
  const { messages, model, apiKey, baseUrl } = await req.json();

  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'API key required' }), { status: 401 });
  }

  const client = new OpenAI({
    apiKey,
    baseURL: baseUrl ?? 'https://llm.cast.ai/openai/v1',
  });

  const encoder = new TextEncoder();

  const readable = new ReadableStream({
    async start(controller) {
      try {
        const resolvedModel = await resolveModel(client, model);

        const stream = await client.chat.completions.create({
          model: resolvedModel,
          messages,
          stream: true,
        });

        // Send the resolved model name as the first event so the UI can display it
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ model: resolvedModel })}\n\n`));

        for await (const chunk of stream) {
          const delta = chunk.choices[0]?.delta?.content ?? '';
          if (delta) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ delta })}\n\n`));
          }
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Stream error';
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: msg })}\n\n`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
