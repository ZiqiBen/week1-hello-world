import Link from "next/link";
import { signInWithGoogle, signOut } from "../actions";

type AuthPanelProps = {
  email?: string | null;
  profileComplete?: boolean;
};

export function AuthPanel({ email, profileComplete }: AuthPanelProps) {
  if (!email) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <Link href="/ai-coach" className="rounded-full border border-cyan-300/35 bg-cyan-300/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100">
          AI coach
        </Link>
        <form action={signInWithGoogle}>
          <button className="rounded-full border border-cyan-300/40 bg-cyan-300/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100 transition hover:bg-cyan-300/20">
            Sign in with Google
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {!profileComplete && (
        <Link href="/profile" className="rounded-full border border-amber-300/40 bg-amber-300/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-amber-100">
          Complete profile
        </Link>
      )}
      <Link href="/ai-coach" className="rounded-full border border-cyan-300/35 bg-cyan-300/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100">
        AI coach
      </Link>
      <Link href="/study-plan" className="rounded-full border border-emerald-300/35 bg-emerald-300/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-100">
        Study plan
      </Link>
      <Link href="/profile" className="rounded-full border border-white/15 bg-white/[0.05] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-100">
        Profile
      </Link>
      <form action={signOut}>
        <button className="rounded-full border border-slate-500/40 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-300 transition hover:border-rose-300/50 hover:text-rose-100">
          Sign out
        </button>
      </form>
    </div>
  );
}
