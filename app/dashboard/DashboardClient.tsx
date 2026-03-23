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
    <div className="min-h-dvh filmn1-bg filmn1-grid relative overflow-hidden">
      <div className="filmn1-noise" />

      <header className="relative z-10 mx-auto flex w-full max-w-5xl items-center justify-between px-5 py-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-foreground transition hover:bg-white/10"
          >
            Back
          </button>
          <div className="leading-tight">
            <div className="text-sm text-foreground/70">Film society</div>
            <div className="text-xl font-semibold tracking-tight">filmn1</div>
          </div>
        </div>
        <ThemeToggle />
      </header>

      <main className="relative z-10 mx-auto w-full max-w-5xl px-5 pb-16">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="text-sm text-foreground/70">Welcome</div>
              <h1 className="text-2xl font-semibold tracking-tight">
                {name ? `${name}` : "Creator"}{" "}
                <span className="text-foreground/70">{age ? `(${age})` : ""}</span>
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-foreground/70">
                Pick a tool below. Your input stays on-device until it hits the API for the AI suggestions.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-foreground/80">
                Mode: Hackathon MVP
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <ToolCard title="1. AI Story Originality" subtitle="Similarity scan + uniqueness plan">
            <ToolCardInner>
              <textarea
                value={story}
                onChange={(e) => setStory(e.target.value)}
                placeholder="Paste your story / plot here…"
                className="min-h-[140px] w-full resize-none rounded-2xl border border-white/10 bg-black/10 p-4 text-sm text-foreground placeholder:text-foreground/40 outline-none ring-0 focus:border-white/20 focus:bg-black/15"
              />
              <div className="mt-3">
                <button
                  type="button"
                  onClick={runOriginality}
                  disabled={origStatus === "loading" || !story.trim()}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-400/90 via-fuchsia-400/80 to-emerald-400/80 px-4 py-3 text-sm font-semibold text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {origStatus === "loading" ? "Analyzing…" : "Check originality"}
                </button>
              </div>
              {origError ? <ErrorBox message={origError} /> : null}
              {originality ? <OriginalityOutput data={originality} /> : null}
            </ToolCardInner>
          </ToolCard>

          <ToolCard title="2. Scene-to-Location Finder" subtitle="Vibe-matched real places">
            <ToolCardInner>
              <textarea
                value={scene}
                onChange={(e) => setScene(e.target.value)}
                placeholder="Describe the scene (action + visual vibe)…"
                className="min-h-[110px] w-full resize-none rounded-2xl border border-white/10 bg-black/10 p-4 text-sm text-foreground placeholder:text-foreground/40 outline-none ring-0 focus:border-white/20 focus:bg-black/15"
              />
              <textarea
                value={surrounding}
                onChange={(e) => setSurrounding(e.target.value)}
                placeholder="Surrounding details (street/park/sea/market/etc)…"
                className="mt-3 min-h-[90px] w-full resize-none rounded-2xl border border-white/10 bg-black/10 p-4 text-sm text-foreground placeholder:text-foreground/40 outline-none ring-0 focus:border-white/20 focus:bg-black/15"
              />
              <input
                value={vibe}
                onChange={(e) => setVibe(e.target.value)}
                placeholder="Extra vibe words (noir, dreamy, golden hour)…"
                className="mt-3 w-full rounded-2xl border border-white/10 bg-black/10 px-4 py-3 text-sm text-foreground placeholder:text-foreground/40 outline-none ring-0 focus:border-white/20 focus:bg-black/15"
              />
              <div className="mt-3">
                <button
                  type="button"
                  onClick={runLocations}
                  disabled={locStatus === "loading" || !scene.trim()}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-400/90 via-fuchsia-400/80 to-emerald-400/80 px-4 py-3 text-sm font-semibold text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {locStatus === "loading" ? "Finding…" : "Find locations"}
                </button>
              </div>
              {locError ? <ErrorBox message={locError} /> : null}
              {locations ? <LocationOutput data={locations} /> : null}
            </ToolCardInner>
          </ToolCard>

          <ToolCard title="3. Scene-to-Script Generator" subtitle="Write-ready screenplay beats">
            <ToolCardInner>
              <textarea
                value={sceneToScript}
                onChange={(e) => setSceneToScript(e.target.value)}
                placeholder="Describe the scene you want in script form…"
                className="min-h-[120px] w-full resize-none rounded-2xl border border-white/10 bg-black/10 p-4 text-sm text-foreground placeholder:text-foreground/40 outline-none ring-0 focus:border-white/20 focus:bg-black/15"
              />
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <select
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-black/10 px-4 py-3 text-sm text-foreground outline-none focus:border-white/20"
                >
                  {["Drama", "Thriller", "Romance", "Comedy", "Sci-Fi", "Documentary"].map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
                <select
                  value={length}
                  onChange={(e) => setLength(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-black/10 px-4 py-3 text-sm text-foreground outline-none focus:border-white/20"
                >
                  {["Short", "Medium", "Long"].map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mt-3">
                <button
                  type="button"
                  onClick={runScript}
                  disabled={scriptStatus === "loading" || !sceneToScript.trim()}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-400/90 via-fuchsia-400/80 to-emerald-400/80 px-4 py-3 text-sm font-semibold text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {scriptStatus === "loading" ? "Generating…" : "Generate script"}
                </button>
              </div>
              {scriptError ? <ErrorBox message={scriptError} /> : null}
              {script ? <ScriptOutput data={script} /> : null}
            </ToolCardInner>
          </ToolCard>
        </div>

        <div className="mt-10 text-center text-xs text-foreground/60">
          Tip: For best results, write like a director (where, who, what changes, and the mood).
        </div>
      </main>
    </div>
  );
}

function ToolCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-transparent opacity-50" />
      <div className="relative">
        <div className="flex items-baseline justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-foreground/70">{subtitle}</div>
            <h2 className="mt-1 text-lg font-semibold tracking-tight">{title}</h2>
          </div>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </section>
  );
}

