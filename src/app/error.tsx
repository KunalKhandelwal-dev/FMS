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
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC] px-4">
      <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600 mb-6">
        <AlertTriangle className="w-8 h-8" />
      </div>
      <h1 className="text-2xl font-bold text-[#0A1F44] tracking-tight mb-2">
        System Error Encountered
      </h1>
      <p className="text-slate-600 text-center max-w-md mb-6">
        An unexpected error occurred while executing this operation. The event has been logged for
        system administrators.
      </p>
      <button
        onClick={() => reset()}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#0A1F44] text-white font-medium hover:bg-[#102C5E] transition-colors cursor-pointer"
      >
        <RotateCcw className="w-4 h-4" />
        Retry Operation
      </button>
    </div>
  );
}
