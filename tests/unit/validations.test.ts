import { describe, it, expect } from "vitest";
import { loginSchema } from "@/validations/auth";
import { createContentJobSchema, createBrandingJobSchema } from "@/validations/job";

describe("Input Validation Schemas", () => {
  it("validates login credentials correctly", () => {
    const invalidEmail = loginSchema.safeParse({
      email: "invalid-email",
      password: "password123",
    });
    expect(invalidEmail.success).toBe(false);

    const validLogin = loginSchema.safeParse({
      email: "staff@geeta.edu.in",
      password: "securepassword",
    });
    expect(validLogin.success).toBe(true);
  });

  it("validates content job creation inputs with deliverables and target dates", () => {
    const invalidJob = createContentJobSchema.safeParse({ title: "Hi" });
    expect(invalidJob.success).toBe(false);

    const validJob = createContentJobSchema.safeParse({
      jobDate: new Date(),
      title: "NexHack",
      category: "Events",
      ownerId: "user-123",
      priority: "HIGH",
      deliverables: [
        {
          deliverableType: "PHOTO_POST",
          targetDate: new Date(),
        },
      ],
    });
    expect(validJob.success).toBe(true);
  });

  it("validates branding job creation inputs", () => {
    const validBranding = createBrandingJobSchema.safeParse({
      title: "Convocation Stage",
      eventDate: new Date(),
      venue: "Main Auditorium",
      organizer: "University Admin",
      ownerId: "user-123",
    });
    expect(validBranding.success).toBe(true);
  });
});
