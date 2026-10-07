import Link from "next/link";
import { createAiGeneration, signInWithGoogle, voteOnGeneration } from "../actions";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import GenerateButton from "../components/GenerateButton";

type AiGeneration = {
  id: string;
  user_id: string;
  category: string;
  prompt: string;
  generated_text: string;
  created_at: string;
  profiles: { first_name: string | null; last_name: string | null } | null;
  generation_votes: { user_id: string; vote: number }[];
};

const categories = ["Arrays", "Trees", "Graphs", "Dynamic Programming", "Search", "Stacks", "Recursion"];

function authorName(card: AiGeneration) {
  const first = card.profiles?.first_name;
  const last = card.profiles?.last_name;
  return first ? `${first}${last ? ` ${last}` : ""}` : "Atlas member";
}

export default async function AiCoachPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data } = await supabase
    .from("ai_generations")
    .select("id, user_id, category, prompt, generated_text, created_at, profiles(first_name, last_name), generation_votes(user_id, vote)")
    .order("created_at", { ascending: false })
    .limit(30)
    .returns<AiGeneration[]>();

  const cards = data ?? [];

  return (
    <main className="min-h-screen bg-[#05070d] px-6 py-10 text-slate-100">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <Link href="/" className="text-sm text-slate-400 hover:text-slate-200">← Back to atlas</Link>
          <div className="flex items-center gap-3">
            <Link href="/study-plan" className="rounded-full border border-emerald-300/30 px-4 py-2 text-xs uppercase tracking-[0.2em] text-emerald-100">Study plan</Link>
            <Link href="/profile" className="rounded-full border border-white/15 px-4 py-2 text-xs uppercase tracking-[0.2em] text-slate-200">Profile</Link>
          </div>
        </div>

        <section className="rounded-3xl border border-cyan-300/20 bg-cyan-300/[0.055] p-8 shadow-2xl shadow-black/30">
          <p className="font-mono text-xs uppercase tracking-[0.35em] text-cyan-300">AI Pattern Coach</p>
          <h1 className="mt-4 max-w-4xl text-5xl font-semibold tracking-tight text-white">Generate study cards. Vote for the most useful ones.</h1>
          <p className="mt-5 max-w-3xl leading-7 text-slate-300">
            Make quick AI-generated interview prep cards for algorithm patterns, then rate the cards that actually help. This gives Columbia students a daily feed of useful coding practice ideas.
          </p>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-6 shadow-xl shadow-black/20">
            <h2 className="text-2xl font-semibold text-white">Create a card</h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Pick a pattern and ask for the kind of explanation you want. The prompt and result are saved so other logged-in users can vote.
            </p>

            {user ? (
              <form action={createAiGeneration} className="mt-6 grid gap-5">
                {error === "generation" ? (
                  <p role="alert" className="rounded-2xl border border-rose-300/30 bg-rose-300/10 p-4 text-sm leading-6 text-rose-100">
                    Gemini could not generate a complete answer. Please try again. No incomplete card was saved.
                  </p>
                ) : null}
                <label className="grid gap-2 text-sm text-slate-300">
                  Pattern category
                  <select name="category" className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-cyan-300/50">
                    {categories.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-2 text-sm text-slate-300">
                  Prompt
                  <textarea
                    name="prompt"
                    rows={5}
                    className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-cyan-300/50"
                    placeholder="Give me a short study card for a Columbia student who keeps missing binary search edge cases."
                  />
                </label>
                <GenerateButton />
              </form>
            ) : (
              <div className="mt-6 rounded-2xl border border-amber-300/25 bg-amber-300/10 p-5 text-amber-100">
                <p className="text-sm leading-6">Sign in first to generate and vote on AI study cards.</p>
                <form action={signInWithGoogle} className="mt-4">
                  <button className="rounded-full border border-amber-300/40 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-amber-100 transition hover:bg-amber-300/10">
                    Sign in with Google
                  </button>
                </form>
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-6 shadow-xl shadow-black/20">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-2xl font-semibold text-white">Community cards</h2>
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-slate-500">{cards.length} saved</span>
            </div>

            {cards.length === 0 ? (
              <p className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-5 text-sm text-slate-300">No AI cards yet. Generate the first one.</p>
            ) : (
              <ul className="mt-6 grid gap-4">
                {cards.map((card) => {
                  const upvotes = card.generation_votes.filter((vote) => vote.vote === 1).length;
                  const downvotes = card.generation_votes.filter((vote) => vote.vote === -1).length;
                  const currentUserVote = card.generation_votes.find((vote) => vote.user_id === user?.id)?.vote;

                  return (
                    <li key={card.id} className="rounded-3xl border border-white/10 bg-black/20 p-5">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <span className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-xs text-cyan-100">{card.category}</span>
                        <span className="text-right text-xs text-slate-500">
                          <span className="block">by {authorName(card)}</span>
                          <time dateTime={card.created_at}>Generated {new Date(card.created_at).toLocaleString()}</time>
                        </span>
                      </div>
                      <p className="mt-4 text-sm leading-7 text-slate-200">{card.generated_text}</p>
                      <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                        <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-slate-500">Saved prompt</div>
                        <p className="mt-2 text-sm leading-6 text-slate-400">{card.prompt}</p>
                      </div>
                      <div className="mt-4 flex flex-wrap items-center gap-3">
                        {user ? (
                          <>
                            <form action={voteOnGeneration}>
                              <input type="hidden" name="generation_id" value={card.id} />
                              <input type="hidden" name="vote" value="1" />
                              <button className={`rounded-full border px-4 py-2 text-sm transition ${currentUserVote === 1 ? "border-emerald-300 bg-emerald-300 text-slate-950" : "border-emerald-300/30 text-emerald-100 hover:bg-emerald-300/10"}`}>
                                Helpful · {upvotes}
                              </button>
                            </form>
                            <form action={voteOnGeneration}>
                              <input type="hidden" name="generation_id" value={card.id} />
                              <input type="hidden" name="vote" value="-1" />
                              <button className={`rounded-full border px-4 py-2 text-sm transition ${currentUserVote === -1 ? "border-rose-300 bg-rose-300 text-slate-950" : "border-rose-300/30 text-rose-100 hover:bg-rose-300/10"}`}>
                                Needs work · {downvotes}
                              </button>
                            </form>
                          </>
                        ) : (
                          <span className="text-sm text-slate-500">Sign in to vote.</span>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
