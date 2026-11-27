"use server";

import { revalidatePath } from "next/cache";
import { requireAuthenticatedUser, requirePermission } from "@/server/auth/guards";
import { brandingService } from "@/server/services/brandingService";
import {
  allocateBrandingCreditsSchema,
  updateBrandingStageSchema,
  type UpdateBrandingStageInput,
} from "@/validations/branding";
import type { ActionResult } from "@/types/common";

export async function updateBrandingStageAction(
  rawInput: UpdateBrandingStageInput
): Promise<ActionResult<{ stageId: string }>> {
  try {
    const user = await requireAuthenticatedUser();
    // Allow manager/deputy/stage owner
    const parsed = updateBrandingStageSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "Invalid stage update",
      };
    }

    const updated = await brandingService.updateStage(user.id, parsed.data);

    revalidatePath("/branding-jobs");
    revalidatePath("/dashboard");

    return { success: true, data: { stageId: updated.id } };
  } catch (err: unknown) {
    console.error("updateBrandingStageAction error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update stage.",
    };
  }
}

export async function allocateBrandingCreditsAction(rawInput: {
  deliverableId: string;
  contentCredits?: number | null;
  jobOwnerCredits?: number | null;
  creditsAllocated?: number | null;
}): Promise<ActionResult<{ deliverableId: string }>> {
  try {
    const user = await requireAuthenticatedUser();
    requirePermission(user, "credits:manage");

    const parsed = allocateBrandingCreditsSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "Invalid credits input",
      };
    }

    const updated = await brandingService.allocateCredits(user.id, parsed.data);

    revalidatePath("/branding-jobs");
    revalidatePath("/roi");

    return { success: true, data: { deliverableId: updated.id } };
  } catch (err: unknown) {
    console.error("allocateBrandingCreditsAction error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to allocate credits.",
    };
  }
}

