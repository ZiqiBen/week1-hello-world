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
  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10 sm:px-10 sm:py-16">
      <header className="mb-14 flex items-center justify-between border-b border-slate-200 pb-5">
        <span className="text-lg font-semibold tracking-tight">Algorithm Pattern Atlas</span>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800">Supabase List</span>
      </header>
      <section aria-labelledby="page-title">
        <p className="mb-3 text-xs font-semibold tracking-[0.2em] text-emerald-700">INTERVIEW PLAYBOOK</p>
        <h1 id="page-title" className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">A map of patterns behind coding interview problems.</h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
          Browse common LeetCode patterns, when to reach for them, and the traps that usually make a solution go sideways.
        </p>
        <div className="mt-12 mb-5 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Pattern cards</h2>
          {!unavailable && <span className="text-sm text-slate-500">{patterns.length} {patterns.length === 1 ? "pattern" : "patterns"}</span>}
        </div>
        {unavailable ? (
          <div role="alert" className="rounded-2xl border border-amber-200 bg-amber-50 p-8 text-amber-950">Patterns are temporarily unavailable. Please try again shortly.</div>
        ) : patterns.length === 0 ? (
          <p className="rounded-2xl border border-slate-200 bg-white p-8 text-slate-600">No patterns yet. Add rows in Supabase to build the atlas.</p>
        ) : (
          <ul className="grid gap-5 lg:grid-cols-2">
            {patterns.map((pattern) => (
              <li key={pattern.id} className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                  <span className="font-mono text-xs text-slate-500">#{String(pattern.id).padStart(2, "0")}</span>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800">{pattern.category}</span>
                </div>
                <h3 className="text-xl font-semibold tracking-tight">{pattern.name}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{pattern.core_idea}</p>
                <dl className="mt-6 grid gap-4 text-sm">
                  <div>
                    <dt className="font-semibold text-slate-900">Use when</dt>
                    <dd className="mt-1 leading-6 text-slate-600">{pattern.when_to_use}</dd>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <dt className="font-semibold text-slate-900">Example</dt>
                      <dd className="mt-1 leading-6 text-slate-600">{pattern.example_problem}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-slate-900">Common trap</dt>
                      <dd className="mt-1 leading-6 text-slate-600">{pattern.common_trap}</dd>
                    </div>
                  </div>
                </dl>
                <div className="mt-6 text-xs font-medium uppercase tracking-[0.18em] text-slate-400">Confidence: {pattern.confidence}</div>
              </li>
            ))}
          </ul>
        )}
      </section>
      <footer className="mt-14 border-t border-slate-200 pt-6 text-sm text-slate-500">Patterns are easier to remember when each one has a job, a trigger, and a warning label.</footer>
    </main>
  );
}
