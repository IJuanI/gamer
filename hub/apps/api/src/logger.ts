import { ConsoleLogger } from "@nestjs/common";
import { createWriteStream, mkdirSync, type WriteStream } from "fs";
import { join } from "path";

/**
 * Logger that mirrors every line to BOTH stdout and a local file
 * (logs/api.log at the monorepo root) so AI agents / tooling can tail
 * results without scraping a TTY. Controlled by LOG_FILE env (default on).
 */
export class FileLogger extends ConsoleLogger {
  private stream: WriteStream | null = null;

  constructor() {
    super();
    const logFile = process.env.LOG_FILE ?? join(process.cwd(), "../../logs/api.log");
    try {
      mkdirSync(join(logFile, ".."), { recursive: true });
      this.stream = createWriteStream(logFile, { flags: "a" });
    } catch {
      // If the path isn't writable, fall back to stdout-only silently.
      this.stream = null;
    }
  }

  protected printMessages(
    messages: unknown[],
    context?: string,
    logLevel?: string,
  ): void {
    // @ts-expect-error - base signature varies across Nest minor versions
    super.printMessages(messages, context, logLevel);
    if (this.stream) {
      const ts = new Date().toISOString();
      for (const m of messages) {
        const text = typeof m === "string" ? m : JSON.stringify(m);
        this.stream.write(`${ts} [${logLevel ?? "log"}] ${context ? `[${context}] ` : ""}${text}\n`);
      }
    }
  }
}
