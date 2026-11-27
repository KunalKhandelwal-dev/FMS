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

export function JobDeliverablesSection({
  deliverables,
  employees,
  currentUserId,
  canReview,
  canManageTracker,
}: {
  deliverables: JobDeliverableItem[];
  employees: EmployeeOption[];
  currentUserId: string;
  canReview: boolean;
  canManageTracker: boolean;
}) {
  const [reviewTarget, setReviewTarget] = useState<JobDeliverableItem | null>(null);
  const [trackerTarget, setTrackerTarget] = useState<JobDeliverableItem | null>(null);

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
            const isAssignedToStage =
              d.shootAssignedToId === currentUserId ||
              d.editorAssignedToId === currentUserId ||
              d.postAssignedToId === currentUserId;
            const showTrackerButton = canManageTracker || isAssignedToStage;
            return (
              <div key={d.id} className="p-5 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h3 className="text-sm font-semibold text-[#202638]">
                        {DELIVERABLE_TYPE_LABELS[d.deliverableType] || d.title}
                      </h3>
                      <StatusBadge type="workflow" status={d.workflowState} />
                      <StatusBadge type="delivery" status={d.deliveryStatus} />
                      <StatusBadge type="approval" status={d.approvalStatus} />
                    </div>
                    <p className="text-xs text-[#64748B] mt-1">
                      Assignee: <span className="font-medium text-[#202638]">{d.assignedToName}</span>{" "}
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

                    {showTrackerButton && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setTrackerTarget(d)}
                      >
                        <SlidersHorizontal className="w-3.5 h-3.5 mr-1.5" />
                        {canManageTracker ? "Shoot / Edit Tracker" : "Update My Stage"}
                      </Button>
                    )}

                    {canReview && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setReviewTarget(d)}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                        Review &amp; Rate
                      </Button>
                    )}
                  </div>
                </div>

                {/* Shoot / Editor / Publishing Summary Bar */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-[#F7F8FC] border border-[#E5E7EB]">
                    <div className="flex items-center gap-1.5 font-semibold text-[#202638] mb-1">
                      <Camera className="w-3.5 h-3.5 text-[#4F46E5]" />
                      Shoot / Cameraman
                    </div>
                    <p className="text-[#64748B]">
                      Assigned: {d.shootAssignedToName || "Not assigned"}
                    </p>
                    <p className="text-[#64748B]">
                      Scheduled: {formatDate(d.shootScheduledDate)} • Actual:{" "}
                      {formatDate(d.shootActualDate)}
                    </p>
                    {d.rawFootageUrl && (
                      <a
                        href={d.rawFootageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[#4F46E5] hover:underline mt-1"
                      >
                        Raw Footage <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>

                  <div className="p-3 rounded-lg bg-[#F7F8FC] border border-[#E5E7EB]">
                    <div className="flex items-center gap-1.5 font-semibold text-[#202638] mb-1">
                      <Video className="w-3.5 h-3.5 text-[#7C3AED]" />
                      Video Editor
                    </div>
                    <p className="text-[#64748B]">
                      Assigned: {d.editorAssignedToName || "Not assigned"}
                    </p>
                    <p className="text-[#64748B]">
                      Scheduled: {formatDate(d.editScheduledDate)} • Actual:{" "}
                      {formatDate(d.editActualDate)}
                    </p>
                    {d.approvedVideoUrl && (
                      <a
                        href={d.approvedVideoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[#4F46E5] hover:underline mt-1"
                      >
                        Approved Video <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>

                  <div className="p-3 rounded-lg bg-[#F7F8FC] border border-[#E5E7EB]">
                    <div className="flex items-center gap-1.5 font-semibold text-[#202638] mb-1">
                      <Share2 className="w-3.5 h-3.5 text-[#202638]" />
                      Social Publishing
                    </div>
                    <p className="text-[#64748B]">
                      Assigned: {d.postAssignedToName || "Not assigned"}
                    </p>
                    <p className="text-[#64748B]">
                      Scheduled: {formatDate(d.postScheduledDate)} • Actual:{" "}
                      {formatDate(d.postActualDate)}
                    </p>
                    {d.livePostUrl ? (
                      <a
                        href={d.livePostUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[#4F46E5] hover:underline mt-1"
                      >
                        View Live Post <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <p className="text-slate-400 mt-1">No live link recorded</p>
                    )}
                  </div>
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
          onClose={() => setReviewTarget(null)}
        />
      )}

      {trackerTarget && (
        <DeliverableTrackerEditor
          deliverable={trackerTarget}
          employees={employees}
          currentUserId={currentUserId}
          canManageAssignments={canManageTracker}
          onClose={() => setTrackerTarget(null)}
        />
      )}
    </div>
  );
}

