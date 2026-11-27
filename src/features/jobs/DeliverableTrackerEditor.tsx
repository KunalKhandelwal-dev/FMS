"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateContentTrackerAction } from "@/features/deliverables/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toKolkataDateInput } from "@/lib/dates";
import { Save, X } from "lucide-react";

interface EmployeeOption {
  id: string;
  fullName: string;
  designation: string | null;
}

interface DeliverableTrackerProps {
  deliverable: {
    id: string;
    title: string;
    deliverableType: string;
    assignedToId: string | null;
    targetDate: Date | null;
    shootAssignedToId: string | null;
    shootScheduledDate: Date | null;
    shootActualDate: Date | null;
    shootStatus: string;
    rawFootageUrl: string | null;
    editorAssignedToId: string | null;
    editScheduledDate: Date | null;
    editActualDate: Date | null;
    editStatus: string;
    approvedVideoUrl: string | null;
    postAssignedToId: string | null;
    postScheduledDate: Date | null;
    postActualDate: Date | null;
    postStatus: string;
    livePostUrl: string | null;
  };
  employees: EmployeeOption[];
  initialStage: "shoot" | "edit" | "post";
  currentUserId: string;
  canManageAssignments: boolean;
  onClose: () => void;
}

const TRACKER_STATUSES = [
  { value: "NOT_INITIATED", label: "Not Initiated" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "COMPLETED_ON_TIME", label: "Completed On Time" },
  { value: "LATE_COMPLETED", label: "Late Completed" },
  { value: "NOT_DONE", label: "Not done till date" },
  { value: "CANCELLED", label: "Cancelled" },
] as const;

