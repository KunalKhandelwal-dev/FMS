import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import type { StorageProvider, StoredFileMetadata } from "./storageProvider";
import { env } from "@/lib/env";

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
  "video/mp4",
  "video/quicktime",
  "application/zip",
  "application/x-zip-compressed",
];

export class LocalStorageProvider implements StorageProvider {
  private readonly storageRoot: string;
  private readonly maxBytes: number;

  constructor() {
    this.storageRoot = path.resolve(process.cwd(), env.MEDIA_STORAGE_ROOT);
    this.maxBytes = env.MAX_UPLOAD_SIZE_MB * 1024 * 1024;
  }

  validateFile(sizeBytes: number, mimeType: string): { valid: boolean; error?: string } {
    if (sizeBytes > this.maxBytes) {
      return {
        valid: false,
        error: `File size exceeds maximum allowed limit of ${env.MAX_UPLOAD_SIZE_MB} MB`,
      };
    }
    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      return {
        valid: false,
        error: `MIME type '${mimeType}' is not permitted. Allowed: PDF, Images, MP4, MOV, ZIP`,
      };
    }
    return { valid: true };
  }

  async saveFile(
    file: File | Blob,
    originalName: string,
    mimeType: string
  ): Promise<StoredFileMetadata> {
    const buffer = Buffer.from(await file.arrayBuffer());
    const validation = this.validateFile(buffer.length, mimeType);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Ensure root directory exists
    await fs.mkdir(this.storageRoot, { recursive: true });

    // Clean filename and generate random storage name
    const sanitizedOriginal = path.basename(originalName);
    const ext = path.extname(sanitizedOriginal);
    const randomHex = crypto.randomBytes(16).toString("hex");
    const storedFileName = `${Date.now()}_${randomHex}${ext}`;
    const targetPath = path.join(this.storageRoot, storedFileName);

    await fs.writeFile(targetPath, buffer);

    return {
      id: randomHex,
      originalFileName: sanitizedOriginal,
      storedFileName,
      storagePath: storedFileName, // Relative path inside storageRoot
      mimeType,
      sizeBytes: buffer.length,
    };
  }

  async readFile(storagePath: string): Promise<Buffer> {
    // Prevent directory traversal
    const safeName = path.basename(storagePath);
    const fullPath = path.join(this.storageRoot, safeName);
    return fs.readFile(fullPath);
  }

  async deleteFile(storagePath: string): Promise<boolean> {
    try {
      const safeName = path.basename(storagePath);
      const fullPath = path.join(this.storageRoot, safeName);
      await fs.unlink(fullPath);
      return true;
    } catch {
      return false;
    }
  }
}

export const localStorageProvider = new LocalStorageProvider();
