import { AiGenerateFailureReason } from '../types/coach';

export interface CallGeminiParams {
  apiKey: string;
  model: string;
  systemInstruction: string;
  userText: string;
  signal?: AbortSignal;
}

export type CallGeminiResult =
  | { ok: true; data: unknown }
  | { ok: false; reason: AiGenerateFailureReason };

function stripCodeFences(raw: string): string {
  const trimmed = raw.trim();
  const fenceMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  if (fenceMatch && fenceMatch[1]) {
    return fenceMatch[1].trim();
  }
  return trimmed;
}

export async function callGemini({
  apiKey,
  model,
  systemInstruction,
  userText,
  signal,
}: CallGeminiParams): Promise<CallGeminiResult> {
  const cleanModel = model.trim() || 'gemini-2.5-flash';
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    cleanModel
  )}:generateContent`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 45000);

  const onExternalAbort = () => controller.abort();
  if (signal) {
    if (signal.aborted) {
      clearTimeout(timeoutId);
      return { ok: false, reason: 'network' };
    }
    signal.addEventListener('abort', onExternalAbort, { once: true });
  }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemInstruction }],
        },
        contents: [
          {
            role: 'user',
            parts: [{ text: userText }],
          },
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.4,
        },
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      if (
        response.status === 400 ||
        response.status === 401 ||
        response.status === 403
      ) {
        return { ok: false, reason: 'auth' };
      }
      if (response.status === 404) {
        return { ok: false, reason: 'model_not_found' };
      }
      if (response.status === 429) {
        return { ok: false, reason: 'quota' };
      }
      return { ok: false, reason: 'network' };
    }

    const json = (await response.json()) as {
      candidates?: {
        content?: {
          parts?: { text?: string }[];
        };
      }[];
    };

    const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text || typeof text !== 'string') {
      return { ok: false, reason: 'invalid_response' };
    }

    try {
      const parsed: unknown = JSON.parse(stripCodeFences(text));
      return { ok: true, data: parsed };
    } catch {
      return { ok: false, reason: 'invalid_response' };
    }
  } catch {
    return { ok: false, reason: 'network' };
  } finally {
    clearTimeout(timeoutId);
    if (signal) {
      signal.removeEventListener('abort', onExternalAbort);
    }
  }
}
