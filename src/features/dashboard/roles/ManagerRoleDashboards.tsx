"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { DELIVERABLE_TYPE_LABELS } from "@/lib/constants";
import { formatDate, formatDateTime } from "@/lib/dates";
import { StageActionModal, type StageModalMode } from "./StageActionModal";
import type { RoleDeliverableItem, StaffOption } from "./DashboardTypes";
import { ArrowRight, CheckCircle2, Plus } from "lucide-react";

function hasSubmissionOrOutput(item: RoleDeliverableItem): boolean {
  return (
    Boolean(item.latestSubmission) ||
    Boolean(item.rawFootageUrl) ||
    Boolean(item.approvedVideoUrl) ||
    Boolean(item.googleDriveUrl) ||
    Boolean(item.livePostUrl) ||
    item.workflowState === "SUBMITTED" ||
    item.workflowState === "UNDER_REVIEW" ||
    item.workflowState === "APPROVED"
  );
}

function getContentStageSummary(item: RoleDeliverableItem): string {
  if (item.deliverableType === "LIVE_STORY") {
    return `Publisher: ${item.postAssignedToName || "Unassigned"} • Target: ${formatDate(item.targetDate)}`;
  }
  if (item.deliverableType === "PHOTO_POST") {
    return `Photographer: ${item.shootAssignedToName || "Unassigned"} • Publisher: ${item.postAssignedToName || "Unassigned"} • Photos: ${item.rawFootageUrl ? "Uploaded" : "Pending"}`;
  }
  if (item.deliverableType === "PHOTOGRAPHY_CLASS") {
    return `Photographer: ${item.shootAssignedToName || "Unassigned"} • Photos: ${item.rawFootageUrl ? "Uploaded" : "Pending"}`;
  }
  return `Shoot: ${item.shootAssignedToName || "Unassigned"} • Editor: ${item.editorAssignedToName || "Unassigned"} • Raw Footage: ${item.rawFootageUrl ? "Uploaded" : "Pending"}`;
}

