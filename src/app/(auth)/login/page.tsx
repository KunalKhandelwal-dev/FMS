"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginAction } from "@/features/auth/actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Lock, AlertCircle } from "lucide-react";

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
    <div className="min-h-screen flex items-center justify-center bg-[#F7F8FC] px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#4F46E5] text-white font-bold text-base shadow-xs mb-4">
            FMS
          </div>
          <h1 className="text-xl font-semibold text-[#202638] tracking-tight">
            Faculty Management System
          </h1>
          <p className="text-xs text-[#64748B] mt-1">
            Branding Department Operations &amp; Performance Portal
          </p>
        </div>

        <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-xs p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-5 pb-3.5 border-b border-[#E5E7EB] text-xs font-medium text-[#64748B]">
            <Lock className="w-3.5 h-3.5 text-[#4F46E5]" />
            <span>Authorized Departmental Access</span>
          </div>

          {error && (
            <div className="mb-5 flex items-start gap-2.5 p-3 rounded-lg bg-rose-50 border border-rose-200 text-[#E11D48] text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="email"
              type="email"
              label="Email Address"
              placeholder="name@department.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />

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

            <Button
              type="submit"
              variant="primary"
              className="w-full mt-2"
              size="md"
              isLoading={isLoading}
            >
              Sign In
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-[#E5E7EB] text-center">
            <p className="text-[11px] text-[#64748B]">
              Accounts are provisioned by the Department Main Manager.
            </p>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-center gap-1.5 text-xs text-[#64748B]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#4F46E5]" />
          <span>Protected by Role-Based Access Control</span>
        </div>
      </div>
    </div>
  );
}
