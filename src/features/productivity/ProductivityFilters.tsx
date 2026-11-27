"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { JOB_CATEGORIES } from "@/lib/constants";
import { X } from "lucide-react";

export function ProductivityFilters({
  teamLeads,
}: {
  teamLeads: { id: string; fullName: string }[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [fromDate, setFromDate] = useState(searchParams.get("fromDate") || "");
  const [toDate, setToDate] = useState(searchParams.get("toDate") || "");
  const [teamLeadId, setTeamLeadId] = useState(searchParams.get("teamLeadId") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");

  function handleApply(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (fromDate) params.set("fromDate", fromDate);
    if (toDate) params.set("toDate", toDate);
    if (teamLeadId) params.set("teamLeadId", teamLeadId);
    if (category) params.set("category", category);
    router.push(`/productivity?${params.toString()}`);
  }

  function handleReset() {
    setFromDate("");
    setToDate("");
    setTeamLeadId("");
    setCategory("");
    router.push("/productivity");
  }

  return (
    <form
      onSubmit={handleApply}
      className="bg-white rounded-lg border border-[#E5E7EB] p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end"
    >
      <div>
        <label className="block text-xs font-medium text-[#64748B] mb-1">From Date</label>
        <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
      </div>

      <div>
        <label className="block text-xs font-medium text-[#64748B] mb-1">To Date</label>
        <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
      </div>

      <div>
        <label className="block text-xs font-medium text-[#64748B] mb-1">Select Team Lead</label>
        <select
          value={teamLeadId}
          onChange={(e) => setTeamLeadId(e.target.value)}
          className="flex h-9 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 text-sm text-[#202638]"
        >
          <option value="">All Team Leads</option>
          {teamLeads.map((tl) => (
            <option key={tl.id} value={tl.id}>
              {tl.fullName}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-[#64748B] mb-1">Job Type</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="flex h-9 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 text-sm text-[#202638]"
        >
          <option value="">All Job Types</option>
          {JOB_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={handleReset}>
          <X className="w-3.5 h-3.5 mr-1" />
          Reset
        </Button>
        <Button type="submit" variant="primary" size="sm" className="flex-1">
          Apply
        </Button>
      </div>
    </form>
  );
}

