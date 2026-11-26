"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SessionUser } from "@/types/auth";
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
} from "lucide-react";

const NAV_ITEMS = [
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

export function MobileNavigation({
  user,
  isOpen,
  onClose,
}: {
  user: SessionUser;
  isOpen: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  if (!isOpen) return null;

  const filteredNav = NAV_ITEMS.filter((item) => {
    if (!item.roles) return true;
    return item.roles.includes(user.role);
  });

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-xs" onClick={onClose} />
      <div className="fixed inset-y-0 left-0 w-72 bg-[#0A1F44] text-white p-5 flex flex-col shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#E8871A] flex items-center justify-center font-bold text-white text-xs">
              GU
            </div>
            <span className="font-bold text-white font-heading">FMS Branding</span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close navigation menu"
            className="p-1 rounded text-slate-300 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 space-y-1">
          {filteredNav.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-[#102C5E] text-white font-semibold border-l-4 border-[#E8871A] pl-2"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                )}
              >
                <Icon className={cn("w-4 h-4", isActive ? "text-[#E8871A]" : "text-slate-400")} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="pt-4 border-t border-white/10 text-xs text-slate-400">
          Signed in as <span className="text-white font-medium">{user.fullName}</span>
        </div>
      </div>
    </div>
  );
}
