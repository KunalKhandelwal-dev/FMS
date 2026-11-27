"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { submitDeliverableWorkAction } from "@/features/deliverables/actions";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DELIVERABLE_TYPE_LABELS } from "@/lib/constants";
import { formatDate, formatDateTime } from "@/lib/dates";
import {
  Upload,
  ExternalLink,
  FileText,
  Star,
  X,
  AlertCircle,
  CheckCircle2,
  Clock,
  RotateCcw,
} from "lucide-react";

export interface MyWorkItem {
  id: string;
  jobId: string;
  jobTitle: string;
  jobCategory: string | null;
  jobDescription: string | null;
  assignedDate: Date;
  deliverableType: string;
  title: string;
  targetDate: Date | null;
  workflowState: string;
  deliveryStatus: string;
  approvalStatus: string;
  latestRating: number | null;
  submissions: Array<{
    id: string;
    version: number;
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
    reviewedAt: Date;
  }>;
}

export function MyWorkClient({ items }: { items: MyWorkItem[] }) {
  const router = useRouter();
  const [selectedItem, setSelectedItem] = useState<MyWorkItem | null>(null);
  const [submissionUrl, setSubmissionUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pendingCount = items.filter(
    (i) => i.workflowState === "ASSIGNED" || i.workflowState === "IN_PROGRESS"
  ).length;
  const revisionCount = items.filter((i) => i.workflowState === "REVISION_REQUESTED").length;
  const approvedCount = items.filter((i) => i.workflowState === "APPROVED").length;

  async function handleSubmitWork(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedItem || isSubmitting) return;
    setError(null);
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("deliverableId", selectedItem.id);
      if (submissionUrl.trim()) formData.append("submissionUrl", submissionUrl.trim());
      if (notes.trim()) formData.append("notes", notes.trim());
      if (file) formData.append("file", file);

      const res = await submitDeliverableWorkAction(formData);
      if (!res.success) {
        setError(res.error);
        setIsSubmitting(false);
        return;
      }

      setSelectedItem(null);
      setSubmissionUrl("");
      setNotes("");
      setFile(null);
      setIsSubmitting(false);
      router.refresh();
    } catch {
      setError("Failed to submit work. Please try again.");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-4">
          <CardContent className="p-0 flex items-center justify-between">
            <div>
              <p className="text-xs text-[#64748B]">Total Assigned</p>
              <p className="text-2xl font-semibold text-[#202638] mt-1">{items.length}</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-[#4F46E5]">
              <Clock className="w-4 h-4" />
            </div>
          </CardContent>
        </Card>
        <Card className="p-4">
          <CardContent className="p-0 flex items-center justify-between">
            <div>
              <p className="text-xs text-[#64748B]">Pending Submission</p>
              <p className="text-2xl font-semibold text-[#202638] mt-1">{pendingCount}</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center text-[#7C3AED]">
              <Upload className="w-4 h-4" />
            </div>
          </CardContent>
        </Card>
        <Card className="p-4">
          <CardContent className="p-0 flex items-center justify-between">
            <div>
              <p className="text-xs text-[#64748B]">Revision Requested</p>
              <p className="text-2xl font-semibold text-[#202638] mt-1">{revisionCount}</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center text-[#E11D48]">
              <RotateCcw className="w-4 h-4" />
            </div>
          </CardContent>
        </Card>
        <Card className="p-4">
          <CardContent className="p-0 flex items-center justify-between">
            <div>
              <p className="text-xs text-[#64748B]">Approved</p>
              <p className="text-2xl font-semibold text-[#202638] mt-1">{approvedCount}</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-700">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assigned Deliverables List */}
      <div className="bg-white rounded-lg border border-[#E5E7EB] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#E5E7EB]">
          <h2 className="text-sm font-semibold text-[#202638]">Assigned Deliverables</h2>
          <p className="text-xs text-[#64748B]">
            Open any deliverable to upload files, attach Google Drive links, or submit revisions
          </p>
        </div>

        {items.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#64748B]">
            You have no deliverables assigned right now.
          </div>
        ) : (
          <div className="divide-y divide-[#E5E7EB]">
            {items.map((item) => (
              <div key={item.id} className="p-5 space-y-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-[#202638]">
                        {item.jobTitle} —{" "}
                        {DELIVERABLE_TYPE_LABELS[item.deliverableType] || item.title}
                      </span>
                      <StatusBadge type="workflow" status={item.workflowState} />
                      <StatusBadge type="delivery" status={item.deliveryStatus} />
                    </div>
                    <p className="text-xs text-[#64748B] mt-1">
                      Job Type: {item.jobCategory || "Content Creation"} • Assigned:{" "}
                      {formatDate(item.assignedDate)} • Target Date:{" "}
                      <span className="font-medium text-[#202638]">
                        {formatDate(item.targetDate)}
                      </span>
                    </p>
                    {item.jobDescription && (
                      <p className="text-xs text-[#202638] mt-1.5 bg-[#F7F8FC] p-2.5 rounded border border-[#E5E7EB]">
                        Instructions: {item.jobDescription}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    {item.latestRating !== null && (
                      <div className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-indigo-50 border border-indigo-200 text-xs font-semibold text-[#4F46E5]">
                        <Star className="w-3.5 h-3.5 fill-[#4F46E5] text-[#4F46E5]" />
                        <span>{item.latestRating}/5</span>
                      </div>
                    )}

                    {item.workflowState !== "CANCELLED" && (
                      <Button
                        variant={
                          item.workflowState === "REVISION_REQUESTED" ? "primary" : "outline"
                        }
                        size="sm"
                        onClick={() => {
                          setSelectedItem(item);
                          setError(null);
                        }}
                      >
                        <Upload className="w-3.5 h-3.5 mr-1.5" />
                        {item.submissions.length > 0 ? "Submit Revised Version" : "Submit Work"}
                      </Button>
                    )}
                  </div>
                </div>

                {/* Submission History & Feedback */}
                {(item.submissions.length > 0 || item.reviews.length > 0) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    {item.submissions.length > 0 && (
                      <div className="p-3 rounded-lg bg-[#F7F8FC] border border-[#E5E7EB] space-y-2">
                        <p className="text-xs font-semibold text-[#202638]">
                          Your Submission History
                        </p>
                        {item.submissions.map((sub) => (
                          <div
                            key={sub.id}
                            className="p-2 rounded bg-white border border-[#E5E7EB] text-xs space-y-1"
                          >
                            <div className="flex justify-between font-medium">
                              <span>Version {sub.version}</span>
                              <span className="text-[#64748B]">
                                {formatDateTime(sub.submittedAt)}
                              </span>
                            </div>
                            {sub.notes && <p className="text-[#64748B]">{sub.notes}</p>}
                            <div className="flex flex-wrap gap-3">
                              {sub.submissionUrl && (
                                <a
                                  href={sub.submissionUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-[#4F46E5] hover:underline"
                                >
                                  Submitted Link <ExternalLink className="w-3 h-3" />
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
                                  {sub.fileName || "Attached File"}
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {item.reviews.length > 0 && (
                      <div className="p-3 rounded-lg bg-[#F7F8FC] border border-[#E5E7EB] space-y-2">
                        <p className="text-xs font-semibold text-[#202638]">Reviewer Feedback</p>
                        {item.reviews.map((rev) => (
                          <div
                            key={rev.id}
                            className="p-2 rounded bg-white border border-[#E5E7EB] text-xs space-y-1"
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-medium">{rev.reviewerName}</span>
                              <StatusBadge type="approval" status={rev.status} />
                            </div>
                            {rev.publicFeedback && (
                              <p className="text-[#202638]">{rev.publicFeedback}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submission Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white border border-[#E5E7EB] shadow-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-[#202638]">Submit Deliverable Work</h3>
                <p className="text-xs text-[#64748B]">
                  {selectedItem.jobTitle} —{" "}
                  {DELIVERABLE_TYPE_LABELS[selectedItem.deliverableType] || selectedItem.title}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="p-1.5 rounded-md text-[#64748B] hover:bg-[#F1F3F9] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitWork} className="p-5 space-y-4">
              {error && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-rose-50 border border-rose-200 text-[#E11D48] text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <Input
                type="url"
                label="Google Drive URL or External Work Link"
                placeholder="https://drive.google.com/..."
                value={submissionUrl}
                onChange={(e) => setSubmissionUrl(e.target.value)}
              />

              <div>
                <label className="block text-xs font-medium text-[#202638] mb-1.5">
                  Upload Document / Media File (Max 25 MB)
                </label>
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="block w-full text-xs text-[#64748B] file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-indigo-50 file:text-[#4F46E5] hover:file:bg-indigo-100"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#202638] mb-1.5">
                  Submission Notes / Description
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Describe what was completed or changes addressed..."
                  className="w-full rounded-lg border border-[#E5E7EB] p-2.5 text-sm text-[#202638] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedItem(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
                  Submit Work
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

