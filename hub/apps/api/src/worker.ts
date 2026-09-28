/**
 * Cloudflare Workers entry point for GamER Hub API
 *
 * Wraps NestJS modules in a Hono HTTP handler for Workers runtime.
 * Database: D1 (via Prisma adapter)
 * Auth: Passport.js (adapted for Workers request/response)
 */

import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { PrismaClient } from "@prisma/client";
import { PrismaD1 } from "@prisma/adapter-d1";

// Import NestJS app modules (business logic layer)
import { AppModule } from "./app.module";
import { NestFactory } from "@nestjs/core";

interface Env {
  DB: D1Database;
  JWT_SECRET: string;
  DISCORD_CLIENT_ID?: string;
  DISCORD_CLIENT_SECRET?: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  FACEIT_API_KEY?: string;
  RIOT_API_KEY?: string;
  WEB_ORIGIN?: string;
  NODE_ENV?: string;
}

// Global app instance (created once per Worker)
let nestApp: any = null;

/**
 * Initialize Prisma client with D1 adapter
 */
function initPrisma(env: Env) {
  const adapter = new PrismaD1(env.DB);
  return new PrismaClient({ adapter });
}

/**
 * Initialize NestJS app (runs once on first request)
 */
async function initNestApp(env: Env, prisma: PrismaClient) {
  if (nestApp) return nestApp;

  // Create NestJS app without Express
  // Note: This requires adapting AppModule to inject Prisma instead of Firestore
  try {
    nestApp = await NestFactory.create(AppModule, {
      logger: false, // Disable default logging in Workers
    });

    // Override Firestore service with Prisma client
    // TODO: Create a Prisma service and inject it into modules
    nestApp.set("prisma", prisma);

    // Setup middleware
    const webOrigin = (env.WEB_ORIGIN || "").split(",").map((o) => o.trim()).filter(Boolean) || [
      "http://localhost:3000",
    ];

    // Note: NestJS middleware won't work directly on Workers
    // This is a limitation that requires rewriting middleware as Hono middleware
    nestApp.enableCors({
      origin: webOrigin,
      credentials: true,
    });

    return nestApp;
  } catch (error) {
    console.error("Failed to initialize NestJS app:", error);
    throw error;
  }
}

/**
 * Main Hono app
 */
const app = new Hono<{ Bindings: Env }>();

// Middleware
app.use("*", logger());

// CORS - simplified for Workers
app.use(
  "*",
  cors({
    origin: (origin) => {
      // Allow origins from WEB_ORIGIN env var
      return origin || "*";
    },
    credentials: true,
  })
);

/**
 * Health check endpoint
 */
app.get("/api/health", (c) => {
  return c.json({ status: "ok", environment: c.env.NODE_ENV || "unknown" });
});

/**
 * API routes
 *
 * TODO: Replace this with actual route handlers that call NestJS services
 * Current approach: Hono routes that directly call NestJS controllers
 *
 * For now, this is a placeholder that will be filled in as we
 * refactor each controller to work with the NestJS service layer.
 */
app.all("/api/*", async (c) => {
  const env = c.env as Env;
  const prisma = initPrisma(env);

  try {
    // Initialize NestJS app on first request
    const nest = await initNestApp(env, prisma);

    // TODO: Route requests to NestJS controllers
    // This will be implemented controller-by-controller:
    // - Auth (register, login, oauth, logout)
    // - Users (CRUD, profile)
    // - Teams (CRUD, members)
    // - Games (list, get)
    // - GameProfiles (CRUD)
    // - PlatformLinks (CRUD, verify)
    // - RecruitmentPosts (CRUD, search)
    // - Telemetry (log errors)
    // - Health (status)

    // Fallback: 501 Not Implemented
    return c.text("API route not yet implemented on Workers", 501);
  } catch (error) {
    console.error("API error:", error);
    return c.json(
      {
        statusCode: 500,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      500
    );
  }
});

/**
 * Catch-all for undefined routes
 */
app.all("*", (c) => {
  return c.json(
    {
      statusCode: 404,
      message: "Not found",
    },
    404
  );
});

/**
 * Export fetch handler for Cloudflare Workers
 */
export default app;
