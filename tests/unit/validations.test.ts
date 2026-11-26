import { describe, it, expect } from "vitest";
import { loginSchema } from "@/validations/auth";
import { createJobSchema } from "@/validations/job";

describe("Input Validation Schemas", () => {
  it("validates login credentials correctly", () => {
    const invalidEmail = loginSchema.safeParse({ email: "invalid-email", password: "password123" });
    expect(invalidEmail.success).toBe(false);

    const validLogin = loginSchema.safeParse({
      email: "staff@geeta.edu.in",
      password: "securepassword",
    });
    expect(validLogin.success).toBe(true);
  });

  it("validates job creation inputs strictly", () => {
    const invalidJob = createJobSchema.safeParse({ title: "Hi" }); // Less than 3 chars
    expect(invalidJob.success).toBe(false);

    const validJob = createJobSchema.safeParse({
      title: "Convocation 2026 Media Coverage",
      jobType: "CONTENT_CREATION",
      category: "Events",
      priority: "HIGH",
    });
    expect(validJob.success).toBe(true);
  });
});
