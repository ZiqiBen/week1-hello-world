import Link from "next/link";
import { signInWithGoogle } from "../actions";

export default function LoginPage() {
  return (
    <main className="page-shell px-6 py-16 sm:py-24">
      <div className="surface mx-auto max-w-lg p-8 sm:p-10">
        <div className="mb-10 text-lg font-semibold">Pattern</div>
        <p className="text-sm font-medium text-[#2997ff]">Welcome back</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.035em] text-white">Your study space is ready.</h1>
        <p className="mt-4 leading-7 text-[#a1a1a6]">
          Sign in to create study cards, vote on community answers, and update your private study plan.
        </p>
        <form action={signInWithGoogle} className="mt-8">
          <button className="primary-button w-full">
            Continue with Google
          </button>
        </form>
        <Link href="/" className="mt-7 inline-block text-sm text-[#86868b] hover:text-white">
          ← Back to Pattern
        </Link>
      </div>
    </main>
  );
}
