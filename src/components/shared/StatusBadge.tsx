import { STAGE_STATUS_LABELS, APPROVAL_STATUS_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  type: "stage" | "approval";
  status: string;
  className?: string;
}

export function StatusBadge({ type, status, className }: StatusBadgeProps) {
  const dictionary = type === "stage" ? STAGE_STATUS_LABELS : APPROVAL_STATUS_LABELS;
  const config = dictionary[status] || {
    label: status.replace(/_/g, " "),
    color: "bg-gray-100 text-gray-700 border-gray-200",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        config.color,
        className
      )}
    >
      {config.label}
    </span>
  );
}

