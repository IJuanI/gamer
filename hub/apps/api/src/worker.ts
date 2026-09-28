import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { PrismaClient } from "@prisma/client";
import { PrismaD1 } from "@prisma/adapter-d1";

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

let prismaInstance: PrismaClient | null = null;

function getPrismaClient(env: Env): PrismaClient {
  if (!prismaInstance) {
    const adapter = new PrismaD1(env.DB);
    prismaInstance = new PrismaClient({ adapter });
  }
  return prismaInstance;
}

const app = new Hono<{ Bindings: Env }>();

app.use("*", logger());
app.use(
  "*",
  cors({
    origin: (origin) => origin || "*",
    credentials: true,
  })
);

app.get("/api/health", (c) => {
  return c.json({ status: "ok", environment: c.env.NODE_ENV || "unknown" });
});

app.all("/api/*", async (c) => {
  try {
    const env = c.env as Env;
    const prisma = getPrismaClient(env);

    // TODO: Implement route handlers
    // This will be filled in controller-by-controller:
    // - Auth: register, login, oauth, logout
    // - Users: CRUD
    // - Teams: CRUD
    // - Games: list, get
    // - GameProfiles: CRUD
    // - PlatformLinks: CRUD
    // - RecruitmentPosts: CRUD
    // - Telemetry: error logging

    return c.json(
      {
        statusCode: 501,
        message: "Route not yet implemented",
      },
      501
    );
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

app.all("*", (c) => {
  return c.json(
    {
      statusCode: 404,
      message: "Not found",
    },
    404
  );
});

export default app;
