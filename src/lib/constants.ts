export const APP_NAME = "FMS";
export const APP_FULL_NAME = "Faculty Management System";
export const DEPARTMENT_NAME = "Branding Department";

export const USER_ROLES = {
  MAIN_MANAGER: "MAIN_MANAGER",
  DEPUTY_MANAGER: "DEPUTY_MANAGER",
  TEAM_LEAD: "TEAM_LEAD",
  EMPLOYEE: "EMPLOYEE",
} as const;

export const ROLE_LABELS: Record<string, string> = {
  MAIN_MANAGER: "Main Manager",
  DEPUTY_MANAGER: "Deputy Manager",
  TEAM_LEAD: "Team Lead",
  EMPLOYEE: "Team Member",
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

/**
 * Display alias mapping:
 * "Personal Branding of PC" is stored canonically;
 * some tracker sections display "Personal Branding of Pro Chancellor".
 */
export const JOB_CATEGORY_ALIASES: Record<string, string> = {
  "Personal Branding of PC": "Personal Branding of Pro Chancellor",
};

export const CONTENT_DELIVERABLE_TYPES = [
  { value: "PHOTO_POST", label: "Photo Post" },
  { value: "BYTE_REEL", label: "Byte Reel" },
  { value: "STANDARD_REEL", label: "Standard Reel" },
  { value: "CHRONOLOGICAL_VIDEO", label: "Chronological Video" },
  { value: "LIVE_STORY", label: "Live Story" },
  { value: "PHOTOGRAPHY_CLASS", label: "Photography Class" },
  { value: "PRE_EVENT_PROMO_REEL", label: "Pre-Event Promotional Reel" },
  { value: "SCRIPTED_CINEMATIC_REEL_VIDEO", label: "Scripted Cinematic Reel/Video" },
] as const;

export const DELIVERABLE_TYPE_LABELS: Record<string, string> = {
  PHOTO_POST: "Photo Post",
  BYTE_REEL: "Byte Reel",
  STANDARD_REEL: "Standard Reel",
  CHRONOLOGICAL_VIDEO: "Chronological Video",
  LIVE_STORY: "Live Story",
  PHOTOGRAPHY_CLASS: "Photography Class",
  PRE_EVENT_PROMO_REEL: "Pre-Event Promotional Reel",
  SCRIPTED_CINEMATIC_REEL_VIDEO: "Scripted Cinematic Reel/Video",
  CONTENT_MOCKUP: "Content / Mockup",
  APPROVED_DESIGN: "Approved Design",
  PRINT_ORDER_DBMS: "Print Orders, Mailing Design, DBMS",
  SUPPLY_INSTALL: "Supply & Install",
  PACK_UPS: "Pack-ups",
  OTHER: "Other Asset",
};

export const WORKFLOW_STATE_LABELS: Record<string, { label: string; color: string }> = {
  NOT_STARTED: { label: "Not Started", color: "bg-slate-100 text-slate-700 border-slate-300" },
  ASSIGNED: { label: "Pending", color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  IN_PROGRESS: { label: "In Progress", color: "bg-violet-50 text-violet-700 border-violet-200" },
  SUBMITTED: { label: "Awaiting Review", color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  UNDER_REVIEW: { label: "Under Review", color: "bg-violet-50 text-violet-700 border-violet-200" },
  REVISION_REQUESTED: { label: "Asked for revision", color: "bg-violet-50 text-violet-700 border-violet-200" },
  APPROVED: { label: "Approved", color: "bg-blue-50 text-blue-700 border-blue-200" },
  COMPLETED: { label: "Completed", color: "bg-blue-50 text-blue-700 border-blue-200" },
  PUBLISHED: { label: "Published", color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  CANCELLED: { label: "Cancelled", color: "bg-gray-100 text-gray-600 border-gray-300" },
};

export const DELIVERY_PERFORMANCE_LABELS: Record<string, { label: string; color: string }> = {
  COMPLETED_ON_TIME: { label: "Completed On Time", color: "bg-blue-50 text-blue-700 border-blue-200" },
  LATE_COMPLETED: { label: "Late Completed", color: "bg-rose-50 text-rose-700 border-rose-200" },
  NOT_DONE_TILL_DATE: { label: "Not done till date", color: "bg-slate-100 text-slate-700 border-slate-300" },
  PENDING: { label: "Pending", color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  CANCELLED: { label: "Cancelled", color: "bg-gray-100 text-gray-600 border-gray-300" },
};

export const STAGE_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  NOT_INITIATED: { label: "Not Done", color: "bg-slate-100 text-slate-700 border-slate-300" },
  IN_PROGRESS: { label: "In Process", color: "bg-violet-50 text-violet-700 border-violet-200" },
  COMPLETED_ON_TIME: { label: "Completed On Time", color: "bg-blue-50 text-blue-700 border-blue-200" },
  LATE_COMPLETED: { label: "Late Completed", color: "bg-rose-50 text-rose-700 border-rose-200" },
  NOT_DONE: { label: "Not done till date", color: "bg-slate-100 text-slate-700 border-slate-300" },
  CANCELLED: { label: "Cancelled", color: "bg-gray-100 text-gray-600 border-gray-300" },
};

export const APPROVAL_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  NOT_INITIATED: { label: "Not Initiated", color: "bg-slate-100 text-slate-700 border-slate-300" },
  PENDING_REVIEW: { label: "Pending", color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  APPROVED: { label: "Approved", color: "bg-blue-50 text-blue-700 border-blue-200" },
  REVISION_REQUESTED: { label: "Asked for revision", color: "bg-violet-50 text-violet-700 border-violet-200" },
  REJECTED: { label: "Not Approved", color: "bg-rose-50 text-rose-700 border-rose-200" },
};
