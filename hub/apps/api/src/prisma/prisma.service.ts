import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { PrismaD1 } from "@prisma/adapter-d1";

/**
 * Prisma service for database access
 * 
 * In Workers environment: Uses D1 adapter
 * In local dev: Uses SQLite adapter (via wrangler dev)
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    // In Workers, DB binding comes from Wrangler environment
    // In local dev, Wrangler provides a D1 binding to a local SQLite database
    const db = (globalThis as any).DB;

    if (db) {
      // Workers environment: use D1 adapter
      super({
        adapter: new PrismaD1(db),
      });
    } else {
      // Fallback for local testing (requires DATABASE_URL env var)
      super();
    }
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
