import { KimchiModel } from './types';

export async function fetchModels(apiKey: string, baseUrl: string): Promise<KimchiModel[]> {
  try {
    const res = await fetch('/api/models', {
      headers: {
        'x-api-key': apiKey,
        'x-base-url': baseUrl,
      },
    });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}
