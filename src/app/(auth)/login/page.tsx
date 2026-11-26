"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginAction } from "@/features/auth/actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Lock, Mail, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const result = await loginAction({ email, password });
      if (!result.success) {
        setError(result.error);
        setIsLoading(false);
      } else {
        router.push(result.data.redirectUrl);
        router.refresh();
      }
    } catch {
      setError("An unexpected network error occurred. Please try again.");
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] px-4 py-12">
      <div className="w-full max-w-md">
        {/* University Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#0A1F44] text-[#E8871A] font-bold text-2xl shadow-md mb-4 border border-[#102C5E]">
            GU
          </div>
          <h1 className="text-2xl font-bold text-[#0A1F44] tracking-tight font-heading">
            Geeta University
          </h1>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#E8871A] mt-0.5">
            Branding Department — FMS Portal
          </p>
          <p className="text-xs text-slate-500 mt-2">
            Faculty & Departmental Performance Management System
          </p>
        </div>

        {/* Login Box */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100 text-xs font-medium text-slate-600">
            <Lock className="w-4 h-4 text-slate-400" />
            <span>Authorized Staff & Faculty Access Only</span>
          </div>

          {error && (
            <div className="mb-5 flex items-start gap-3 p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                id="email"
                type="email"
                label="University Email"
                placeholder="staff@geetauniversity.edu.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div>
              <Input
                id="password"
                type="password"
                label="Password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full mt-2"
              size="md"
              isLoading={isLoading}
            >
              Sign In to FMS
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-400">
              No public registration. Accounts are provisioned by the Department Head.
            </p>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Protected by Role-Based Access Control</span>
        </div>
      </div>
    </div>
  );
}

