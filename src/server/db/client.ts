import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { env } from "@/lib/env";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  if (env.USE_PRISMA_MARIADB_ADAPTER) {
    const adapter = new PrismaMariaDb({
      host: env.DB_HOST,
      port: env.DB_PORT,
      user: env.DB_USER,
      password: env.DB_PASSWORD,
      database: env.DB_NAME,
      connectionLimit: 5,
      connectTimeout: 15000,
    });

    return new PrismaClient({
      adapter,
      log: env.LOG_LEVEL === "debug" ? ["query", "error", "warn"] : ["error"],
    });
  }

  // Default MySQL connector with DATABASE_URL
  return new PrismaClient({
    datasources: {
      db: {
        url: env.DATABASE_URL,
      },
    },
    log: env.LOG_LEVEL === "debug" ? ["query", "error", "warn"] : ["error"],
  });
}

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
