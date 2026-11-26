import { describe, it, expect } from "vitest";
import { localStorageProvider } from "@/server/storage/localStorageProvider";

describe("LocalStorageProvider File Validation", () => {
  it("rejects files exceeding maximum allowed size", () => {
    const oversizedBytes = 30 * 1024 * 1024; // 30 MB (limit is 25 MB)
    const result = localStorageProvider.validateFile(oversizedBytes, "image/png");
    expect(result.valid).toBe(false);
    expect(result.error).toContain("File size exceeds");
  });

  it("rejects unpermitted MIME types like executables", () => {
    const validSizeBytes = 1024 * 1024; // 1 MB
    const result = localStorageProvider.validateFile(validSizeBytes, "application/x-msdownload");
    expect(result.valid).toBe(false);
    expect(result.error).toContain("MIME type 'application/x-msdownload' is not permitted");
  });

  it("accepts valid PDF and image documents within size limit", () => {
    const validSizeBytes = 5 * 1024 * 1024; // 5 MB
    expect(localStorageProvider.validateFile(validSizeBytes, "application/pdf").valid).toBe(true);
    expect(localStorageProvider.validateFile(validSizeBytes, "image/png").valid).toBe(true);
    expect(localStorageProvider.validateFile(validSizeBytes, "video/mp4").valid).toBe(true);
  });
});

