"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileLogger = void 0;
const common_1 = require("@nestjs/common");
const fs_1 = require("fs");
const path_1 = require("path");
/**
 * Logger that mirrors every line to BOTH stdout and a local file
 * (logs/api.log at the monorepo root) so AI agents / tooling can tail
 * results without scraping a TTY. Controlled by LOG_FILE env (default on).
 */
class FileLogger extends common_1.ConsoleLogger {
    stream = null;
    constructor() {
        super();
        const logFile = process.env.LOG_FILE ?? (0, path_1.join)(process.cwd(), "../../logs/api.log");
        try {
            (0, fs_1.mkdirSync)((0, path_1.join)(logFile, ".."), { recursive: true });
            this.stream = (0, fs_1.createWriteStream)(logFile, { flags: "a" });
        }
        catch {
            // If the path isn't writable, fall back to stdout-only silently.
            this.stream = null;
        }
    }
    printMessages(messages, context, logLevel) {
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
exports.FileLogger = FileLogger;
