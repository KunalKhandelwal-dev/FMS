"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { JOB_CATEGORIES } from "@/lib/constants";
import { Search, X } from "lucide-react";

interface OwnerOption {
  id: string;
  fullName: string;
}

export function DashboardFilters({ owners }: { owners: OwnerOption[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [fromDate, setFromDate] = useState(searchParams.get("fromDate") || "");
  const [toDate, setToDate] = useState(searchParams.get("toDate") || "");
  const [ownerId, setOwnerId] = useState(searchParams.get("ownerId") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");

  function applyFilters(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    if (fromDate) params.set("fromDate", fromDate);
    if (toDate) params.set("toDate", toDate);
    if (ownerId) params.set("ownerId", ownerId);
    if (category) params.set("category", category);
    router.push(`/dashboard?${params.toString()}`);
  }

  function clearFilters() {
    setSearch("");
    setFromDate("");
    setToDate("");
    setOwnerId("");
    setCategory("");
    router.push("/dashboard");
  }

  return (
    <form
      onSubmit={applyFilters}
      className="bg-white rounded-lg border border-[#E5E7EB] p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 items-end"
    >
      <div className="lg:col-span-2">
        <label className="block text-xs font-medium text-[#64748B] mb-1">Search Jobs</label>
        <div className="relative">
          <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-2.5" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Job / Activity name..."
            className="pl-9"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-[#64748B] mb-1">From Date</label>
        <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
      </div>

      <div>
        <label className="block text-xs font-medium text-[#64748B] mb-1">To Date</label>
        <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
      </div>

      <div>
        <label className="block text-xs font-medium text-[#64748B] mb-1">Team Lead / Owner</label>
        <select
          value={ownerId}
          onChange={(e) => setOwnerId(e.target.value)}
          className="flex h-9 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-1.5 text-sm text-[#202638] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
        >
          <option value="">All Owners</option>
          {owners.map((o) => (
            <option key={o.id} value={o.id}>
              {o.fullName}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex-1">
          <label className="block text-xs font-medium text-[#64748B] mb-1">Job Type</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="flex h-9 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-1.5 text-sm text-[#202638] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
          >
            <option value="">All Types</option>
            {JOB_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="sm:col-span-2 lg:col-span-6 flex items-center justify-end gap-2 pt-1">
        <Button type="button" variant="ghost" size="sm" onClick={clearFilters}>
          <X className="w-3.5 h-3.5 mr-1" />
          Reset
        </Button>
        <Button type="submit" variant="primary" size="sm">
          Apply Filters
        </Button>
      </div>
    </form>
  );
}

