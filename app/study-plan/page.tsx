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
    <main className="page-shell px-6 py-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <Link href="/" className="text-lg font-semibold text-white">Pattern</Link>
          <Link href="/profile" className="nav-link">Profile</Link>
        </div>

        <section className="py-12 text-center sm:py-20">
          <p className="text-sm font-medium text-[#2997ff]">Today&apos;s focus</p>
          <h1 className="mt-4 text-5xl font-semibold tracking-[-0.04em] text-white sm:text-7xl">A clear plan for {displayName}.</h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-[#a1a1a6]">
            Three small steps. Enough structure to make progress without turning practice into a chore.
          </p>
        </section>

        <section className="mt-8 grid gap-5 md:grid-cols-3">
          {[
            ["Warm up", "Review sliding window, two pointers, and prefix sum."],
            ["Core practice", "Pick one graph or tree pattern and solve two problems."],
            ["Reflection", "Write down the trap that caused the most mistakes today."],
          ].map(([title, body]) => (
            <article key={title} className="surface p-7">
              <h2 className="text-xl font-semibold text-white">{title}</h2>
              <p className="mt-3 leading-7 text-[#a1a1a6]">{body}</p>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
