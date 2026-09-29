import Link from "next/link";
import { signInWithGoogle } from "../actions";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[#05070d] px-6 py-16 text-slate-100">
      <div className="mx-auto max-w-xl rounded-3xl border border-white/10 bg-white/[0.045] p-8 shadow-2xl shadow-black/30">
        <p className="font-mono text-xs uppercase tracking-[0.35em] text-cyan-300">Google Auth</p>
        <h1 className="mt-4 text-4xl font-semibold text-white">Sign in to unlock your study space.</h1>
        <p className="mt-4 leading-7 text-slate-300">
          The public pattern atlas is still open. Signing in unlocks the protected study plan and your profile section.
        </p>
        <form action={signInWithGoogle} className="mt-8">
          <button className="w-full rounded-2xl bg-emerald-300 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-200">
            Continue with Google
          </button>
        </form>
        <Link href="/" className="mt-6 inline-block text-sm text-slate-400 hover:text-slate-200">
          Back to atlas
        </Link>
      </div>
    </main>
  );
}
