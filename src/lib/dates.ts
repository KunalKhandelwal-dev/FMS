import { DeliveryPerformanceStatus } from "@prisma/client";

const KOLKATA_TZ = "Asia/Kolkata";

/**
 * Formats a date in Indian locale (Asia/Kolkata).
 */
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: KOLKATA_TZ,
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

/**
 * Formats date and time in Indian locale (Asia/Kolkata).
 */
export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: KOLKATA_TZ,
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

/**
 * Formats a date as YYYY-MM-DD in Asia/Kolkata timezone for HTML date inputs.
 */
export function toKolkataDateInput(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: KOLKATA_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(d);
  const year = parts.find((p) => p.type === "year")?.value;
  const month = parts.find((p) => p.type === "month")?.value;
  const day = parts.find((p) => p.type === "day")?.value;
  return `${year}-${month}-${day}`;
}

/**
 * Returns the end of the given calendar day (23:59:59.999) in Asia/Kolkata (+05:30).
 */
export function getKolkataEndOfDay(date: Date | string): Date {
  const ymd = toKolkataDateInput(date);
  return new Date(`${ymd}T23:59:59.999+05:30`);
}

/**
 * Returns the start of the given calendar day (00:00:00.000) in Asia/Kolkata (+05:30).
 */
export function getKolkataStartOfDay(date: Date | string): Date {
  const ymd = toKolkataDateInput(date);
  return new Date(`${ymd}T00:00:00.000+05:30`);
}

/**
 * Calculates DeliveryPerformanceStatus based on targetDate, firstSubmittedAt, and cancellation.
 * Uses Asia/Kolkata end-of-day comparison so submissions on the target date count as on time.
 */
export function calculateDeliveryStatus(params: {
  targetDate: Date | string | null | undefined;
  firstSubmittedAt: Date | string | null | undefined;
  isCancelled?: boolean;
  now?: Date;
}): DeliveryPerformanceStatus {
  if (params.isCancelled) {
    return DeliveryPerformanceStatus.CANCELLED;
  }

  if (!params.targetDate) {
    return params.firstSubmittedAt
      ? DeliveryPerformanceStatus.COMPLETED_ON_TIME
      : DeliveryPerformanceStatus.PENDING;
  }

  const deadlineEnd = getKolkataEndOfDay(params.targetDate);

  if (params.firstSubmittedAt) {
    const submitted =
      typeof params.firstSubmittedAt === "string"
        ? new Date(params.firstSubmittedAt)
        : params.firstSubmittedAt;
    return submitted.getTime() <= deadlineEnd.getTime()
      ? DeliveryPerformanceStatus.COMPLETED_ON_TIME
      : DeliveryPerformanceStatus.LATE_COMPLETED;
  }

  const now = params.now ?? new Date();
  if (now.getTime() > deadlineEnd.getTime()) {
    return DeliveryPerformanceStatus.NOT_DONE_TILL_DATE;
  }

  return DeliveryPerformanceStatus.PENDING;
}

export function isPastDeadline(deadline: Date | string | null | undefined): boolean {
  if (!deadline) return false;
  const deadlineEnd = getKolkataEndOfDay(deadline);
  return Date.now() > deadlineEnd.getTime();
}

/**
 * Adds days to a start date (configurable between calendar and working days).
 */
export function addDays(startDate: Date, days: number, workingDaysOnly = false): Date {
  const result = new Date(startDate);
  if (!workingDaysOnly) {
    result.setDate(result.getDate() + days);
    return result;
  }
  let added = 0;
  while (added < days) {
    result.setDate(result.getDate() + 1);
    const day = result.getDay();
    if (day !== 0) {
      // Skip Sunday as default non-working day when workingDaysOnly is enabled
      added++;
    }
  }
  return result;
}
