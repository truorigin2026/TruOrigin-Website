import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { isDisposableTestModeActive, assertLoopbackDatabaseUrl } from "./test-env-guard";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("Missing DATABASE_URL. Set it in .env before using Prisma.");
}

// Second, independent layer (see lib/test-env-guard.ts): a disposable-
// test orchestrator already validates and constructs DATABASE_URL
// itself before spawning its test process, but this runs inside that
// SAME process regardless of whether the orchestrator's own check was
// somehow bypassed or a future suite forgets it. Inert whenever
// TRUORIGIN_TEST_MODE isn't set to "disposable-test" -- normal
// development, staging, and production behaviour is unchanged.
if (isDisposableTestModeActive()) {
  assertLoopbackDatabaseUrl(connectionString);
}

const adapter = new PrismaPg({
  connectionString,
  ssl: { rejectUnauthorized: true },
});

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
