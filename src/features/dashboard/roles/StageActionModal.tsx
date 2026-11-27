"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  assignWorkflowStageAction,
  reviewSequentialStageAction,
  submitStageOutputAction,
} from "@/features/workflow/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, Star, X } from "lucide-react";
import type { StaffOption } from "./DashboardTypes";

export type StageModalMode =
  | {
      kind: "ASSIGN";
      deliverableId: string;
      deliverableTitle: string;
      stageKey: string;
      stageLabel: string;
      employees: StaffOption[];
    }
  | {
      kind: "SUBMIT";
      deliverableId: string;
      deliverableTitle: string;
      stageKey: string;
      stageLabel: string;
      requireUrl?: boolean;
      showPlatform?: boolean;
    }
  | {
      kind: "REVIEW";
      deliverableId: string;
      deliverableTitle: string;
      stageKey: string;
      stageLabel: string;
      canRate: boolean;
      existingRating?: number | null;
    };

export function StageActionModal({
  mode,
  onClose,
}: {
  mode: StageModalMode;
  onClose: () => void;
}) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [assigneeId, setAssigneeId] = useState(
    mode.kind === "ASSIGN" ? mode.employees[0]?.id || "" : ""
  );
  const [dueDate, setDueDate] = useState("");
  const [overrideDependency, setOverrideDependency] = useState(false);

  const [url, setUrl] = useState("");
  const [actualDate, setActualDate] = useState(new Date().toISOString().slice(0, 10));
  const [socialPlatform, setSocialPlatform] = useState("Instagram");
  const [notes, setNotes] = useState("");

  const [decision, setDecision] = useState<"APPROVED" | "REVISION_REQUESTED" | "REJECTED">(
    "APPROVED"
  );
  const [stars, setStars] = useState<number>(
    mode.kind === "REVIEW" ? mode.existingRating ?? 4 : 4
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isSaving) return;
    setError(null);
    setIsSaving(true);

    try {
      if (mode.kind === "ASSIGN") {
        const res = await assignWorkflowStageAction({
          deliverableId: mode.deliverableId,
          stageKey: mode.stageKey,
          assigneeId,
          dueDate: dueDate ? new Date(`${dueDate}T12:00:00+05:30`) : null,
          overrideDependency,
        });
        if (!res.success) {
          setError(res.error);
          setIsSaving(false);
          return;
        }
      } else if (mode.kind === "SUBMIT") {
        const res = await submitStageOutputAction({
          deliverableId: mode.deliverableId,
          stageKey: mode.stageKey,
          url: url.trim() || null,
          actualDate: actualDate ? new Date(`${actualDate}T12:00:00+05:30`) : new Date(),
          socialPlatform: mode.showPlatform ? socialPlatform : null,
          notes: notes.trim() || null,
        });
        if (!res.success) {
          setError(res.error);
          setIsSaving(false);
          return;
        }
      } else {
        const res = await reviewSequentialStageAction({
          deliverableId: mode.deliverableId,
          stageKey: mode.stageKey,
          decision,
          comments: notes.trim() || null,
          stars: mode.canRate ? stars : null,
        });
        if (!res.success) {
          setError(res.error);
          setIsSaving(false);
          return;
        }
      }

      router.refresh();
      onClose();
    } catch {
      setError("Action failed. Please try again.");
      setIsSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white border border-[#E5E7EB] shadow-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-[#202638]">{mode.stageLabel}</h3>
            <p className="text-xs text-[#64748B]">{mode.deliverableTitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md text-[#64748B] hover:bg-[#F1F3F9] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-rose-50 border border-rose-200 text-[#E11D48] text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {mode.kind === "ASSIGN" && (
            <>
              <div>
                <label className="block text-xs font-medium text-[#202638] mb-1">
                  Assign To
                </label>
                <select
                  value={assigneeId}
                  onChange={(e) => setAssigneeId(e.target.value)}
                  required
                  className="flex h-9 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 text-sm text-[#202638]"
                >
                  <option value="">Select team member</option>
                  {mode.employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.fullName} {emp.designation ? `(${emp.designation})` : ""}
                    </option>
                  ))}
                </select>
              </div>
              <Input
                type="date"
                label="Target Date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
              {mode.stageKey === "VIDEO_EDITING" && (
                <label className="flex items-center gap-2 text-xs text-[#64748B]">
                  <input
                    type="checkbox"
                    checked={overrideDependency}
                    onChange={(e) => setOverrideDependency(e.target.checked)}
                  />
                  Manager override (allow assignment before raw footage upload)
                </label>
              )}
            </>
          )}

          {mode.kind === "SUBMIT" && (
            <>
              <Input
                type="url"
                label={mode.requireUrl ? "Live / Drive URL (Required)" : "Google Drive / Proof URL"}
                placeholder="https://..."
                required={mode.requireUrl}
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
              <Input
                type="date"
                label="Actual Completion Date"
                value={actualDate}
                onChange={(e) => setActualDate(e.target.value)}
              />
              {mode.showPlatform && (
                <div>
                  <label className="block text-xs font-medium text-[#202638] mb-1">
                    Platform / Account
                  </label>
                  <select
                    value={socialPlatform}
                    onChange={(e) => setSocialPlatform(e.target.value)}
                    className="flex h-9 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 text-sm text-[#202638]"
                  >
                    <option value="Instagram">Instagram</option>
                    <option value="YouTube">YouTube</option>
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="Facebook">Facebook</option>
                  </select>
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-[#202638] mb-1">
                  Notes
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Optional submission notes..."
                  className="w-full rounded-lg border border-[#E5E7EB] p-2.5 text-sm text-[#202638]"
                />
              </div>
            </>
          )}

          {mode.kind === "REVIEW" && (
            <>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    { value: "APPROVED", label: "Approve", style: "border-blue-300 bg-blue-50 text-blue-700" },
                    {
                      value: "REVISION_REQUESTED",
                      label: "Corrections",
                      style: "border-violet-300 bg-violet-50 text-violet-700",
                    },
                    {
                      value: "REJECTED",
                      label: "Not Approved",
                      style: "border-rose-300 bg-rose-50 text-rose-700",
                    },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setDecision(opt.value)}
                    className={`py-2 px-2 rounded-lg border text-xs font-medium cursor-pointer ${
                      decision === opt.value
                        ? opt.style
                        : "border-[#E5E7EB] bg-white text-[#64748B]"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {mode.canRate && (
                <div>
                  <label className="block text-xs font-medium text-[#202638] mb-1.5">
                    Main Manager Rating ({stars} / 5)
                  </label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setStars(val)}
                        className="p-1 cursor-pointer"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            val <= stars ? "fill-[#4F46E5] text-[#4F46E5]" : "text-slate-300"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-[#202638] mb-1">
                  Review / Proofreading Comments
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add review notes or requested corrections..."
                  className="w-full rounded-lg border border-[#E5E7EB] p-2.5 text-sm text-[#202638]"
                />
              </div>
            </>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isSaving}>
              Save
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
