import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkDatabase() {
  console.log("Checking database connectivity to MariaDB/MySQL...");
  try {
    // Run simple lightweight query
    await prisma.$queryRaw`SELECT 1 as is_alive`;
    console.log("✅ Database connection successful! MariaDB/MySQL is reachable.");
  } catch (error: any) {
    console.warn("⚠️ Database connection check failed or database is not yet running.");
    console.warn("Reason:", error.message || error);
    console.log(
      "\nNote: For development, ensure MariaDB/MySQL is started or run migrations once accessible."
    );
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase().catch(() => {
  // Exit gracefully without failing build or script
  process.exit(0);
});
