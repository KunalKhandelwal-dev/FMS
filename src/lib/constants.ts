export const APP_NAME = "Faculty Management System";
export const DEPARTMENT_NAME = "Branding Department — Geeta University";

export const USER_ROLES = {
  MAIN_MANAGER: "MAIN_MANAGER",
  DEPUTY_MANAGER: "DEPUTY_MANAGER",
  TEAM_LEAD: "TEAM_LEAD",
  EMPLOYEE: "EMPLOYEE",
} as const;

export const ROLE_LABELS: Record<string, string> = {
  MAIN_MANAGER: "Main Manager (Department Head)",
  DEPUTY_MANAGER: "Deputy Manager",
  TEAM_LEAD: "Team Lead (Pending Policy)",
  EMPLOYEE: "Production Specialist / Employee",
};

export const JOB_CATEGORIES = [
  "Events",
  "Placement",
  "Meta Ads",
  "Campus Life",
  "Hostel & Sports",
  "Department",
  "Pre-Event Promotion",
  "Other Guest / Expert Byte",
  "Personal Branding",
  "Personal Branding of PC",
  "International Students",
] as const;

export const DELIVERABLE_TYPE_LABELS: Record<string, string> = {
  PHOTO_POST: "Photo Post",
  BYTE_REEL: "Byte Reel (15-30s)",
  STANDARD_REEL: "Standard Reel (30-60s)",
  CHRONOLOGICAL_VIDEO: "Chronological Video",
  LIVE_STORY: "Live Story",
  PHOTOGRAPHY_CLASS: "Photography Class",
  PRE_EVENT_PROMO_REEL: "Pre-Event Promotional Reel",
  SCRIPTED_CINEMATIC_REEL_VIDEO: "Scripted Cinematic Reel / Video",
  CONTENT_MOCKUP: "Content / Mockup",
  APPROVED_DESIGN: "Approved Design",
  PRINT_ORDER_DBMS: "Print Orders, Mailing & DBMS",
  SUPPLY_INSTALL: "Supply & Install",
  PACK_UPS: "Pack-ups & Teardown",
  OTHER: "Other Asset",
};

export const STAGE_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  NOT_INITIATED: { label: "Not Initiated", color: "bg-slate-100 text-slate-700 border-slate-300" },
  IN_PROGRESS: { label: "In Progress", color: "bg-blue-100 text-blue-700 border-blue-300" },
  COMPLETED_ON_TIME: {
    label: "Completed On Time",
    color: "bg-emerald-100 text-emerald-800 border-emerald-300",
  },
  LATE_COMPLETED: {
    label: "Late Completed",
    color: "bg-amber-100 text-amber-800 border-amber-300",
  },
  NOT_DONE: { label: "Not Done", color: "bg-red-100 text-red-700 border-red-300" },
  CANCELLED: { label: "Cancelled", color: "bg-gray-100 text-gray-600 border-gray-300" },
};

export const APPROVAL_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  NOT_INITIATED: { label: "Not Initiated", color: "bg-slate-100 text-slate-700 border-slate-300" },
  PENDING_REVIEW: {
    label: "Pending Review",
    color: "bg-amber-100 text-amber-800 border-amber-300",
  },
  APPROVED: { label: "Approved", color: "bg-emerald-100 text-emerald-800 border-emerald-300" },
  REVISION_REQUESTED: {
    label: "Asked for Revision",
    color: "bg-orange-100 text-orange-800 border-orange-300",
  },
  REJECTED: { label: "Rejected", color: "bg-red-100 text-red-700 border-red-300" },
};
