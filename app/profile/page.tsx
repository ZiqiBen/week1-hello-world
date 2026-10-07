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
    <main className="page-shell px-6 py-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <Link href="/" className="text-lg font-semibold text-white">Pattern</Link>
          <Link href="/study-plan" className="nav-link">Study plan</Link>
        </div>

        <section className="surface p-8 sm:p-10">
          <p className="text-sm font-medium text-[#2997ff]">Your account</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.035em] text-white">Make Pattern yours.</h1>
          <p className="mt-4 leading-7 text-[#a1a1a6]">
            {needsName
              ? "Add your first and last name to finish your profile."
              : "Update your name or avatar whenever you want."}
          </p>

          <div className="mt-8 flex items-center gap-4">
            {profile.avatar_url ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={profile.avatar_url} alt="Profile photo" className="h-20 w-20 rounded-full object-cover" />
              </>
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/[0.07] text-2xl">👤</div>
            )}
            <div>
              <div className="font-medium text-white">{user.email}</div>
              <div className="mt-1 text-sm text-[#86868b]">Google account</div>
            </div>
          </div>

          <form action={updateProfile} className="mt-8 grid gap-5">
            <input type="hidden" name="current_avatar_url" value={profile.avatar_url ?? ""} />
            <label className="grid gap-2 text-sm text-[#a1a1a6]">
              First name
              <input name="first_name" defaultValue={profile.first_name ?? ""} className="field" placeholder="Ziqi" />
            </label>
            <label className="grid gap-2 text-sm text-[#a1a1a6]">
              Last name
              <input name="last_name" defaultValue={profile.last_name ?? ""} className="field" placeholder="Ben" />
            </label>
            <label className="grid gap-2 text-sm text-[#a1a1a6]">
              Profile photo
              <input name="avatar" type="file" accept="image/*" className="field text-sm text-[#a1a1a6] file:mr-4 file:rounded-full file:border-0 file:bg-white/[0.1] file:px-4 file:py-2 file:text-sm file:font-medium file:text-white" />
            </label>
            <button className="primary-button">
              Save profile
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
