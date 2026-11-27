"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { DELIVERABLE_TYPE_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/dates";
import { StageActionModal, type StageModalMode } from "./StageActionModal";
import type { RoleDeliverableItem } from "./DashboardTypes";
import { ExternalLink, Star, Upload } from "lucide-react";

function SpecialistTaskCard({
  item,
  meta,
  action,
}: {
  item: RoleDeliverableItem;
  meta: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="p-4 rounded-lg bg-[#F7F8FC] border border-[#E5E7EB] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="space-y-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href={`/jobs/${item.jobId}`}
            className="text-sm font-semibold text-[#202638] hover:text-[#4F46E5]"
          >
            {item.jobTitle} — {DELIVERABLE_TYPE_LABELS[item.deliverableType] || item.title}
          </Link>
          <StatusBadge type="workflow" status={item.workflowState} />
          {item.latestRating !== null && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-50 border border-indigo-200 text-xs font-medium text-[#4F46E5]">
              <Star className="w-3 h-3 fill-[#4F46E5]" /> {item.latestRating}/5
            </span>
          )}
        </div>
        <p className="text-xs text-[#64748B]">{meta}</p>
        {item.latestReview?.publicFeedback && (
          <p className="text-xs text-[#202638] bg-white px-2.5 py-1.5 rounded border border-[#E5E7EB] mt-1">
            Feedback ({item.latestReview.reviewerName}): {item.latestReview.publicFeedback}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {action}
        <Link href={`/jobs/${item.jobId}`}>
          <Button variant="outline" size="sm">Details</Button>
        </Link>
      </div>
    </div>
  );
}

export function MandeepProofreaderDashboard({
  firstName,
  deliverables,
}: {
  firstName: string;
  deliverables: RoleDeliverableItem[];
}) {
  const [modal, setModal] = useState<StageModalMode | null>(null);

  const awaiting = deliverables.filter((d) => d.proofreadStatus === "PENDING_REVIEW");
  const corrections = deliverables.filter((d) => d.proofreadStatus === "REVISION_REQUESTED");
  const approved = deliverables.filter((d) => d.proofreadStatus === "APPROVED");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-[#202638]">Proofreading Workspace — {firstName}</h1>
        <p className="text-sm text-[#64748B]">
          Review banners, posters, and content drafts for spelling, copy accuracy, and brand guidelines.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card className="p-4"><p className="text-xs text-[#64748B]">Awaiting Proofreading</p><p className="text-2xl font-semibold text-[#202638] mt-1">{awaiting.length}</p></Card>
        <Card className="p-4"><p className="text-xs text-[#64748B]">Corrections Requested</p><p className="text-2xl font-semibold text-[#202638] mt-1">{corrections.length}</p></Card>
        <Card className="p-4"><p className="text-xs text-[#64748B]">Approved Content</p><p className="text-2xl font-semibold text-[#202638] mt-1">{approved.length}</p></Card>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Content Proofreading Queue</CardTitle></CardHeader>
        <CardContent className="space-y-2.5">
          {deliverables.length === 0 ? (
            <p className="text-xs text-[#64748B]">No content items queued for proofreading.</p>
          ) : (
            deliverables.map((item) => (
              <SpecialistTaskCard
                key={item.id}
                item={item}
                meta={`Owner: ${item.jobOwnerName} • Designer: ${item.assignedToName || "Staff"} • Proofreading: ${item.proofreadStatus} • Target: ${formatDate(item.targetDate)}`}
                action={
                  <div className="flex items-center gap-2">
                    {(item.googleDriveUrl || item.latestSubmission?.submissionUrl) && (
                      <a
                        href={item.googleDriveUrl || item.latestSubmission?.submissionUrl || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-[#4F46E5] hover:underline"
                      >
                        Open File <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() =>
                        setModal({
                          kind: "REVIEW",
                          deliverableId: item.id,
                          deliverableTitle: item.title,
                          stageKey: "PROOFREADING",
                          stageLabel: "Mandeep Proofreading Decision",
                          canRate: false,
                        })
                      }
                    >
                      Review Copy
                    </Button>
                  </div>
                }
              />
            ))
          )}
        </CardContent>
      </Card>

      {modal && <StageActionModal mode={modal} onClose={() => setModal(null)} />}
    </div>
  );
}

export function DesignerDashboard({
  firstName,
  deliverables,
}: {
  firstName: string;
  deliverables: RoleDeliverableItem[];
}) {
  const [modal, setModal] = useState<StageModalMode | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-[#202638]">Design Production — {firstName}</h1>
        <p className="text-sm text-[#64748B]">
          Submit banner/poster drafts, review Mandeep proofreading feedback, and upload final corrections.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-4"><p className="text-xs text-[#64748B]">Assigned Designs</p><p className="text-2xl font-semibold text-[#202638] mt-1">{deliverables.length}</p></Card>
        <Card className="p-4"><p className="text-xs text-[#64748B]">Awaiting Mandeep</p><p className="text-2xl font-semibold text-[#202638] mt-1">{deliverables.filter((d) => d.proofreadStatus === "PENDING_REVIEW").length}</p></Card>
        <Card className="p-4"><p className="text-xs text-[#64748B]">Corrections Required</p><p className="text-2xl font-semibold text-[#202638] mt-1">{deliverables.filter((d) => d.workflowState === "REVISION_REQUESTED" || d.proofreadStatus === "REVISION_REQUESTED").length}</p></Card>
        <Card className="p-4"><p className="text-xs text-[#64748B]">Approved</p><p className="text-2xl font-semibold text-[#202638] mt-1">{deliverables.filter((d) => d.workflowState === "APPROVED").length}</p></Card>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">My Design Assignments</CardTitle></CardHeader>
        <CardContent className="space-y-2.5">
          {deliverables.map((item) => (
            <SpecialistTaskCard
              key={item.id}
              item={item}
              meta={`Target: ${formatDate(item.targetDate)} • Proofreading: ${item.proofreadStatus} • Approval: ${item.approvalStatus}`}
              action={
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() =>
                    setModal({
                      kind: "SUBMIT",
                      deliverableId: item.id,
                      deliverableTitle: item.title,
                      stageKey: "DESIGN_DRAFT",
                      stageLabel: "Submit Design Draft / Revision",
                      requireUrl: true,
                    })
                  }
                >
                  <Upload className="w-3.5 h-3.5 mr-1" /> Submit Design
                </Button>
              }
            />
          ))}
        </CardContent>
      </Card>

      {modal && <StageActionModal mode={modal} onClose={() => setModal(null)} />}
    </div>
  );
}

export function FitterDashboard({
  firstName,
  deliverables,
}: {
  firstName: string;
  deliverables: RoleDeliverableItem[];
}) {
  const [modal, setModal] = useState<StageModalMode | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-[#202638]">Venue Installations — {firstName}</h1>
        <p className="text-sm text-[#64748B]">
          View event venues, installation deadlines, and record installation completion with optional proof.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card className="p-4"><p className="text-xs text-[#64748B]">Assigned Installations</p><p className="text-2xl font-semibold text-[#202638] mt-1">{deliverables.length}</p></Card>
        <Card className="p-4"><p className="text-xs text-[#64748B]">Pending</p><p className="text-2xl font-semibold text-[#202638] mt-1">{deliverables.filter((d) => d.installStatus === "NOT_INITIATED" || d.installStatus === "IN_PROGRESS").length}</p></Card>
        <Card className="p-4"><p className="text-xs text-[#64748B]">Completed</p><p className="text-2xl font-semibold text-[#202638] mt-1">{deliverables.filter((d) => d.installStatus === "COMPLETED_ON_TIME" || d.installStatus === "LATE_COMPLETED").length}</p></Card>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Installation Tasks</CardTitle></CardHeader>
        <CardContent className="space-y-2.5">
          {deliverables.map((item) => (
            <SpecialistTaskCard
              key={item.id}
              item={item}
              meta={`Venue: ${item.jobVenue || "Check Job Details"} • Scheduled: ${formatDate(item.installScheduledDate || item.targetDate)} • Status: ${item.installStatus}`}
              action={
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() =>
                    setModal({
                      kind: "SUBMIT",
                      deliverableId: item.id,
                      deliverableTitle: item.title,
                      stageKey: "INSTALLATION",
                      stageLabel: "Mark Installation Completed",
                      requireUrl: false,
                    })
                  }
                >
                  Complete Installation
                </Button>
              }
            />
          ))}
        </CardContent>
      </Card>

      {modal && <StageActionModal mode={modal} onClose={() => setModal(null)} />}
    </div>
  );
}

export function PhotographerDashboard({
  firstName,
  deliverables,
}: {
  firstName: string;
  deliverables: RoleDeliverableItem[];
}) {
  const [modal, setModal] = useState<StageModalMode | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-[#202638]">Photography Shoots — {firstName}</h1>
        <p className="text-sm text-[#64748B]">
          Assignments from Yashpreet and Ruhi. Submit your Google Drive URL and completion date directly (no mandatory approval).
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card className="p-4"><p className="text-xs text-[#64748B]">Assigned Shoots</p><p className="text-2xl font-semibold text-[#202638] mt-1">{deliverables.length}</p></Card>
        <Card className="p-4"><p className="text-xs text-[#64748B]">Upcoming</p><p className="text-2xl font-semibold text-[#202638] mt-1">{deliverables.filter((d) => !d.rawFootageUrl).length}</p></Card>
        <Card className="p-4"><p className="text-xs text-[#64748B]">Submitted</p><p className="text-2xl font-semibold text-[#202638] mt-1">{deliverables.filter((d) => Boolean(d.rawFootageUrl)).length}</p></Card>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Assigned Photography Tasks</CardTitle></CardHeader>
        <CardContent className="space-y-2.5">
          {deliverables.map((item) => (
            <SpecialistTaskCard
              key={item.id}
              item={item}
              meta={`Assigned by: ${item.stageAssignedByMap["PHOTOGRAPHY"] || item.jobOwnerName} • Shoot Date: ${formatDate(item.shootScheduledDate || item.targetDate)} • Link: ${item.rawFootageUrl ? "Submitted" : "Pending"}`}
              action={
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() =>
                    setModal({
                      kind: "SUBMIT",
                      deliverableId: item.id,
                      deliverableTitle: item.title,
                      stageKey: "PHOTOGRAPHY",
                      stageLabel: "Submit Photography Drive Link",
                      requireUrl: true,
                    })
                  }
                >
                  <Upload className="w-3.5 h-3.5 mr-1" /> Submit Photos
                </Button>
              }
            />
          ))}
        </CardContent>
      </Card>

      {modal && <StageActionModal mode={modal} onClose={() => setModal(null)} />}
    </div>
  );
}

export function CinematographerDashboard({
  firstName,
  deliverables,
}: {
  firstName: string;
  deliverables: RoleDeliverableItem[];
}) {
  const [modal, setModal] = useState<StageModalMode | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-[#202638]">Cinematography — {firstName}</h1>
        <p className="text-sm text-[#64748B]">
          Upload raw footage Google Drive URLs and enter actual shoot dates. No mandatory approval required.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card className="p-4"><p className="text-xs text-[#64748B]">Assigned Shoots</p><p className="text-2xl font-semibold text-[#202638] mt-1">{deliverables.length}</p></Card>
        <Card className="p-4"><p className="text-xs text-[#64748B]">Footage Pending</p><p className="text-2xl font-semibold text-[#202638] mt-1">{deliverables.filter((d) => !d.rawFootageUrl).length}</p></Card>
        <Card className="p-4"><p className="text-xs text-[#64748B]">Raw Footage Submitted</p><p className="text-2xl font-semibold text-[#202638] mt-1">{deliverables.filter((d) => Boolean(d.rawFootageUrl)).length}</p></Card>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Assigned Shoot Tasks</CardTitle></CardHeader>
        <CardContent className="space-y-2.5">
          {deliverables.map((item) => (
            <SpecialistTaskCard
              key={item.id}
              item={item}
              meta={`Shoot Date: ${formatDate(item.shootScheduledDate || item.targetDate)} • Editor: ${item.editorAssignedToName || "Not assigned yet"} • Footage: ${item.rawFootageUrl ? "Uploaded" : "Pending"}`}
              action={
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() =>
                    setModal({
                      kind: "SUBMIT",
                      deliverableId: item.id,
                      deliverableTitle: item.title,
                      stageKey: "CINEMATOGRAPHY",
                      stageLabel: "Submit Raw Footage Drive Link",
                      requireUrl: true,
                    })
                  }
                >
                  <Upload className="w-3.5 h-3.5 mr-1" /> Upload Raw Footage
                </Button>
              }
            />
          ))}
        </CardContent>
      </Card>

      {modal && <StageActionModal mode={modal} onClose={() => setModal(null)} />}
    </div>
  );
}

export function VideoEditorDashboard({
  firstName,
  deliverables,
}: {
  firstName: string;
  deliverables: RoleDeliverableItem[];
}) {
  const [modal, setModal] = useState<StageModalMode | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-[#202638]">Video Editing — {firstName}</h1>
        <p className="text-sm text-[#64748B]">
          Access source footage, submit edited videos to your Team Lead/Head, and track Deepak&apos;s final approval.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-4"><p className="text-xs text-[#64748B]">Editing Tasks</p><p className="text-2xl font-semibold text-[#202638] mt-1">{deliverables.length}</p></Card>
        <Card className="p-4"><p className="text-xs text-[#64748B]">Source Footage Ready</p><p className="text-2xl font-semibold text-[#202638] mt-1">{deliverables.filter((d) => Boolean(d.rawFootageUrl)).length}</p></Card>
        <Card className="p-4"><p className="text-xs text-[#64748B]">Revisions Requested</p><p className="text-2xl font-semibold text-[#202638] mt-1">{deliverables.filter((d) => d.workflowState === "REVISION_REQUESTED").length}</p></Card>
        <Card className="p-4"><p className="text-xs text-[#64748B]">Approved Videos</p><p className="text-2xl font-semibold text-[#202638] mt-1">{deliverables.filter((d) => d.workflowState === "APPROVED").length}</p></Card>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Assigned Video Edits</CardTitle></CardHeader>
        <CardContent className="space-y-2.5">
          {deliverables.map((item) => (
            <SpecialistTaskCard
              key={item.id}
              item={item}
              meta={`Target: ${formatDate(item.editScheduledDate || item.targetDate)} • Approval Route: ${item.workflowType === "YASHPREET_VIDEO" ? "Yashpreet → Deepak" : "Ruhi → Deepak"}`}
              action={
                <div className="flex items-center gap-2">
                  {item.rawFootageUrl && (
                    <a
                      href={item.rawFootageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-[#4F46E5] hover:underline"
                    >
                      Source Footage <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() =>
                      setModal({
                        kind: "SUBMIT",
                        deliverableId: item.id,
                        deliverableTitle: item.title,
                        stageKey: "VIDEO_EDITING",
                        stageLabel: "Submit Edited Video Link",
                        requireUrl: true,
                      })
                    }
                  >
                    <Upload className="w-3.5 h-3.5 mr-1" /> Submit Edit
                  </Button>
                </div>
              }
            />
          ))}
        </CardContent>
      </Card>

      {modal && <StageActionModal mode={modal} onClose={() => setModal(null)} />}
    </div>
  );
}

export function SocialMediaDashboard({
  firstName,
  deliverables,
}: {
  firstName: string;
  deliverables: RoleDeliverableItem[];
}) {
  const [modal, setModal] = useState<StageModalMode | null>(null);

  const readyToPublish = deliverables.filter(
    (d) => d.approvalStatus === "APPROVED" && d.workflowState !== "PUBLISHED"
  );
  const published = deliverables.filter((d) => d.workflowState === "PUBLISHED" || Boolean(d.livePostUrl));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-[#202638]">Social Media Publishing — {firstName}</h1>
        <p className="text-sm text-[#64748B]">
          Publish manager-approved content and record platform, actual post date, and live post URL.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card className="p-4"><p className="text-xs text-[#64748B]">Approved &amp; Ready</p><p className="text-2xl font-semibold text-[#202638] mt-1">{readyToPublish.length}</p></Card>
        <Card className="p-4"><p className="text-xs text-[#64748B]">Published</p><p className="text-2xl font-semibold text-[#202638] mt-1">{published.length}</p></Card>
        <Card className="p-4"><p className="text-xs text-[#64748B]">Total Queue</p><p className="text-2xl font-semibold text-[#202638] mt-1">{deliverables.length}</p></Card>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Approved Content &amp; Publishing History</CardTitle></CardHeader>
        <CardContent className="space-y-2.5">
          {deliverables.length === 0 ? (
            <p className="text-xs text-[#64748B]">No approved content is ready for publishing yet.</p>
          ) : (
            deliverables.map((item) => (
              <SpecialistTaskCard
                key={item.id}
                item={item}
                meta={`Target: ${formatDate(item.postScheduledDate || item.targetDate)} • Platform: ${item.socialPlatform || "Not set"} • Post Date: ${formatDate(item.postActualDate)}`}
                action={
                  <div className="flex items-center gap-2">
                    {(item.approvedVideoUrl || item.googleDriveUrl) && (
                      <a
                        href={item.approvedVideoUrl || item.googleDriveUrl || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-[#4F46E5] hover:underline"
                      >
                        Approved Asset <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    {item.approvalStatus === "APPROVED" && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() =>
                          setModal({
                            kind: "SUBMIT",
                            deliverableId: item.id,
                            deliverableTitle: item.title,
                            stageKey: "PUBLISHING",
                            stageLabel: "Record Live Social Post",
                            requireUrl: true,
                            showPlatform: true,
                          })
                        }
                      >
                        <Upload className="w-3.5 h-3.5 mr-1" /> Submit Live Post
                      </Button>
                    )}
                  </div>
                }
              />
            ))
          )}
        </CardContent>
      </Card>

      {modal && <StageActionModal mode={modal} onClose={() => setModal(null)} />}
    </div>
  );
}
