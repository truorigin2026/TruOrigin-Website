import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const workerPath = path.resolve(__dirname, "./child-worker.ts");

type WorkerResult = { allowed: boolean; retryAfterSeconds: number };

export function runWorker(args: {
  databaseUrl: string;
  key: string;
  limit: number;
  windowMs: number;
  failMode: "fail-open" | "fail-closed";
  requestCount: number;
}): Promise<WorkerResult[]> {
  return new Promise((resolve, reject) => {
    const child = spawn(
      process.execPath,
      [
        "--import",
        "tsx",
        workerPath,
        args.key,
        String(args.limit),
        String(args.windowMs),
        args.failMode,
        String(args.requestCount),
      ],
      {
        env: { ...process.env, DATABASE_URL: args.databaseUrl },
        stdio: ["ignore", "pipe", "pipe"],
      },
    );

    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => (stdout += chunk));
    child.stderr.on("data", (chunk) => (stderr += chunk));

    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`child-worker.ts exited with code ${code}. stderr:\n${stderr}`));
        return;
      }
      try {
        resolve(JSON.parse(stdout));
      } catch (error) {
        reject(new Error(`Failed to parse child-worker.ts output as JSON: ${stdout}\n${error}`));
      }
    });
  });
}
