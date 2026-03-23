type GeminiJsonResult<T> = {
  json: T | null;
  rawText: string;
  usedFallback: boolean;
};

type GeminiRequestBody = {
  contents: Array<{
    role: "user";
    parts: Array<{ text: string }>;
  }>;
  generationConfig: {
    temperature: number;
    maxOutputTokens: number;
    responseMimeType: "application/json";
  };
  systemInstruction?: {
    parts: Array<{ text: string }>;
  };
};

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
  promptFeedback?: {
    blockReason?: string;
  };
};

function extractFirstJsonObject(text: string): string | null {
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) return null;
  return text.slice(firstBrace, lastBrace + 1);
}

export async function geminiGenerateJson<T>({
  systemPrompt,
  userPrompt,
  temperature = 0.7,
  maxOutputTokens = 2048,
  model = process.env.GEMINI_MODEL ?? "gemini-1.5-flash",
}: {
  systemPrompt?: string;
  userPrompt: string;
  temperature?: number;
  maxOutputTokens?: number;
  model?: string;
}): Promise<GeminiJsonResult<T>> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      json: null,
      rawText: "",
      usedFallback: true,
    };
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    model,
  )}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const body: GeminiRequestBody = {
    contents: [
      {
        role: "user",
        parts: [{ text: userPrompt }],
      },
    ],
    generationConfig: {
      temperature,
      maxOutputTokens,
      responseMimeType: "application/json",
    },
  };

  if (systemPrompt?.trim()) {
    body.systemInstruction = {
      parts: [{ text: systemPrompt }],
    };
  }

  const controller = new AbortController();
  const timeoutMs = 25000;
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    const data = (await res.json().catch(() => null)) as GeminiResponse | null;
    const parts = data?.candidates?.[0]?.content?.parts;
    const rawTextFromParts = Array.isArray(parts)
      ? parts
          .map((p) => (p && typeof p.text === "string" ? p.text : ""))
          .filter(Boolean)
          .join("\n")
      : "";
    const rawTextPromptFeedback =
      typeof data?.promptFeedback?.blockReason === "string" ? data.promptFeedback.blockReason : "";
    const rawText = rawTextFromParts || rawTextPromptFeedback;

    if (!res.ok) {
      return { json: null, rawText: rawText || "Gemini request failed.", usedFallback: true };
    }

    const asText = (rawText ?? "").trim();
    const jsonStr = extractFirstJsonObject(asText);

    if (!jsonStr) {
      return { json: null, rawText: asText, usedFallback: true };
    }

    const parsed = JSON.parse(jsonStr) as T;
    return { json: parsed, rawText: asText, usedFallback: false };
  } catch (e) {
    return {
      json: null,
      rawText: e instanceof Error ? e.message : "Gemini call failed.",
      usedFallback: true,
    };
  } finally {
    clearTimeout(timeout);
  }
}

