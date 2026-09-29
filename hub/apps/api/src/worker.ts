import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import { PrismaClient } from "@prisma/client";
import { PrismaD1 } from "@prisma/adapter-d1";
import * as jwt from "jsonwebtoken";

interface Env {
  DB: any;
  JWT_SECRET: string;
  DISCORD_CLIENT_ID?: string;
  DISCORD_CLIENT_SECRET?: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  FACEIT_API_KEY?: string;
  RIOT_API_KEY?: string;
  WEB_ORIGIN?: string;
  OAUTH_CALLBACK_BASE?: string;
  NODE_ENV?: string;
  PASSWORD_PBKDF2_ITERATIONS?: string;
}

let prismaInstance: PrismaClient | null = null;
let lastEnv: any = null;

function getPrismaClient(env: Env): PrismaClient {
  // Create a new instance if env changes (e.g., between production and preview)
  if (!prismaInstance || lastEnv !== env.DB) {
    prismaInstance = new PrismaClient({ adapter: new PrismaD1(env.DB) } as any);
    lastEnv = env.DB;
  }
  return prismaInstance;
}

// Free-plan Workers get 10 ms CPU: bcryptjs (pure JS) can't fit, native PBKDF2 can.
// Iterations are stored in each hash, so DEFAULT_PBKDF2_ITERATIONS can change later.
// Measured in Node: 10k ≈ 2.8ms, but Workers V8 is likely slower.
// Using 10k as conservative estimate to stay under 10ms budget.
const DEFAULT_PBKDF2_ITERATIONS = 10000;

const toB64 = (b: ArrayBuffer | Uint8Array) => btoa(String.fromCharCode(...new Uint8Array(b)));
const fromB64 = (s: string) => Uint8Array.from(atob(s), (ch) => ch.charCodeAt(0));

async function pbkdf2(password: string, salt: Uint8Array, iterations: number): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: salt as BufferSource, iterations }, key, 256);
  return new Uint8Array(bits);
}

async function hashPassword(password: string, env: Env): Promise<string> {
  const iterations = Number(env.PASSWORD_PBKDF2_ITERATIONS) || DEFAULT_PBKDF2_ITERATIONS;
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return `pbkdf2$sha256$${iterations}$${toB64(salt)}$${toB64(await pbkdf2(password, salt, iterations))}`;
}

async function verifyPassword(password: string, stored: string): Promise<boolean> {
  if (!stored.startsWith("pbkdf2$")) return false;
  const [, , iterations, salt, expected] = stored.split("$");
  const actual = await pbkdf2(password, fromB64(salt), Number(iterations));
  const want = fromB64(expected);
  let diff = actual.length ^ want.length;
  for (let i = 0; i < actual.length; i++) diff |= actual[i] ^ (want[i] ?? 0);
  return diff === 0;
}

const ACCESS_TOKEN_EXPIRES_IN = "15m";
const REFRESH_TOKEN_EXPIRES_IN = "90d";
const ACCESS_TOKEN_MAX_AGE = 15 * 60;
const REFRESH_TOKEN_MAX_AGE = 90 * 24 * 60 * 60;

function signTokens(userId: string, secret: string) {
  return {
    accessToken: jwt.sign({ sub: userId, type: "access" }, secret, { expiresIn: ACCESS_TOKEN_EXPIRES_IN }),
    refreshToken: jwt.sign({ sub: userId, type: "refresh" }, secret, { expiresIn: REFRESH_TOKEN_EXPIRES_IN }),
  };
}

function setSessionCookies(c: any, tokens: { accessToken: string; refreshToken: string }) {
  const isProduction = c.env.NODE_ENV === "production";
  setCookie(c, "access_token", tokens.accessToken, {
    httpOnly: true,
    sameSite: "Lax",
    secure: isProduction,
    maxAge: ACCESS_TOKEN_MAX_AGE,
    path: "/",
  });
  setCookie(c, "refresh_token", tokens.refreshToken, {
    httpOnly: true,
    sameSite: "Lax",
    secure: isProduction,
    maxAge: REFRESH_TOKEN_MAX_AGE,
    path: "/",
  });
}

function clearSessionCookies(c: any) {
  deleteCookie(c, "access_token", { path: "/" });
  deleteCookie(c, "refresh_token", { path: "/" });
}

function requireUserId(c: any, type: "access" | "refresh" = "access"): string | null {
  const token = getCookie(c, type === "access" ? "access_token" : "refresh_token");
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, c.env.JWT_SECRET) as any;
    if (decoded.type !== type) return null;
    return decoded.sub;
  } catch {
    return null;
  }
}

function toPublicUser(user: any) {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    role: user.role,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt instanceof Date ? user.createdAt.toISOString() : user.createdAt,
  };
}

async function findOrCreateOAuthUser(
  prisma: PrismaClient,
  params: { provider: string; providerAccountId: string; email: string; displayName: string; avatarUrl?: string | null },
) {
  const existing = await prisma.account.findUnique({
    where: { provider_providerAccountId: { provider: params.provider, providerAccountId: params.providerAccountId } },
    include: { user: true },
  });
  if (existing) return existing.user;

  const email = params.email.toLowerCase();
  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    user = await prisma.user.create({
      data: { email, displayName: params.displayName, avatarUrl: params.avatarUrl ?? null, role: "MEMBER" },
    });
  }

  await prisma.account.create({
    data: { provider: params.provider, providerAccountId: params.providerAccountId, userId: user.id },
  });

  return user;
}

function webOrigin(env: Env): string {
  return (env.WEB_ORIGIN ?? "http://localhost:3000").split(",")[0].trim();
}

function callbackBase(env: Env): string {
  return env.OAUTH_CALLBACK_BASE ?? "http://localhost:4000";
}

function randomState(): string {
  return crypto.randomUUID();
}

const app = new Hono<{ Bindings: Env }>();

app.use("*", logger());
app.use("*", cors({
  origin: (origin, c) => {
    const allowed = (c.env.WEB_ORIGIN ?? "").split(",").map((o: string) => o.trim()).filter(Boolean);
    if (!origin) return allowed[0] || "*";
    if (allowed.includes(origin)) return origin;
    // Allow preview deployments on workers.dev
    if (origin.includes(".workers.dev")) return origin;
    return allowed[0] || "*";
  },
  credentials: true,
}));

// Health check
app.get("/api/health", (c) => {
  return c.json({
    status: "ok",
    environment: c.env.NODE_ENV || "unknown",
    timestamp: new Date().toISOString(),
  });
});

