"use server";

import { revalidatePath } from "next/cache";
import { requireAuthenticatedUser, requirePermission } from "@/server/auth/guards";
import { approvalService } from "@/server/services/approvalService";
import { approvalReviewSchema, type ApprovalReviewInput } from "@/validations/approval";
import type { ActionResult } from "@/types/common";

export async function reviewDeliverableAction(
  rawInput: ApprovalReviewInput
): Promise<ActionResult<{ reviewId: string }>> {
  try {
    const user = await requireAuthenticatedUser();
    requirePermission(user, "review:approve");

    if (rawInput.stars) {
      requirePermission(user, "rating:create");
    }

    const parsed = approvalReviewSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "Invalid review submission",
      };
    }

    const review = await approvalService.submitReview(user.id, parsed.data);

    revalidatePath("/dashboard");
    revalidatePath("/approvals");
    revalidatePath("/jobs");
    revalidatePath("/my-work");
    revalidatePath("/productivity");

    return {
      success: true,
      data: { reviewId: review.id },
      message: "Review and rating saved.",
    };
  } catch (err: unknown) {
    console.error("reviewDeliverableAction error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to submit review.",
    };
  }
}

