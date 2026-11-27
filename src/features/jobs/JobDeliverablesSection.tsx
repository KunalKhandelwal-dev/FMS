"use client";

import { useState } from "react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DeliverableReviewModal } from "./DeliverableReviewModal";
import { DeliverableTrackerEditor } from "./DeliverableTrackerEditor";
import { DELIVERABLE_TYPE_LABELS } from "@/lib/constants";
import { formatDate, formatDateTime } from "@/lib/dates";
import {
  Star,
  ExternalLink,
  FileText,
  SlidersHorizontal,
  CheckCircle2,
  Camera,
  Video,
  Share2,
} from "lucide-react";

export interface JobDeliverableItem {
  id: string;
  title: string;
  deliverableType: string;
  assignedToId: string | null;
  assignedToName: string;
  targetDate: Date | null;
  firstSubmittedAt: Date | null;
  workflowState: string;
  deliveryStatus: string;
  approvalStatus: string;
  shootAssignedToId: string | null;
  shootAssignedToName: string | null;
  shootScheduledDate: Date | null;
  shootActualDate: Date | null;
  shootStatus: string;
  rawFootageUrl: string | null;
  editorAssignedToId: string | null;
  editorAssignedToName: string | null;
  editScheduledDate: Date | null;
  editActualDate: Date | null;
  editStatus: string;
  approvedVideoUrl: string | null;
  postAssignedToId: string | null;
  postAssignedToName: string | null;
  postScheduledDate: Date | null;
  postActualDate: Date | null;
  postStatus: string;
  livePostUrl: string | null;
  latestRating: number | null;
  submissions: Array<{
    id: string;
    version: number;
    submittedByName: string;
    submittedAt: Date;
    submissionUrl: string | null;
    fileName: string | null;
    filePath: string | null;
    notes: string | null;
  }>;
  reviews: Array<{
    id: string;
    status: string;
    reviewerName: string;
    publicFeedback: string | null;
    privateNotes: string | null;
    reviewedAt: Date;
  }>;
}

interface EmployeeOption {
  id: string;
  fullName: string;
  designation: string | null;
}

function getVisibleStageKeys(deliverableType: string): Array<"shoot" | "edit" | "post"> {
  if (deliverableType === "LIVE_STORY") return ["post"];
  if (deliverableType === "PHOTO_POST") return ["shoot", "post"];
  if (deliverableType === "PHOTOGRAPHY_CLASS") return ["shoot"];
  return ["shoot", "edit", "post"];
}

