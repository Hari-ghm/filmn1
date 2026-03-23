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
    <div className="min-h-dvh flex flex-col relative overflow-hidden bg-background">
      <div className="film-grain" />
      <div className="cinematic-vignette" />

      <header className="relative z-50 flex items-center justify-between w-full p-8 md:p-12 lg:px-24">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 flex items-center justify-center border border-primary/40 rounded-full bg-black/5 dark:bg-white/5 backdrop-blur-md">
            <span className="font-serif text-xl italic font-bold text-primary">f</span>
          </div>
          <div className="uppercase tracking-[0.3em] text-xs font-semibold opacity-80">
            filmn1
          </div>
        </div>
        <ThemeToggle />
      </header>

      <main className="relative z-40 flex-1 flex flex-col lg:flex-row items-center w-full max-w-screen-2xl mx-auto px-8 md:px-12 lg:px-24 gap-16 lg:gap-24">
        
        {/* Left Typography Section */}
        <div className="flex-1 w-full lg:w-1/2 flex flex-col justify-center pt-12 lg:pt-0">
          <div className="inline-flex items-center justify-center py-1.5 px-4 border border-primary/40 rounded-full text-primary text-[10px] uppercase tracking-widest w-fit mb-8 bg-primary/5 backdrop-blur-sm">
            CodeFlix
          </div>
          
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl leading-[1.05] tracking-tight mb-8">
            Create.<br />
            <span className="italic font-light text-primary/90">Differentiate.</span><br />
            Shoot.
          </h1>
          
          <p className="max-w-md text-base md:text-lg text-foreground/60 leading-relaxed font-light">
            Unlock your dedicated film-society assistant. Designed to refine originality, scout locations, elevate scripts and much more.
          </p>
        </div>

        {/* Right Form Section */}
        <div className="flex-1 w-full lg:w-1/2 flex items-center justify-center lg:justify-end pb-24 lg:pb-0">
          <form
            onSubmit={onSubmit}
            className="w-full max-w-md backdrop-blur-3xl bg-white/5 dark:bg-black/30 border border-black/10 dark:border-white/10 p-10 md:p-14 shadow-2xl relative"
          >
            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-6 h-6 border-t border-l border-primary/60 -translate-x-px -translate-y-px" />
            <div className="absolute top-0 right-0 w-6 h-6 border-t border-r border-primary/60 translate-x-px -translate-y-px" />
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b border-l border-primary/60 -translate-x-px translate-y-px" />
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b border-r border-primary/60 translate-x-px translate-y-px" />

            <h2 className="font-serif text-2xl md:text-3xl mb-10 text-center font-medium">Enter your details</h2>

            <div className="space-y-10">
              <div className="group relative">
                <label className="block text-[11px] uppercase tracking-[0.2em] text-foreground/50 mb-4 group-focus-within:text-primary transition-colors">
                  Name
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Anurag"
                  className="w-full bg-transparent border-b border-black/20 dark:border-white/20 px-0 py-2 text-xl font-light text-foreground placeholder:text-foreground/20 outline-none focus:border-primary transition-colors block"
                />
              </div>

              <div className="group relative">
                <label className="block text-[11px] uppercase tracking-[0.2em] text-foreground/50 mb-4 group-focus-within:text-primary transition-colors">
                  Age
                </label>
                <input
                  value={age}
                  inputMode="numeric"
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="1–120"
                  className="w-full bg-transparent border-b border-black/20 dark:border-white/20 px-0 py-2 text-xl font-light text-foreground placeholder:text-foreground/20 outline-none focus:border-primary transition-colors block"
                />
              </div>

              {error && (
                <div className="text-sm text-red-700 dark:text-red-400 font-light tracking-wide bg-red-500/10 p-3 rounded border border-red-500/20">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-6 bg-foreground text-background hover:bg-primary hover:text-white transition-all duration-500 ease-out py-5 text-xs uppercase tracking-[0.3em] font-medium disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
              >
                <span className="relative z-10">{isSubmitting ? "Entering..." : "Enter Workspace"}</span>
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
