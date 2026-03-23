"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "../components/theme-toggle";

type ToolStatus = "idle" | "loading" | "error";

type OriginalityResponse = {
  similarityMatches?: Array<{ similarity: number; storySnippet: string }>;
  uniquenessAngle?: string;
  rewrites?: Array<{ name: string; logline: string }>;
  plotDifferentiationChecklist?: string[];
  stored?: boolean;
  message?: string;
};

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

type ScriptResponse = {
  scriptTitle?: string;
  logline?: string;
  screenplay?: string;
  sceneBreakdown?: string[];
  message?: string;
};

export default function DashboardClient({ name, age }: { name: string; age: string }) {
  const router = useRouter();

  const [story, setStory] = useState("");
  const [originality, setOriginality] = useState<OriginalityResponse | null>(null);
  const [origStatus, setOrigStatus] = useState<ToolStatus>("idle");
  const [origError, setOrigError] = useState<string | null>(null);

  const [scene, setScene] = useState("");
  const [surrounding, setSurrounding] = useState("");
  const [vibe, setVibe] = useState("");
  const [locations, setLocations] = useState<LocationResponse | null>(null);
  const [locStatus, setLocStatus] = useState<ToolStatus>("idle");
  const [locError, setLocError] = useState<string | null>(null);

  const [sceneToScript, setSceneToScript] = useState("");
  const [genre, setGenre] = useState("Drama");
  const [length, setLength] = useState("Short");
  const [script, setScript] = useState<ScriptResponse | null>(null);
  const [scriptStatus, setScriptStatus] = useState<ToolStatus>("idle");
  const [scriptError, setScriptError] = useState<string | null>(null);

  async function runOriginality() {
    setOrigError(null);
    setOrigStatus("loading");
    setOriginality(null);

    try {
      const res = await fetch("/api/originality", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ story }),
      });
      const data = (await res.json()) as OriginalityResponse;
      if (!res.ok) throw new Error(data.message ?? "Originality check failed.");
      setOriginality(data);
      setOrigStatus("idle");
    } catch (e) {
      setOrigStatus("error");
      setOrigError(e instanceof Error ? e.message : "Something went wrong.");
    }
  }

  async function runLocations() {
    setLocError(null);
    setLocStatus("loading");
    setLocations(null);

    try {
      const res = await fetch("/api/location-finder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scene, surrounding, vibe }),
      });
      const data = (await res.json()) as LocationResponse;
      if (!res.ok) throw new Error(data.message ?? "Location finder failed.");
      setLocations(data);
      setLocStatus("idle");
    } catch (e) {
      setLocStatus("error");
      setLocError(e instanceof Error ? e.message : "Something went wrong.");
    }
  }

  async function runScript() {
    setScriptError(null);
    setScriptStatus("loading");
    setScript(null);

    try {
      const res = await fetch("/api/script-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scene: sceneToScript, genre, length }),
      });
      const data = (await res.json()) as ScriptResponse;
      if (!res.ok) throw new Error(data.message ?? "Script generation failed.");
      setScript(data);
      setScriptStatus("idle");
    } catch (e) {
      setScriptStatus("error");
      setScriptError(e instanceof Error ? e.message : "Something went wrong.");
    }
  }

  return (
    <div className="min-h-dvh flex flex-col relative overflow-hidden bg-background">
      <div className="film-grain" />
      <div className="cinematic-vignette" />

      <header className="relative z-50 flex items-center justify-between w-full p-8 md:px-12 lg:px-24">
        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="uppercase tracking-[0.2em] text-[10px] text-foreground/70 hover:text-primary transition-colors flex items-center gap-2"
          >
            <span>←</span> Back
          </button>
          <div className="w-8 h-8 flex items-center justify-center border border-primary/40 rounded-full bg-black/5 dark:bg-white/5 backdrop-blur-md">
            <span className="font-serif text-sm italic font-bold text-primary">f</span>
          </div>
          <div className="uppercase tracking-[0.3em] text-[10px] font-semibold opacity-80 hidden sm:block">
            filmn1 workspace
          </div>
        </div>
        <ThemeToggle />
      </header>

      <main className="relative z-40 flex-1 w-full max-w-screen-2xl mx-auto px-8 md:px-12 lg:px-24 pb-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 mt-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center justify-center py-1.5 px-4 border border-primary/40 rounded-full text-primary text-[10px] uppercase tracking-widest w-fit mb-6 bg-primary/5 backdrop-blur-sm">
              Dashboard
            </div>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl tracking-tight leading-tight">
              Welcome, {name ? <span className="italic text-primary">{name}</span> : "Creator"}
            </h1>
            <p className="mt-6 text-foreground/60 text-lg font-light leading-relaxed">
              Your creative suite. Process your scenes, concepts, and locations directly before tapping into the framework.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-32 lg:gap-48 mt-16 pb-16">
          <FeatureSection title="Originality Scan" subtitle="Concept Uniqueness" number="01" imgSrc="/originality.png">
            <div className="flex flex-col gap-4">
              <textarea
                value={story}
                onChange={(e) => setStory(e.target.value)}
                placeholder="Detail your underlying concept or story..."
                className="min-h-[160px] w-full resize-none bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 p-5 text-sm font-light text-foreground placeholder:text-foreground/30 outline-none focus:border-primary transition-colors focus:bg-transparent"
              />
              <button
                type="button"
                onClick={runOriginality}
                disabled={origStatus === "loading" || !story.trim()}
                className="w-full bg-foreground text-background hover:bg-primary hover:text-white transition-all duration-500 ease-out py-5 text-[10px] uppercase tracking-[0.2em] font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {origStatus === "loading" ? "Analyzing..." : "Check Originality"}
              </button>
              {origError ? <ErrorBox message={origError} /> : null}
              {originality ? <OriginalityOutput data={originality} /> : null}
            </div>
          </FeatureSection>

          <FeatureSection title="Location Scout" subtitle="Vibe-Matched Real Places" number="02" imgSrc="/location.png" reverse>
            <div className="flex flex-col gap-4">
              <textarea
                value={scene}
                onChange={(e) => setScene(e.target.value)}
                placeholder="Describe the action and visual style..."
                className="min-h-[100px] w-full resize-none bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 p-5 text-sm font-light text-foreground placeholder:text-foreground/30 outline-none focus:border-primary transition-colors focus:bg-transparent"
              />
              <textarea
                value={surrounding}
                onChange={(e) => setSurrounding(e.target.value)}
                placeholder="Surrounding details (e.g., bustling market)..."
                className="min-h-[80px] w-full resize-none bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 p-5 text-sm font-light text-foreground placeholder:text-foreground/30 outline-none focus:border-primary transition-colors focus:bg-transparent"
              />
              <input
                value={vibe}
                onChange={(e) => setVibe(e.target.value)}
                placeholder="Vibe words (neon, moody, golden hour)..."
                className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 px-5 py-4 text-sm font-light text-foreground placeholder:text-foreground/30 outline-none focus:border-primary transition-colors focus:bg-transparent"
              />
              <button
                type="button"
                onClick={runLocations}
                disabled={locStatus === "loading" || !scene.trim()}
                className="w-full mt-2 bg-foreground text-background hover:bg-primary hover:text-white transition-all duration-500 ease-out py-5 text-[10px] uppercase tracking-[0.2em] font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {locStatus === "loading" ? "Scouting..." : "Find Locations"}
              </button>
              {locError ? <ErrorBox message={locError} /> : null}
              {locations ? <LocationOutput data={locations} /> : null}
            </div>
          </FeatureSection>

          <FeatureSection title="Script Generator" subtitle="Draft Screenplay Beats" number="03" imgSrc="/script.png">
            <div className="flex flex-col gap-4">
              <textarea
                value={sceneToScript}
                onChange={(e) => setSceneToScript(e.target.value)}
                placeholder="Describe the scene you want scripted..."
                className="min-h-[160px] w-full resize-none bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 p-5 text-sm font-light text-foreground placeholder:text-foreground/30 outline-none focus:border-primary transition-colors focus:bg-transparent"
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <select
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 px-5 py-4 text-sm font-light text-foreground outline-none focus:border-primary transition-colors"
                >
                  {["Drama", "Thriller", "Romance", "Comedy", "Sci-Fi", "Documentary"].map((g) => (
                    <option key={g} value={g} className="bg-background">
                      {g}
                    </option>
                  ))}
                </select>
                <select
                  value={length}
                  onChange={(e) => setLength(e.target.value)}
                  className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 px-5 py-4 text-sm font-light text-foreground outline-none focus:border-primary transition-colors"
                >
                  {["Short", "Medium", "Long"].map((l) => (
                    <option key={l} value={l} className="bg-background">
                      {l}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={runScript}
                disabled={scriptStatus === "loading" || !sceneToScript.trim()}
                className="w-full mt-2 bg-foreground text-background hover:bg-primary hover:text-white transition-all duration-500 ease-out py-5 text-[10px] uppercase tracking-[0.2em] font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {scriptStatus === "loading" ? "Drafting..." : "Generate Script"}
              </button>
              {scriptError ? <ErrorBox message={scriptError} /> : null}
              {script ? <ScriptOutput data={script} /> : null}
            </div>
          </FeatureSection>
        </div>

        <div className="mt-16 text-center text-[11px] uppercase tracking-[0.2em] text-foreground/40 max-w-xl mx-auto border-t border-black/10 dark:border-white/10 pt-8">
          Tip: For best results, write descriptively focusing on movement, perspective, and atmosphere.
        </div>
      </main>
    </div>
  );
}

function FeatureSection({
  title,
  subtitle,
  number,
  imgSrc,
  children,
  reverse = false,
}: {
  title: string;
  subtitle: string;
  number: string;
  imgSrc: string;
  children: React.ReactNode;
  reverse?: boolean;
}) {
  return (
    <section className="min-h-[85vh] flex flex-col justify-center relative w-full group">
      <div className={`flex flex-col ${reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-12 lg:gap-24`}>
        {/* Image side */}
        <div className="w-full lg:w-1/2 relative">
          <div className="absolute -inset-8 bg-primary/10 blur-3xl rounded-[3rem] opacity-0 group-hover:opacity-100 transition duration-1000" />
          <div className="relative aspect-[4/3] lg:aspect-square overflow-hidden rounded-sm border border-black/10 dark:border-white/10 shadow-2xl">
            <img src={imgSrc} alt={title} className="w-full h-full object-cover grayscale transition duration-1000 group-hover:scale-[1.03] group-hover:grayscale-0 dark:brightness-75 group-hover:brightness-100" />
            <div className="absolute inset-0 border border-black/10 dark:border-white/20 z-10 pointer-events-none mix-blend-overlay" />
          </div>
          <div className={`absolute top-0 ${reverse ? 'left-0 -translate-x-1/2' : 'right-0 translate-x-1/2'} -translate-y-1/2 z-20 hidden lg:block`}>
             <span className="text-[12rem] font-serif leading-none text-black/5 dark:text-white/5 select-none">{number}</span>
          </div>
        </div>

        {/* Content side */}
        <div className="w-full lg:w-1/2 flex flex-col z-10 relative mt-8 lg:mt-0">
          <div className="mb-8 pl-4 lg:pl-0">
            <div className="flex items-center gap-4 mb-4">
              <span className="text-[10px] font-mono text-primary border border-primary/30 rounded-full w-8 h-8 flex items-center justify-center shrink-0">{number}</span>
              <div className="text-[10px] uppercase tracking-[0.3em] text-primary">{subtitle}</div>
            </div>
            <h2 className="font-serif text-4xl md:text-5xl lg:text-5xl tracking-tight">{title}</h2>
          </div>
          <div className="bg-white/5 dark:bg-black/20 backdrop-blur-2xl border border-black/10 dark:border-white/10 p-6 sm:p-8 lg:p-12 shadow-2xl relative">
            <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-primary/40 -translate-x-px -translate-y-px" />
            <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-primary/40 translate-x-px -translate-y-px" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-primary/40 -translate-x-px translate-y-px" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-primary/40 translate-x-px translate-y-px" />

            <div className="flex-1 flex flex-col">{children}</div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div className="mt-4 border-l-2 border-red-500/50 bg-red-500/5 p-4 text-xs font-light text-red-700 dark:text-red-400">
      {message}
    </div>
  );
}

function OriginalityOutput({ data }: { data: OriginalityResponse }) {
  return (
    <div className="mt-6 border-t border-black/10 dark:border-white/10 pt-6 animate-in fade-in duration-700">
      {data.message ? <div className="text-xs text-foreground/50 mb-4">{data.message}</div> : null}
      
      {data.similarityMatches && data.similarityMatches.length ? (
        <div className="mb-6">
          <div className="text-[10px] uppercase tracking-[0.2em] text-foreground/50 mb-3">Similarity Detected</div>
          <div className="flex flex-col gap-3">
            {data.similarityMatches.map((m, idx) => (
              <div key={idx} className="border-l border-primary/30 pl-4 py-1">
                <div className="text-primary text-xs tracking-wider mb-1">{Math.round(m.similarity * 100)}% Match</div>
                <div className="text-sm font-serif italic text-foreground/75 leading-relaxed">"{m.storySnippet}"</div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {data.uniquenessAngle ? (
        <div className="mb-6">
          <div className="text-[10px] uppercase tracking-[0.2em] text-foreground/50 mb-3">Suggested Angle</div>
          <div className="text-sm font-light leading-relaxed text-foreground/80">{data.uniquenessAngle}</div>
        </div>
      ) : null}

      {data.rewrites && data.rewrites.length ? (
        <div className="mb-6">
          <div className="text-[10px] uppercase tracking-[0.2em] text-foreground/50 mb-3">Rewrite Iterations</div>
          <div className="flex flex-col gap-4">
            {data.rewrites.map((r, idx) => (
              <div key={idx} className="bg-black/5 dark:bg-white/5 p-4 border border-black/10 dark:border-white/10">
                <div className="text-xs font-semibold tracking-wider uppercase mb-2 text-primary">{r.name}</div>
                <div className="text-sm leading-relaxed font-light">{r.logline}</div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {data.plotDifferentiationChecklist && data.plotDifferentiationChecklist.length ? (
        <div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-foreground/50 mb-3">Action Items</div>
          <ul className="list-none space-y-2">
            {data.plotDifferentiationChecklist.map((x, idx) => (
              <li key={idx} className="flex items-start gap-3 text-sm font-light">
                <span className="text-primary mt-0.5">•</span>
                <span className="flex-1">{x}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function LocationOutput({ data }: { data: LocationResponse }) {
  return (
    <div className="mt-6 border-t border-black/10 dark:border-white/10 pt-6 animate-in fade-in duration-700">
      {data.message ? <div className="text-xs text-foreground/50 mb-4">{data.message}</div> : null}
      
      {data.locations && data.locations.length ? (
        <div className="mb-6">
          <div className="text-[10px] uppercase tracking-[0.2em] text-foreground/50 mb-3">Target Spots</div>
          <div className="flex flex-col gap-4">
            {data.locations.map((loc, idx) => {
              const gmapHref =
                loc.gmapQuery && loc.gmapQuery.trim()
                  ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc.gmapQuery.trim())}`
                  : null;
              return (
                <div key={idx} className="border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 p-4 relative group/loc">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div>
                      <div className="font-serif text-lg text-primary">{loc.name}</div>
                      {loc.addressOrArea && <div className="mt-1 text-xs uppercase tracking-wide text-foreground/60">{loc.addressOrArea}</div>}
                    </div>
                    {gmapHref && (
                      <a
                        href={gmapHref}
                        target="_blank"
                        rel="noreferrer"
                        className="shrink-0 text-[10px] uppercase tracking-widest text-foreground hover:text-primary transition-colors border-b border-transparent hover:border-primary pb-0.5"
                      >
                        View Map ↗
                      </a>
                    )}
                  </div>
                  {loc.whyMatches && (
                    <div className="mt-4 text-sm font-light italic leading-relaxed text-foreground/80 pl-3 border-l text-primary/40">
                      {loc.whyMatches}
                    </div>
                  )}
                  {loc.timeOfDay && (
                    <div className="mt-4 text-xs tracking-wide bg-background w-fit px-2 py-1 border border-black/10 dark:border-white/10">
                      Ideal Lighting: {loc.timeOfDay}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {data.mapSuggestions && data.mapSuggestions.length ? (
        <div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-foreground/50 mb-3">Secondary Areas</div>
          <div className="flex flex-wrap gap-2 text-xs text-foreground/70">
            {data.mapSuggestions.map((x, idx) => (
              <span key={idx} className="border border-black/10 dark:border-white/10 px-2 py-1 bg-black/5 dark:bg-white/5">
                {x}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ScriptOutput({ data }: { data: ScriptResponse }) {
  return (
    <div className="mt-6 border-t border-black/10 dark:border-white/10 pt-6 animate-in fade-in duration-700">
      {data.scriptTitle && (
        <div className="mb-4">
          <div className="text-[10px] uppercase tracking-[0.2em] text-foreground/50 mb-3">Working Title</div>
          <div className="font-serif text-2xl text-primary">{data.scriptTitle}</div>
        </div>
      )}
      
      {data.logline && (
        <div className="mb-6 bg-black/5 dark:bg-white/5 p-4 border-l-2 border-primary">
          <div className="text-sm font-light leading-relaxed">{data.logline}</div>
        </div>
      )}
      
      {data.screenplay && (
        <div className="mb-6 border border-black/10 dark:border-white/10 bg-background/50 p-5 font-mono text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">
          {data.screenplay}
        </div>
      )}
      
      {data.sceneBreakdown && data.sceneBreakdown.length ? (
        <div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-foreground/50 mb-3">Beat Sheet</div>
          <div className="flex flex-col gap-3">
            {data.sceneBreakdown.map((x, idx) => (
              <div key={idx} className="flex gap-4 items-start text-sm font-light">
                <span className="text-[10px] text-primary border border-primary/30 rounded-full w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">{idx + 1}</span>
                <span className="leading-relaxed">{x}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
      
      {data.message ? <div className="mt-6 text-xs text-foreground/50">{data.message}</div> : null}
    </div>
  );
}

