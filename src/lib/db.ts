import { PrismaClient } from "@prisma/client";
import { copyFileSync, existsSync } from "fs";
import path from "path";

function resolveDatabaseUrl() {
  if (process.env.VERCEL) {
    const tmp = "/tmp/ajaia.db";
    const seed = path.join(process.cwd(), "prisma", "seeded.db");
    if (!existsSync(tmp) && existsSync(seed)) {
      copyFileSync(seed, tmp);
    }
    process.env.DATABASE_URL = `file:${tmp}`;
  }
}

resolveDatabaseUrl();

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
