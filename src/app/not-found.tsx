import Link from "next/link";
import { FileQuestion, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F7F8FC] px-4">
      <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-[#4F46E5] mb-5">
        <FileQuestion className="w-6 h-6" />
      </div>
      <h1 className="text-xl font-semibold text-[#202638] tracking-tight mb-1.5">
        Page Not Found
      </h1>
      <p className="text-sm text-[#64748B] text-center max-w-md mb-6">
        The requested module or record could not be found or you do not have access to it.
      </p>
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#4F46E5] text-white text-sm font-medium hover:bg-[#4338CA] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Return to Dashboard
      </Link>
    </div>
  );
}
