import { NextResponse } from "next/server";
import { groqGenerateJson } from "../../../lib/groq";

type ScriptResponse = {
  scriptTitle?: string;
  logline?: string;
  screenplay?: string;
  sceneBreakdown?: string[];
  message?: string;
};

function fallbackScript({ scene, genre, length }: { scene: string; genre: string; length: string }): ScriptResponse {
  const trimmed = scene.trim();
  const sceneCount = length === "Short" ? 3 : length === "Medium" ? 5 : 7;
  const title = "A Film Society Original";
  const logline = `In a ${genre.toLowerCase()}-leaning world, one decision in "${trimmed.slice(0, 70)}${trimmed.length > 70 ? "…" : ""}" forces a character to change what they believed was safe.`;

  const scenes: string[] = [];
  for (let i = 0; i < sceneCount; i++) {
    scenes.push(
      `SCENE ${i + 1}: ${i === 0 ? "Setup" : i === sceneCount - 1 ? "Climax" : "Escalation"}\n` +
        (i === 0
          ? `INT./EXT. LOCATION - Day/Night\nA visual introduction of the mood: ${trimmed}`
          : i === sceneCount - 1
            ? `INT./EXT. LOCATION - Later\nThe protagonist makes the irreversible choice. The scene resolves with a new moral cost.`
            : `INT./EXT. LOCATION - Continuation\nConflict tightens. A small lie/shortcut becomes a bigger problem.`
        ),
    );
  }

  return {
    scriptTitle: title,
    logline,
    screenplay: scenes.join("\n\n"),
    sceneBreakdown: scenes.map((s, idx) => s.split("\n")[0] + (idx === 0 ? " (Setup)" : idx === sceneCount - 1 ? " (Climax)" : "")),
    message: "Groq unavailable. Using a demo screenplay template.",
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const scene = typeof body?.scene === "string" ? body.scene.trim() : "";
    const genre = typeof body?.genre === "string" ? body.genre.trim() : "Drama";
    const length = typeof body?.length === "string" ? body.length.trim() : "Short";

    if (!scene || scene.length < 10) {
      return NextResponse.json({ message: "Scene description is required (min 10 characters)." }, { status: 400 });
    }

    const fallback = fallbackScript({ scene, genre, length });

    const systemPrompt =
      "You are a filmmaking assistant. Return ONLY valid JSON. No markdown. Screenplay content must be a single string with line breaks.";

    const userPrompt = JSON.stringify(
      {
        scene,
        genre,
        length,
        tasks: [
          "Create a screenplay for a short film based on the scene description.",
          "Use a clear structure with scene headings (INT./EXT.), action lines, and brief dialogue.",
          "Return JSON with keys: scriptTitle, logline, screenplay, sceneBreakdown.",
          "sceneBreakdown should be an array of 3-7 short bullets describing each beat.",
        ],
        requiredJsonKeys: ["scriptTitle", "logline", "screenplay", "sceneBreakdown"],
      },
      null,
      2,
    );

    const groq = await groqGenerateJson<ScriptResponse>({
      systemPrompt,
      userPrompt: userPrompt + "\nReturn JSON only with those keys.",
      temperature: 0.8,
      maxOutputTokens: 2500,
    });

    if (!groq.json) {
      return NextResponse.json(
        {
          ...fallback,
          message: `Groq unavailable (${groq.rawText || "invalid JSON"}). Using a demo screenplay template.`,
        },
        { status: 200 },
      );
    }

    return NextResponse.json({
      ...groq.json,
      message: groq.usedFallback ? "Used fallback because Groq returned invalid JSON." : "OK",
    });
  } catch (e) {
    return NextResponse.json(
      { message: e instanceof Error ? e.message : "Script generation failed." },
      { status: 500 },
    );
  }
}

