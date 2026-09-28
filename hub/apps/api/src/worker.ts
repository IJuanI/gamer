import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import { PrismaClient } from "@prisma/client";
import { PrismaD1 } from "@prisma/adapter-d1";
import * as bcrypt from "bcryptjs";
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
}

let prismaInstance: PrismaClient | null = null;

function getPrismaClient(env: Env): PrismaClient {
  if (!prismaInstance) {
    const adapter = new PrismaD1(env.DB);
    prismaInstance = new PrismaClient({ adapter } as any);
  }
  return prismaInstance;
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
    return origin && allowed.includes(origin) ? origin : allowed[0] || "*";
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

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { email: email.toLowerCase(), displayName, passwordHash, role: "MEMBER" },
    });

    setSessionCookies(c, signTokens(user.id, c.env.JWT_SECRET));
    return c.json({ user: toPublicUser(user) });
  } catch (error) {
    console.error("Register error:", error);
    return c.json({ statusCode: 500, message: "Server error" }, 500);
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

    const ok = await bcrypt.compare(password, user.passwordHash);
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
    const teams = await prisma.team.findMany({ where: gameId ? { gameId } : undefined, include: { members: true } });
    return c.json(teams.map((t) => ({ id: t.id, name: t.name, gameId: t.gameId, members: t.members.length, createdAt: t.createdAt.toISOString() })));
  } catch (error) {
    console.error("List teams error:", error);
    return c.json({ statusCode: 500, message: "Server error" }, 500);
  }
});

// Teams: Get by ID
app.get("/api/teams/:id", async (c) => {
  try {
    const prisma = getPrismaClient(c.env);
    const team = await prisma.team.findUnique({ where: { id: c.req.param("id") }, include: { members: { include: { user: true } } } });
    if (!team) return c.json({ statusCode: 404, message: "Not found" }, 404);
    return c.json({ id: team.id, name: team.name, gameId: team.gameId, members: team.members.map((m) => ({ userId: m.userId, displayName: m.user.displayName, role: m.role })), createdAt: team.createdAt.toISOString() });
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

// Recruitment Posts: List
app.get("/api/recruitment-posts", async (c) => {
  try {
    const prisma = getPrismaClient(c.env);
    const gameId = c.req.query("gameId");
    const type = c.req.query("type");
    const where: any = { isOpen: true };
    if (gameId) where.gameId = gameId;
    if (type) where.type = type;

    const posts = await prisma.recruitmentPost.findMany({ where, include: { author: true }, orderBy: { createdAt: "desc" }, take: 50 });
    return c.json(posts.map((p) => ({ id: p.id, type: p.type, title: p.title, author: { id: p.author.id, displayName: p.author.displayName }, gameId: p.gameId, createdAt: p.createdAt.toISOString() })));
  } catch (error) {
    console.error("List posts error:", error);
    return c.json({ statusCode: 500, message: "Server error" }, 500);
  }
});

// Recruitment Posts: Create
app.post("/api/recruitment-posts", async (c) => {
  try {
    const userId = requireUserId(c);
    if (!userId) return c.json({ statusCode: 401, message: "Unauthorized" }, 401);

    const prisma = getPrismaClient(c.env);
    const { type, gameId, title, body } = await c.req.json();

    const post = await prisma.recruitmentPost.create({
      data: { type, gameId, title, body, authorId: userId, isOpen: true },
      include: { author: true },
    });

    return c.json({ id: post.id, type: post.type, title: post.title, author: { id: post.author.id, displayName: post.author.displayName }, gameId: post.gameId, createdAt: post.createdAt.toISOString() });
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
      include: { author: true },
    });

    return c.json({ id: updated.id, type: updated.type, title: updated.title, author: { id: updated.author.id, displayName: updated.author.displayName }, gameId: updated.gameId, createdAt: updated.createdAt.toISOString() });
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
    const profiles = await prisma.gameProfile.findMany({ where: { userId }, include: { game: true } });
    return c.json(profiles.map((p) => ({ id: p.id, gameId: p.gameId, gameName: p.game.name, inGameHandle: p.inGameHandle, createdAt: p.createdAt.toISOString() })));
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
      include: { game: true },
    });

    return c.json({ id: profile.id, gameId: profile.gameId, gameName: profile.game.name, inGameHandle: profile.inGameHandle, createdAt: profile.createdAt.toISOString() });
  } catch (error) {
    console.error("Create profile error:", error);
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
