"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { reviewDeliverableAction } from "@/features/approvals/actions";
import { Button } from "@/components/ui/button";
import { Star, X, AlertCircle } from "lucide-react";

interface DeliverableReviewModalProps {
  deliverableId: string;
  deliverableTitle: string;
  submissionId?: string | null;
  canRate: boolean;
  existingRating?: number | null;
  onClose: () => void;
}

export function DeliverableReviewModal({
  deliverableId,
  deliverableTitle,
  submissionId,
  canRate,
  existingRating,
  onClose,
}: DeliverableReviewModalProps) {
  const router = useRouter();
  const [status, setStatus] = useState<"APPROVED" | "REVISION_REQUESTED" | "REJECTED">("APPROVED");
  const [stars, setStars] = useState<number>(existingRating ?? 4);
  const [publicFeedback, setPublicFeedback] = useState("");
  const [privateNotes, setPrivateNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isSubmitting) return;
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await reviewDeliverableAction({
        deliverableId,
        submissionId: submissionId || null,
        status,
        stars: canRate ? stars : null,
        publicFeedback: publicFeedback.trim() || null,
        privateNotes: privateNotes.trim() || null,
      });

      if (!res.success) {
        setError(res.error);
        setIsSubmitting(false);
        return;
      }

      router.refresh();
      onClose();
    } catch {
      setError("Failed to submit review.");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white border border-[#E5E7EB] shadow-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-[#202638]">
              {canRate ? "Review & Rate Deliverable" : "Team Lead Review"}
            </h3>
            <p className="text-xs text-[#64748B]">{deliverableTitle}</p>
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

          {/* Decision */}
          <div>
            <label className="block text-xs font-medium text-[#202638] mb-2">
              Review Decision
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { value: "APPROVED", label: "Approve", style: "border-blue-300 bg-blue-50 text-blue-700" },
                  {
                    value: "REVISION_REQUESTED",
                    label: "Ask for revision",
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
                  onClick={() => setStatus(opt.value)}
                  className={`py-2 px-3 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                    status === opt.value
                      ? opt.style
                      : "border-[#E5E7EB] bg-white text-[#64748B] hover:bg-[#F7F8FC]"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* 1-5 Star Rating (Main Manager Only) */}
          {canRate ? (
            <div>
              <label className="block text-xs font-medium text-[#202638] mb-2">
                Overall Output Rating ({stars} / 5 Stars){existingRating ? " — Edit Rating" : ""}
              </label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setStars(value)}
                    aria-label={`Rate ${value} stars`}
                    className="p-1 rounded hover:bg-[#F1F3F9] cursor-pointer"
                  >
                    <Star
                      className={`w-6 h-6 transition-colors ${
                        value <= stars
                          ? "fill-[#4F46E5] text-[#4F46E5]"
                          : "text-slate-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-lg bg-[#F7F8FC] border border-[#E5E7EB] text-xs text-[#64748B]">
              Team Lead review records your approval or revision decision. Only the Main Manager (Deepak) can award or edit the 1–5 star rating.
            </div>
          )}

          {/* Public Feedback */}
          <div>
            <label className="block text-xs font-medium text-[#202638] mb-1.5">
              Feedback for Employee (Visible to Assignee)
            </label>
            <textarea
              rows={3}
              value={publicFeedback}
              onChange={(e) => setPublicFeedback(e.target.value)}
              placeholder="Share constructive feedback or revision instructions..."
              className="w-full rounded-lg border border-[#E5E7EB] p-2.5 text-sm text-[#202638] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
            />
          </div>

          {/* Private Manager Notes */}
          <div>
            <label className="block text-xs font-medium text-[#202638] mb-1.5">
              Confidential Managerial Notes (Hidden from Employees)
            </label>
            <textarea
              rows={2}
              value={privateNotes}
              onChange={(e) => setPrivateNotes(e.target.value)}
              placeholder="Internal evaluation remarks..."
              className="w-full rounded-lg border border-[#E5E7EB] bg-[#F7F8FC] p-2.5 text-sm text-[#202638] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
              Save Review &amp; Rating
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

