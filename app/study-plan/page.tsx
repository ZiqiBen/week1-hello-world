import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type Profile = {
  first_name: string | null;
  last_name: string | null;
};

export default async function StudyPlanPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name")
    .eq("id", user.id)
    .single<Profile>();

  const displayName = profile?.first_name ? `${profile.first_name}${profile.last_name ? ` ${profile.last_name}` : ""}` : user.email;

  return (
    <main className="min-h-screen bg-[#05070d] px-6 py-10 text-slate-100">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <Link href="/" className="text-sm text-slate-400 hover:text-slate-200">← Back to atlas</Link>
          <Link href="/profile" className="rounded-full border border-white/15 px-4 py-2 text-xs uppercase tracking-[0.2em] text-slate-200">Profile</Link>
        </div>

        <section className="rounded-3xl border border-emerald-300/20 bg-emerald-300/[0.06] p-8 shadow-2xl shadow-black/30">
          <p className="font-mono text-xs uppercase tracking-[0.35em] text-emerald-300">Protected Route</p>
          <h1 className="mt-4 text-5xl font-semibold text-white">{displayName}&apos;s LeetCode study plan</h1>
          <p className="mt-5 max-w-2xl leading-7 text-slate-300">
            This page only shows after login. It turns the public pattern atlas into a private study space.
          </p>
        </section>

        <section className="mt-8 grid gap-5 md:grid-cols-3">
          {[
            ["Warm up", "Review sliding window, two pointers, and prefix sum."],
            ["Core practice", "Pick one graph or tree pattern and solve two problems."],
            ["Reflection", "Write down the trap that caused the most mistakes today."],
          ].map(([title, body]) => (
            <article key={title} className="rounded-3xl border border-white/10 bg-white/[0.045] p-6">
              <h2 className="text-xl font-semibold text-white">{title}</h2>
              <p className="mt-3 leading-7 text-slate-300">{body}</p>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
