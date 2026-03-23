import { pipeline, env } from '@xenova/transformers';

// Skip local model checks, use HuggingFace CDN for the models.
env.allowLocalModels = false;

export type SimilarityMatch = {
  similarity: number; // 0..1
  storySnippet: string;
};

class PipelineSingleton {
  static task = 'feature-extraction' as const;
  static model = 'Xenova/all-MiniLM-L6-v2';
  static instance: any = null;

  static async getInstance() {
    if (!this.instance) {
      this.instance = await pipeline(this.task, this.model);
    }
    return this.instance;
  }
}

function dotProduct(a: number[], b: number[]) {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    sum += a[i] * b[i];
  }
  return sum;
}

function magnitude(arr: number[]) {
  let sum = 0;
  for (const val of arr) {
    sum += val * val;
  }
  return Math.sqrt(sum);
}

function cosineSimilarity(a: number[], b: number[]) {
  const magA = magnitude(a);
  const magB = magnitude(b);
  if (magA === 0 || magB === 0) return 0;
  return dotProduct(a, b) / (magA * magB);
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
  
  const extractor = await PipelineSingleton.getInstance();
  
  // Extract embedding for the input story
  const inputOut = await extractor(inputStory, { pooling: 'mean', normalize: true });
  const inputEmbedding = Array.from(inputOut.data) as number[];

  const scored: SimilarityMatch[] = [];
  
  // Extract embeddings and compute similarities for existing stories
  for (const s of existingStories) {
    const sOut = await extractor(s.story, { pooling: 'mean', normalize: true });
    const sEmbedding = Array.from(sOut.data) as number[];
    const sim = cosineSimilarity(inputEmbedding, sEmbedding);
    const snippet = s.story.length > 220 ? s.story.slice(0, 220) + "…" : s.story;
    scored.push({ similarity: sim, storySnippet: snippet });
  }

  scored.sort((x, y) => y.similarity - x.similarity);

  return scored.slice(0, topK).filter((x) => x.similarity > 0);
}