function ToolCardInner({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col gap-3">{children}</div>;
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-rose-500/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
      {message}
    </div>
  );
}

function OriginalityOutput({ data }: { data: OriginalityResponse }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
      {data.message ? <div className="text-sm text-foreground/70">{data.message}</div> : null}
      {data.similarityMatches && data.similarityMatches.length ? (
        <>
          <div className="text-sm font-semibold">Similarity</div>
          <div className="mt-2 flex flex-col gap-2">
            {data.similarityMatches.map((m, idx) => (
              <div key={idx} className="rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="text-sm font-semibold">{Math.round(m.similarity * 100)}% match</div>
                <div className="mt-1 line-clamp-3 text-xs text-foreground/70">{m.storySnippet}</div>
              </div>
            ))}
          </div>
        </>
      ) : null}

      {data.uniquenessAngle ? (
        <>
          <div className="mt-4 text-sm font-semibold">Uniqueness angle</div>
          <div className="mt-2 whitespace-pre-wrap text-sm text-foreground/80">{data.uniquenessAngle}</div>
        </>
      ) : null}

      {data.rewrites && data.rewrites.length ? (
        <>
          <div className="mt-4 text-sm font-semibold">Rewrite ideas</div>
          <div className="mt-2 flex flex-col gap-2">
            {data.rewrites.map((r, idx) => (
              <div key={idx} className="rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="text-xs font-semibold text-foreground/70">{r.name}</div>
                <div className="mt-1 text-sm">{r.logline}</div>
              </div>
            ))}
          </div>
        </>
      ) : null}

      {data.plotDifferentiationChecklist && data.plotDifferentiationChecklist.length ? (
        <>
          <div className="mt-4 text-sm font-semibold">Differentiation checklist</div>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-foreground/80">
            {data.plotDifferentiationChecklist.map((x, idx) => (
              <li key={idx}>{x}</li>
            ))}
          </ul>
        </>
      ) : null}
    </div>
  );
}

function LocationOutput({ data }: { data: LocationResponse }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
      {data.message ? <div className="text-sm text-foreground/70">{data.message}</div> : null}
      {data.locations && data.locations.length ? (
        <>
          <div className="text-sm font-semibold">Suggested locations</div>
          <div className="mt-2 flex flex-col gap-2">
            {data.locations.map((loc, idx) => {
              const gmapHref =
                loc.gmapQuery && loc.gmapQuery.trim()
                  ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc.gmapQuery.trim())}`
                  : null;
              return (
                <div key={idx} className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold">{loc.name}</div>
                      {loc.addressOrArea ? (
                        <div className="mt-1 text-xs text-foreground/70">{loc.addressOrArea}</div>
                      ) : null}
                      {loc.timeOfDay ? (
                        <div className="mt-1 text-xs text-foreground/70">Best time: {loc.timeOfDay}</div>
                      ) : null}
                    </div>
                    {gmapHref ? (
                      <a
                        href={gmapHref}
                        target="_blank"
                        rel="noreferrer"
                        className="shrink-0 rounded-full border border-white/10 bg-black/10 px-3 py-2 text-xs text-foreground/80 transition hover:bg-black/20"
                      >
                        Open maps
                      </a>
                    ) : null}
                  </div>
                  {loc.whyMatches ? <div className="mt-2 text-xs text-foreground/80">{loc.whyMatches}</div> : null}
                </div>
              );
            })}
          </div>
        </>
      ) : null}

      {data.mapSuggestions && data.mapSuggestions.length ? (
        <>
          <div className="mt-4 text-sm font-semibold">Extra map search ideas</div>
          <div className="mt-2 text-xs text-foreground/70">
            {data.mapSuggestions.map((x, idx) => (
              <span key={idx}>
                {idx ? " · " : ""}
                {x}
              </span>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

function ScriptOutput({ data }: { data: ScriptResponse }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
      {data.scriptTitle ? <div className="text-sm font-semibold">{data.scriptTitle}</div> : null}
      {data.logline ? <div className="mt-1 text-xs text-foreground/70">Logline: {data.logline}</div> : null}
      {data.screenplay ? (
        <div className="mt-3 whitespace-pre-wrap text-sm text-foreground/85">{data.screenplay}</div>
      ) : null}
      {data.sceneBreakdown && data.sceneBreakdown.length ? (
        <>
          <div className="mt-4 text-sm font-semibold">Scene beats</div>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-foreground/80">
            {data.sceneBreakdown.map((x, idx) => (
              <li key={idx}>{x}</li>
            ))}
          </ul>
        </>
      ) : null}
      {data.message ? <div className="mt-3 text-xs text-foreground/70">{data.message}</div> : null}
    </div>
  );
}

