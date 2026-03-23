"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "./components/theme-toggle";

export default function Home() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [age, setAge] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const ageNumber = useMemo(() => {
    const n = Number(age);
    return Number.isFinite(n) ? n : NaN;
  }, [age]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const trimmed = name.trim();
    if (!trimmed) {
      setError("Please enter your name.");
      return;
    }
    if (!Number.isFinite(ageNumber) || ageNumber < 1 || ageNumber > 120) {
      setError("Please enter a valid age (1–120).");
      return;
    }

    setIsSubmitting(true);
    router.push(`/dashboard?name=${encodeURIComponent(trimmed)}&age=${encodeURIComponent(String(ageNumber))}`);
  }

  return (
    <div className="min-h-dvh filmn1-bg filmn1-grid relative overflow-hidden">
      <div className="filmn1-noise" />

      <header className="relative z-10 mx-auto flex w-full max-w-5xl items-center justify-between px-5 py-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-white/5 ring-1 ring-white/10 backdrop-blur" />
          <div className="leading-tight">
            <div className="text-sm text-foreground/70">Film festival hackathon</div>
            <div className="text-xl font-semibold tracking-tight">filmn1</div>
          </div>
        </div>
        <ThemeToggle />
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-5xl items-center justify-center px-5 pb-14 pt-10">
        <div className="w-full max-w-xl">
          <div className="mb-6 text-center">
            <h1 className="text-balance text-3xl font-semibold tracking-tight">
              Create. Differentiate. Shoot.
            </h1>
            <p className="mt-2 text-pretty text-sm text-foreground/70">
              Answer two details to unlock your AI film-society assistant.
            </p>
          </div>

          <form
            onSubmit={onSubmit}
            className="relative rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] backdrop-blur"
          >
            <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-r from-sky-400/20 via-fuchsia-400/15 to-emerald-400/20 opacity-60 blur-xl" />
            <div className="relative">
              <div className="grid gap-5">
                <label className="block">
                  <div className="mb-2 text-sm font-medium text-foreground/80">Your name</div>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Asha"
                    className="w-full rounded-2xl border border-white/10 bg-black/10 px-4 py-3 text-foreground placeholder:text-foreground/40 outline-none ring-0 focus:border-white/20 focus:bg-black/15"
                  />
                </label>

                <label className="block">
                  <div className="mb-2 text-sm font-medium text-foreground/80">Age</div>
                  <input
                    value={age}
                    inputMode="numeric"
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="1–120"
                    className="w-full rounded-2xl border border-white/10 bg-black/10 px-4 py-3 text-foreground placeholder:text-foreground/40 outline-none ring-0 focus:border-white/20 focus:bg-black/15"
                  />
                </label>

                {error ? <div className="rounded-2xl border border-rose-500/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div> : null}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-2 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-400/90 via-fuchsia-400/80 to-emerald-400/80 text-black font-semibold transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <span>{isSubmitting ? "Loading..." : "Enter dashboard"}</span>
                </button>

                <div className="mt-2 text-center text-xs text-foreground/60">
                  No navbar. No clutter. Just a focused experience.
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
