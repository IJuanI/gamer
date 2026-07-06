import { ConsoleLogger } from "@nestjs/common";
/**
 * Logger that mirrors every line to BOTH stdout and a local file
 * (logs/api.log at the monorepo root) so AI agents / tooling can tail
 * results without scraping a TTY. Controlled by LOG_FILE env (default on).
 */
export declare class FileLogger extends ConsoleLogger {
    private stream;
    constructor();
    protected printMessages(messages: unknown[], context?: string, logLevel?: string): void;
}
