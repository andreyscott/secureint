import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaPostgresAdapter } from "@prisma/adapter-ppg";
import { PrismaClient } from "@/app/generated/prisma";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  // Prefer DIRECT_DATABASE_URL (standard postgres://) for adapter-pg
  // Fall back to DATABASE_URL with adapter-ppg for prisma+postgres://
  const directUrl = process.env.DIRECT_DATABASE_URL;
  const databaseUrl = process.env.DATABASE_URL ?? "";

  const adapter = directUrl
    ? new PrismaPg({ connectionString: directUrl })
    : new PrismaPostgresAdapter({ connectionString: databaseUrl });

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
