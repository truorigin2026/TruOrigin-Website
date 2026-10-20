import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { resolveSslConfig } from "./db-connection";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("Missing DATABASE_URL. Set it in .env before using Prisma.");
}

// The real database (Supabase) always requires a verified TLS connection —
// rejectUnauthorized stays on for it. The only other thing this ever
// connects to is a loopback Postgres (local dev, or CI's ephemeral
// postgres:16 service container), which isn't configured for SSL at all;
// forcing rejectUnauthorized there just fails every connection
// (confirmed in CI: "the server does not support SSL connections").
// Scoped to hostname rather than NODE_ENV/CI env vars so it can't be
// accidentally toggled by an unrelated environment flag — nothing
// resolving to a real deployment is ever reachable via a loopback
// hostname. See lib/db-connection.ts for the (unit-tested) logic.
const adapter = new PrismaPg({
  connectionString,
  ssl: resolveSslConfig(connectionString),
});

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
