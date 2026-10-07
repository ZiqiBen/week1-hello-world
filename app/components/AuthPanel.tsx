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
        <Link href="/ai-coach" className="nav-link">
          Community
        </Link>
        <form action={signInWithGoogle}>
          <button className="nav-link-strong">
            Sign in
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {!profileComplete && (
        <Link href="/profile" className="nav-link text-[#ff9f0a]">
          Finish profile
        </Link>
      )}
      <Link href="/ai-coach" className="nav-link">
        Community
      </Link>
      <Link href="/study-plan" className="nav-link">
        Study plan
      </Link>
      <Link href="/profile" className="nav-link">
        Profile
      </Link>
      <form action={signOut}>
        <button className="nav-link">
          Sign out
        </button>
      </form>
    </div>
  );
}
