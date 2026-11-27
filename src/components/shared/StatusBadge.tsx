import {
  STAGE_STATUS_LABELS,
  APPROVAL_STATUS_LABELS,
  WORKFLOW_STATE_LABELS,
  DELIVERY_PERFORMANCE_LABELS,
} from "@/lib/constants";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  type: "stage" | "approval" | "workflow" | "delivery";
  status: string;
  className?: string;
}

export function StatusBadge({ type, status, className }: StatusBadgeProps) {
  const dictionary =
    type === "stage"
      ? STAGE_STATUS_LABELS
      : type === "approval"
      ? APPROVAL_STATUS_LABELS
      : type === "workflow"
      ? WORKFLOW_STATE_LABELS
      : DELIVERY_PERFORMANCE_LABELS;

  const config = dictionary[status] || {
    label: status.replace(/_/g, " "),
    color: "bg-slate-100 text-slate-700 border-slate-200",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border whitespace-nowrap",
        config.color,
        className
      )}
    >
      {config.label}
    </span>
  );
}
