const STOPWORDS = new Set([
  "the",
  "a",
  "an",
  "and",
  "or",
  "but",
  "if",
  "then",
  "than",
  "to",
  "of",
  "in",
  "on",
  "at",
  "for",
  "with",
  "without",
  "from",
  "by",
  "as",
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "being",
  "it",
  "this",
  "that",
  "these",
  "those",
  "i",
  "you",
  "he",
  "she",
  "they",
  "we",
  "my",
  "your",
  "our",
  "their",
  "not",
  "no",
  "yes",
  "into",
  "over",
  "under",
  "about",
  "around",
  "through",
  "between",
]);

function normalize(text: string) {
  return text
    .toLowerCase()
    .replace(/[\u2019']/g, "'")
    .replace(/[^a-z0-9\s'-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function tokenize(text: string): string[] {
  const n = normalize(text);
  if (!n) return [];
  const raw = n.split(/[\s]+/g).filter(Boolean);
  return raw.filter((t) => t.length >= 2 && !STOPWORDS.has(t));
}

export type TfVector = Map<string, number>;

export function toTfVector(tokens: string[]): TfVector {
  const v = new Map<string, number>();
  for (const t of tokens) {
    v.set(t, (v.get(t) ?? 0) + 1);
  }
  return v;
}

export function cosineSimilarity(a: TfVector, b: TfVector): number {
  let dot = 0;
  let magA = 0;
  let magB = 0;

  for (const [, val] of a) magA += val * val;
  for (const [, val] of b) magB += val * val;

  if (magA === 0 || magB === 0) return 0;

  const [small, large] = a.size <= b.size ? [a, b] : [b, a];
  for (const [token, aval] of small) {
    const bval = large.get(token);
    if (!bval) continue;
    dot += aval * bval;
  }

  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

export type SimilarityMatch = {
  similarity: number; // 0..1
  storySnippet: string;
};

export function computeSimilarityMatches({
  inputStory,
  existingStories,
  topK = 3,
}: {
  inputStory: string;
  existingStories: Array<{ story: string }>;
  topK?: number;
}): SimilarityMatch[] {
  const inputTokens = tokenize(inputStory);
  const inputVec = toTfVector(inputTokens);

  const scored = existingStories
    .map((s) => {
      const tokens = tokenize(s.story);
      const vec = toTfVector(tokens);
      const sim = cosineSimilarity(inputVec, vec);
      const snippet = s.story.length > 220 ? s.story.slice(0, 220) + "…" : s.story;
      return { similarity: sim, storySnippet: snippet };
    })
    .sort((x, y) => y.similarity - x.similarity);

  return scored.slice(0, topK).filter((x) => x.similarity > 0);
}

