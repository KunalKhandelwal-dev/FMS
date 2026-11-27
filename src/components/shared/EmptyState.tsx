import * as React from "react";
import { FolderOpen } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

export function EmptyState({
  title,
  description,
  action,
  icon = <FolderOpen className="w-6 h-6 text-[#64748B]" />,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 rounded-lg border border-dashed border-[#E5E7EB] bg-white text-center">
      <div className="w-11 h-11 rounded-lg bg-[#F1F3F9] flex items-center justify-center mb-3">
        {icon}
      </div>
      <h3 className="text-sm font-semibold text-[#202638] mb-1">{title}</h3>
      <p className="text-xs text-[#64748B] max-w-md mb-5">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}