export function DeliverableTrackerEditor({
  deliverable,
  employees,
  initialStage,
  currentUserId,
  canManageAssignments,
  onClose,
}: DeliverableTrackerProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeStage, setActiveStage] = useState<"shoot" | "edit" | "post">(initialStage);

  const isShootAssignee = deliverable.shootAssignedToId === currentUserId;
  const isEditorAssignee = deliverable.editorAssignedToId === currentUserId;
  const isPostAssignee = deliverable.postAssignedToId === currentUserId;

  const isPhotoOnly =
    deliverable.deliverableType === "PHOTO_POST" ||
    deliverable.deliverableType === "PHOTOGRAPHY_CLASS";
  const isLiveStory = deliverable.deliverableType === "LIVE_STORY";

  const visibleStageKeys: Array<"shoot" | "edit" | "post"> = isLiveStory
    ? ["post"]
    : deliverable.deliverableType === "PHOTOGRAPHY_CLASS"
    ? ["shoot"]
    : isPhotoOnly
    ? ["shoot", "post"]
    : ["shoot", "edit", "post"];

  const shootEmployees = (() => {
    const filtered = employees.filter((e) => {
      const d = (e.designation || "").toLowerCase();
      if (isPhotoOnly) return d.includes("photographer");
      return d.includes("cinematographer") || d.includes("photographer");
    });
    return filtered.length > 0 ? filtered : employees;
  })();

  const editorEmployees = (() => {
    const filtered = employees.filter((e) =>
      (e.designation || "").toLowerCase().includes("editor")
    );
    return filtered.length > 0 ? filtered : employees;
  })();

  const publisherEmployees = (() => {
    const filtered = employees.filter((e) =>
      (e.designation || "").toLowerCase().includes("social")
    );
    return filtered.length > 0 ? filtered : employees;
  })();

  const availableStages: Array<{ key: "shoot" | "edit" | "post"; label: string }> = [
    ...(visibleStageKeys.includes("shoot") && (canManageAssignments || isShootAssignee)
      ? [{ key: "shoot" as const, label: isPhotoOnly ? "Photography" : "1. Shoot / Cameraman" }]
      : []),
    ...(visibleStageKeys.includes("edit") && (canManageAssignments || isEditorAssignee)
      ? [{ key: "edit" as const, label: "2. Video Editor" }]
      : []),
    ...(visibleStageKeys.includes("post") && (canManageAssignments || isPostAssignee)
      ? [{ key: "post" as const, label: "Social Publishing" }]
      : []),
  ];

  const [shootAssignedToId, setShootAssignedToId] = useState(deliverable.shootAssignedToId || "");
  const [shootScheduledDate, setShootScheduledDate] = useState(
    toKolkataDateInput(deliverable.shootScheduledDate)
  );
  const [shootActualDate, setShootActualDate] = useState(
    toKolkataDateInput(deliverable.shootActualDate)
  );
  const [shootStatus, setShootStatus] = useState(deliverable.shootStatus);
  const [rawFootageUrl, setRawFootageUrl] = useState(deliverable.rawFootageUrl || "");

  const [editorAssignedToId, setEditorAssignedToId] = useState(
    deliverable.editorAssignedToId || ""
  );
  const [editScheduledDate, setEditScheduledDate] = useState(
    toKolkataDateInput(deliverable.editScheduledDate)
  );
  const [editActualDate, setEditActualDate] = useState(
    toKolkataDateInput(deliverable.editActualDate)
  );
  const [editStatus, setEditStatus] = useState(deliverable.editStatus);
  const [approvedVideoUrl, setApprovedVideoUrl] = useState(deliverable.approvedVideoUrl || "");

  const [postAssignedToId, setPostAssignedToId] = useState(deliverable.postAssignedToId || "");
  const [postScheduledDate, setPostScheduledDate] = useState(
    toKolkataDateInput(deliverable.postScheduledDate)
  );
  const [postActualDate, setPostActualDate] = useState(
    toKolkataDateInput(deliverable.postActualDate)
  );
  const [postStatus, setPostStatus] = useState(deliverable.postStatus);
  const [livePostUrl, setLivePostUrl] = useState(deliverable.livePostUrl || "");

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    const payload: Parameters<typeof updateContentTrackerAction>[0] = {
      deliverableId: deliverable.id,
    };

    if (activeStage === "shoot") {
      if (canManageAssignments) {
        payload.shootAssignedToId = shootAssignedToId || null;
        payload.shootScheduledDate = shootScheduledDate
          ? new Date(`${shootScheduledDate}T12:00:00+05:30`)
          : null;
        payload.shootStatus = shootStatus as (typeof TRACKER_STATUSES)[number]["value"];
      }
      if (isShootAssignee) {
        payload.shootActualDate = shootActualDate
          ? new Date(`${shootActualDate}T12:00:00+05:30`)
          : null;
        payload.shootStatus = shootStatus as (typeof TRACKER_STATUSES)[number]["value"];
        payload.rawFootageUrl = rawFootageUrl.trim() || null;
      }
    }

    if (activeStage === "edit") {
      if (canManageAssignments) {
        payload.editorAssignedToId = editorAssignedToId || null;
        payload.editScheduledDate = editScheduledDate
          ? new Date(`${editScheduledDate}T12:00:00+05:30`)
          : null;
        payload.editStatus = editStatus as (typeof TRACKER_STATUSES)[number]["value"];
      }
      if (isEditorAssignee) {
        payload.editActualDate = editActualDate
          ? new Date(`${editActualDate}T12:00:00+05:30`)
          : null;
        payload.editStatus = editStatus as (typeof TRACKER_STATUSES)[number]["value"];
        payload.approvedVideoUrl = approvedVideoUrl.trim() || null;
      }
    }

    if (activeStage === "post") {
      if (canManageAssignments) {
        payload.postAssignedToId = postAssignedToId || null;
        payload.postScheduledDate = postScheduledDate
          ? new Date(`${postScheduledDate}T12:00:00+05:30`)
          : null;
        payload.postStatus = postStatus as (typeof TRACKER_STATUSES)[number]["value"];
      }
      if (isPostAssignee) {
        payload.postActualDate = postActualDate
          ? new Date(`${postActualDate}T12:00:00+05:30`)
          : null;
        payload.postStatus = postStatus as (typeof TRACKER_STATUSES)[number]["value"];
        payload.livePostUrl = livePostUrl.trim() || null;
      }
    }

    const res = await updateContentTrackerAction(payload);

    if (!res.success) {
      setError(res.error);
      setIsSaving(false);
      return;
    }

    router.refresh();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-white border border-[#E5E7EB] shadow-xl">
        <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
            <h3 className="text-sm font-semibold text-[#202638]">
              Production Stage Tracker — {deliverable.title}
            </h3>
            <p className="text-xs text-[#64748B]">
              Assign Shoot/Cameraman, Video Editor, and Social Publishing details
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md text-[#64748B] hover:bg-[#F1F3F9] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-5 space-y-5">
          {availableStages.length > 1 && (
            <div className="flex items-center gap-1.5 p-1 rounded-lg bg-[#F1F3F9] border border-[#E5E7EB]">
              {availableStages.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveStage(tab.key)}
                  className={`flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                    activeStage === tab.key
                      ? "bg-white text-[#202638] shadow-sm"
                      : "text-[#64748B] hover:text-[#202638]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}

          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-[#E11D48]">
              {error}
            </div>
          )}

          {/* Shoot / Cameraman */}
          {activeStage === "shoot" && (canManageAssignments || isShootAssignee) && (
            <div className="space-y-3 p-4 rounded-lg bg-[#F7F8FC] border border-[#E5E7EB]">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#4F46E5]">
                1. Shoot / Cameraman
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {canManageAssignments && (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-[#202638] mb-1">
                        Shoot Assigned To
                      </label>
                      <select
                        value={shootAssignedToId}
                        onChange={(e) => setShootAssignedToId(e.target.value)}
                        className="flex h-9 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 text-sm text-[#202638]"
                      >
                        <option value="">Unassigned</option>
                        {shootEmployees.map((emp) => (
                          <option key={emp.id} value={emp.id}>
                            {emp.fullName} {emp.designation ? `(${emp.designation})` : ""}
                          </option>
                        ))}
                      </select>
                    </div>
                    <Input
                      type="date"
                      label="Shoot Scheduled Date"
                      value={shootScheduledDate}
                      onChange={(e) => setShootScheduledDate(e.target.value)}
                    />
                  </>
                )}
                <div>
                  <label className="block text-xs font-medium text-[#202638] mb-1">
                    Shoot Status
                  </label>
                  <select
                    value={shootStatus}
                    onChange={(e) => setShootStatus(e.target.value)}
                    className="flex h-9 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 text-sm text-[#202638]"
                  >
                    {TRACKER_STATUSES.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
                {isShootAssignee && (
                  <Input
                    type="date"
                    label="Shoot Actual Date"
                    value={shootActualDate}
                    onChange={(e) => setShootActualDate(e.target.value)}
                  />
                )}
              </div>
              {isShootAssignee ? (
                <Input
                  type="url"
                  label="Raw Photo / Footage Link"
                  placeholder="https://drive.google.com/..."
                  value={rawFootageUrl}
                  onChange={(e) => setRawFootageUrl(e.target.value)}
                />
              ) : (
                <p className="text-[11px] text-[#64748B]">
                  Raw footage link and completion date can only be submitted by the assigned Shoot / Cameraman.
                </p>
              )}
            </div>
          )}

          {/* Video Editor */}
          {activeStage === "edit" && (canManageAssignments || isEditorAssignee) && (
            <div className="space-y-3 p-4 rounded-lg bg-[#F7F8FC] border border-[#E5E7EB]">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#7C3AED]">
                2. Video Editor
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {canManageAssignments && (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-[#202638] mb-1">
                        Video Editor Assigned To
                      </label>
                      <select
                        value={editorAssignedToId}
                        onChange={(e) => setEditorAssignedToId(e.target.value)}
                        className="flex h-9 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 text-sm text-[#202638]"
                      >
                        <option value="">Unassigned</option>
                        {editorEmployees.map((emp) => (
                          <option key={emp.id} value={emp.id}>
                            {emp.fullName} {emp.designation ? `(${emp.designation})` : ""}
                          </option>
                        ))}
                      </select>
                    </div>
                    <Input
                      type="date"
                      label="Edit Scheduled Date"
                      value={editScheduledDate}
                      onChange={(e) => setEditScheduledDate(e.target.value)}
                    />
                  </>
                )}
                <div>
                  <label className="block text-xs font-medium text-[#202638] mb-1">
                    Edit Status
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="flex h-9 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 text-sm text-[#202638]"
                  >
                    {TRACKER_STATUSES.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
                {isEditorAssignee && (
                  <Input
                    type="date"
                    label="Edit Actual Date"
                    value={editActualDate}
                    onChange={(e) => setEditActualDate(e.target.value)}
                  />
                )}
              </div>
              {isEditorAssignee ? (
                <Input
                  type="url"
                  label="Approved Video Link"
                  placeholder="https://drive.google.com/..."
                  value={approvedVideoUrl}
                  onChange={(e) => setApprovedVideoUrl(e.target.value)}
                />
              ) : (
                <p className="text-[11px] text-[#64748B]">
                  Approved video link and completion date can only be submitted by the assigned Video Editor.
                </p>
              )}
            </div>
          )}

          {/* Social Media Publishing */}
          {activeStage === "post" && (canManageAssignments || isPostAssignee) && (
            <div className="space-y-3 p-4 rounded-lg bg-[#F7F8FC] border border-[#E5E7EB]">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#202638]">
                3. Social Media Publishing
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {canManageAssignments && (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-[#202638] mb-1">
                        Publisher Assigned To
                      </label>
                      <select
                        value={postAssignedToId}
                        onChange={(e) => setPostAssignedToId(e.target.value)}
                        className="flex h-9 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 text-sm text-[#202638]"
                      >
                        <option value="">Unassigned</option>
                        {publisherEmployees.map((emp) => (
                          <option key={emp.id} value={emp.id}>
                            {emp.fullName} {emp.designation ? `(${emp.designation})` : ""}
                          </option>
                        ))}
                      </select>
                    </div>
                    <Input
                      type="date"
                      label="Post Scheduled Date"
                      value={postScheduledDate}
                      onChange={(e) => setPostScheduledDate(e.target.value)}
                    />
                  </>
                )}
                <div>
                  <label className="block text-xs font-medium text-[#202638] mb-1">
                    Publishing Status
                  </label>
                  <select
                    value={postStatus}
                    onChange={(e) => setPostStatus(e.target.value)}
                    className="flex h-9 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 text-sm text-[#202638]"
                  >
                    {TRACKER_STATUSES.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
                {isPostAssignee && (
                  <Input
                    type="date"
                    label="Post Actual Date"
                    value={postActualDate}
                    onChange={(e) => setPostActualDate(e.target.value)}
                  />
                )}
              </div>
              {isPostAssignee ? (
                <Input
                  type="url"
                  label="Live Post Link"
                  placeholder="https://instagram.com/p/..."
                  value={livePostUrl}
                  onChange={(e) => setLivePostUrl(e.target.value)}
                />
              ) : (
                <p className="text-[11px] text-[#64748B]">
                  Live post link and post date can only be submitted by the assigned Social Media Publisher.
                </p>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2.5 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isSaving}>
              <Save className="w-3.5 h-3.5 mr-1.5" />
              Save Tracker Updates
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

