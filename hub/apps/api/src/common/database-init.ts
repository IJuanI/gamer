import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class DatabaseInitializer {
  private readonly logger = new Logger(DatabaseInitializer.name);

  constructor(private readonly prisma: PrismaService) {}

  async verifyDatabase(): Promise<boolean> {
    try {
      this.logger.log("Verifying database connectivity...");
      await this.prisma.$queryRaw`SELECT 1`;
      this.logger.log("✓ Database verified and accessible");
      return true;
    } catch (error) {
      this.logger.error(`✗ Database verification failed: ${error}`);
      return false;
    }
  }

  async ensureTables(): Promise<void> {
    this.logger.log("Database tables managed by Prisma migrations");
    try {
      const result = await this.prisma.user.count();
      this.logger.debug(`✓ User table exists (${result} records)`);
    } catch (error) {
      this.logger.warn(`! Table verification skipped: ${error}`);
    }
  }
}