// Telemetry: Error logging from frontend
const handleClientTelemetry = async (c: any) => {
  try {
    const { severity = "ERROR", message, stack, url, context, userId, metadata } = await c.req.json();
    const logLevel = severity === "INFO" ? "log" : severity === "WARNING" ? "warn" : "error";
    console[logLevel]("[client]", JSON.stringify({
      severity,
      message,
      stack,
      url,
      context,
      userId,
      metadata,
      userAgent: c.req.header("user-agent"),
      timestamp: new Date().toISOString(),
    }));
    return c.json({ statusCode: 200, message: "Telemetry logged" });
  } catch (error) {
    console.error("[client] telemetry endpoint failure:", error);
    return c.json({ statusCode: 500, message: "Failed to log telemetry" }, 500);
  }
};
app.post("/api/telemetry", handleClientTelemetry);
// Backwards compatibility for old endpoints
app.post("/api/telemetry/error", handleClientTelemetry);
app.post("/api/telemetry/errors", handleClientTelemetry);

// Auth: Register
app.post("/api/auth/register", async (c) => {
  try {
    const prisma = getPrismaClient(c.env);
    const { email, displayName, password } = await c.req.json();

    if (!email || !displayName || !password) {
      return c.json({ statusCode: 400, message: "Missing fields" }, 400);
    }

    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) {
      return c.json({ statusCode: 409, message: "Ya existe una cuenta con ese email" }, 409);
    }

    const passwordHash = await hashPassword(password, c.env);
    const user = await prisma.user.create({
      data: { email: email.toLowerCase(), displayName, passwordHash, role: "MEMBER" },
    });

    setSessionCookies(c, signTokens(user.id, c.env.JWT_SECRET));
    return c.json({ user: toPublicUser(user) });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("Register error:", errorMsg, error);
    return c.json({ statusCode: 500, message: `Server error: ${errorMsg}` }, 500);
  }
});

// Auth: Login
app.post("/api/auth/login", async (c) => {
  try {
    const prisma = getPrismaClient(c.env);
    const { email, password } = await c.req.json();

    if (!email || !password) {
      return c.json({ statusCode: 400, message: "Missing fields" }, 400);
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user || !user.passwordHash) {
      return c.json({ statusCode: 401, message: "Credenciales inválidas" }, 401);
    }

    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) {
      return c.json({ statusCode: 401, message: "Credenciales inválidas" }, 401);
    }

    setSessionCookies(c, signTokens(user.id, c.env.JWT_SECRET));
    return c.json({ user: toPublicUser(user) });
  } catch (error) {
    console.error("Login error:", error);
    return c.json({ statusCode: 500, message: "Server error" }, 500);
  }
});

// Auth: Refresh
app.post("/api/auth/refresh", async (c) => {
  try {
    const userId = requireUserId(c, "refresh");
    if (!userId) return c.json({ statusCode: 401, message: "Invalid refresh token" }, 401);

    const prisma = getPrismaClient(c.env);
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return c.json({ statusCode: 401, message: "Invalid refresh token" }, 401);

    setSessionCookies(c, signTokens(user.id, c.env.JWT_SECRET));
    return c.json({ user: toPublicUser(user) });
  } catch (error) {
    console.error("Refresh error:", error);
    return c.json({ statusCode: 500, message: "Server error" }, 500);
  }
});

// Auth: Logout
app.post("/api/auth/logout", (c) => {
  clearSessionCookies(c);
  return c.json({ ok: true });
});

// Auth: Me
app.get("/api/auth/me", async (c) => {
  try {
    const userId = requireUserId(c);
    if (!userId) return c.json({ statusCode: 401, message: "Unauthorized" }, 401);

    const prisma = getPrismaClient(c.env);
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return c.json({ statusCode: 401, message: "Unauthorized" }, 401);

    return c.json({ user: toPublicUser(user) });
  } catch (error) {
    console.error("Me error:", error);
    return c.json({ statusCode: 500, message: "Server error" }, 500);
  }
});

// Auth: Delete account
app.delete("/api/me", async (c) => {
  try {
    const userId = requireUserId(c);
    if (!userId) return c.json({ statusCode: 401, message: "Unauthorized" }, 401);

    const prisma = getPrismaClient(c.env);
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return c.json({ statusCode: 401, message: "Unauthorized" }, 401);

    // Find all teams this user belongs to (before any deletes)
    const userTeams = await prisma.teamMember.findMany({
      where: { userId },
      include: { team: { include: { members: true } } }
    });

    // Find teams where user is the only member
    const teamsToDelete: string[] = [];
    for (const teamMember of userTeams) {
      if (teamMember.team.members.length === 1) {
        teamsToDelete.push(teamMember.team.id);
      }
    }

    // Delete TeamMembers for teams being deleted (breaks foreign key references)
    if (teamsToDelete.length > 0) {
      await prisma.teamMember.deleteMany({
        where: { teamId: { in: teamsToDelete } }
      });
    }

    // Delete recruitment posts for teams being deleted (will set teamId to null, not delete)
    // But we want to delete them, so do it explicitly
    await prisma.recruitmentPost.deleteMany({
      where: { teamId: { in: teamsToDelete } }
    });

    // Delete the teams
    if (teamsToDelete.length > 0) {
      await prisma.team.deleteMany({
        where: { id: { in: teamsToDelete } }
      });
    }

    // Delete user's game profiles
    await prisma.gameProfile.deleteMany({ where: { userId } });

    // Delete user's recruitment posts (if authored by this user)
    await prisma.recruitmentPost.deleteMany({ where: { authorId: userId } });

    // Delete user (cascade delete will handle remaining TeamMembers)
    try {
      await prisma.user.delete({ where: { id: userId } });
    } catch (e) {
      console.error("Failed to delete user after cleanup:", {
        userId,
        error: e instanceof Error ? e.message : String(e),
        teamsDeleted: teamsToDelete.length
      });
      throw e;
    }

    // Clear session cookies
    clearSessionCookies(c);
    return c.json({ ok: true });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("Delete account error:", errorMsg);
    return c.json({ statusCode: 500, message: `Server error: ${errorMsg}` }, 500);
  }
});

// Users: List (admin only)
app.get("/api/users", async (c) => {
  try {
    const userId = requireUserId(c);
    if (!userId) return c.json({ statusCode: 401, message: "Unauthorized" }, 401);

    const prisma = getPrismaClient(c.env);
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== "ADMIN") {
      return c.json({ statusCode: 403, message: "Forbidden" }, 403);
    }

    const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });
    return c.json({ users: users.map(toPublicUser) });
  } catch (error) {
    console.error("List users error:", error);
    return c.json({ statusCode: 500, message: "Server error" }, 500);
  }
});

// Auth: Discord OAuth — initiate
app.get("/api/auth/discord", (c) => {
  if (!c.env.DISCORD_CLIENT_ID || !c.env.DISCORD_CLIENT_SECRET) {
    return c.json({ statusCode: 404, message: "Not found" }, 404);
  }
  const state = randomState();
  setCookie(c, "oauth_state", state, {
    httpOnly: true,
    sameSite: "Lax",
    secure: c.env.NODE_ENV === "production",
    maxAge: 300,
    path: "/",
  });

  const url = new URL("https://discord.com/api/oauth2/authorize");
  url.searchParams.set("client_id", c.env.DISCORD_CLIENT_ID);
  url.searchParams.set("redirect_uri", `${callbackBase(c.env)}/api/auth/discord/callback`);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "identify email");
  url.searchParams.set("state", state);
  return c.redirect(url.toString());
});

