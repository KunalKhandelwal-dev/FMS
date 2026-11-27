"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createContentJobAction } from "./actions";
import { SearchableEmployeeSelect, type EmployeeOption } from "./SearchableEmployeeSelect";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  CONTENT_DELIVERABLE_TYPES,
  DELIVERABLE_TYPE_LABELS,
  JOB_CATEGORIES,
} from "@/lib/constants";
import { toKolkataDateInput, formatDate } from "@/lib/dates";
import { AlertCircle, CheckCircle2, Calendar, CheckSquare, Square } from "lucide-react";

type DeliverableTypeKey = (typeof CONTENT_DELIVERABLE_TYPES)[number]["value"];

interface SelectedDeliverable {
  deliverableType: DeliverableTypeKey;
  targetDate: string;
}

export function CreateJobForm({ employees }: { employees: EmployeeOption[] }) {
  const router = useRouter();
  const today = toKolkataDateInput(new Date());

  const [jobDate, setJobDate] = useState(today);
  const [category, setCategory] = useState<string>(JOB_CATEGORIES[0]);
  const [title, setTitle] = useState("");
  const [ownerId, setOwnerId] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"LOW" | "MEDIUM" | "HIGH" | "URGENT">("MEDIUM");
  const [selectedDeliverables, setSelectedDeliverables] = useState<SelectedDeliverable[]>([]);

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function toggleDeliverable(type: DeliverableTypeKey) {
    setSelectedDeliverables((prev) => {
      const exists = prev.find((d) => d.deliverableType === type);
      if (exists) {
        return prev.filter((d) => d.deliverableType !== type);
      }
      return [...prev, { deliverableType: type, targetDate: jobDate || today }];
    });
  }

  function updateTargetDate(type: DeliverableTypeKey, newDate: string) {
    setSelectedDeliverables((prev) =>
      prev.map((d) => (d.deliverableType === type ? { ...d, targetDate: newDate } : d))
    );
  }

  const selectedOwner = employees.find((e) => e.id === ownerId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isSubmitting) return;
    setError(null);

    if (!title.trim()) {
      setError("Please enter a Job / Activity Name.");
      return;
    }
    if (!ownerId) {
      setError("Please select an accountable Job Owner / Team Lead.");
      return;
    }
    if (selectedDeliverables.length === 0) {
      setError("Please select at least one deliverable and set its target date.");
      return;
    }
    if (selectedDeliverables.some((d) => !d.targetDate)) {
      setError("Every selected deliverable must have a target date.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createContentJobAction({
        jobDate: new Date(`${jobDate}T09:00:00+05:30`),
        category: category as (typeof JOB_CATEGORIES)[number],
        title: title.trim(),
        ownerId,
        description: description.trim() || null,
        priority,
        deliverables: selectedDeliverables.map((d) => ({
          deliverableType: d.deliverableType,
          targetDate: new Date(`${d.targetDate}T18:00:00+05:30`),
        })),
      });

      if (!result.success) {
        setError(result.error);
        setIsSubmitting(false);
        return;
      }

      router.push(`/jobs/${result.data.jobId}`);
      router.refresh();
    } catch {
      setError("Unexpected error while creating job.");
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Form Columns */}
      <div className="lg:col-span-2 space-y-6">
        {error && (
          <div className="flex items-start gap-2.5 p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-[#E11D48] text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Section 1: Job Details */}
        <Card>
          <CardHeader>
            <CardTitle>Job Details</CardTitle>
            <CardDescription>
              Define the core activity, date, category, and accountable job owner
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                id="jobDate"
                type="date"
                label="Job Date"
                value={jobDate}
                onChange={(e) => setJobDate(e.target.value)}
                required
              />

              <div>
                <label
                  htmlFor="category"
                  className="block text-xs font-medium text-[#202638] mb-1.5"
                >
                  Job Type
                </label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="flex h-9 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-1.5 text-sm text-[#202638] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                >
                  {JOB_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <Input
              id="title"
              type="text"
              label="Job / Activity Name"
              placeholder="e.g., NexHack"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SearchableEmployeeSelect
                employees={employees}
                value={ownerId}
                onChange={setOwnerId}
              />

              <div>
                <label
                  htmlFor="priority"
                  className="block text-xs font-medium text-[#202638] mb-1.5"
                >
                  Priority
                </label>
                <select
                  id="priority"
                  value={priority}
                  onChange={(e) =>
                    setPriority(e.target.value as "LOW" | "MEDIUM" | "HIGH" | "URGENT")
                  }
                  className="flex h-9 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-1.5 text-sm text-[#202638] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-xs font-medium text-[#202638] mb-1.5"
              >
                Job Description / Instructions (Optional)
              </label>
              <textarea
                id="description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide brief context, shoot guidelines, or event details..."
                className="w-full rounded-lg border border-[#E5E7EB] bg-white p-3 text-sm text-[#202638] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Multi-Select Deliverables & Target Dates */}
        <Card>
          <CardHeader>
            <CardTitle>Deliverables &amp; Individual Target Dates</CardTitle>
            <CardDescription>
              Select all deliverables required for this job and set a target date for each
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {CONTENT_DELIVERABLE_TYPES.map((dt) => {
                const selected = selectedDeliverables.find(
                  (d) => d.deliverableType === dt.value
                );
                return (
                  <button
                    key={dt.value}
                    type="button"
                    onClick={() => toggleDeliverable(dt.value)}
                    className={`flex items-center gap-2.5 p-3 rounded-lg border text-left text-sm transition-colors cursor-pointer ${
                      selected
                        ? "border-[#4F46E5] bg-indigo-50/70 text-[#202638] font-medium"
                        : "border-[#E5E7EB] bg-white text-[#64748B] hover:bg-[#F7F8FC]"
                    }`}
                  >
                    {selected ? (
                      <CheckSquare className="w-4 h-4 text-[#4F46E5] shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                    <span>{dt.label}</span>
                  </button>
                );
              })}
            </div>

            {selectedDeliverables.length > 0 && (
              <div className="pt-4 border-t border-[#E5E7EB] space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                  Target Dates for Selected Deliverables
                </h4>
                <div className="space-y-2.5">
                  {selectedDeliverables.map((item) => (
                    <div
                      key={item.deliverableType}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-lg bg-[#F7F8FC] border border-[#E5E7EB]"
                    >
                      <span className="text-sm font-medium text-[#202638]">
                        {DELIVERABLE_TYPE_LABELS[item.deliverableType]}
                      </span>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-[#64748B]" />
                        <input
                          type="date"
                          value={item.targetDate}
                          onChange={(e) =>
                            updateTargetDate(item.deliverableType, e.target.value)
                          }
                          required
                          className="h-8 rounded-md border border-[#E5E7EB] bg-white px-2.5 text-xs text-[#202638] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Right Column: Review Summary & Save */}
      <div className="space-y-6">
        <Card className="sticky top-22">
          <CardHeader>
            <CardTitle>Job Review Summary</CardTitle>
            <CardDescription>Verify assignment details before saving</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1.5 border-b border-[#E5E7EB]">
                <span className="text-[#64748B]">Job / Activity</span>
                <span className="font-semibold text-[#202638]">
                  {title.trim() || "Not specified"}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#E5E7EB]">
                <span className="text-[#64748B]">Job Date</span>
                <span className="font-medium text-[#202638]">{formatDate(jobDate)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#E5E7EB]">
                <span className="text-[#64748B]">Job Type</span>
                <span className="font-medium text-[#202638]">{category}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#E5E7EB]">
                <span className="text-[#64748B]">Job Owner</span>
                <span className="font-semibold text-[#4F46E5]">
                  {selectedOwner ? selectedOwner.fullName : "Unassigned"}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-[#64748B]">
                Selected Deliverables ({selectedDeliverables.length})
              </p>
              {selectedDeliverables.length === 0 ? (
                <p className="text-xs text-slate-400 italic">None selected yet</p>
              ) : (
                <ul className="space-y-1.5">
                  {selectedDeliverables.map((d) => (
                    <li
                      key={d.deliverableType}
                      className="flex items-center justify-between text-xs p-2 rounded bg-[#F1F3F9]"
                    >
                      <span className="font-medium text-[#202638] flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#4F46E5]" />
                        {DELIVERABLE_TYPE_LABELS[d.deliverableType]}
                      </span>
                      <span className="text-[#64748B]">{formatDate(d.targetDate)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              size="md"
              isLoading={isSubmitting}
            >
              Create &amp; Assign Job
            </Button>
          </CardContent>
        </Card>
      </div>
    </form>
  );
}

