"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrandingJobAction } from "@/features/jobs/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X, AlertCircle } from "lucide-react";

export function CreateBrandingJobButton({
  employees,
}: {
  employees: { id: string; fullName: string; designation: string | null }[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [venue, setVenue] = useState("");
  const [organizer, setOrganizer] = useState("");
  const [ownerId, setOwnerId] = useState("");
  const [workingDaysOnly, setWorkingDaysOnly] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isSubmitting) return;
    setError(null);
    setIsSubmitting(true);

    const res = await createBrandingJobAction({
      title,
      eventDate: new Date(`${eventDate}T10:00:00+05:30`),
      venue,
      organizer,
      ownerId,
      workingDaysOnly,
    });

    if (!res.success) {
      setError(res.error);
      setIsSubmitting(false);
      return;
    }

    setOpen(false);
    setIsSubmitting(false);
    router.push(`/branding-jobs/${res.data.jobId}`);
    router.refresh();
  }

  return (
    <>
      <Button variant="primary" size="md" onClick={() => setOpen(true)}>
        <Plus className="w-4 h-4 mr-1.5" />
        New Branding Job
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white border border-[#E5E7EB] shadow-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-[#202638]">
                  Create Branding &amp; Production Job
                </h3>
                <p className="text-xs text-[#64748B]">
                  Initializes the 5-stage production tracker automatically
                </p>
              </div>
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
                label="Job / Event Name"
                placeholder="e.g., Annual Convocation Stage Branding"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  type="date"
                  label="Date of Event"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  required
                />
                <Input
                  label="Venue"
                  placeholder="e.g., Main Auditorium"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Organiser"
                  placeholder="e.g., School of Engineering"
                  value={organizer}
                  onChange={(e) => setOrganizer(e.target.value)}
                  required
                />
                <div>
                  <label className="block text-xs font-medium text-[#202638] mb-1.5">
                    Job Owner
                  </label>
                  <select
                    value={ownerId}
                    onChange={(e) => setOwnerId(e.target.value)}
                    required
                    className="flex h-9 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 text-sm text-[#202638]"
                  >
                    <option value="">Select Job Owner...</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.fullName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs text-[#64748B] cursor-pointer">
                <input
                  type="checkbox"
                  checked={workingDaysOnly}
                  onChange={(e) => setWorkingDaysOnly(e.target.checked)}
                  className="rounded border-[#E5E7EB] text-[#4F46E5]"
                />
                <span>
                  Calculate +1 to +4 day stage targets using working days (skipping Sundays)
                </span>
              </label>

              <div className="flex justify-end gap-2.5 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
                  Create Branding Job
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

