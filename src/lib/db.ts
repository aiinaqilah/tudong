import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";  // ← ADD THIS

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// ← ADD THIS BLOCK
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,  // ← ADD THIS
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}

export default db;