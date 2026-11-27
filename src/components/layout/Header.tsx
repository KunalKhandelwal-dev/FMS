"use client";

import { usePathname } from "next/navigation";
import { logoutAction } from "@/features/auth/actions";
import { LogOut, Bell, Menu, ChevronRight } from "lucide-react";
import type { SessionUser } from "@/types/auth";
import { ROLE_LABELS } from "@/lib/constants";

interface HeaderProps {
  user: SessionUser;
  onOpenMobileMenu?: () => void;
}

const ROUTE_LABELS: Record<string, string> = {
  dashboard: "Overview",
  jobs: "Jobs & Deliverables",
  "my-work": "My Work",
  approvals: "Approvals",
  employees: "Team / Employees",
  teams: "Teams",
  productivity: "Productivity",
  "branding-jobs": "Branding Jobs",
  roi: "ROI",
  settings: "Settings",
  new: "Create New",
  edit: "Edit",
};

export function Header({ user, onOpenMobileMenu }: HeaderProps) {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-[#E5E7EB] bg-white px-4 sm:px-6">
      {/* Left: Mobile trigger & Breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        {onOpenMobileMenu && (
          <button
            onClick={onOpenMobileMenu}
            aria-label="Open navigation menu"
            className="lg:hidden p-2 rounded-lg text-[#64748B] hover:bg-[#F1F3F9] cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <nav aria-label="Breadcrumb" className="hidden sm:flex items-center gap-1.5 text-xs text-[#64748B]">
          <span>FMS</span>
          {segments.map((seg, idx) => {
            const label = ROUTE_LABELS[seg] || seg;
            const isLast = idx === segments.length - 1;
            return (
              <span key={`${seg}-${idx}`} className="flex items-center gap-1.5">
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                <span className={isLast ? "font-semibold text-[#202638]" : ""}>{label}</span>
              </span>
            );
          })}
        </nav>
      </div>

      {/* Right: Notifications & Profile */}
      <div className="flex items-center gap-3">
        <button
          aria-label="Notifications"
          className="p-2 rounded-lg text-[#64748B] hover:bg-[#F1F3F9] hover:text-[#202638] transition-colors relative cursor-pointer"
        >
          <Bell className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 pl-3 border-l border-[#E5E7EB]">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold text-[#202638]">{user.fullName}</p>
            <p className="text-[11px] text-[#64748B]">
              {ROLE_LABELS[user.role] || user.role.replace(/_/g, " ")}
            </p>
          </div>
          <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center text-xs font-semibold text-[#4F46E5]">
            {user.fullName.substring(0, 2).toUpperCase()}
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              title="Sign Out"
              aria-label="Sign Out"
              className="p-2 rounded-lg text-[#64748B] hover:bg-rose-50 hover:text-[#E11D48] transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