// Auth: Discord OAuth — callback
app.get("/api/auth/discord/callback", async (c) => {
  try {
    if (!c.env.DISCORD_CLIENT_ID || !c.env.DISCORD_CLIENT_SECRET) {
      return c.json({ statusCode: 404, message: "Not found" }, 404);
    }
    const code = c.req.query("code");
    const state = c.req.query("state");
    const expectedState = getCookie(c, "oauth_state");
    deleteCookie(c, "oauth_state", { path: "/" });

    if (!code || !state || state !== expectedState) {
      return c.json({ statusCode: 400, message: "Invalid OAuth state" }, 400);
    }

    const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: c.env.DISCORD_CLIENT_ID,
        client_secret: c.env.DISCORD_CLIENT_SECRET,
        grant_type: "authorization_code",
        code,
        redirect_uri: `${callbackBase(c.env)}/api/auth/discord/callback`,
      }),
    });
    if (!tokenRes.ok) throw new Error(`Discord token exchange failed: ${tokenRes.status}`);
    const { access_token } = (await tokenRes.json()) as { access_token: string };

    const profileRes = await fetch("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    if (!profileRes.ok) throw new Error(`Discord profile fetch failed: ${profileRes.status}`);
    const profile = (await profileRes.json()) as any;

    const avatarUrl = profile.avatar
      ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`
      : null;

    const prisma = getPrismaClient(c.env);
    const user = await findOrCreateOAuthUser(prisma, {
      provider: "discord",
      providerAccountId: profile.id,
      email: profile.email ?? `${profile.id}@discord.local`,
      displayName: profile.global_name ?? profile.username ?? "GamER",
      avatarUrl,
    });

    setSessionCookies(c, signTokens(user.id, c.env.JWT_SECRET));
    return c.redirect(`${webOrigin(c.env)}/dashboard`);
  } catch (error) {
    console.error("Discord OAuth error:", error);
    return c.redirect(`${webOrigin(c.env)}/login?error=oauth_failed`);
  }
});

// Auth: Google OAuth — initiate
app.get("/api/auth/google", (c) => {
  if (!c.env.GOOGLE_CLIENT_ID || !c.env.GOOGLE_CLIENT_SECRET) {
    return c.json({ statusCode: 404, message: "Not found" }, 404);
  }
  const state = randomState();
  setCookie(c, "oauth_state", state, {
    httpOnly: true,
    sameSite: "Lax",
    secure: c.env.NODE_ENV === "production",
    maxAge: 300,
    path: "/",
  });

  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", c.env.GOOGLE_CLIENT_ID);
  url.searchParams.set("redirect_uri", `${callbackBase(c.env)}/api/auth/google/callback`);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "email profile");
  url.searchParams.set("state", state);
  return c.redirect(url.toString());
});

// Auth: Google OAuth — callback
app.get("/api/auth/google/callback", async (c) => {
  try {
    if (!c.env.GOOGLE_CLIENT_ID || !c.env.GOOGLE_CLIENT_SECRET) {
      return c.json({ statusCode: 404, message: "Not found" }, 404);
    }
    const code = c.req.query("code");
    const state = c.req.query("state");
    const expectedState = getCookie(c, "oauth_state");
    deleteCookie(c, "oauth_state", { path: "/" });

    if (!code || !state || state !== expectedState) {
      return c.json({ statusCode: 400, message: "Invalid OAuth state" }, 400);
    }

    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: c.env.GOOGLE_CLIENT_ID,
        client_secret: c.env.GOOGLE_CLIENT_SECRET,
        grant_type: "authorization_code",
        code,
        redirect_uri: `${callbackBase(c.env)}/api/auth/google/callback`,
      }),
    });
    if (!tokenRes.ok) throw new Error(`Google token exchange failed: ${tokenRes.status}`);
    const { access_token } = (await tokenRes.json()) as { access_token: string };

    const profileRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    if (!profileRes.ok) throw new Error(`Google profile fetch failed: ${profileRes.status}`);
    const profile = (await profileRes.json()) as any;

    const prisma = getPrismaClient(c.env);
    const user = await findOrCreateOAuthUser(prisma, {
      provider: "google",
      providerAccountId: profile.id,
      email: profile.email ?? `${profile.id}@google.local`,
      displayName: profile.name ?? "GamER",
      avatarUrl: profile.picture ?? null,
    });

    setSessionCookies(c, signTokens(user.id, c.env.JWT_SECRET));
    return c.redirect(`${webOrigin(c.env)}/dashboard`);
  } catch (error) {
    console.error("Google OAuth error:", error);
    return c.redirect(`${webOrigin(c.env)}/login?error=oauth_failed`);
  }
});

// Games: List
app.get("/api/games", async (c) => {
  try {
    const prisma = getPrismaClient(c.env);
    const games = await prisma.game.findMany({ orderBy: { name: "asc" } });
    return c.json(games.map((g) => ({ id: g.id, slug: g.slug, name: g.name, iconUrl: g.iconUrl, rankVerifiable: g.rankVerifiable })));
  } catch (error) {
    console.error("List games error:", error);
    return c.json({ statusCode: 500, message: "Server error" }, 500);
  }
});

// Games: Get by ID
app.get("/api/games/:id", async (c) => {
  try {
    const prisma = getPrismaClient(c.env);
    const game = await prisma.game.findUnique({ where: { id: c.req.param("id") } });
    if (!game) return c.json({ statusCode: 404, message: "Not found" }, 404);
    return c.json({ id: game.id, slug: game.slug, name: game.name, iconUrl: game.iconUrl, rankVerifiable: game.rankVerifiable });
  } catch (error) {
    console.error("Get game error:", error);
    return c.json({ statusCode: 500, message: "Server error" }, 500);
  }
});

// Games: Get by slug
app.get("/api/games/slug/:slug", async (c) => {
  try {
    const prisma = getPrismaClient(c.env);
    const game = await prisma.game.findUnique({ where: { slug: c.req.param("slug") } });
    if (!game) return c.json({ statusCode: 404, message: "Not found" }, 404);
    return c.json({ id: game.id, slug: game.slug, name: game.name, iconUrl: game.iconUrl, rankVerifiable: game.rankVerifiable });
  } catch (error) {
    console.error("Get game by slug error:", error);
    return c.json({ statusCode: 500, message: "Server error" }, 500);
  }
});

// Users: Get by ID
app.get("/api/users/:id", async (c) => {
  try {
    const prisma = getPrismaClient(c.env);
    const user = await prisma.user.findUnique({ where: { id: c.req.param("id") } });
    if (!user) return c.json({ statusCode: 404, message: "Not found" }, 404);
    return c.json(toPublicUser(user));
  } catch (error) {
    console.error("Get user error:", error);
    return c.json({ statusCode: 500, message: "Server error" }, 500);
  }
});

// Users: Update
app.patch("/api/users/:id", async (c) => {
  try {
    const userId = requireUserId(c);
    if (!userId) return c.json({ statusCode: 401, message: "Unauthorized" }, 401);

    const targetId = c.req.param("id");
    if (userId !== targetId) return c.json({ statusCode: 403, message: "Forbidden" }, 403);

    const prisma = getPrismaClient(c.env);
    const { displayName, avatarUrl } = await c.req.json();
    const user = await prisma.user.update({
      where: { id: targetId },
      data: { ...(displayName && { displayName }), ...(avatarUrl !== undefined && { avatarUrl }) },
    });

    return c.json(toPublicUser(user));
  } catch (error) {
    console.error("Update user error:", error);
    return c.json({ statusCode: 500, message: "Server error" }, 500);
  }
});

// Teams: List
app.get("/api/teams", async (c) => {
  try {
    const prisma = getPrismaClient(c.env);
    const gameId = c.req.query("gameId");
    const teams = await prisma.team.findMany({
      where: gameId ? { gameId } : undefined,
      include: { game: true, members: { include: { user: true } } }
    });

    // Clean up empty teams (teams with 0 members)
    const emptyTeamIds = teams.filter((t) => t.members.length === 0).map((t) => t.id);
    if (emptyTeamIds.length > 0) {
      await prisma.recruitmentPost.deleteMany({ where: { teamId: { in: emptyTeamIds } } });
      await prisma.team.deleteMany({ where: { id: { in: emptyTeamIds } } });
    }

    // Return only teams with members
    const filledTeams = teams.filter((t) => t.members.length > 0);
    return c.json(filledTeams.map((t) => ({
      id: t.id,
      name: t.name,
      tag: t.tag,
      logoUrl: t.logoUrl,
      bio: t.bio,
      game: { id: t.game.id, slug: t.game.slug, name: t.game.name, iconUrl: t.game.iconUrl, rankVerifiable: t.game.rankVerifiable },
      members: t.members.map((m) => ({ id: m.id, userId: m.userId, displayName: m.user.displayName, avatarUrl: m.user.avatarUrl, role: m.role, joinedAt: m.joinedAt.toISOString() })),
      createdAt: t.createdAt.toISOString()
    })));
  } catch (error) {
    console.error("List teams error:", error);
    return c.json({ statusCode: 500, message: "Server error" }, 500);
  }
});

// Teams: Get by ID
app.get("/api/teams/:id", async (c) => {
  try {
    const prisma = getPrismaClient(c.env);
    const team = await prisma.team.findUnique({
      where: { id: c.req.param("id") },
      include: { game: true, members: { include: { user: true } } }
    });
    if (!team) return c.json({ statusCode: 404, message: "Not found" }, 404);
    return c.json({
      id: team.id,
      name: team.name,
      tag: team.tag,
      logoUrl: team.logoUrl,
      bio: team.bio,
      game: { id: team.game.id, slug: team.game.slug, name: team.game.name, iconUrl: team.game.iconUrl, rankVerifiable: team.game.rankVerifiable },
      members: team.members.map((m) => ({ id: m.id, userId: m.userId, displayName: m.user.displayName, avatarUrl: m.user.avatarUrl, role: m.role, joinedAt: m.joinedAt.toISOString() })),
      createdAt: team.createdAt.toISOString()
    });
  } catch (error) {
    console.error("Get team error:", error);
    return c.json({ statusCode: 500, message: "Server error" }, 500);
  }
});

// Teams: Create
app.post("/api/teams", async (c) => {
  try {
    const userId = requireUserId(c);
    if (!userId) return c.json({ statusCode: 401, message: "Unauthorized" }, 401);

    const prisma = getPrismaClient(c.env);
    const { gameId, name, tag, bio } = await c.req.json();

    const existing = await prisma.team.findFirst({ where: { gameId, name } });
    if (existing) return c.json({ statusCode: 409, message: "Team already exists" }, 409);

    const team = await prisma.team.create({
      data: { gameId, name, tag: tag || null, bio: bio || null, members: { create: { userId, role: "CAPTAIN" } } },
      include: { members: true },
    });

    return c.json({ id: team.id, name: team.name, gameId: team.gameId, members: team.members.length, createdAt: team.createdAt.toISOString() });
  } catch (error) {
    console.error("Create team error:", error);
    return c.json({ statusCode: 500, message: "Server error" }, 500);
  }
});

// Teams: Update
app.patch("/api/teams/:id", async (c) => {
  try {
    const userId = requireUserId(c);
    if (!userId) return c.json({ statusCode: 401, message: "Unauthorized" }, 401);

    const prisma = getPrismaClient(c.env);
    const teamId = c.req.param("id");

    const team = await prisma.team.findUnique({ where: { id: teamId }, include: { members: true } });
    if (!team) return c.json({ statusCode: 404, message: "Not found" }, 404);

    const isCaptain = team.members.some((m) => m.userId === userId && m.role === "CAPTAIN");
    if (!isCaptain) return c.json({ statusCode: 403, message: "Forbidden" }, 403);

    const { name, tag, bio } = await c.req.json();
    const updated = await prisma.team.update({
      where: { id: teamId },
      data: { ...(name && { name }), ...(tag !== undefined && { tag }), ...(bio !== undefined && { bio }) },
      include: { members: true },
    });

    return c.json({ id: updated.id, name: updated.name, gameId: updated.gameId, members: updated.members.length, createdAt: updated.createdAt.toISOString() });
  } catch (error) {
    console.error("Update team error:", error);
    return c.json({ statusCode: 500, message: "Server error" }, 500);
  }
});

// Teams: Delete
app.delete("/api/teams/:id", async (c) => {
  try {
    const userId = requireUserId(c);
    if (!userId) return c.json({ statusCode: 401, message: "Unauthorized" }, 401);

    const prisma = getPrismaClient(c.env);
    const teamId = c.req.param("id");

    const team = await prisma.team.findUnique({ where: { id: teamId }, include: { members: true } });
    if (!team) return c.json({ statusCode: 404, message: "Not found" }, 404);

    const isCaptain = team.members.some((m) => m.userId === userId && m.role === "CAPTAIN");
    if (!isCaptain) return c.json({ statusCode: 403, message: "Forbidden" }, 403);

    // Delete recruitment posts from this team
    await prisma.recruitmentPost.deleteMany({ where: { teamId } });
    // Delete all team members
    await prisma.teamMember.deleteMany({ where: { teamId } });
    // Delete the team
    await prisma.team.delete({ where: { id: teamId } });

    return c.json({ ok: true });
  } catch (error) {
    console.error("Delete team error:", error);
    return c.json({ statusCode: 500, message: "Server error" }, 500);
  }
});

// Teams: Update Member Role
app.patch("/api/teams/:id/members/:memberId", async (c) => {
  try {
    const userId = requireUserId(c);
    if (!userId) return c.json({ statusCode: 401, message: "Unauthorized" }, 401);

    const prisma = getPrismaClient(c.env);
    const teamId = c.req.param("id");
    const memberId = c.req.param("memberId");

    const team = await prisma.team.findUnique({ where: { id: teamId }, include: { members: true } });
    if (!team) return c.json({ statusCode: 404, message: "Not found" }, 404);

    const isCaptain = team.members.some((m) => m.userId === userId && m.role === "CAPTAIN");
    if (!isCaptain) return c.json({ statusCode: 403, message: "Forbidden" }, 403);

    const member = await prisma.teamMember.findUnique({ where: { id: memberId } });
    if (!member || member.teamId !== teamId) return c.json({ statusCode: 404, message: "Not found" }, 404);

    const { role } = await c.req.json();
    if (role !== "CAPTAIN" && role !== "MEMBER") {
      return c.json({ statusCode: 400, message: "Invalid role" }, 400);
    }

    // If promoting to CAPTAIN, demote current captain (only one captain per team)
    if (role === "CAPTAIN") {
      const currentCaptain = team.members.find((m) => m.role === "CAPTAIN");
      if (currentCaptain && currentCaptain.id !== memberId) {
        await prisma.teamMember.update({
          where: { id: currentCaptain.id },
          data: { role: "MEMBER" }
        });
      }
    }

    const updated = await prisma.teamMember.update({
      where: { id: memberId },
      data: { role }
    });

    return c.json({ id: updated.id, role: updated.role });
  } catch (error) {
    console.error("Update team member role error:", error);
    return c.json({ statusCode: 500, message: "Server error" }, 500);
  }
});

// Teams: Remove Member
app.delete("/api/teams/:id/members/:memberId", async (c) => {
  try {
    const userId = requireUserId(c);
    if (!userId) return c.json({ statusCode: 401, message: "Unauthorized" }, 401);

    const prisma = getPrismaClient(c.env);
    const teamId = c.req.param("id");
    const memberId = c.req.param("memberId");

    const team = await prisma.team.findUnique({ where: { id: teamId }, include: { members: true } });
    if (!team) return c.json({ statusCode: 404, message: "Not found" }, 404);

    const member = await prisma.teamMember.findUnique({ where: { id: memberId } });
    if (!member || member.teamId !== teamId) return c.json({ statusCode: 404, message: "Not found" }, 404);

    // Allow captain to remove any member, or member to remove themselves
    const isCaptain = team.members.some((m) => m.userId === userId && m.role === "CAPTAIN");
    const isSelf = member.userId === userId;
    if (!isCaptain && !isSelf) return c.json({ statusCode: 403, message: "Forbidden" }, 403);

    // If removing the captain, promote the oldest member to captain
    if (member.role === "CAPTAIN") {
      const oldestMember = team.members
        .filter((m) => m.id !== memberId)
        .sort((a, b) => a.joinedAt.getTime() - b.joinedAt.getTime())[0];

      if (oldestMember) {
        await prisma.teamMember.update({
          where: { id: oldestMember.id },
          data: { role: "CAPTAIN" }
        });
      }
    }

    // Remove the member
    await prisma.teamMember.delete({ where: { id: memberId } });

    // If team now has 0 members, delete it and its posts
    const remaining = await prisma.teamMember.count({ where: { teamId } });
    if (remaining === 0) {
      await prisma.recruitmentPost.deleteMany({ where: { teamId } });
      await prisma.team.delete({ where: { id: teamId } });
    }

    return c.json({ ok: true });
  } catch (error) {
    console.error("Remove team member error:", error);
    return c.json({ statusCode: 500, message: "Server error" }, 500);
  }
});

// Recruitment Posts: List
app.get("/api/recruitment-posts", async (c) => {
  try {
    const prisma = getPrismaClient(c.env);
    const gameId = c.req.query("gameId");
    const type = c.req.query("type");
    const where: any = { isOpen: true };
    if (gameId) where.gameId = gameId;
    if (type) where.type = type;

    const posts = await prisma.recruitmentPost.findMany({
      where,
      include: { author: true, game: true, team: true },
      orderBy: { createdAt: "desc" },
      take: 50
    });
    return c.json(posts.map((p) => ({
      id: p.id,
      type: p.type,
      author: { id: p.author.id, displayName: p.author.displayName, avatarUrl: p.author.avatarUrl },
      game: { id: p.game.id, slug: p.game.slug, name: p.game.name, iconUrl: p.game.iconUrl, rankVerifiable: p.game.rankVerifiable },
      team: p.team ? { id: p.team.id, name: p.team.name, tag: p.team.tag } : null,
      title: p.title,
      body: p.body,
      isOpen: p.isOpen,
      createdAt: p.createdAt.toISOString()
    })));
  } catch (error) {
    console.error("List posts error:", error);
    return c.json({ statusCode: 500, message: "Server error" }, 500);
  }
});

// Recruitment Posts: Get by ID
app.get("/api/recruitment-posts/:id", async (c) => {
  try {
    const prisma = getPrismaClient(c.env);
    const post = await prisma.recruitmentPost.findUnique({
      where: { id: c.req.param("id") },
      include: { author: true, game: true, team: true },
    });
    if (!post) return c.json({ statusCode: 404, message: "Not found" }, 404);
    return c.json({
      id: post.id,
      type: post.type,
      author: { id: post.author.id, displayName: post.author.displayName, avatarUrl: post.author.avatarUrl },
      game: { id: post.game.id, slug: post.game.slug, name: post.game.name, iconUrl: post.game.iconUrl, rankVerifiable: post.game.rankVerifiable },
      team: post.team ? { id: post.team.id, name: post.team.name, tag: post.team.tag } : null,
      title: post.title,
      body: post.body,
      isOpen: post.isOpen,
      createdAt: post.createdAt.toISOString()
    });
  } catch (error) {
    console.error("Get post error:", error);
    return c.json({ statusCode: 500, message: "Server error" }, 500);
  }
});

// Recruitment Posts: Create
app.post("/api/recruitment-posts", async (c) => {
  try {
    const userId = requireUserId(c);
    if (!userId) return c.json({ statusCode: 401, message: "Unauthorized" }, 401);

    const prisma = getPrismaClient(c.env);
    const { type, gameId, teamId, title, body } = await c.req.json();

    const post = await prisma.recruitmentPost.create({
      data: { type, gameId, teamId: teamId || null, title, body, authorId: userId, isOpen: true },
      include: { author: true, game: true, team: true },
    });

    return c.json({
      id: post.id,
      type: post.type,
      author: { id: post.author.id, displayName: post.author.displayName, avatarUrl: post.author.avatarUrl },
      game: { id: post.game.id, slug: post.game.slug, name: post.game.name, iconUrl: post.game.iconUrl, rankVerifiable: post.game.rankVerifiable },
      team: post.team ? { id: post.team.id, name: post.team.name, tag: post.team.tag } : null,
      title: post.title,
      body: post.body,
      isOpen: post.isOpen,
      createdAt: post.createdAt.toISOString()
    });
  } catch (error) {
    console.error("Create post error:", error);
    return c.json({ statusCode: 500, message: "Server error" }, 500);
  }
});

// Recruitment Posts: Update
app.patch("/api/recruitment-posts/:id", async (c) => {
  try {
    const userId = requireUserId(c);
    if (!userId) return c.json({ statusCode: 401, message: "Unauthorized" }, 401);

    const prisma = getPrismaClient(c.env);
    const postId = c.req.param("id");

    const post = await prisma.recruitmentPost.findUnique({ where: { id: postId } });
    if (!post) return c.json({ statusCode: 404, message: "Not found" }, 404);
    if (post.authorId !== userId) return c.json({ statusCode: 403, message: "Forbidden" }, 403);

    const { title, body, isOpen } = await c.req.json();
    const updated = await prisma.recruitmentPost.update({
      where: { id: postId },
      data: { ...(title && { title }), ...(body && { body }), ...(isOpen !== undefined && { isOpen }) },
      include: { author: true, game: true, team: true },
    });

    return c.json({
      id: updated.id,
      type: updated.type,
      author: { id: updated.author.id, displayName: updated.author.displayName, avatarUrl: updated.author.avatarUrl },
      game: { id: updated.game.id, slug: updated.game.slug, name: updated.game.name, iconUrl: updated.game.iconUrl, rankVerifiable: updated.game.rankVerifiable },
      team: updated.team ? { id: updated.team.id, name: updated.team.name, tag: updated.team.tag } : null,
      title: updated.title,
      body: updated.body,
      isOpen: updated.isOpen,
      createdAt: updated.createdAt.toISOString()
    });
  } catch (error) {
    console.error("Update post error:", error);
    return c.json({ statusCode: 500, message: "Server error" }, 500);
  }
});

// Recruitment Posts: Delete
app.delete("/api/recruitment-posts/:id", async (c) => {
  try {
    const userId = requireUserId(c);
    if (!userId) return c.json({ statusCode: 401, message: "Unauthorized" }, 401);

    const prisma = getPrismaClient(c.env);
    const postId = c.req.param("id");

    const post = await prisma.recruitmentPost.findUnique({ where: { id: postId } });
    if (!post) return c.json({ statusCode: 404, message: "Not found" }, 404);
    if (post.authorId !== userId) return c.json({ statusCode: 403, message: "Forbidden" }, 403);

    await prisma.recruitmentPost.delete({ where: { id: postId } });
    return c.json({ statusCode: 204 });
  } catch (error) {
    console.error("Delete post error:", error);
    return c.json({ statusCode: 500, message: "Server error" }, 500);
  }
});

// Game Profiles: List
app.get("/api/game-profiles", async (c) => {
  try {
    const userId = requireUserId(c);
    if (!userId) return c.json({ statusCode: 401, message: "Unauthorized" }, 401);

    const prisma = getPrismaClient(c.env);
    const profiles = await prisma.gameProfile.findMany({
      where: { userId },
      include: { game: true, platformLink: true }
    });
    return c.json(profiles.map((p) => ({
      id: p.id,
      userId: p.userId,
      game: { id: p.game.id, slug: p.game.slug, name: p.game.name, iconUrl: p.game.iconUrl, rankVerifiable: p.game.rankVerifiable },
      inGameHandle: p.inGameHandle,
      platformLink: p.platformLink,
      createdAt: p.createdAt.toISOString()
    })));
  } catch (error) {
    console.error("List profiles error:", error);
    return c.json({ statusCode: 500, message: "Server error" }, 500);
  }
});

// Game Profiles: Create
app.post("/api/game-profiles", async (c) => {
  try {
    const userId = requireUserId(c);
    if (!userId) return c.json({ statusCode: 401, message: "Unauthorized" }, 401);

    const prisma = getPrismaClient(c.env);
    const { gameId, inGameHandle } = await c.req.json();

    const existing = await prisma.gameProfile.findUnique({ where: { userId_gameId: { userId, gameId } } });
    if (existing) return c.json({ statusCode: 409, message: "Profile already exists" }, 409);

    const profile = await prisma.gameProfile.create({
      data: { userId, gameId, inGameHandle },
      include: { game: true, platformLink: true },
    });

    return c.json({
      id: profile.id,
      userId: profile.userId,
      game: { id: profile.game.id, slug: profile.game.slug, name: profile.game.name, iconUrl: profile.game.iconUrl, rankVerifiable: profile.game.rankVerifiable },
      inGameHandle: profile.inGameHandle,
      platformLink: profile.platformLink,
      createdAt: profile.createdAt.toISOString()
    });
  } catch (error) {
    console.error("Create profile error:", error);
    return c.json({ statusCode: 500, message: "Server error" }, 500);
  }
});

// Game Profiles: Aliases for /me/game-profiles paths (more specific, so listed first)
app.get("/api/me/game-profiles", async (c) => {
  try {
    const userId = requireUserId(c);
    if (!userId) return c.json({ statusCode: 401, message: "Unauthorized" }, 401);

    const prisma = getPrismaClient(c.env);
    const profiles = await prisma.gameProfile.findMany({
      where: { userId },
      include: { game: true, platformLink: true }
    });
    return c.json({
      gameProfiles: profiles.map((p) => ({
        id: p.id,
        userId: p.userId,
        game: { id: p.game.id, slug: p.game.slug, name: p.game.name, iconUrl: p.game.iconUrl, rankVerifiable: p.game.rankVerifiable },
        inGameHandle: p.inGameHandle,
        platformLink: p.platformLink,
        createdAt: p.createdAt.toISOString()
      }))
    });
  } catch (error) {
    console.error("List me profiles error:", error);
    return c.json({ statusCode: 500, message: "Server error" }, 500);
  }
});

app.post("/api/me/game-profiles", async (c) => {
  try {
    const userId = requireUserId(c);
    if (!userId) return c.json({ statusCode: 401, message: "Unauthorized" }, 401);

    const prisma = getPrismaClient(c.env);
    const { gameId, inGameHandle } = await c.req.json();

    const existing = await prisma.gameProfile.findUnique({ where: { userId_gameId: { userId, gameId } } });
    if (existing) return c.json({ statusCode: 409, message: "Profile already exists" }, 409);

    const profile = await prisma.gameProfile.create({
      data: { userId, gameId, inGameHandle },
      include: { game: true, platformLink: true },
    });

    return c.json({
      id: profile.id,
      userId: profile.userId,
      game: { id: profile.game.id, slug: profile.game.slug, name: profile.game.name, iconUrl: profile.game.iconUrl, rankVerifiable: profile.game.rankVerifiable },
      inGameHandle: profile.inGameHandle,
      platformLink: profile.platformLink,
      createdAt: profile.createdAt.toISOString()
    });
  } catch (error) {
    console.error("Create me profile error:", error);
    return c.json({ statusCode: 500, message: "Server error" }, 500);
  }
});

app.delete("/api/me/game-profiles/:id", async (c) => {
  try {
    const userId = requireUserId(c);
    if (!userId) return c.json({ statusCode: 401, message: "Unauthorized" }, 401);

    const prisma = getPrismaClient(c.env);
    const profileId = c.req.param("id");

    const profile = await prisma.gameProfile.findUnique({ where: { id: profileId } });
    if (!profile) return c.json({ statusCode: 404, message: "Not found" }, 404);
    if (profile.userId !== userId) return c.json({ statusCode: 403, message: "Forbidden" }, 403);

    await prisma.gameProfile.delete({ where: { id: profileId } });
    return c.json({ statusCode: 204 });
  } catch (error) {
    console.error("Delete me profile error:", error);
    return c.json({ statusCode: 500, message: "Server error" }, 500);
  }
});

// Game Profiles: Delete
app.delete("/api/game-profiles/:id", async (c) => {
  try {
    const userId = requireUserId(c);
    if (!userId) return c.json({ statusCode: 401, message: "Unauthorized" }, 401);

    const prisma = getPrismaClient(c.env);
    const profileId = c.req.param("id");

    const profile = await prisma.gameProfile.findUnique({ where: { id: profileId } });
    if (!profile) return c.json({ statusCode: 404, message: "Not found" }, 404);
    if (profile.userId !== userId) return c.json({ statusCode: 403, message: "Forbidden" }, 403);

    await prisma.gameProfile.delete({ where: { id: profileId } });
    return c.json({ statusCode: 204 });
  } catch (error) {
    console.error("Delete profile error:", error);
    return c.json({ statusCode: 500, message: "Server error" }, 500);
  }
});

// Platform Links: List
app.get("/api/platform-links", async (c) => {
  try {
    const userId = requireUserId(c);
    if (!userId) return c.json({ statusCode: 401, message: "Unauthorized" }, 401);

    const prisma = getPrismaClient(c.env);
    const links = await prisma.platformLink.findMany({
      where: { gameProfile: { userId } },
      include: { gameProfile: { include: { game: true } } },
    });
    return c.json(links.map((l) => ({ id: l.id, provider: l.provider, externalHandle: l.externalHandle, gameId: l.gameProfile.gameId, hasRankData: l.hasRankData })));
  } catch (error) {
    console.error("List links error:", error);
    return c.json({ statusCode: 500, message: "Server error" }, 500);
  }
});

// Platform Links: Create
app.post("/api/platform-links", async (c) => {
  try {
    const userId = requireUserId(c);
    if (!userId) return c.json({ statusCode: 401, message: "Unauthorized" }, 401);

    const prisma = getPrismaClient(c.env);
    const { gameProfileId, provider, externalId, externalHandle, hasRankData, accessToken, refreshToken } = await c.req.json();

    const profile = await prisma.gameProfile.findUnique({ where: { id: gameProfileId } });
    if (!profile || profile.userId !== userId) return c.json({ statusCode: 403, message: "Forbidden" }, 403);

    const link = await prisma.platformLink.create({
      data: { gameProfileId, provider, externalId, externalHandle, hasRankData, accessToken, refreshToken },
      include: { gameProfile: { include: { game: true } } },
    });

    return c.json({ id: link.id, provider: link.provider, externalHandle: link.externalHandle, gameId: link.gameProfile.gameId, hasRankData: link.hasRankData });
  } catch (error) {
    console.error("Create link error:", error);
    return c.json({ statusCode: 500, message: "Server error" }, 500);
  }
});

// Platform Links: Refresh
app.post("/api/platform-links/:id/refresh", async (c) => {
  try {
    const userId = requireUserId(c);
    if (!userId) return c.json({ statusCode: 401, message: "Unauthorized" }, 401);

    const prisma = getPrismaClient(c.env);
    const linkId = c.req.param("id");

    const link = await prisma.platformLink.findUnique({ where: { id: linkId }, include: { gameProfile: true } });
    if (!link) return c.json({ statusCode: 404, message: "Not found" }, 404);
    if (link.gameProfile.userId !== userId) return c.json({ statusCode: 403, message: "Forbidden" }, 403);

    // TODO: Implement actual rank data refresh from external platform APIs
    // For now, just return success
    return c.json({ ok: true });
  } catch (error) {
    console.error("Refresh link error:", error);
    return c.json({ statusCode: 500, message: "Server error" }, 500);
  }
});

// Platform Links: Delete
app.delete("/api/platform-links/:id", async (c) => {
  try {
    const userId = requireUserId(c);
    if (!userId) return c.json({ statusCode: 401, message: "Unauthorized" }, 401);

    const prisma = getPrismaClient(c.env);
    const linkId = c.req.param("id");

    const link = await prisma.platformLink.findUnique({ where: { id: linkId }, include: { gameProfile: true } });
    if (!link) return c.json({ statusCode: 404, message: "Not found" }, 404);
    if (link.gameProfile.userId !== userId) return c.json({ statusCode: 403, message: "Forbidden" }, 403);

    await prisma.platformLink.delete({ where: { id: linkId } });
    return c.json({ statusCode: 204 });
  } catch (error) {
    console.error("Delete link error:", error);
    return c.json({ statusCode: 500, message: "Server error" }, 500);
  }
});

// Platform Links: FaceIT OAuth — initiate (more specific routes first)
app.get("/api/platform-links/faceit/connect", (c) => {
  if (!c.env.FACEIT_API_KEY) {
    return c.json({ statusCode: 404, message: "Not found" }, 404);
  }
  const state = randomState();
  setCookie(c, "oauth_state", state, {
    httpOnly: true,
    sameSite: "Lax",
    secure: c.env.NODE_ENV === "production",
    maxAge: 300,
    path: "/",
  });

  const gameId = c.req.query("game");
  if (gameId) {
    setCookie(c, "oauth_game", gameId, {
      httpOnly: true,
      sameSite: "Lax",
      secure: c.env.NODE_ENV === "production",
      maxAge: 300,
      path: "/",
    });
  }

  const url = new URL("https://api.faceit.com/oauth/authorize");
  url.searchParams.set("client_id", c.env.FACEIT_API_KEY);
  url.searchParams.set("redirect_uri", `${callbackBase(c.env)}/api/platform-links/faceit/callback`);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("state", state);
  return c.redirect(url.toString());
});

// Platform Links: FaceIT OAuth — callback
app.get("/api/platform-links/faceit/callback", async (c) => {
  try {
    if (!c.env.FACEIT_API_KEY) {
      return c.json({ statusCode: 404, message: "Not found" }, 404);
    }
    const userId = requireUserId(c);
    if (!userId) return c.json({ statusCode: 401, message: "Unauthorized" }, 401);

    const code = c.req.query("code");
    const state = c.req.query("state");
    const expectedState = getCookie(c, "oauth_state");
    const gameId = getCookie(c, "oauth_game");
    deleteCookie(c, "oauth_state", { path: "/" });
    deleteCookie(c, "oauth_game", { path: "/" });

    if (!code || !state || state !== expectedState) {
      return c.json({ statusCode: 400, message: "Invalid OAuth state" }, 400);
    }

    // TODO: Exchange code for FaceIT access token and fetch player data
    // For now, return to dashboard with success
    return c.redirect(`${webOrigin(c.env)}/dashboard${gameId ? `?game=${gameId}` : ""}`);
  } catch (error) {
    console.error("FaceIT OAuth error:", error);
    return c.redirect(`${webOrigin(c.env)}/dashboard?error=platform_link_failed`);
  }
});

// Platform Links: Riot OAuth — initiate
app.get("/api/platform-links/riot/connect", (c) => {
  if (!c.env.RIOT_API_KEY) {
    return c.json({ statusCode: 404, message: "Not found" }, 404);
  }
  const state = randomState();
  setCookie(c, "oauth_state", state, {
    httpOnly: true,
    sameSite: "Lax",
    secure: c.env.NODE_ENV === "production",
    maxAge: 300,
    path: "/",
  });

  const gameId = c.req.query("game");
  if (gameId) {
    setCookie(c, "oauth_game", gameId, {
      httpOnly: true,
      sameSite: "Lax",
      secure: c.env.NODE_ENV === "production",
      maxAge: 300,
      path: "/",
    });
  }

  const url = new URL("https://auth.riotgames.com/authorize");
  url.searchParams.set("client_id", c.env.RIOT_API_KEY);
  url.searchParams.set("redirect_uri", `${callbackBase(c.env)}/api/platform-links/riot/callback`);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid offline_access");
  url.searchParams.set("state", state);
  return c.redirect(url.toString());
});

// Platform Links: Riot OAuth — callback
app.get("/api/platform-links/riot/callback", async (c) => {
  try {
    if (!c.env.RIOT_API_KEY) {
      return c.json({ statusCode: 404, message: "Not found" }, 404);
    }
    const userId = requireUserId(c);
    if (!userId) return c.json({ statusCode: 401, message: "Unauthorized" }, 401);

    const code = c.req.query("code");
    const state = c.req.query("state");
    const expectedState = getCookie(c, "oauth_state");
    const gameId = getCookie(c, "oauth_game");
    deleteCookie(c, "oauth_state", { path: "/" });
    deleteCookie(c, "oauth_game", { path: "/" });

    if (!code || !state || state !== expectedState) {
      return c.json({ statusCode: 400, message: "Invalid OAuth state" }, 400);
    }

    // TODO: Exchange code for Riot access token and fetch player data
    // For now, return to dashboard with success
    return c.redirect(`${webOrigin(c.env)}/dashboard${gameId ? `?game=${gameId}` : ""}`);
  } catch (error) {
    console.error("Riot OAuth error:", error);
    return c.redirect(`${webOrigin(c.env)}/dashboard?error=platform_link_failed`);
  }
});

// Test Cleanup: Delete all test users and their data
app.delete("/api/test/cleanup", async (c) => {
  try {
    // Only allow in non-production environments
    if (c.env.NODE_ENV === "production") {
      return c.json({ statusCode: 403, message: "Forbidden" }, 403);
    }

    const prisma = getPrismaClient(c.env);

    // Find all users with "test.local" in their email (catches smoke, api, debug, verify, etc.)
    const testUsers = await prisma.user.findMany({
      where: { email: { contains: "test.local" } },
    });

    if (testUsers.length === 0) {
      return c.json({ deleted: { users: 0, teams: 0 } });
    }

    const userIds = testUsers.map((u) => u.id);
    console.log(`Cleaning up ${userIds.length} test users`);

    // Find teams that only have test users (no regular users)
    const userTeams = await prisma.teamMember.findMany({
      where: { userId: { in: userIds } },
      include: { team: { include: { members: true } } },
    });

    // Find teams where all members are test users
    const teamIdsToDelete = new Set<string>();
    for (const teamMember of userTeams) {
      const allMembersAreTest = teamMember.team.members.every((m) =>
        userIds.includes(m.userId)
      );
      if (allMembersAreTest) {
        teamIdsToDelete.add(teamMember.team.id);
      }
    }

    console.log(`Found ${teamIdsToDelete.size} teams with only test users`);

    // Delete TeamMembers for teams being deleted
    if (teamIdsToDelete.size > 0) {
      await prisma.teamMember.deleteMany({
        where: { teamId: { in: Array.from(teamIdsToDelete) } },
      });
    }

    // Delete recruitment posts from teams being deleted
    if (teamIdsToDelete.size > 0) {
      await prisma.recruitmentPost.deleteMany({
        where: { teamId: { in: Array.from(teamIdsToDelete) } },
      });
    }

    // Delete the teams
    if (teamIdsToDelete.size > 0) {
      await prisma.team.deleteMany({
        where: { id: { in: Array.from(teamIdsToDelete) } },
      });
    }

    // Delete game profiles by test users
    await prisma.gameProfile.deleteMany({ where: { userId: { in: userIds } } });

    // Delete recruitment posts authored by test users
    await prisma.recruitmentPost.deleteMany({ where: { authorId: { in: userIds } } });

    // Delete all test users
    const deleteResult = await prisma.user.deleteMany({
      where: { id: { in: userIds } },
    });

    return c.json({
      deleted: {
        users: deleteResult.count,
        teams: teamIdsToDelete.size,
      },
    });
  } catch (error) {
    console.error("Test cleanup error:", error);
    return c.json({ statusCode: 500, message: `Server error: ${error instanceof Error ? error.message : String(error)}` }, 500);
  }
});

// Catch-all
app.all("*", (c) => {
  return c.json({ statusCode: 404, message: "Not found" }, 404);
});

// Structured logging for any exception not already caught by a route handler,
// so server-side errors land in Workers Logs the same shape as client reports.
app.onError((err, c) => {
  console.error("[server]", JSON.stringify({
    severity: "ERROR",
    message: err.message,
    stack: err.stack,
    url: c.req.url,
    method: c.req.method,
    timestamp: new Date().toISOString(),
  }));
  return c.json({ statusCode: 500, message: "Server error" }, 500);
});

export default app;
