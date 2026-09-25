import { connection } from "next/server";
import { createClient } from "@supabase/supabase-js";

type Pattern = {
  id: number;
  name: string;
  category: string;
  core_idea: string;
  when_to_use: string;
  example_problem: string;
  common_trap: string;
  confidence: string;
};

const categoryStyles: Record<string, string> = {
  Arrays: "border-cyan-400/30 bg-cyan-400/10 text-cyan-200",
  Trees: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
  Graphs: "border-violet-400/30 bg-violet-400/10 text-violet-200",
  "Dynamic Programming": "border-rose-400/30 bg-rose-400/10 text-rose-200",
  Search: "border-amber-400/30 bg-amber-400/10 text-amber-200",
  "Data Structures": "border-sky-400/30 bg-sky-400/10 text-sky-200",
  Stacks: "border-fuchsia-400/30 bg-fuchsia-400/10 text-fuchsia-200",
  Recursion: "border-lime-400/30 bg-lime-400/10 text-lime-200",
  Strings: "border-orange-400/30 bg-orange-400/10 text-orange-200",
};

function categoryClass(category: string) {
  return categoryStyles[category] ?? "border-slate-400/30 bg-slate-400/10 text-slate-200";
}

export default async function Home() {
  // Fetch at request time so database changes appear without redeploying.
  await connection();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  let patterns: Pattern[] = [];
  let unavailable = false;
  if (!url || !key) {
    unavailable = true;
    console.error("Missing Supabase environment variables.");
  } else {
    try {
      const supabase = createClient(url, key, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const { data, error } = await supabase
        .from("patterns")
        .select("id, name, category, core_idea, when_to_use, example_problem, common_trap, confidence")
        .order("id");
      if (error) throw error;
      patterns = data ?? [];
    } catch {
      console.error("Unable to fetch algorithm patterns from Supabase.");
      unavailable = true;
    }
  }

  const categories = [...new Set(patterns.map((pattern) => pattern.category))];

  return (
    <main className="min-h-screen overflow-hidden bg-[#05070d] text-slate-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(16,185,129,0.18),transparent_30%),radial-gradient(circle_at_85%_10%,rgba(59,130,246,0.14),transparent_32%),linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:auto,auto,42px_42px,42px_42px]" />
      <div className="relative mx-auto w-full max-w-7xl px-6 py-8 sm:px-10 sm:py-12">
        <header className="mb-12 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.35em] text-emerald-300">Supabase Pattern Library</p>
            <span className="mt-2 block text-lg font-semibold tracking-tight">Algorithm Pattern Atlas</span>
          </div>
          <span className="rounded-full border border-emerald-300/30 bg-emerald-300/10 px-4 py-2 text-xs font-medium text-emerald-200 shadow-[0_0_30px_rgba(16,185,129,0.16)]">
            {unavailable ? "Offline" : `${patterns.length} live rows`}
          </span>
        </header>

        <section aria-labelledby="page-title" className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
          <div>
            <p className="mb-4 font-mono text-xs font-semibold uppercase tracking-[0.35em] text-cyan-300">Interview Playbook</p>
            <h1 id="page-title" className="max-w-4xl text-5xl font-semibold leading-tight tracking-tight text-white sm:text-7xl">
              A dark atlas for decoding coding problems.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              Each card stores a pattern, a trigger for when to use it, one representative problem, and the mistake that usually breaks the solution.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/30 backdrop-blur">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-3xl font-semibold text-white">{patterns.length}</div>
                <div className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-400">patterns</div>
              </div>
              <div>
                <div className="text-3xl font-semibold text-white">{categories.length}</div>
                <div className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-400">domains</div>
              </div>
              <div>
                <div className="text-3xl font-semibold text-white">1</div>
                <div className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-400">database</div>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              {categories.slice(0, 8).map((category) => (
                <span key={category} className={`rounded-full border px-3 py-1 text-xs ${categoryClass(category)}`}>
                  {category}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-14" aria-label="Algorithm pattern cards">
          <div className="mb-5 flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold text-white">Pattern cards</h2>
            {!unavailable && <span className="font-mono text-sm text-slate-400">Fetched from Supabase</span>}
          </div>

          {unavailable ? (
            <div role="alert" className="rounded-3xl border border-amber-300/25 bg-amber-300/10 p-8 text-amber-100">
              Patterns are temporarily unavailable. Please check the Supabase table and environment variables.
            </div>
          ) : patterns.length === 0 ? (
            <p className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-slate-300">No patterns yet. Add rows in Supabase to build the atlas.</p>
          ) : (
            <ul className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {patterns.map((pattern) => (
                <li key={pattern.id} className="group rounded-3xl border border-white/10 bg-white/[0.045] p-6 shadow-xl shadow-black/20 backdrop-blur transition duration-200 hover:-translate-y-1 hover:border-emerald-300/35 hover:bg-white/[0.07]">
                  <div className="mb-6 flex items-center justify-between gap-3">
                    <span className="font-mono text-xs text-slate-500">#{String(pattern.id).padStart(2, "0")}</span>
                    <span className={`rounded-full border px-3 py-1 text-xs ${categoryClass(pattern.category)}`}>{pattern.category}</span>
                  </div>
                  <h3 className="text-xl font-semibold tracking-tight text-white">{pattern.name}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-300">{pattern.core_idea}</p>
                  <dl className="mt-6 grid gap-4 text-sm">
                    <div>
                      <dt className="font-mono text-xs uppercase tracking-[0.2em] text-emerald-300">Use when</dt>
                      <dd className="mt-2 leading-6 text-slate-300">{pattern.when_to_use}</dd>
                    </div>
                    <div className="grid gap-4">
                      <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                        <dt className="font-mono text-xs uppercase tracking-[0.2em] text-cyan-300">Example</dt>
                        <dd className="mt-2 leading-6 text-slate-300">{pattern.example_problem}</dd>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                        <dt className="font-mono text-xs uppercase tracking-[0.2em] text-rose-300">Trap</dt>
                        <dd className="mt-2 leading-6 text-slate-300">{pattern.common_trap}</dd>
                      </div>
                    </div>
                  </dl>
                  <div className="mt-6 border-t border-white/10 pt-4 font-mono text-xs uppercase tracking-[0.18em] text-slate-500">Confidence: {pattern.confidence}</div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <footer className="mt-14 border-t border-white/10 pt-6 text-sm text-slate-500">
          Patterns are easier to remember when each one has a job, a trigger, and a warning label.
        </footer>
      </div>
    </main>
  );
}
