export function LoadingState({ message = "Loading records..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="h-8 w-8 animate-spin rounded-full border-3 border-[#0A1F44] border-t-transparent mb-3" />
      <p className="text-sm text-slate-500 font-medium">{message}</p>
    </div>
  );
}

