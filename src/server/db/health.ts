import { db } from "./client";

export interface DbHealthResult {
  healthy: boolean;
  latencyMs?: number;
  error?: string;
}

export async function checkDbHealth(): Promise<DbHealthResult> {
  const start = Date.now();
  try {
    await db.$queryRaw`SELECT 1 as alive`;
    return {
      healthy: true,
      latencyMs: Date.now() - start,
    };
  } catch (err: any) {
    return {
      healthy: false,
      latencyMs: Date.now() - start,
      error: err?.message || "Database connection unavailable",
    };
  }
}

