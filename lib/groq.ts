type GroqJsonResult<T> = {
  json: T | null;
  rawText: string;
  usedFallback: boolean;
};

type GroqResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  error?: {
    message?: string;
  };
};

const DEFAULT_GROQ_MODEL = "llama-3.1-8b-instant";

function extractFirstJsonObject(text: string): string | null {
  const firstBrace = text.indexOf("{");
  const firstBracket = text.indexOf("[");
  let startIdx = firstBrace;
  let endIdx = text.lastIndexOf("}");

  if (firstBracket !== -1 && (firstBrace === -1 || firstBracket < firstBrace)) {
    startIdx = firstBracket;
    endIdx = text.lastIndexOf("]");
  }

  if (startIdx === -1 || endIdx === -1 || endIdx <= startIdx) return null;
  return text.slice(startIdx, endIdx + 1);
}

export async function groqGenerateJson<T>({
  systemPrompt,
  userPrompt,
  temperature = 0.7,
  maxOutputTokens = 2048,
  model = process.env.GROQ_MODEL || DEFAULT_GROQ_MODEL,
}: {
  systemPrompt?: string;
  userPrompt: string;
  temperature?: number;
  maxOutputTokens?: number;
  model?: string;
}): Promise<GroqJsonResult<T>> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return {
      json: null,
      rawText: "GROQ_API_KEY is missing.",
      usedFallback: true,
    };
  }

  const body = {
    model,
    temperature,
    max_tokens: maxOutputTokens,
    messages: [
      ...(systemPrompt?.trim() ? [{ role: "system", content: systemPrompt }] : []),
      { role: "user", content: userPrompt },
    ],
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25000);

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    const data = (await res.json().catch(() => null)) as GroqResponse | null;
    const rawText = data?.choices?.[0]?.message?.content?.trim() || "";

    if (!res.ok) {
      return {
        json: null,
        rawText: data?.error?.message || rawText || `Groq request failed (Status: ${res.status}).`,
        usedFallback: true,
      };
    }

    const jsonStr = extractFirstJsonObject(rawText);
    if (!jsonStr) {
      return { json: null, rawText, usedFallback: true };
    }

    const parsed = JSON.parse(jsonStr) as T;
    return { json: parsed, rawText, usedFallback: false };
  } catch (e) {
    return {
      json: null,
      rawText: e instanceof Error ? e.message : "Groq call failed.",
      usedFallback: true,
    };
  } finally {
    clearTimeout(timeout);
  }
}
