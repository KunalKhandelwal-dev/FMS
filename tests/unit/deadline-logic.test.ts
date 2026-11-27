import { describe, it, expect } from "vitest";
import { calculateDeliveryStatus } from "@/lib/dates";
import { DeliveryPerformanceStatus } from "@prisma/client";

describe("Delivery Deadline & Timeliness Logic (Asia/Kolkata)", () => {
  it("returns PENDING when targetDate is in the future and no submission exists", () => {
    const targetDate = new Date("2026-11-30T18:00:00+05:30");
    const now = new Date("2026-11-26T10:00:00+05:30");
    expect(
      calculateDeliveryStatus({ targetDate, firstSubmittedAt: null, now })
    ).toBe(DeliveryPerformanceStatus.PENDING);
  });

  it("returns NOT_DONE_TILL_DATE when deadline has passed with no submission", () => {
    const targetDate = new Date("2026-11-24T18:00:00+05:30");
    const now = new Date("2026-11-26T10:00:00+05:30");
    expect(
      calculateDeliveryStatus({ targetDate, firstSubmittedAt: null, now })
    ).toBe(DeliveryPerformanceStatus.NOT_DONE_TILL_DATE);
  });

  it("returns COMPLETED_ON_TIME when first submission is on the same calendar day in Asia/Kolkata", () => {
    const targetDate = new Date("2026-11-24T18:00:00+05:30");
    const firstSubmittedAt = new Date("2026-11-24T23:30:00+05:30");
    expect(
      calculateDeliveryStatus({ targetDate, firstSubmittedAt })
    ).toBe(DeliveryPerformanceStatus.COMPLETED_ON_TIME);
  });

  it("returns LATE_COMPLETED when first submission occurs after target day", () => {
    const targetDate = new Date("2026-11-24T18:00:00+05:30");
    const firstSubmittedAt = new Date("2026-11-25T09:00:00+05:30");
    expect(
      calculateDeliveryStatus({ targetDate, firstSubmittedAt })
    ).toBe(DeliveryPerformanceStatus.LATE_COMPLETED);
  });

  it("returns CANCELLED when isCancelled is true regardless of dates", () => {
    const targetDate = new Date("2026-11-24T18:00:00+05:30");
    expect(
      calculateDeliveryStatus({ targetDate, firstSubmittedAt: null, isCancelled: true })
    ).toBe(DeliveryPerformanceStatus.CANCELLED);
  });
});

