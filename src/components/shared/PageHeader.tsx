import * as React from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-[#E5E7EB] gap-4 mb-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-[#202638]">{title}</h1>
        {description && <p className="text-sm text-[#64748B] mt-0.5">{description}</p>}
      </div>
      {action && <div className="flex items-center gap-3 shrink-0">{action}</div>}
    </div>
  );
}
