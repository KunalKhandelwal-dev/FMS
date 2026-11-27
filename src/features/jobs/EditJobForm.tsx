"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateJobAction } from "./actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { JOB_CATEGORIES } from "@/lib/constants";

interface EditJobFormProps {
  job: {
    id: string;
    title: string;
    category: string;
    ownerId: string;
    description: string;
    priority: string;
  };
  employees: { id: string; fullName: string; designation: string | null }[];
}

export function EditJobForm({ job, employees }: EditJobFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(job.title);
  const [category, setCategory] = useState(job.category);
  const [ownerId, setOwnerId] = useState(job.ownerId);
  const [description, setDescription] = useState(job.description);
  const [priority, setPriority] = useState(job.priority);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    const res = await updateJobAction({
      id: job.id,
      title,
      category: category as (typeof JOB_CATEGORIES)[number],
      ownerId,
      description,
      priority: priority as "LOW" | "MEDIUM" | "HIGH" | "URGENT",
    });

    if (!res.success) {
      setError(res.error);
      setIsSaving(false);
      return;
    }

    router.push(`/jobs/${job.id}`);
    router.refresh();
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Update Job Details</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-[#E11D48]">
              {error}
            </div>
          )}

          <Input
            label="Job / Activity Name"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#202638] mb-1.5">Job Type</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="flex h-9 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 text-sm text-[#202638]"
              >
                {JOB_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#202638] mb-1.5">Job Owner</label>
              <select
                value={ownerId}
                onChange={(e) => setOwnerId(e.target.value)}
                className="flex h-9 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 text-sm text-[#202638]"
              >
                <option value="">Select owner...</option>
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.fullName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#202638] mb-1.5">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="flex h-9 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 text-sm text-[#202638]"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#202638] mb-1.5">
              Description / Instructions
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-[#E5E7EB] p-2.5 text-sm text-[#202638]"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSaving}>
              Save Changes
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

