"use client";

import { useFormStatus } from "react-dom";

export default function GenerateButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="primary-button flex items-center justify-center gap-3"
    >
      {pending ? (
        <>
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" aria-hidden="true" />
          Creating your card…
        </>
      ) : (
        "Generate AI card"
      )}
    </button>
  );
}
