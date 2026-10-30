// Run in its own, freshly-spawned Node process (see multi-process.test.ts
// and db-failure.test.ts) -- never imported directly by a test file. Two
// things can only be tested honestly from a real separate process:
//   1. That the rate limiter's counters are actually shared via Postgres,
//      not per-process memory -- the old in-memory Map would pass every
//      single-process test in this suite while still being broken exactly
//      this way on real multi-instance Vercel deployments.
//   2. A real, unrecoverable DB connection failure against the one shared
//      `prisma` singleton other test files/processes are actively using --
//      doing this in-process would corrupt their connection too.
//
// Usage: node --import tsx child-worker.ts <key> <limit> <windowMs> <fail-open|fail-closed> <requestCount>
// DATABASE_URL is read from this process's own environment (set by the
// parent before spawning), not from register-env.ts -- the DB-failure
// scenario deliberately needs an unreachable URL that register-env.ts's
// own schema-bootstrap step would immediately fail against.
import { checkRateLimit } from "../../lib/rate-limit";

async function main() {
  const [key, limitRaw, windowMsRaw, failMode, requestCountRaw] = process.argv.slice(2);
  const limit = Number(limitRaw);
  const windowMs = Number(windowMsRaw);
  const requestCount = Number(requestCountRaw);

  if (failMode !== "fail-open" && failMode !== "fail-closed") {
    throw new Error(`Invalid fail mode: ${failMode}`);
  }

  const results = await Promise.all(
    Array.from({ length: requestCount }, () => checkRateLimit(key, limit, windowMs, failMode)),
  );

  // Plain stdout, parsed by the parent test -- keep this the only line of
  // output so the parent doesn't need to filter log noise out of it.
  process.stdout.write(JSON.stringify(results));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
