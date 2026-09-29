import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { updateProfile } from "../actions";

type Profile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
};

export default async function ProfilePage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, avatar_url")
    .eq("id", user.id)
    .single<Profile>();

  const profile = data ?? { id: user.id, first_name: null, last_name: null, avatar_url: null };
  const needsName = !profile.first_name || !profile.last_name;

  return (
    <main className="min-h-screen bg-[#05070d] px-6 py-10 text-slate-100">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <Link href="/" className="text-sm text-slate-400 hover:text-slate-200">← Back to atlas</Link>
          <Link href="/study-plan" className="rounded-full border border-emerald-300/30 px-4 py-2 text-xs uppercase tracking-[0.2em] text-emerald-100">Protected route</Link>
        </div>

        <section className="rounded-3xl border border-white/10 bg-white/[0.045] p-8 shadow-2xl shadow-black/30">
          <p className="font-mono text-xs uppercase tracking-[0.35em] text-emerald-300">Profile</p>
          <h1 className="mt-4 text-4xl font-semibold text-white">Make the atlas yours.</h1>
          <p className="mt-4 leading-7 text-slate-300">
            {needsName
              ? "Add your first and last name to finish your profile."
              : "Update your name or avatar whenever you want."}
          </p>

          <div className="mt-8 flex items-center gap-4">
            {profile.avatar_url ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={profile.avatar_url} alt="Profile photo" className="h-20 w-20 rounded-2xl object-cover" />
              </>
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-white/10 bg-black/30 text-2xl">👤</div>
            )}
            <div>
              <div className="font-medium text-white">{user.email}</div>
              <div className="mt-1 text-sm text-slate-400">Signed in with Supabase Auth</div>
            </div>
          </div>

          <form action={updateProfile} className="mt-8 grid gap-5">
            <input type="hidden" name="current_avatar_url" value={profile.avatar_url ?? ""} />
            <label className="grid gap-2 text-sm text-slate-300">
              First name
              <input name="first_name" defaultValue={profile.first_name ?? ""} className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-emerald-300/50" placeholder="Ziqi" />
            </label>
            <label className="grid gap-2 text-sm text-slate-300">
              Last name
              <input name="last_name" defaultValue={profile.last_name ?? ""} className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-emerald-300/50" placeholder="Ben" />
            </label>
            <label className="grid gap-2 text-sm text-slate-300">
              Profile photo
              <input name="avatar" type="file" accept="image/*" className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-slate-300 file:mr-4 file:rounded-full file:border-0 file:bg-emerald-300 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-slate-950" />
            </label>
            <button className="rounded-2xl bg-emerald-300 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-200">
              Save profile
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
