"use client";

import { usePathname } from "next/navigation";
import { logoutAction } from "@/features/auth/actions";
import { LogOut, Bell, Menu, Shield } from "lucide-react";
import type { SessionUser } from "@/types/auth";
import { ROLE_LABELS } from "@/lib/constants";

interface HeaderProps {
  user: SessionUser;
  onOpenMobileMenu?: () => void;
}

export function Header({ user, onOpenMobileMenu }: HeaderProps) {
  const pathname = usePathname();

  // Extract page title from route
  const segment = pathname.split("/").filter(Boolean)[0] || "dashboard";
  const title = segment.charAt(0).toUpperCase() + segment.slice(1);

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 backdrop-blur-xs px-4 sm:px-6">
      {/* Left: Mobile trigger & Breadcrumbs */}
      <div className="flex items-center gap-3">
        {onOpenMobileMenu && (
          <button
            onClick={onOpenMobileMenu}
            aria-label="Open navigation menu"
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
          <span>Geeta University</span>
          <span>/</span>
          <span>Branding</span>
          <span>/</span>
          <span className="font-semibold text-[#0A1F44]">{title}</span>
        </div>
      </div>

      {/* Right: Role indicator & Actions */}
      <div className="flex items-center gap-4">
        {/* Role Badge */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700">
          <Shield className="w-3.5 h-3.5 text-[#E8871A]" />
          <span>{ROLE_LABELS[user.role] || user.role}</span>
        </div>

        {/* Notifications */}
        <button
          aria-label="View notifications"
          className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors relative cursor-pointer"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#E8871A]" />
        </button>

        {/* Profile Info */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold text-[#0A1F44]">{user.fullName}</p>
            <p className="text-[10px] text-slate-500">{user.email}</p>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              title="Sign Out"
              aria-label="Sign Out"
              className="p-2 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}

