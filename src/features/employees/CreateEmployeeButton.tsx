"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createEmployeeAction } from "@/features/employees/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPlus, X, AlertCircle } from "lucide-react";

export function CreateEmployeeButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [designation, setDesignation] = useState("");
  const [role, setRole] = useState<"EMPLOYEE" | "TEAM_LEAD" | "DEPUTY_MANAGER">("EMPLOYEE");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isSubmitting) return;
    setError(null);
    setIsSubmitting(true);

    const res = await createEmployeeAction({
      fullName,
      email,
      designation,
      role,
      password,
    });

    if (!res.success) {
      setError(res.error);
      setIsSubmitting(false);
      return;
    }

    setOpen(false);
    setFullName("");
    setEmail("");
    setDesignation("");
    setPassword("");
    setIsSubmitting(false);
    router.refresh();
  }

  return (
    <>
      <Button variant="primary" size="sm" onClick={() => setOpen(true)}>
        <UserPlus className="w-4 h-4 mr-1.5" />
        Add Staff Member
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white border border-[#E5E7EB] shadow-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[#202638]">Provision Staff Account</h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-md text-[#64748B] hover:bg-[#F1F3F9] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {error && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-[#E11D48]">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <Input
                label="Full Name"
                placeholder="e.g., Yash"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />

              <Input
                type="email"
                label="Email Address"
                placeholder="name@department.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Input
                label="Designation"
                placeholder="e.g., Cameraman, Video Editor, Team Lead"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
              />

              <div>
                <label className="block text-xs font-medium text-[#202638] mb-1.5">
                  System Role
                </label>
                <select
                  value={role}
                  onChange={(e) =>
                    setRole(e.target.value as "EMPLOYEE" | "TEAM_LEAD" | "DEPUTY_MANAGER")
                  }
                  className="flex h-9 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 text-sm text-[#202638]"
                >
                  <option value="EMPLOYEE">Employee / Specialist</option>
                  <option value="TEAM_LEAD">Team Lead</option>
                  <option value="DEPUTY_MANAGER">Deputy Manager</option>
                </select>
              </div>

              <Input
                type="password"
                label="Initial Password (min 8 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
                  Create Account
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

