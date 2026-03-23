import { NextResponse } from "next/server";
import { connectToMongo } from "../../../lib/mongoose";
import { Plot } from "../../../lib/models/Plot";
import { computeSimilarityMatches } from "../../../lib/similarity";
import { geminiGenerateJson } from "../../../lib/gemini";

type OriginalityResponse = {
  similarityMatches?: Array<{ similarity: number; storySnippet: string }>;
  uniquenessAngle?: string;
  rewrites?: Array<{ name: string; logline: string }>;
  plotDifferentiationChecklist?: string[];
  stored?: boolean;
  message?: string;
};

function fallbackOriginality({
  matches,
  hasMongo,
}: {
  matches: OriginalityResponse["similarityMatches"] | undefined;
  hasMongo: boolean;
}): OriginalityResponse {
  const overlap =
    matches && matches.length
      ? `Your plot shares recurring motifs with existing stories (top match: ${Math.round(matches[0].similarity * 100)}%).`
      : "No existing plots found yet, so we’ll focus on structural uniqueness.";

  return {
    similarityMatches: matches,
    uniquenessAngle: `${overlap}\n\nTo make it unmistakably yours, anchor the story on a single irreversible change (inciting incident), give the protagonist a goal that forces hard trade-offs, and re-route the climax toward a different moral cost.`,
    rewrites: [
      { name: "Sharper promise", logline: "A desperate choice forces the protagonist to win a battle that destroys what they’re trying to protect." },
      { name: "Unexpected contradiction", logline: "The more they try to fix the past, the worse the present becomes—until a final act reveals the real villain is a belief." },
      { name: "Fresh perspective", logline: "A side character inherits the problem, and their unlikely skill turns the ‘hero’ path into a ‘survival’ path." },
    ],
    plotDifferentiationChecklist: [
      "Change the inciting incident to an irreversible new trigger.",
      "Flip the protagonist’s core belief (what they think will save them).",
      "Introduce a secondary character with conflicting stakes.",
      "Make the midpoint create a new problem, not just a setback.",
      "Design a climax where the protagonist pays a different kind of cost.",
      "Add one sensory signature scene that becomes your film’s ‘fingerprint’.",
    ],
    stored: hasMongo,
    message: hasMongo
      ? "Gemini key not set. Showing heuristic originality guidance."
      : "Mongo/Gemini not configured. Showing heuristic originality guidance.",
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const story = typeof body?.story === "string" ? body.story.trim() : "";

    if (!story || story.length < 20) {
      return NextResponse.json({ message: "Story is required (min 20 characters)." }, { status: 400 });
    }
    if (story.length > 6000) {
      return NextResponse.json({ message: "Story is too long (max 6000 characters)." }, { status: 400 });
    }

    // Mongo similarity (optional).
    const mongo = await connectToMongo().catch(() => null);
    const hasMongo = Boolean(mongo);

    let existingStories: Array<{ story: string }> = [];
    if (hasMongo) {
      existingStories = await Plot.find()
        .sort({ createdAt: -1 })
        .limit(20)
        .select({ story: 1 })
        .lean();
    }

    const matches = await computeSimilarityMatches({
      inputStory: story,
      existingStories,
      topK: 3,
    });

    const originalityMatches = matches.map((m) => ({
      similarity: Number(m.similarity.toFixed(4)),
      storySnippet: m.storySnippet,
    }));

    const systemPrompt =
      "You are a film script development assistant for a film society hackathon. Return ONLY valid JSON. Do not wrap in markdown.";

    const userPrompt = JSON.stringify(
      {
        input: story,
        closestExistingPlots: originalityMatches,
        tasks: [
          "Explain the overlap briefly (uniquenessAngle).",
          "Provide 3 rewrite ideas for a stronger, more distinct logline (rewrites).",
          "Provide a 6-item checklist of concrete plot elements to change (plotDifferentiationChecklist).",
        ],
        requiredJsonKeys: [
          "similarityMatches",
          "uniquenessAngle",
          "rewrites",
          "plotDifferentiationChecklist",
        ],
      },
      null,
      2,
    );

    const gemini = await geminiGenerateJson<OriginalityResponse>({
      systemPrompt,
      userPrompt: userPrompt + "\n\nReturn JSON with those exact keys.",
    });

    let response: OriginalityResponse;
    if (gemini.json) {
      response = {
        ...gemini.json,
        similarityMatches: gemini.json.similarityMatches?.length ? gemini.json.similarityMatches : originalityMatches,
        stored: hasMongo,
      };
      response.message = gemini.usedFallback ? "Used fallback because Gemini returned invalid JSON." : "OK";
    } else {
      response = fallbackOriginality({ matches: originalityMatches, hasMongo });
    }

    // Store the new plot for future similarity checks (best-effort).
    if (hasMongo) {
      try {
        await Plot.create({ story });
      } catch {
        // Ignore storage errors during demo.
      }
    }

    return NextResponse.json(response, { status: 200 });
  } catch (e) {
    return NextResponse.json(
      { message: e instanceof Error ? e.message : "Originality check failed." },
      { status: 500 },
    );
  }
}

