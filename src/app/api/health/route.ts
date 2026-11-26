import { NextResponse } from "next/server";
import { checkDbHealth } from "@/server/db/health";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";

export async function GET() {
  const dbHealth = await checkDbHealth();
  const status = dbHealth.healthy ? 200 : 503;

  return NextResponse.json(
    {
      status: dbHealth.healthy ? "UP" : "DEGRADED",
      timestamp: new Date().toISOString(),
      appName: env.APP_NAME,
      environment: env.NODE_ENV,
      database: {
        provider: "mariadb_mysql",
        healthy: dbHealth.healthy,
        latencyMs: dbHealth.latencyMs,
        error: dbHealth.error,
      },
      storage: {
        rootConfigured: Boolean(env.MEDIA_STORAGE_ROOT),
        maxSizeMb: env.MAX_UPLOAD_SIZE_MB,
      },
    },
    { status }
  );
}

