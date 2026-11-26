export interface StoredFileMetadata {
  id: string;
  originalFileName: string;
  storedFileName: string;
  storagePath: string;
  mimeType: string;
  sizeBytes: number;
}

export interface StorageProvider {
  saveFile(file: File | Blob, originalName: string, mimeType: string): Promise<StoredFileMetadata>;
  readFile(storagePath: string): Promise<Buffer>;
  deleteFile(storagePath: string): Promise<boolean>;
  validateFile(sizeBytes: number, mimeType: string): { valid: boolean; error?: string };
}

