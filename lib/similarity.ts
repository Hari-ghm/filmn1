import { groqGenerateJson } from "./groq";

export type SimilarityMatch = {
  similarity: number; // 0..1
  storySnippet: string;
};

function trimForPrompt(text: string, maxChars: number): string {
  const cleaned = (text || "").trim();
  if (cleaned.length <= maxChars) return cleaned;
  return `${cleaned.slice(0, maxChars)}...`;
}

function normalizeMatches(data: unknown, topK: number): SimilarityMatch[] {
  if (!Array.isArray(data)) return [];

  const normalized: SimilarityMatch[] = [];
  for (const item of data) {
    if (!item || typeof item !== "object") continue;
    const similarityRaw = (item as { similarity?: unknown }).similarity;
    const snippetRaw = (item as { storySnippet?: unknown }).storySnippet;
    const similarity = typeof similarityRaw === "number" ? similarityRaw : Number(similarityRaw);
    const storySnippet = typeof snippetRaw === "string" ? snippetRaw.trim() : "";

    if (!Number.isFinite(similarity) || similarity <= 0 || !storySnippet) continue;
    normalized.push({
      similarity: Math.max(0, Math.min(1, similarity)),
      storySnippet: storySnippet.slice(0, 220),
    });
  }

  normalized.sort((a, b) => b.similarity - a.similarity);
  return normalized.slice(0, topK);
}

function buildSimilarityPrompt({
  inputStory,
  existingStories,
  topK,
}: {
  inputStory: string;
  existingStories: Array<{ story: string }>;
  topK: number;
}): string {
  const compactInput = trimForPrompt(inputStory, 1000);
  const compactExisting = existingStories
    .slice(0, 20)
    .map((s, idx) => `[Story ${idx}] ${trimForPrompt(s.story, 500)}`)
    .join("\n\n");

  return `Compare one new story with existing stories and return strict JSON only.

New Story:
"""
${compactInput}
"""

Existing Stories:
${compactExisting}

Task:
- Score similarity of plot/themes/characters from 0.0 to 1.0.
- Return top ${topK} matches with score > 0.
- Return ONLY a JSON array.
- Each item must contain:
  - "similarity": number
  - "storySnippet": short snippet from matched existing story`;
}

export async function computeSimilarityMatches({
  inputStory,
  existingStories,
  topK = 3,
}: {
  inputStory: string;
  existingStories: Array<{ story: string }>;
  topK?: number;
}): Promise<SimilarityMatch[]> {
  if (!existingStories || existingStories.length === 0) return [];

  const prompt = buildSimilarityPrompt({ inputStory, existingStories, topK });
  const firstTry = await groqGenerateJson<SimilarityMatch[]>({
    systemPrompt: "You are an expert narrative similarity evaluator. Output strict JSON array of objects.",
    userPrompt: prompt,
    temperature: 0.1, // low temperature for consistent evaluation
    maxOutputTokens: 900,
  });
  const firstMatches = normalizeMatches(firstTry.json, topK);
  if (firstMatches.length > 0) return firstMatches;

  // Retry once with even tighter constraints when JSON is malformed/truncated.
  const retry = await groqGenerateJson<SimilarityMatch[]>({
    systemPrompt: "Return ONLY valid JSON array. No markdown. No prose.",
    userPrompt: `${prompt}\n\nReturn at most ${topK} items. Keep each storySnippet under 120 characters.`,
    temperature: 0,
    maxOutputTokens: 500,
  });
  const retryMatches = normalizeMatches(retry.json, topK);
  if (retryMatches.length > 0) return retryMatches;

  console.error('[Similarity Error] Failed to generate valid JSON:', retry.rawText || firstTry.rawText);
  return [];
}

