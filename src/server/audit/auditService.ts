import { db } from "@/server/db/client";
import { AuditAction } from "@prisma/client";

export interface LogAuditParams {
  userId?: string | null;
  jobId?: string | null;
  action: AuditAction;
  entityType: string;
  entityId: string;
  details?: Record<string, unknown> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export class AuditService {
  /**
   * Appends an immutable audit log entry.
   */
  async log(params: LogAuditParams): Promise<void> {
    try {
      await db.activityLog.create({
        data: {
          userId: params.userId || null,
          jobId: params.jobId || null,
          action: params.action,
          entityType: params.entityType,
          entityId: params.entityId,
          details: params.details ? JSON.stringify(params.details) : null,
          ipAddress: params.ipAddress || null,
          userAgent: params.userAgent || null,
        },
      });
    } catch (err) {
      // Audit log failures should not crash user operations, but are logged to stderr
      console.error("Failed to write audit log:", err);
    }
  }
}

export const auditService = new AuditService();

