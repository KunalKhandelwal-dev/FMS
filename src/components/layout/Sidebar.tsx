"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Network,
  Briefcase,
  CheckSquare,
  Package,
  FileCheck2,
  BarChart3,
  TrendingUp,
  Settings,
  ShieldAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { SessionUser } from "@/types/auth";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: string[]; // If undefined, accessible to all
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  {
    label: "Employees",
    href: "/employees",
    icon: Users,
    roles: ["MAIN_MANAGER", "DEPUTY_MANAGER"],
  },
  { label: "Teams", href: "/teams", icon: Network, roles: ["MAIN_MANAGER", "DEPUTY_MANAGER"] },
  { label: "Jobs", href: "/jobs", icon: Briefcase },
  { label: "Tasks", href: "/tasks", icon: CheckSquare },
  { label: "Deliverables", href: "/deliverables", icon: Package },
  {
    label: "Approvals",
    href: "/approvals",
    icon: FileCheck2,
    roles: ["MAIN_MANAGER", "DEPUTY_MANAGER", "TEAM_LEAD"],
  },
  {
    label: "Analytics",
    href: "/analytics",
    icon: BarChart3,
    roles: ["MAIN_MANAGER", "DEPUTY_MANAGER"],
  },
  { label: "ROI & Credits", href: "/roi", icon: TrendingUp, roles: ["MAIN_MANAGER"] },
  { label: "Settings", href: "/settings", icon: Settings, roles: ["MAIN_MANAGER"] },
];

export function Sidebar({ user }: { user: SessionUser }) {
  const pathname = usePathname();

  const filteredNav = NAV_ITEMS.filter((item) => {
    if (!item.roles) return true;
    return item.roles.includes(user.role);
  });

  return (
    <aside className="hidden lg:flex w-64 flex-col fixed inset-y-0 z-30 bg-[#0A1F44] text-white border-r border-[#102C5E]">
      {/* Brand Header */}
      <div className="flex flex-col px-6 py-5 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-[#E8871A] flex items-center justify-center font-bold text-white shadow-xs">
            GU
          </div>
          <div>
            <h2 className="text-base font-bold tracking-tight text-white font-heading">
              FMS PORTAL
            </h2>
            <p className="text-[11px] font-medium text-orange-400 tracking-wider uppercase">
              Branding Department
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {filteredNav.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-[#102C5E] text-white font-semibold border-l-4 border-[#E8871A] pl-2.5 shadow-xs"
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon
                className={cn("w-4 h-4 shrink-0", isActive ? "text-[#E8871A]" : "text-slate-400")}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Status Bar */}
      <div className="p-4 border-t border-white/10 bg-[#050E1F]/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#102C5E] border border-white/20 flex items-center justify-center text-xs font-semibold text-white">
            {user.fullName.substring(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">{user.fullName}</p>
            <p className="text-[10px] text-slate-400 truncate uppercase tracking-wider">
              {user.role.replace(/_/g, " ")}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
