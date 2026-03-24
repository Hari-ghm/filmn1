import { NextResponse } from "next/server";
import { groqGenerateJson } from "../../../lib/groq";

type EmotionDataPoint = {
  segment: number;
  textSnippet: string;
  joy: number;
  sadness: number;
  anger: number;
  fear: number;
  surprise: number;
  trust: number;
};

type EmotionAnalysisResponse = {
  overallSentiment: string;
  summary: string;
  arc: EmotionDataPoint[];
};

function fallbackAnalysis(text: string): EmotionAnalysisResponse {
  const segments = text.split('.').filter(s => s.trim().length > 0).slice(0, 5);
  if (segments.length === 0) segments.push(text);
  
  return {
    overallSentiment: "Neutral (Fallback)",
    summary: "Could not reach the AI to analyze emotions, showing fallback data.",
    arc: segments.map((seg, i) => ({
      segment: i + 1,
      textSnippet: seg.slice(0, 50) + "...",
      joy: Math.random() * 100,
      sadness: Math.random() * 100,
      anger: Math.random() * 50,
      fear: Math.random() * 40,
      surprise: Math.random() * 80,
      trust: Math.random() * 90,
    }))
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const text = typeof body?.text === "string" ? body.text.trim() : "";

    if (!text || text.length < 10) {
      return NextResponse.json({ message: "Text description is required (min 10 characters)." }, { status: 400 });
    }

    const fallback = fallbackAnalysis(text);

    const systemPrompt =
      "You are an expert NLP and sentiment analysis engine. You analyze text for narrative and emotional arcs. Respond ONLY with valid JSON.";

    const userPrompt = JSON.stringify({
      task: "Analyze the provided text to extract emotional arcs across its narrative progression.",
      text: text,
      instructions: [
        "Divide the text mentally into up to 5 sequential segments.",
        "For each segment, score the following emotions from 0 to 100: joy, sadness, anger, fear, surprise, trust.",
        "Return a JSON object with keys: overallSentiment (string), summary (string), and arc (array of segment objects).",
        "Each object in 'arc' must have: segment (number), textSnippet (short string ~30 chars), joy (number), sadness (number), anger (number), fear (number), surprise (number), trust (number)."
      ]
    }, null, 2);

    const groq = await groqGenerateJson<EmotionAnalysisResponse>({
      systemPrompt,
      userPrompt: userPrompt + "\nOutput strict JSON matching the instructions.",
      temperature: 0.3,
      maxOutputTokens: 2000,
    });

    if (!groq.json || !groq.json.arc) {
      return NextResponse.json(fallback, { status: 200 });
    }

    return NextResponse.json(groq.json);
  } catch (e) {
    return NextResponse.json(
      { message: e instanceof Error ? e.message : "Analysis failed." },
      { status: 500 },
    );
  }
}
