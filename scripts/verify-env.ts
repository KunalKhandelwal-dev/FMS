import { env } from "../src/lib/env";

console.log("==========================================");
console.log("FMS — Environment Configuration Audit");
console.log("==========================================");
console.log(`Node Environment:   ${env.NODE_ENV}`);
console.log(`Application Name:   ${env.APP_NAME}`);
console.log(`Application URL:    ${env.APP_URL}`);
console.log(
  `Database Adapter:   ${env.USE_PRISMA_MARIADB_ADAPTER ? "MariaDB Pool Adapter" : "Prisma Default MySQL"}`
);
console.log(`Database Host:      ${env.DB_HOST}:${env.DB_PORT}`);
console.log(`Database Name:      ${env.DB_NAME}`);
console.log(`Storage Root:       ${env.MEDIA_STORAGE_ROOT}`);
console.log(`Max Upload Size:    ${env.MAX_UPLOAD_SIZE_MB} MB`);
console.log(`Log Level:          ${env.LOG_LEVEL}`);

// Masked secret checks
const secretSet = Boolean(process.env.AUTH_SECRET && process.env.AUTH_SECRET.length >= 16);
console.log(
  `AUTH_SECRET Status: ${secretSet ? "✅ Configured (Secure)" : "⚠️ Not configured / using fallback"}`
);

const dbUrlSet = Boolean(process.env.DATABASE_URL);
console.log(
  `DATABASE_URL Status: ${dbUrlSet ? "✅ Configured" : "⚠️ Not set in current environment"}`
);

console.log("==========================================");
console.log("Environment validation complete.");
