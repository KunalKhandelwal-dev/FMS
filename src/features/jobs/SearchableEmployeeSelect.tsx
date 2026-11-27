"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { Search, ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface EmployeeOption {
  id: string;
  fullName: string;
  designation: string | null;
  role: string;
  teams: string[];
}

interface SearchableEmployeeSelectProps {
  employees: EmployeeOption[];
  value: string;
  onChange: (employeeId: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
}

export function SearchableEmployeeSelect({
  employees,
  value,
  onChange,
  placeholder = "Select accountable job owner...",
  label = "Owner of Job / Team Lead",
  error,
}: SearchableEmployeeSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [teamFilter, setTeamFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const allTeams = useMemo(() => {
    const set = new Set<string>();
    employees.forEach((e) => e.teams.forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [employees]);

  const filteredEmployees = useMemo(() => {
    return [...employees]
      .sort((a, b) => a.fullName.localeCompare(b.fullName))
      .filter((emp) => {
        const matchesSearch =
          !search.trim() ||
          emp.fullName.toLowerCase().includes(search.toLowerCase()) ||
          (emp.designation || "").toLowerCase().includes(search.toLowerCase());
        const matchesTeam = !teamFilter || emp.teams.includes(teamFilter);
        const matchesRole = !roleFilter || emp.role === roleFilter;
        return matchesSearch && matchesTeam && matchesRole;
      });
  }, [employees, search, teamFilter, roleFilter]);

  const selectedEmployee = employees.find((e) => e.id === value);

  return (
    <div ref={containerRef} className="relative w-full">
      {label && (
        <label className="block text-xs font-medium text-[#202638] mb-1.5">{label}</label>
      )}

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex items-center justify-between w-full min-h-[38px] rounded-lg border border-[#E5E7EB] bg-white px-3 py-1.5 text-left text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5] cursor-pointer",
          error && "border-[#E11D48]"
        )}
      >
        {selectedEmployee ? (
          <div className="flex items-center justify-between w-full pr-2">
            <span className="font-medium text-[#202638]">{selectedEmployee.fullName}</span>
            <span className="text-xs text-[#64748B]">
              {selectedEmployee.teams[0] || selectedEmployee.designation || selectedEmployee.role}
            </span>
          </div>
        ) : (
          <span className="text-slate-400">{placeholder}</span>
        )}
        <ChevronDown className="w-4 h-4 text-[#64748B] shrink-0" />
      </button>

      {error && <p className="mt-1 text-xs text-[#E11D48]">{error}</p>}

      {open && (
        <div className="absolute z-40 mt-1.5 w-full rounded-lg border border-[#E5E7EB] bg-white shadow-lg overflow-hidden">
          {/* Search & Filter Controls */}
          <div className="p-2.5 border-b border-[#E5E7EB] bg-[#F7F8FC] space-y-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#64748B] absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or designation..."
                className="w-full h-8 pl-8 pr-2.5 rounded-md border border-[#E5E7EB] bg-white text-xs text-[#202638] focus:outline-none focus:ring-1 focus:ring-[#4F46E5]"
                autoFocus
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <select
                value={teamFilter}
                onChange={(e) => setTeamFilter(e.target.value)}
                className="h-7 rounded-md border border-[#E5E7EB] bg-white px-2 text-xs text-[#202638]"
              >
                <option value="">All Teams</option>
                {allTeams.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="h-7 rounded-md border border-[#E5E7EB] bg-white px-2 text-xs text-[#202638]"
              >
                <option value="">All Roles</option>
                <option value="TEAM_LEAD">Team Lead</option>
                <option value="DEPUTY_MANAGER">Deputy Manager</option>
                <option value="EMPLOYEE">Employee</option>
                <option value="MAIN_MANAGER">Main Manager</option>
              </select>
            </div>
          </div>

          {/* Options List */}
          <div className="max-h-60 overflow-y-auto divide-y divide-[#E5E7EB]">
            {filteredEmployees.length === 0 ? (
              <div className="px-3 py-4 text-center text-xs text-[#64748B]">
                No matching employees found.
              </div>
            ) : (
              filteredEmployees.map((emp) => {
                const isSelected = emp.id === value;
                return (
                  <button
                    key={emp.id}
                    type="button"
                    onClick={() => {
                      onChange(emp.id);
                      setOpen(false);
                    }}
                    className={cn(
                      "w-full px-3 py-2.5 text-left flex items-center justify-between hover:bg-[#F1F3F9] transition-colors cursor-pointer",
                      isSelected && "bg-indigo-50"
                    )}
                  >
                    <div>
                      <p className="text-sm font-medium text-[#202638]">{emp.fullName}</p>
                      <p className="text-xs text-[#64748B]">
                        {emp.teams.length > 0 ? emp.teams.join(", ") : emp.designation || emp.role.replace(/_/g, " ")}
                      </p>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-[#4F46E5]" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

