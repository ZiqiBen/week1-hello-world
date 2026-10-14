import { connection } from "next/server";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AuthPanel } from "./components/AuthPanel";
import { AlgorithmGalaxy } from "./components/AlgorithmGalaxy";
import { ProgressButton } from "./components/ProgressButton";
import { togglePatternSolved } from "./actions";

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
  Arrays: "text-[#7dd3fc]",
  Trees: "text-[#86efac]",
  Graphs: "text-[#c4b5fd]",
  "Dynamic Programming": "text-[#fda4af]",
  Search: "text-[#fde68a]",
  "Data Structures": "text-[#93c5fd]",
  Stacks: "text-[#f0abfc]",
  Recursion: "text-[#bef264]",
  Strings: "text-[#fdba74]",
};

function categoryClass(category: string) {
  return categoryStyles[category] ?? "text-[#a1a1a6]";
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ profile?: string }>;
}) {
  // Fetch at request time so database changes appear without redeploying.
  await connection();
  const { profile: profileStatus } = await searchParams;
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

  let userEmail: string | null = null;
  let profileComplete = false;
  let progressUnavailable = false;
  const solvedPatternIds = new Set<number>();
  try {
    const authClient = await createSupabaseServerClient();
    const {
      data: { user },
    } = await authClient.auth.getUser();
    userEmail = user?.email ?? null;

    if (user) {
      const [{ data: profile }, { data: solvedProblems, error: progressError }] = await Promise.all([
        authClient
          .from("profiles")
          .select("first_name, last_name")
          .eq("id", user.id)
          .single<{ first_name: string | null; last_name: string | null }>(),
        authClient
          .from("solved_problems")
          .select("pattern_id")
          .eq("user_id", user.id)
          .returns<{ pattern_id: number }[]>(),
      ]);
      profileComplete = Boolean(profile?.first_name && profile?.last_name);

      if (progressError) {
        progressUnavailable = true;
        console.error("Unable to load private pattern progress.");
      } else {
        for (const row of solvedProblems ?? []) {
          solvedPatternIds.add(row.pattern_id);
        }
      }
    }
  } catch {
    userEmail = null;
  }

  return (
    <main className="page-shell">
      <div className="page-wrap">
        {profileStatus === "saved" ? (
          <div role="status" className="mb-7 flex items-center justify-between gap-4 rounded-2xl border border-[#75d49b]/30 bg-[#75d49b]/10 px-5 py-4 text-sm text-[#b9efcd]">
            <span>Your profile was saved.</span>
            <Link href="/" className="rounded-full px-3 py-2 font-medium text-[#dff8e8] transition hover:bg-white/[0.08]">
              Dismiss
            </Link>
          </div>
        ) : null}
        <header className="mb-20 flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-lg font-semibold tracking-tight">Pattern</span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="hidden text-sm text-[#6e6e73] sm:inline">
              {unavailable ? "Unavailable" : `${patterns.length} patterns`}
            </span>
            <AuthPanel email={userEmail} profileComplete={profileComplete} />
          </div>
        </header>

        <section aria-labelledby="page-title" className="mx-auto max-w-5xl pb-8 pt-8 text-center sm:pt-16">
          <div>
            <h1 id="page-title" className="text-5xl font-semibold leading-[1.02] tracking-[-0.045em] text-[#f5f5f7] sm:text-7xl lg:text-8xl">
              See the pattern.<br />Solve the problem.
            </h1>
            <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-[#a1a1a6] sm:text-xl">
              A focused collection of reusable ideas for coding interviews—when to use them, how they work, and where they fail.
            </p>
          </div>
          <div className="surface mx-auto mt-12 max-w-3xl p-7">
            <div className="grid grid-cols-3 divide-x divide-white/[0.08] text-center">
              <div>
                <div className="text-3xl font-semibold text-white">{patterns.length}</div>
                <div className="mt-1 text-sm text-[#86868b]">Patterns</div>
              </div>
              <div>
                <div className="text-3xl font-semibold text-white">{categories.length}</div>
                <div className="mt-1 text-sm text-[#86868b]">Topics</div>
              </div>
              <div>
                <div className="text-3xl font-semibold text-white">Live</div>
                <div className="mt-1 text-sm text-[#86868b]">Community</div>
              </div>
            </div>
          </div>
        </section>

        {userEmail && !unavailable ? (
          <section className="mt-24" aria-labelledby="galaxy-title">
            <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 id="galaxy-title" className="text-3xl font-semibold tracking-tight text-white">Your algorithm galaxy</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#9aa7b8]">
                  Every node is a pattern. Solve its example problem to light it up in your private map.
                </p>
              </div>
              {!progressUnavailable ? (
                <div className="text-right">
                  <div className="text-2xl font-semibold text-white">{solvedPatternIds.size} <span className="text-base font-normal text-[#8190a4]">of {patterns.length}</span></div>
                  <div className="mt-1 text-xs text-[#8190a4]">example problems solved</div>
                </div>
              ) : null}
            </div>

            {progressUnavailable ? (
              <p role="alert" className="surface-soft p-5 text-sm leading-6 text-amber-100">
                Personal progress is not ready yet. Run the Week 5 Supabase migration to enable it.
              </p>
            ) : (
              <AlgorithmGalaxy patterns={patterns} solvedPatternIds={solvedPatternIds} />
            )}
          </section>
        ) : null}

        <section className="mt-24" aria-label="Algorithm pattern cards">
          <div className="mb-7 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight text-white">Patterns worth remembering</h2>
              <p className="mt-2 text-sm text-[#9aa7b8]">A practical reference for recognizing common problem shapes.</p>
            </div>
            {!unavailable && <span className="hidden text-sm text-[#6e6e73] sm:block">Updated from Supabase</span>}
          </div>

          {unavailable ? (
            <div role="alert" className="rounded-3xl border border-amber-300/25 bg-amber-300/10 p-8 text-amber-100">
              Patterns are temporarily unavailable. Please check the Supabase table and environment variables.
            </div>
          ) : patterns.length === 0 ? (
            <p className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-slate-300">No patterns yet. Add rows in Supabase to build the atlas.</p>
          ) : (
            <ul className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {patterns.map((pattern) => {
                const solved = solvedPatternIds.has(pattern.id);
                return (
                <li id={`pattern-${pattern.id}`} key={pattern.id} className="group surface flex h-full scroll-mt-6 flex-col p-6 transition duration-300 hover:-translate-y-1 hover:border-[#334966] hover:bg-[#141e2c]">
                  <div className="mb-6 flex items-center justify-between gap-3">
                    <span className="text-xs text-[#6e6e73]">{String(pattern.id).padStart(2, "0")}</span>
                    <span className={`rounded-full bg-white/[0.06] px-3 py-1 text-xs font-medium ${categoryClass(pattern.category)}`}>{pattern.category}</span>
                  </div>
                  <h3 className="text-xl font-semibold tracking-tight text-white">{pattern.name}</h3>
                  <p className="mt-3 text-sm leading-7 text-[#a1a1a6]">{pattern.core_idea}</p>
                  <dl className="mt-6 grid gap-4 text-sm">
                    <div>
                      <dt className="text-xs font-medium text-[#86868b]">When to use it</dt>
                      <dd className="mt-2 leading-6 text-[#d2d2d7]">{pattern.when_to_use}</dd>
                    </div>
                    <div className="grid border-t border-white/[0.08]">
                      <div className="py-4">
                        <dt className="text-xs font-medium text-[#86868b]">Example</dt>
                        <dd className="mt-2 leading-6 text-[#d2d2d7]">{pattern.example_problem}</dd>
                      </div>
                      <div className="border-t border-white/[0.08] py-4">
                        <dt className="text-xs font-medium text-[#ff453a]">Common mistake</dt>
                        <dd className="mt-2 leading-6 text-[#d2d2d7]">{pattern.common_trap}</dd>
                      </div>
                    </div>
                  </dl>
                  <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.08] pt-4">
                    <span className="text-xs text-[#6f7e91]">Confidence · {pattern.confidence}</span>
                    {userEmail && !progressUnavailable ? (
                      <form action={togglePatternSolved}>
                        <input type="hidden" name="pattern_id" value={pattern.id} />
                        <ProgressButton solved={solved} />
                      </form>
                    ) : null}
                  </div>
                </li>
                );
              })}
            </ul>
          )}
        </section>

        <footer className="mt-24 border-t border-white/[0.08] py-8 text-sm text-[#6e6e73]">
          Pattern · Built for focused interview practice.
        </footer>
      </div>
    </main>
  );
}
