"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled Application Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F7F8FC] px-4">
      <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-[#E11D48] mb-5">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <h1 className="text-xl font-semibold text-[#202638] tracking-tight mb-1.5">
        Something went wrong
      </h1>
      <p className="text-sm text-[#64748B] text-center max-w-md mb-6">
        An unexpected error occurred while processing this request. Please try again.
      </p>
      <button
        onClick={() => reset()}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#4F46E5] text-white text-sm font-medium hover:bg-[#4338CA] transition-colors cursor-pointer"
      >
        <RotateCcw className="w-4 h-4" />
        Retry
      </button>
    </div>
  );
}
