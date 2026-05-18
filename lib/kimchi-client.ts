import OpenAI from 'openai';
import { KimchiModel } from './types';

let clientCache: { client: OpenAI; apiKey: string; baseUrl: string } | null = null;

export function getKimchiClient(apiKey: string, baseUrl: string): OpenAI {
  if (
    clientCache &&
    clientCache.apiKey === apiKey &&
    clientCache.baseUrl === baseUrl
  ) {
    return clientCache.client;
  }
  const client = new OpenAI({
    apiKey,
    baseURL: baseUrl,
    dangerouslyAllowBrowser: true,
  });
  clientCache = { client, apiKey, baseUrl };
  return client;
}

export async function fetchModels(
  apiKey: string,
  baseUrl: string
): Promise<KimchiModel[]> {
  const client = getKimchiClient(apiKey, baseUrl);
  try {
    const response = await client.models.list();
    return response.data as KimchiModel[];
  } catch {
    return [];
  }
}
