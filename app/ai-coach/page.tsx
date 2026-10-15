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

const newYorkTime = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/New_York",
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZoneName: "short",
});

function authorName(post: AiGeneration) {
  const first = post.profiles?.first_name;
  const last = post.profiles?.last_name;
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

  const posts = data ?? [];

  return (
    <main className="page-shell">
      <div className="page-wrap max-w-6xl">
        <div className="mb-16 flex flex-wrap items-center justify-between gap-4">
          <Link href="/" className="text-lg font-semibold tracking-tight text-white">Pattern</Link>
          <div className="flex items-center gap-3">
            <Link href="/study-plan" className="nav-link">Study plan</Link>
            <Link href="/profile" className="nav-link">Profile</Link>
          </div>
        </div>

        <section className="mx-auto max-w-4xl py-10 text-center">
          <h1 className="text-5xl font-semibold leading-[1.05] tracking-[-0.04em] text-white sm:text-7xl">Ask a good question.<br />Keep the best answers.</h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-[#a1a1a6]">
            Share a concise study post, then let the community decide what is worth remembering.
          </p>
        </section>

        <section className="mt-16 grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
          <div className="surface p-7 lg:sticky lg:top-6">
            <h2 className="text-2xl font-semibold tracking-tight text-white">Create a post</h2>
            <p className="mt-3 text-sm leading-6 text-[#86868b]">
              Choose a topic and ask one focused question.
            </p>

            {user ? (
              <form action={createAiGeneration} className="mt-7 grid gap-5">
                {error === "generation" ? (
                  <p role="alert" className="rounded-2xl border border-rose-300/30 bg-rose-300/10 p-4 text-sm leading-6 text-rose-100">
                    Gemini could not generate a complete answer. Please try again. No incomplete post was saved.
                  </p>
                ) : null}
                <label className="grid gap-2 text-sm font-medium text-[#a1a1a6]">
                  Pattern category
                  <select name="category" className="field">
                    {categories.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-2 text-sm font-medium text-[#a1a1a6]">
                  Prompt
                  <textarea
                    name="prompt"
                    rows={5}
                    className="field resize-none"
                    placeholder="Why does binary search sometimes miss the last element?"
                  />
                </label>
                <GenerateButton />
              </form>
            ) : (
              <div className="mt-6 border-t border-white/[0.08] pt-5 text-[#d2d2d7]">
                <p className="text-sm leading-6">Sign in to create posts and vote.</p>
                <form action={signInWithGoogle} className="mt-4">
                  <button className="primary-button">
                    Continue with Google
                  </button>
                </form>
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-2xl font-semibold tracking-tight text-white">Latest posts</h2>
              <span className="text-sm text-[#6e6e73]">{posts.length} shared</span>
            </div>

            {posts.length === 0 ? (
              <p className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-5 text-sm text-slate-300">No community posts yet. Share the first one.</p>
            ) : (
              <ul className="mt-6 grid gap-5">
                {posts.map((post) => {
                  const upvotes = post.generation_votes.filter((vote) => vote.vote === 1).length;
                  const downvotes = post.generation_votes.filter((vote) => vote.vote === -1).length;
                  const currentUserVote = post.generation_votes.find((vote) => vote.user_id === user?.id)?.vote;

                  return (
                    <li key={post.id} className="surface p-6 sm:p-7">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <span className="rounded-full bg-white/[0.07] px-3 py-1 text-xs font-medium text-[#d2d2d7]">{post.category}</span>
                        <span className="text-right text-xs leading-5 text-[#6e6e73]">
                          <span className="block">by {authorName(post)}</span>
                          <time dateTime={post.created_at}>Shared {newYorkTime.format(new Date(post.created_at))}</time>
                        </span>
                      </div>
                      <p className="mt-6 text-[15px] leading-7 text-[#e8e8ed]">{post.generated_text}</p>
                      <div className="mt-6 border-l-2 border-[#334966] pl-4">
                        <div className="text-xs font-medium text-[#6e6e73]">Question</div>
                        <p className="mt-2 text-sm leading-6 text-[#a1a1a6]">{post.prompt}</p>
                      </div>
                      <div className="mt-4 flex flex-wrap items-center gap-3">
                        {user ? (
                          <>
                            <form action={voteOnGeneration}>
                              <input type="hidden" name="generation_id" value={post.id} />
                              <input type="hidden" name="vote" value="1" />
                              <button className={`min-h-11 rounded-full px-4 py-2 text-sm font-medium transition ${currentUserVote === 1 ? "bg-[#30d158] text-[#07120a]" : "bg-white/[0.06] text-[#d2d2d7] hover:bg-white/[0.1]"}`}>
                                Helpful · {upvotes}
                              </button>
                            </form>
                            <form action={voteOnGeneration}>
                              <input type="hidden" name="generation_id" value={post.id} />
                              <input type="hidden" name="vote" value="-1" />
                              <button className={`min-h-11 rounded-full px-4 py-2 text-sm font-medium transition ${currentUserVote === -1 ? "bg-[#ff453a] text-white" : "bg-white/[0.06] text-[#d2d2d7] hover:bg-white/[0.1]"}`}>
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
