export function LoadingState({ message = "Loading records..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#4F46E5] border-t-transparent mb-3" />
      <p className="text-xs text-[#64748B] font-medium">{message}</p>
    </div>
  );
}