export function JobDeliverablesSection({
  deliverables,
  employees,
  currentUserId,
  canReview,
  canRate,
  canManageTracker,
}: {
  deliverables: JobDeliverableItem[];
  employees: EmployeeOption[];
  currentUserId: string;
  canReview: boolean;
  canRate: boolean;
  canManageTracker: boolean;
}) {
  const [reviewTarget, setReviewTarget] = useState<JobDeliverableItem | null>(null);
  const [trackerTarget, setTrackerTarget] = useState<{
    deliverable: JobDeliverableItem;
    stage: "shoot" | "edit" | "post";
  } | null>(null);

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg border border-[#E5E7EB] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#E5E7EB]">
          <h2 className="text-sm font-semibold text-[#202638]">
            Deliverables &amp; Production Tracker ({deliverables.length})
          </h2>
          <p className="text-xs text-[#64748B]">
            Individual deliverable target dates, submission status, ratings, and production stages
          </p>
        </div>

        <div className="divide-y divide-[#E5E7EB]">
          {deliverables.map((d) => {
            const latestSub = d.submissions[0];
            const isShootAssignee = d.shootAssignedToId === currentUserId;
            const isEditorAssignee = d.editorAssignedToId === currentUserId;
            const isPostAssignee = d.postAssignedToId === currentUserId;
            const visibleKeys = getVisibleStageKeys(d.deliverableType);
            const hasSubmissionOrOutput =
              d.submissions.length > 0 ||
              Boolean(d.rawFootageUrl) ||
              Boolean(d.approvedVideoUrl) ||
              Boolean(d.livePostUrl) ||
              d.workflowState === "SUBMITTED" ||
              d.workflowState === "UNDER_REVIEW" ||
              d.workflowState === "APPROVED" ||
              d.workflowState === "COMPLETED" ||
              d.workflowState === "PUBLISHED";

            const allStages: Array<{
              key: "shoot" | "edit" | "post";
              title: string;
              icon: typeof Camera;
              iconClass: string;
              status: string;
              assignedName: string | null;
              scheduledDate: Date | null;
              actualDate: Date | null;
              linkUrl: string | null;
              linkLabel: string;
              canEditStage: boolean;
            }> = [
              {
                key: "shoot",
                title:
                  d.deliverableType === "PHOTO_POST" || d.deliverableType === "PHOTOGRAPHY_CLASS"
                    ? "1. Photography / Shoot"
                    : "1. Shoot / Cameraman",
                icon: Camera,
                iconClass: "text-[#4F46E5]",
                status: d.shootStatus,
                assignedName: d.shootAssignedToName,
                scheduledDate: d.shootScheduledDate,
                actualDate: d.shootActualDate,
                linkUrl: d.rawFootageUrl,
                linkLabel: "Raw Footage / Photos",
                canEditStage: canManageTracker || isShootAssignee,
              },
              {
                key: "edit",
                title: "2. Video Editor",
                icon: Video,
                iconClass: "text-[#7C3AED]",
                status: d.editStatus,
                assignedName: d.editorAssignedToName,
                scheduledDate: d.editScheduledDate,
                actualDate: d.editActualDate,
                linkUrl: d.approvedVideoUrl,
                linkLabel: "Approved Video",
                canEditStage: canManageTracker || isEditorAssignee,
              },
              {
                key: "post",
                title: visibleKeys.length === 1 ? "1. Social Publishing" : "Social Publishing",
                icon: Share2,
                iconClass: "text-[#202638]",
                status: d.postStatus,
                assignedName: d.postAssignedToName,
                scheduledDate: d.postScheduledDate,
                actualDate: d.postActualDate,
                linkUrl: d.livePostUrl,
                linkLabel: "View Live Post",
                canEditStage: canManageTracker || isPostAssignee,
              },
            ];

            const stages = allStages.filter((s) => visibleKeys.includes(s.key));

            return (
              <div key={d.id} className="p-5 space-y-4">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-[#202638]">
                      {DELIVERABLE_TYPE_LABELS[d.deliverableType] || d.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs">
                      <span className="inline-flex items-center gap-1.5 text-[#64748B]">
                        Workflow: <StatusBadge type="workflow" status={d.workflowState} />
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-[#64748B]">
                        Delivery: <StatusBadge type="delivery" status={d.deliveryStatus} />
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-[#64748B]">
                        Approval: <StatusBadge type="approval" status={d.approvalStatus} />
                      </span>
                    </div>

                    <p className="text-xs text-[#64748B]">
                      Owner / Lead: <span className="font-medium text-[#202638]">{d.assignedToName}</span>{" "}
                      • Target Date:{" "}
                      <span className="font-medium text-[#202638]">{formatDate(d.targetDate)}</span>
                      {d.firstSubmittedAt && (
                        <>
                          {" "}
                          • First Submitted:{" "}
                          <span className="font-medium text-[#202638]">
                            {formatDateTime(d.firstSubmittedAt)}
                          </span>
                        </>
                      )}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {d.latestRating !== null && (
                      <div className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-indigo-50 border border-indigo-200 text-xs font-semibold text-[#4F46E5]">
                        <Star className="w-3.5 h-3.5 fill-[#4F46E5] text-[#4F46E5]" />
                        <span>{d.latestRating}/5</span>
                      </div>
                    )}

                    {canReview && (
                      <Button
                        variant="primary"
                        size="sm"
                        disabled={!hasSubmissionOrOutput}
                        title={
                          hasSubmissionOrOutput
                            ? "Review deliverable"
                            : "Review & Approve is locked until the assigned person submits work"
                        }
                        onClick={() => setReviewTarget(d)}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                        {!hasSubmissionOrOutput
                          ? "Awaiting Submission"
                          : canRate
                          ? d.latestRating !== null
                            ? "Review / Edit Rating"
                            : "Review & Rate"
                          : "Review / Approve"}
                      </Button>
                    )}
                  </div>
                </div>

                {/* Production Stages — One Row Per Stage */}
                <div className="space-y-2.5 text-xs">
                  {stages.map((stage) => {
                    const StageIcon = stage.icon;
                    return (
                      <div
                        key={stage.key}
                        className="p-3.5 rounded-lg bg-[#F7F8FC] border border-[#E5E7EB] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <StageIcon className={`w-3.5 h-3.5 ${stage.iconClass}`} />
                            <span className="font-semibold text-[#202638]">{stage.title}</span>
                            <StatusBadge type="stage" status={stage.status} />
                          </div>
                          <p className="text-[#64748B]">
                            Assigned:{" "}
                            <span className="font-medium text-[#202638]">
                              {stage.assignedName || "Not assigned"}
                            </span>{" "}
                            • Scheduled: {formatDate(stage.scheduledDate)} • Actual:{" "}
                            {formatDate(stage.actualDate)}
                          </p>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          {stage.linkUrl ? (
                            <a
                              href={stage.linkUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[#4F46E5] font-medium hover:underline"
                            >
                              {stage.linkLabel} <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : (
                            <span className="text-slate-400">No link recorded</span>
                          )}

                          {stage.canEditStage && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setTrackerTarget({ deliverable: d, stage: stage.key })}
                            >
                              <SlidersHorizontal className="w-3.5 h-3.5 mr-1.5" />
                              {canManageTracker ? "Assign / Edit" : "Update Stage"}
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Submission History & Reviews */}
                {(d.submissions.length > 0 || d.reviews.length > 0) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    {d.submissions.length > 0 && (
                      <Card className="bg-[#F7F8FC]">
                        <CardHeader className="p-3 pb-1.5">
                          <CardTitle className="text-xs">
                            Submission History ({d.submissions.length})
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-3 pt-0 space-y-2">
                          {d.submissions.map((sub) => (
                            <div
                              key={sub.id}
                              className="p-2.5 rounded bg-white border border-[#E5E7EB] text-xs space-y-1"
                            >
                              <div className="flex justify-between font-medium text-[#202638]">
                                <span>
                                  Version {sub.version} by {sub.submittedByName}
                                </span>
                                <span className="text-[#64748B]">
                                  {formatDateTime(sub.submittedAt)}
                                </span>
                              </div>
                              {sub.notes && <p className="text-[#64748B]">{sub.notes}</p>}
                              <div className="flex flex-wrap gap-3 pt-0.5">
                                {sub.submissionUrl && (
                                  <a
                                    href={sub.submissionUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-[#4F46E5] hover:underline"
                                  >
                                    External Link <ExternalLink className="w-3 h-3" />
                                  </a>
                                )}
                                {sub.filePath && (
                                  <a
                                    href={`/api/files/${sub.id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-[#4F46E5] hover:underline"
                                  >
                                    <FileText className="w-3 h-3" />
                                    {sub.fileName || "Download File"}
                                  </a>
                                )}
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    )}

                    {d.reviews.length > 0 && (
                      <Card className="bg-[#F7F8FC]">
                        <CardHeader className="p-3 pb-1.5">
                          <CardTitle className="text-xs">
                            Review History ({d.reviews.length})
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-3 pt-0 space-y-2">
                          {d.reviews.map((rev) => (
                            <div
                              key={rev.id}
                              className="p-2.5 rounded bg-white border border-[#E5E7EB] text-xs space-y-1"
                            >
                              <div className="flex justify-between items-center">
                                <span className="font-medium text-[#202638]">
                                  {rev.reviewerName}
                                </span>
                                <StatusBadge type="approval" status={rev.status} />
                              </div>
                              {rev.publicFeedback && (
                                <p className="text-[#202638]">{rev.publicFeedback}</p>
                              )}
                              {rev.privateNotes && (
                                <p className="text-[#64748B] italic border-t border-[#E5E7EB] pt-1 mt-1">
                                  Private Note: {rev.privateNotes}
                                </p>
                              )}
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}

                {latestSub === undefined && d.workflowState === "ASSIGNED" && (
                  <p className="text-xs text-[#64748B] italic">
                    No submissions uploaded yet for this deliverable.
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {reviewTarget && (
        <DeliverableReviewModal
          deliverableId={reviewTarget.id}
          deliverableTitle={
            DELIVERABLE_TYPE_LABELS[reviewTarget.deliverableType] || reviewTarget.title
          }
          submissionId={reviewTarget.submissions[0]?.id}
          canRate={canRate}
          existingRating={reviewTarget.latestRating}
          onClose={() => setReviewTarget(null)}
        />
      )}

      {trackerTarget && (
        <DeliverableTrackerEditor
          deliverable={trackerTarget.deliverable}
          initialStage={trackerTarget.stage}
          employees={employees}
          currentUserId={currentUserId}
          canManageAssignments={canManageTracker}
          onClose={() => setTrackerTarget(null)}
        />
      )}
    </div>
  );
}