function DeliverableRow({
  item,
  subtitle,
  action,
}: {
  item: RoleDeliverableItem;
  subtitle: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="p-3.5 rounded-lg bg-[#F7F8FC] border border-[#E5E7EB] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="space-y-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href={`/jobs/${item.jobId}`}
            className="text-xs font-semibold text-[#202638] hover:text-[#4F46E5] truncate"
          >
            {item.jobTitle} — {DELIVERABLE_TYPE_LABELS[item.deliverableType] || item.title}
          </Link>
          <StatusBadge type="workflow" status={item.workflowState} />
        </div>
        <p className="text-xs text-[#64748B]">{subtitle}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {action}
        <Link href={`/jobs/${item.jobId}`}>
          <Button variant="outline" size="sm">
            Open <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

export function DeepakDashboardView({
  firstName,
  deliverables,
  recentLogs,
  staff,
}: {
  firstName: string;
  deliverables: RoleDeliverableItem[];
  recentLogs: Array<{
    id: string;
    action: string;
    entityType: string;
    actorName: string;
    jobTitle: string | null;
    createdAt: string;
  }>;
  staff: Array<StaffOption & { role: string; teamNames: string[] }>;
}) {
  const [modal, setModal] = useState<StageModalMode | null>(null);

  const completed = deliverables.filter(
    (d) => d.workflowState === "APPROVED" || d.workflowState === "COMPLETED" || d.workflowState === "PUBLISHED"
  ).length;
  const late = deliverables.filter((d) => d.deliveryStatus === "LATE_COMPLETED").length;
  const overdue = deliverables.filter((d) => d.deliveryStatus === "NOT_DONE_TILL_DATE").length;
  // Exclude photography/cinematography raw shoots and items without submissions from Deepak's final approval queue
  const finalApprovalQueue = deliverables.filter(
    (d) =>
      d.workflowType !== "PHOTOGRAPHY" &&
      d.workflowType !== "CINEMATOGRAPHY" &&
      hasSubmissionOrOutput(d) &&
      (d.workflowState === "UNDER_REVIEW" || d.workflowState === "SUBMITTED")
  );
  const proofreadingQueue = deliverables.filter((d) => d.proofreadStatus === "PENDING_REVIEW");

  const offlineTeam = deliverables.filter(
    (d) => d.teamCode === "TEAM-BRANDING" || d.workflowType === "OFFLINE_DESIGN" || d.workflowType === "INSTALLATION"
  );
  const onlineTeam = deliverables.filter(
    (d) => d.teamCode === "TEAM-ONLINE" || d.workflowType === "YASHPREET_VIDEO" || d.workflowType === "SOCIAL_PUBLISHING"
  );
  const contentTeam = deliverables.filter(
    (d) => d.teamCode === "TEAM-CONTENT" || d.workflowType === "RUHI_VIDEO"
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-[#202638]">Good morning, {firstName}</h1>
          <p className="text-sm text-[#64748B]">
            Department-wide operations across Offline Branding, Online Production, and Content Strategy.
          </p>
        </div>
        <Link href="/jobs/new">
          <Button variant="primary" size="md">
            <Plus className="w-4 h-4 mr-1.5" /> Create New Job
          </Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {[
          { label: "Total Deliverables", value: deliverables.length },
          { label: "Completed", value: completed },
          { label: "Late", value: late },
          { label: "Overdue", value: overdue },
          { label: "Awaiting Final Approval", value: finalApprovalQueue.length },
          { label: "Proofreading Queue", value: proofreadingQueue.length },
        ].map((stat) => (
          <Card key={stat.label} className="p-4">
            <p className="text-xs text-[#64748B]">{stat.label}</p>
            <p className="text-2xl font-semibold text-[#202638] mt-1">{stat.value}</p>
          </Card>
        ))}
      </div>

      {/* 3 Team Overviews */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Offline Branding (Navneet)</CardTitle>
          </CardHeader>
          <CardContent className="text-xs space-y-1.5 text-[#64748B]">
            <p>Total Assets: <span className="font-semibold text-[#202638]">{offlineTeam.length}</span></p>
            <p>Awaiting Proofreading: <span className="font-semibold text-[#202638]">{offlineTeam.filter((d) => d.proofreadStatus === "PENDING_REVIEW").length}</span></p>
            <p>Installations Tracked: <span className="font-semibold text-[#202638]">{offlineTeam.filter((d) => d.fitterAssignedToId).length}</span></p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Online Production (Yashpreet)</CardTitle>
          </CardHeader>
          <CardContent className="text-xs space-y-1.5 text-[#64748B]">
            <p>Total Assets: <span className="font-semibold text-[#202638]">{onlineTeam.length}</span></p>
            <p>Aashish Editing: <span className="font-semibold text-[#202638]">{onlineTeam.filter((d) => d.editorAssignedToId).length}</span></p>
            <p>Kajal Publishing Queue: <span className="font-semibold text-[#202638]">{onlineTeam.filter((d) => d.approvalStatus === "APPROVED" && d.workflowState !== "PUBLISHED").length}</span></p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Content Strategy (Ruhi)</CardTitle>
          </CardHeader>
          <CardContent className="text-xs space-y-1.5 text-[#64748B]">
            <p>Total Assets: <span className="font-semibold text-[#202638]">{contentTeam.length}</span></p>
            <p>Sarvjeet Shoots: <span className="font-semibold text-[#202638]">{contentTeam.filter((d) => d.shootAssignedToId).length}</span></p>
            <p>Vishal Tyagi Edits: <span className="font-semibold text-[#202638]">{contentTeam.filter((d) => d.editorAssignedToId).length}</span></p>
          </CardContent>
        </Card>
      </div>

      {/* Final Approval Queue */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Final Approval &amp; Rating Queue ({finalApprovalQueue.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2.5">
          {finalApprovalQueue.length === 0 ? (
            <p className="text-xs text-[#64748B]">No deliverables are currently awaiting final approval.</p>
          ) : (
            finalApprovalQueue.slice(0, 8).map((item) => (
              <DeliverableRow
                key={item.id}
                item={item}
                subtitle={`Owner: ${item.jobOwnerName} • Latest Review: ${item.latestReview ? `${item.latestReview.reviewerName} (${item.latestReview.status})` : "Pending"}`}
                action={
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() =>
                      setModal({
                        kind: "REVIEW",
                        deliverableId: item.id,
                        deliverableTitle: item.title,
                        stageKey: "FINAL_APPROVAL",
                        stageLabel: "Deepak Final Approval & Rating",
                        canRate: true,
                        existingRating: item.latestRating,
                      })
                    }
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Approve &amp; Rate
                  </Button>
                }
              />
            ))
          )}
        </CardContent>
      </Card>

      {/* Recent Activities & Employee Workload */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Recent Department Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentLogs.map((log) => (
              <div key={log.id} className="text-xs py-1.5 border-b border-[#E5E7EB] last:border-0 flex justify-between gap-2">
                <span className="text-[#202638]">
                  <span className="font-medium">{log.actorName}</span> • {log.action} ({log.entityType})
                  {log.jobTitle ? ` — ${log.jobTitle}` : ""}
                </span>
                <span className="text-[#64748B] shrink-0">{formatDateTime(log.createdAt)}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Active Staff Workload</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {staff.map((emp) => {
              const count = deliverables.filter(
                (d) =>
                  d.assignedToId === emp.id ||
                  d.shootAssignedToId === emp.id ||
                  d.editorAssignedToId === emp.id ||
                  d.postAssignedToId === emp.id ||
                  d.fitterAssignedToId === emp.id
              ).length;
              return (
                <div key={emp.id} className="text-xs py-1.5 border-b border-[#E5E7EB] last:border-0 flex justify-between">
                  <div>
                    <span className="font-medium text-[#202638]">{emp.fullName}</span>
                    <span className="text-[#64748B] ml-2">{emp.designation}</span>
                  </div>
                  <span className="font-semibold text-[#4F46E5]">{count} active</span>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {modal && <StageActionModal mode={modal} onClose={() => setModal(null)} />}
    </div>
  );
}

export function NavneetDashboardView({
  firstName,
  deliverables,
}: {
  firstName: string;
  deliverables: RoleDeliverableItem[];
  teamMembers?: StaffOption[];
}) {
  const [modal, setModal] = useState<StageModalMode | null>(null);

  const awaitingDesignAssign = deliverables.filter((d) => !d.assignedToId);
  const awaitingProofreading = deliverables.filter((d) => d.proofreadStatus === "PENDING_REVIEW");
  const awaitingNavneetReview = deliverables.filter(
    (d) => d.proofreadStatus === "APPROVED" && d.workflowState === "UNDER_REVIEW" && d.approvalStatus !== "APPROVED"
  );
  const installations = deliverables.filter((d) => d.fitterAssignedToId || d.workflowType === "INSTALLATION");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-[#202638]">Offline Branding — {firstName}</h1>
        <p className="text-sm text-[#64748B]">
          Manage Vishal Tavni &amp; Rajesh designs, track Mandeep proofreading stage status, and monitor Ankit &amp; Anup installations.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-4"><p className="text-xs text-[#64748B]">Assigned Jobs</p><p className="text-2xl font-semibold text-[#202638] mt-1">{deliverables.length}</p></Card>
        <Card className="p-4"><p className="text-xs text-[#64748B]">Awaiting Designer</p><p className="text-2xl font-semibold text-[#202638] mt-1">{awaitingDesignAssign.length}</p></Card>
        <Card className="p-4"><p className="text-xs text-[#64748B]">At Mandeep Proofreading</p><p className="text-2xl font-semibold text-[#202638] mt-1">{awaitingProofreading.length}</p></Card>
        <Card className="p-4"><p className="text-xs text-[#64748B]">Awaiting Navneet Review</p><p className="text-2xl font-semibold text-[#202638] mt-1">{awaitingNavneetReview.length}</p></Card>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Design &amp; Review Queue</CardTitle></CardHeader>
        <CardContent className="space-y-2.5">
          {deliverables.map((item) => (
            <DeliverableRow
              key={item.id}
              item={item}
              subtitle={`Designer: ${item.assignedToName || "Unassigned"} • Proofreading: ${item.proofreadStatus} • Target: ${formatDate(item.targetDate)}`}
              action={
                item.proofreadStatus === "APPROVED" && hasSubmissionOrOutput(item) ? (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() =>
                      setModal({
                        kind: "REVIEW",
                        deliverableId: item.id,
                        deliverableTitle: item.title,
                        stageKey: "HEAD_REVIEW",
                        stageLabel: "Navneet Design Review",
                        canRate: false,
                      })
                    }
                  >
                    Review Design
                  </Button>
                ) : undefined
              }
            />
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Installation Tracking (Ankit &amp; Anup)</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {installations.length === 0 ? (
            <p className="text-xs text-[#64748B]">No installation tasks assigned yet.</p>
          ) : (
            installations.map((item) => (
              <DeliverableRow
                key={item.id}
                item={item}
                subtitle={`Fitter: ${item.fitterAssignedToName || "Unassigned"} • Venue: ${item.jobVenue || "TBA"} • Status: ${item.installStatus}`}
              />
            ))
          )}
        </CardContent>
      </Card>

      {modal && <StageActionModal mode={modal} onClose={() => setModal(null)} />}
    </div>
  );
}

export function YashpreetDashboardView({
  firstName,
  userId,
  deliverables,
}: {
  firstName: string;
  userId: string;
  deliverables: RoleDeliverableItem[];
  teamMembers?: StaffOption[];
}) {
  const [modal, setModal] = useState<StageModalMode | null>(null);

  const hardikTasksByYashpreet = deliverables.filter(
    (d) => d.stageAssignedByMap["PHOTOGRAPHY_ID"] === userId
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-[#202638]">Online Production — {firstName}</h1>
        <p className="text-sm text-[#64748B]">
          Track Aashish video edits, Kajal social publishing, and Hardik photography assignments. Open a job to assign team members.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-4"><p className="text-xs text-[#64748B]">Online Deliverables</p><p className="text-2xl font-semibold text-[#202638] mt-1">{deliverables.length}</p></Card>
        <Card className="p-4"><p className="text-xs text-[#64748B]">Aashish Editing</p><p className="text-2xl font-semibold text-[#202638] mt-1">{deliverables.filter((d) => d.editorAssignedToId).length}</p></Card>
        <Card className="p-4"><p className="text-xs text-[#64748B]">Kajal Publishing Queue</p><p className="text-2xl font-semibold text-[#202638] mt-1">{deliverables.filter((d) => d.approvalStatus === "APPROVED" && d.workflowState !== "PUBLISHED").length}</p></Card>
        <Card className="p-4"><p className="text-xs text-[#64748B]">Hardik Shoots (by You)</p><p className="text-2xl font-semibold text-[#202638] mt-1">{hardikTasksByYashpreet.length}</p></Card>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Online Production Pipeline</CardTitle></CardHeader>
        <CardContent className="space-y-2.5">
          {deliverables.map((item) => {
            const isVideo =
              item.deliverableType !== "PHOTO_POST" &&
              item.deliverableType !== "LIVE_STORY" &&
              item.deliverableType !== "PHOTOGRAPHY_CLASS";
            const canReviewVideo = isVideo && Boolean(item.editorAssignedToId) && hasSubmissionOrOutput(item);

            return (
              <DeliverableRow
                key={item.id}
                item={item}
                subtitle={getContentStageSummary(item)}
                action={
                  canReviewVideo ? (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() =>
                        setModal({
                          kind: "REVIEW",
                          deliverableId: item.id,
                          deliverableTitle: item.title,
                          stageKey: "HEAD_REVIEW",
                          stageLabel: "Yashpreet Video Review",
                          canRate: false,
                        })
                      }
                    >
                      Review Video
                    </Button>
                  ) : undefined
                }
              />
            );
          })}
        </CardContent>
      </Card>

      {modal && <StageActionModal mode={modal} onClose={() => setModal(null)} />}
    </div>
  );
}

export function RuhiDashboardView({
  firstName,
  userId,
  deliverables,
}: {
  firstName: string;
  userId: string;
  deliverables: RoleDeliverableItem[];
  teamMembers?: StaffOption[];
}) {
  const [modal, setModal] = useState<StageModalMode | null>(null);

  const hardikByRuhi = deliverables.filter((d) => d.stageAssignedByMap["PHOTOGRAPHY_ID"] === userId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-[#202638]">Content Strategy &amp; Video — {firstName}</h1>
        <p className="text-sm text-[#64748B]">
          Track Sarvjeet cinematography, Vishal Tyagi video editing, and Hardik photography tasks. Open a job to assign team members.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-4"><p className="text-xs text-[#64748B]">Video Projects</p><p className="text-2xl font-semibold text-[#202638] mt-1">{deliverables.length}</p></Card>
        <Card className="p-4"><p className="text-xs text-[#64748B]">Sarvjeet Shoots</p><p className="text-2xl font-semibold text-[#202638] mt-1">{deliverables.filter((d) => d.shootAssignedToId).length}</p></Card>
        <Card className="p-4"><p className="text-xs text-[#64748B]">Vishal Tyagi Edits</p><p className="text-2xl font-semibold text-[#202638] mt-1">{deliverables.filter((d) => d.editorAssignedToId).length}</p></Card>
        <Card className="p-4"><p className="text-xs text-[#64748B]">Hardik Tasks (by You)</p><p className="text-2xl font-semibold text-[#202638] mt-1">{hardikByRuhi.length}</p></Card>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Video &amp; Content Workflow</CardTitle></CardHeader>
        <CardContent className="space-y-2.5">
          {deliverables.map((item) => {
            const isVideo =
              item.deliverableType !== "PHOTO_POST" &&
              item.deliverableType !== "LIVE_STORY" &&
              item.deliverableType !== "PHOTOGRAPHY_CLASS";
            const canReviewEdit = isVideo && Boolean(item.editorAssignedToId) && hasSubmissionOrOutput(item);

            return (
              <DeliverableRow
                key={item.id}
                item={item}
                subtitle={getContentStageSummary(item)}
                action={
                  canReviewEdit ? (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() =>
                        setModal({
                          kind: "REVIEW",
                          deliverableId: item.id,
                          deliverableTitle: item.title,
                          stageKey: "LEAD_REVIEW",
                          stageLabel: "Ruhi Video Review",
                          canRate: false,
                        })
                      }
                    >
                      Review Edit
                    </Button>
                  ) : undefined
                }
              />
            );
          })}
        </CardContent>
      </Card>

      {modal && <StageActionModal mode={modal} onClose={() => setModal(null)} />}
    </div>
  );
}
