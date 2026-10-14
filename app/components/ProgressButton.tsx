"use client";

import { useFormStatus } from "react-dom";

export function ProgressButton({ solved }: { solved: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      aria-pressed={solved}
      disabled={pending}
      className={`min-h-11 rounded-full px-4 py-2 text-sm font-semibold transition disabled:cursor-wait disabled:opacity-60 ${
        solved
          ? "bg-[#75d49b] text-[#07120a] hover:bg-[#8cdeaa]"
          : "bg-white/[0.07] text-[#dbe6f3] hover:bg-white/[0.12]"
      }`}
    >
      {pending ? "Updating…" : solved ? "Mark unsolved" : "Mark as solved"}
    </button>
  );
}
