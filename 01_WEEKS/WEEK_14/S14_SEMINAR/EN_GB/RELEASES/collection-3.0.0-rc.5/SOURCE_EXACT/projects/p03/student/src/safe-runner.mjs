import { execFile, spawn } from "node:child_process";
import { access } from "node:fs/promises";
import { join } from "node:path";
import { promisify } from "node:util";

const execute = promisify(execFile);
const allowed = new Set(["install", "audit", "build", "runtime"]);

export function createSafeRunner(evidence) {
  let active = 0;

  return Object.freeze({
    async run(name) {
      if (!allowed.has(name)) {
        throw Object.assign(new Error("Command is not allowlisted"), {
          code: "command_not_allowed",
        });
      }

      active += 1;
      try {
        return structuredClone(evidence.commands[name]);
      } finally {
        active -= 1;
      }
    },
    get diagnostics() {
      return Object.freeze({ active });
    },
  });
}

export function createCommandRunner({ projectRoot, timeoutMs = 15_000 }) {
  let active = 0;

  async function command(file, args) {
    try {
      const { stdout } = await execute(file, args, {
        cwd: projectRoot,
        timeout: timeoutMs,
        maxBuffer: 1_000_000,
      });
      return { ok: true, stdout };
    } catch (error) {
      return {
        ok: false,
        stdout: String(error.stdout ?? ""),
        toolError: error.code === "ENOENT" || error.killed,
      };
    }
  }

  async function runtime() {
    const child = spawn(process.execPath, ["dist/server.mjs"], {
      cwd: projectRoot,
      env: {
        ...process.env,
        PORT: "0",
        SESSION_SECRET: "review-only-secret",
      },
      stdio: ["ignore", "pipe", "pipe"],
    });

    try {
      const port = await new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error("runtime_timeout")), timeoutMs);
        child.once("error", reject);
        child.stdout.setEncoding("utf8");
        child.stdout.once("data", (line) => {
          clearTimeout(timer);
          try {
            resolve(JSON.parse(line).port);
          } catch {
            reject(new Error("invalid_startup_output"));
          }
        });
      });
      const response = await fetch(`http://127.0.0.1:${port}/health`, {
        signal: AbortSignal.timeout(timeoutMs),
      });
      const body = await response.json();
      return { ok: response.ok, healthStatus: response.status, body, closed: false };
    } catch {
      return { ok: false, healthStatus: null, body: null, closed: false };
    } finally {
      child.kill("SIGTERM");
      await new Promise((resolve) => {
        if (child.exitCode !== null) resolve();
        else child.once("exit", resolve);
      });
    }
  }

  return Object.freeze({
    async run(name) {
      if (!allowed.has(name)) {
        throw Object.assign(new Error("Command is not allowlisted"), {
          code: "command_not_allowed",
        });
      }

      active += 1;
      try {
        if (name === "install") {
          const result = await command("npm", ["ci", "--ignore-scripts"]);
          return { ok: result.ok, locked: result.ok };
        }
        if (name === "audit") {
          const result = await command("npm", ["audit", "--json", "--audit-level=moderate"]);
          try {
            const report = JSON.parse(result.stdout);
            const counts = report.metadata?.vulnerabilities ?? {};
            const vulnerabilities = Object.entries(counts).flatMap(
              ([severity, count]) =>
                Array(Number(count)).fill({ severity }),
            );
            return { ok: result.ok, vulnerabilities };
          } catch {
            return { ok: false, toolError: true, vulnerabilities: [] };
          }
        }
        if (name === "build") {
          const result = await command("npm", ["run", "build"]);
          let artifact = false;

          try {
            await access(join(projectRoot, "dist/server.mjs"));
            artifact = true;
          } catch {}

          return { ok: result.ok, artifacts: artifact ? ["dist/server.mjs"] : [] };
        }

        const result = await runtime();
        return { ...result, closed: true };
      } finally {
        active -= 1;
      }
    },
    get diagnostics() {
      return Object.freeze({ active });
    },
  });
}
