"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  allocateBrandingCreditsAction,
  updateBrandingStageAction,
} from "@/features/branding/actions";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/dates";
import { ExternalLink, Save } from "lucide-react";

interface StageItem {
  id: string;
  name: string;
  stageOrder: number;
  status: string;
  approvalStatus: string;
  responsibleUserId: string | null;
  responsibleUserName: string;
  targetDate: Date | null;
  completedAt: Date | null;
  driveUrl: string | null;
  notes: string | null;
}

interface EmployeeOption {
  id: string;
  fullName: string;
}

export function BrandingStagesClient({
  deliverableId,
  stages,
  employees,
  credits,
  canManageCredits,
}: {
  deliverableId: string;
  stages: StageItem[];
  employees: EmployeeOption[];
  credits: {
    contentCredits: number | null;
    jobOwnerCredits: number | null;
    creditsAllocated: number | null;
  };
  canManageCredits: boolean;
}) {
  const router = useRouter();
  const [editingStageId, setEditingStageId] = useState<string | null>(null);
  const [stageStatus, setStageStatus] = useState("IN_PROGRESS");
  const [responsibleUserId, setResponsibleUserId] = useState("");
  const [driveUrl, setDriveUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [savingStage, setSavingStage] = useState(false);

  const [contentCredits, setContentCredits] = useState(
    credits.contentCredits !== null ? String(credits.contentCredits) : ""
  );
  const [jobOwnerCredits, setJobOwnerCredits] = useState(
    credits.jobOwnerCredits !== null ? String(credits.jobOwnerCredits) : ""
  );
  const [creditsAllocated, setCreditsAllocated] = useState(
    credits.creditsAllocated !== null ? String(credits.creditsAllocated) : ""
  );
  const [savingCredits, setSavingCredits] = useState(false);

  function startEdit(s: StageItem) {
    setEditingStageId(s.id);
    setStageStatus(s.status);
    setResponsibleUserId(s.responsibleUserId || "");
    setDriveUrl(s.driveUrl || "");
    setNotes(s.notes || "");
  }

  async function saveStage(stageId: string) {
    setSavingStage(true);
    await updateBrandingStageAction({
      stageId,
      responsibleUserId: responsibleUserId || null,
      status: stageStatus as
        | "NOT_INITIATED"
        | "IN_PROGRESS"
        | "COMPLETED_ON_TIME"
        | "LATE_COMPLETED"
        | "NOT_DONE"
        | "CANCELLED",
      driveUrl: driveUrl.trim() || null,
      notes: notes.trim() || null,
    });
    setSavingStage(false);
    setEditingStageId(null);
    router.refresh();
  }

  async function saveCredits(e: React.FormEvent) {
    e.preventDefault();
    setSavingCredits(true);
    await allocateBrandingCreditsAction({
      deliverableId,
      contentCredits: contentCredits ? Number(contentCredits) : null,
      jobOwnerCredits: jobOwnerCredits ? Number(jobOwnerCredits) : null,
      creditsAllocated: creditsAllocated ? Number(creditsAllocated) : null,
    });
    setSavingCredits(false);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>5-Stage Deliverable Tracker</CardTitle>
          <CardDescription>
            Content/Mockup (+1d), Approved Design (+2d), Print/DBMS (+3d), Supply &amp; Install (+4d), Pack-ups (+4d)
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 divide-y divide-[#E5E7EB]">
          {stages.map((s) => {
            const isEditing = editingStageId === s.id;
            return (
              <div key={s.id} className="p-5 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-indigo-50 text-[#4F46E5] text-xs font-semibold">
                        {s.stageOrder}
                      </span>
                      <h4 className="text-sm font-semibold text-[#202638]">{s.name}</h4>
                      <StatusBadge type="stage" status={s.status} />
                    </div>
                    <p className="text-xs text-[#64748B] mt-1">
                      Responsible:{" "}
                      <span className="font-medium text-[#202638]">{s.responsibleUserName}</span> •
                      Target Date:{" "}
                      <span className="font-medium text-[#202638]">{formatDate(s.targetDate)}</span>
                      {s.completedAt && ` • Completed: ${formatDate(s.completedAt)}`}
                    </p>
                    {s.driveUrl && (
                      <a
                        href={s.driveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-[#4F46E5] hover:underline mt-1"
                      >
                        Google Drive Link <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>

                  {!isEditing && (
                    <Button variant="outline" size="sm" onClick={() => startEdit(s)}>
                      Update Stage
                    </Button>
                  )}
                </div>

                {isEditing && (
                  <div className="p-4 rounded-lg bg-[#F7F8FC] border border-[#E5E7EB] space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-[#202638] mb-1">
                          Responsible Employee
                        </label>
                        <select
                          value={responsibleUserId}
                          onChange={(e) => setResponsibleUserId(e.target.value)}
                          className="flex h-9 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 text-sm text-[#202638]"
                        >
                          <option value="">Unassigned</option>
                          {employees.map((emp) => (
                            <option key={emp.id} value={emp.id}>
                              {emp.fullName}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-[#202638] mb-1">
                          Stage Status
                        </label>
                        <select
                          value={stageStatus}
                          onChange={(e) => setStageStatus(e.target.value)}
                          className="flex h-9 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 text-sm text-[#202638]"
                        >
                          <option value="NOT_INITIATED">Not Done</option>
                          <option value="IN_PROGRESS">In Process</option>
                          <option value="COMPLETED_ON_TIME">Done / Approved (On Time)</option>
                          <option value="LATE_COMPLETED">Done (Late)</option>
                          <option value="CANCELLED">Cancelled</option>
                        </select>
                      </div>
                    </div>

                    <Input
                      type="url"
                      label="Google Drive Link"
                      placeholder="https://drive.google.com/..."
                      value={driveUrl}
                      onChange={(e) => setDriveUrl(e.target.value)}
                    />

                    <Input
                      label="Stage Notes"
                      placeholder="Optional progress remarks..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />

                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingStageId(null)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        isLoading={savingStage}
                        onClick={() => saveStage(s.id)}
                      >
                        <Save className="w-3.5 h-3.5 mr-1.5" />
                        Save Stage
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* ROI / Credits Allocation Section */}
      {canManageCredits && (
        <Card>
          <CardHeader>
            <CardTitle>Credits Allocation (Manager Only)</CardTitle>
            <CardDescription>
              Allocate Content Credits, Job Owner Credits, and overall stage credits
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={saveCredits} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
              <Input
                type="number"
                step="0.5"
                label="Content Credits"
                value={contentCredits}
                onChange={(e) => setContentCredits(e.target.value)}
              />
              <Input
                type="number"
                step="0.5"
                label="Job Owner Credits"
                value={jobOwnerCredits}
                onChange={(e) => setJobOwnerCredits(e.target.value)}
              />
              <Input
                type="number"
                step="0.5"
                label="Credits Allocated"
                value={creditsAllocated}
                onChange={(e) => setCreditsAllocated(e.target.value)}
              />
              <Button type="submit" variant="primary" size="md" isLoading={savingCredits}>
                Save Credits
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

