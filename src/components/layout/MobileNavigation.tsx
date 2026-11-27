"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SessionUser } from "@/types/auth";
import { SIDEBAR_NAV_ITEMS } from "./Sidebar";

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

  const filteredNav = SIDEBAR_NAV_ITEMS.filter((item) => {
    if (!item.roles) return true;
    return item.roles.includes(user.role);
  });

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="fixed inset-0 bg-slate-900/40" onClick={onClose} />
      <div className="fixed inset-y-0 left-0 w-72 bg-white border-r border-[#E5E7EB] p-4 flex flex-col shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-[#E5E7EB]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#4F46E5] flex items-center justify-center font-bold text-white text-xs">
              FMS
            </div>
            <span className="font-semibold text-sm text-[#202638]">Faculty Management</span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close navigation menu"
            className="p-1.5 rounded-lg text-[#64748B] hover:bg-[#F1F3F9]"
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
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-indigo-50 text-[#4F46E5]"
                    : "text-[#64748B] hover:bg-[#F1F3F9] hover:text-[#202638]"
                )}
              >
                <Icon className={cn("w-4 h-4", isActive ? "text-[#4F46E5]" : "text-[#64748B]")} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="pt-3 border-t border-[#E5E7EB] text-xs text-[#64748B]">
          Signed in as <span className="text-[#202638] font-medium">{user.fullName}</span>
        </div>
      </div>
    </div>
  );
}
