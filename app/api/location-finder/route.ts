import { NextResponse } from "next/server";
import { geminiGenerateJson } from "../../../lib/gemini";

type LocationResponse = {
  locations?: Array<{
    name: string;
    addressOrArea?: string;
    whyMatches?: string;
    gmapQuery?: string;
    timeOfDay?: string;
  }>;
  mapSuggestions?: string[];
  message?: string;
};

function fallbackLocations({ vibe }: { vibe: string }): LocationResponse {
  const v = vibe.trim() || "cinematic";
  const ideas = [
    {
      name: "Old-town street corridor",
      addressOrArea: "Old town / heritage district",
      whyMatches: `Tight visual lines + mixed textures give a ${v} mood.`,
      gmapQuery: "old town street heritage district",
      timeOfDay: "Golden hour",
    },
    {
      name: "City library / reading hall (exterior)",
      addressOrArea: "Near public libraries",
      whyMatches: "Soft light and quiet geometry feel intentional and film-like.",
      gmapQuery: "public library building exterior",
      timeOfDay: "Late afternoon",
    },
    {
      name: "Riverside / waterfront walkway",
      addressOrArea: "Riverside promenade",
      whyMatches: "Reflective surfaces + natural motion suit mood-driven scenes.",
      gmapQuery: "riverside promenade walkway",
      timeOfDay: "Blue hour",
    },
    {
      name: "Covered market lane",
      addressOrArea: "Indoor market / bazaar lane",
      whyMatches: "Dense background layers help sell story tension and vibe.",
      gmapQuery: "covered market lane street",
      timeOfDay: "Evening",
    },
    {
      name: "Concrete underpass / urban shadows",
      addressOrArea: "Urban underpass area",
      whyMatches: `High-contrast lighting supports a ${v} tone.`,
      gmapQuery: "urban underpass concrete alley",
      timeOfDay: "Night (with practical lights)",
    },
  ];

  return {
    locations: ideas,
    mapSuggestions: [
      `cinematic ${v} street market`,
      `${v} alley sidewalk`,
      `${v} riverside walkway`,
    ],
    message: "Gemini key not set. Using demo-friendly location templates.",
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const scene = typeof body?.scene === "string" ? body.scene.trim() : "";
    const surrounding = typeof body?.surrounding === "string" ? body.surrounding.trim() : "";
    const vibe = typeof body?.vibe === "string" ? body.vibe.trim() : "";

    if (!scene || scene.length < 10) {
      return NextResponse.json({ message: "Scene description is required (min 10 characters)." }, { status: 400 });
    }

    const fallback = fallbackLocations({ vibe });

    const systemPrompt =
      "You are a master location scout proposing EXACT, REAL WORLD, hyper-specific film shooting locations. Unless the user specifies a particular city or country in their description, default to locations STRICTLY within Tamil Nadu, India (e.g. 'Napier Bridge in Chennai', 'Thirumalai Nayakkar Mahal in Madurai'). Return ONLY valid JSON. Use highly precise gmapQuery strings suitable for Google Maps search URLs to pinpoint the exact address. Do NOT return generalized areas.";

    const userPrompt = JSON.stringify(
      {
        scene,
        surrounding,
        vibe,
        tasks: [
          "Suggest 5-7 hyper-specific, exact target spot locations that perfectly match the scene visuals and mood.",
          "IMPORTANT: If the user mentions a specific place, use that. Otherwise, ALWAYS suggest exact locations in Tamil Nadu, India.",
          "NO generalized concepts. You must name an EXACT real-world spot, street corner, cafe, public building, or geographic landmark.",
          "Each location must include: name (Exact real-world name), addressOrArea (Exact City/District, Tamil Nadu, or User's requested region), whyMatches (Why this highly specific spot works creatively), gmapQuery (Detailed query to pinpoint the exact location on Google Maps), timeOfDay (Ideal lighting/time).",
          "Also provide 3 extra highly precise map search ideas as mapSuggestions.",
        ],
        requiredJsonKeys: ["locations", "mapSuggestions"],
      },
      null,
      2,
    );

    const gemini = await geminiGenerateJson<LocationResponse>({
      systemPrompt,
      userPrompt: userPrompt + "\nReturn JSON only with keys locations and mapSuggestions.",
      temperature: 0.6,
    });

    if (!gemini.json) {
      return NextResponse.json(fallback, { status: 200 });
    }

    return NextResponse.json({
      ...gemini.json,
      message: gemini.usedFallback ? "Used fallback because Gemini returned invalid JSON." : "OK",
    });
  } catch (e) {
    return NextResponse.json(
      { message: e instanceof Error ? e.message : "Location finder failed." },
      { status: 500 },
    );
  }
}

