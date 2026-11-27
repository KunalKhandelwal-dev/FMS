"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  ClipboardCheck,
  Users,
  BarChart3,
  Layers,
  TrendingUp,
  Settings,
  FileCheck2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { SessionUser } from "@/types/auth";

export interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: string[];
}

export const SIDEBAR_NAV_ITEMS: NavItem[] = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  {
    label: "Jobs & Deliverables",
    href: "/jobs",
    icon: Briefcase,
    roles: ["MAIN_MANAGER", "DEPUTY_MANAGER", "TEAM_LEAD"],
  },
  { label: "My Work", href: "/my-work", icon: ClipboardCheck },
  {
    label: "Approvals",
    href: "/approvals",
    icon: FileCheck2,
    roles: ["MAIN_MANAGER", "DEPUTY_MANAGER", "TEAM_LEAD"],
  },
  {
    label: "Team / Employees",
    href: "/employees",
    icon: Users,
    roles: ["MAIN_MANAGER", "DEPUTY_MANAGER"],
  },
  {
    label: "Productivity",
    href: "/productivity",
    icon: BarChart3,
    roles: ["MAIN_MANAGER", "DEPUTY_MANAGER"],
  },
  { label: "Branding Jobs", href: "/branding-jobs", icon: Layers },
  { label: "ROI", href: "/roi", icon: TrendingUp, roles: ["MAIN_MANAGER"] },
  { label: "Settings", href: "/settings", icon: Settings, roles: ["MAIN_MANAGER"] },
];

export function Sidebar({
  user,
  collapsed,
  onToggleCollapse,
}: {
  user: SessionUser;
  collapsed: boolean;
  onToggleCollapse: () => void;
}) {
  const pathname = usePathname();

  const filteredNav = SIDEBAR_NAV_ITEMS.filter((item) => {
    if (!item.roles) return true;
    return item.roles.includes(user.role);
  });

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col fixed inset-y-0 z-30 bg-white border-r border-[#E5E7EB] transition-all duration-200",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-[#E5E7EB]">
        <Link href="/dashboard" className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-[#4F46E5] flex items-center justify-center font-bold text-white text-xs shrink-0">
            FMS
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <span className="text-sm font-semibold text-[#202638] tracking-tight block truncate">
                Faculty Mgmt
              </span>
              <span className="text-[11px] text-[#64748B] block truncate">
                Branding Dept.
              </span>
            </div>
          )}
        </Link>

        <button
          onClick={onToggleCollapse}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="p-1 rounded-md text-[#64748B] hover:bg-[#F1F3F9] hover:text-[#202638] cursor-pointer"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-2.5 py-4 space-y-1">
        {filteredNav.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-indigo-50 text-[#4F46E5]"
                  : "text-[#64748B] hover:bg-[#F1F3F9] hover:text-[#202638]",
                collapsed && "justify-center px-2"
              )}
            >
              <Icon
                className={cn(
                  "w-4 h-4 shrink-0",
                  isActive ? "text-[#4F46E5]" : "text-[#64748B]"
                )}
              />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer User Info */}
      {!collapsed && (
        <div className="p-3.5 border-t border-[#E5E7EB] bg-[#F7F8FC]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center text-xs font-semibold text-[#4F46E5] shrink-0">
              {user.fullName.substring(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-[#202638] truncate">{user.fullName}</p>
              <p className="text-[11px] text-[#64748B] truncate">
                {user.role.replace(/_/g, " ")}
              </p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
