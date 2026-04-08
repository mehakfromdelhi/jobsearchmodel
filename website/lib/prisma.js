import { hasDatabase } from "@/lib/env";

let prismaClient;

export async function getPrisma() {
  if (!hasDatabase()) return null;
  if (prismaClient) return prismaClient;

  const { PrismaClient } = await import("@prisma/client");
  prismaClient = new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"]
  });

  return prismaClient;
}
