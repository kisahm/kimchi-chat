import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const apiKey = req.headers.get('x-api-key') ?? '';
  const baseUrl = req.headers.get('x-base-url') ?? 'https://llm.cast.ai/openai/v1';

  if (!apiKey) {
    return NextResponse.json({ error: 'API key required' }, { status: 401 });
  }

  const client = new OpenAI({ apiKey, baseURL: baseUrl });

  try {
    const response = await client.models.list();
    return NextResponse.json(response.data);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch models';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
