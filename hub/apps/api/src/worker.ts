import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { PrismaClient } from "@prisma/client";
import { PrismaD1 } from "@prisma/adapter-d1";
import * as bcrypt from "bcrypt";
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

const app = new Hono<{ Bindings: Env }>();

app.use("*", logger());
app.use("*", cors({ origin: (origin) => origin || "*", credentials: true }));

// Health check
app.get("/api/health", (c) => {
  return c.json({
    status: "ok",
    environment: c.env.NODE_ENV || "unknown",
    timestamp: new Date().toISOString(),
  });
});

// Telemetry: Error logging from frontend
app.post("/api/telemetry/errors", async (c) => {
  try {
    const { message, context, metadata, userAgent } = await c.req.json();
    console.error("Frontend error:", { message, context, metadata, userAgent, timestamp: new Date().toISOString() });
    return c.json({ statusCode: 200, message: "Error logged" });
  } catch (error) {
    console.error("Telemetry error:", error);
    return c.json({ statusCode: 500, message: "Failed to log error" }, 500);
  }
});

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
      return c.json({ statusCode: 409, message: "Email already registered" }, 409);
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        displayName,
        passwordHash,
        role: "MEMBER",
      },
    });

    const accessToken = jwt.sign({ sub: user.id, type: "access" }, c.env.JWT_SECRET, { expiresIn: "15m" });
    const refreshToken = jwt.sign({ sub: user.id, type: "refresh" }, c.env.JWT_SECRET, { expiresIn: "90d" });

    return c.json({ user: { id: user.id, email: user.email, displayName: user.displayName }, accessToken, refreshToken });
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
      return c.json({ statusCode: 401, message: "Invalid credentials" }, 401);
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return c.json({ statusCode: 401, message: "Invalid credentials" }, 401);
    }

    const accessToken = jwt.sign({ sub: user.id, type: "access" }, c.env.JWT_SECRET, { expiresIn: "15m" });
    const refreshToken = jwt.sign({ sub: user.id, type: "refresh" }, c.env.JWT_SECRET, { expiresIn: "90d" });

    return c.json({ user: { id: user.id, email: user.email, displayName: user.displayName }, accessToken, refreshToken });
  } catch (error) {
    console.error("Login error:", error);
    return c.json({ statusCode: 500, message: "Server error" }, 500);
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
    return c.json({ id: user.id, email: user.email, displayName: user.displayName, role: user.role, avatarUrl: user.avatarUrl, createdAt: user.createdAt.toISOString() });
  } catch (error) {
    console.error("Get user error:", error);
    return c.json({ statusCode: 500, message: "Server error" }, 500);
  }
});

// Users: Update
app.patch("/api/users/:id", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return c.json({ statusCode: 401, message: "Unauthorized" }, 401);

    const prisma = getPrismaClient(c.env);
    const token = authHeader.slice(7);
    const decoded = jwt.verify(token, c.env.JWT_SECRET) as any;
    const userId = decoded.sub;
    const targetId = c.req.param("id");

    if (userId !== targetId) return c.json({ statusCode: 403, message: "Forbidden" }, 403);

    const { displayName, avatarUrl } = await c.req.json();
    const user = await prisma.user.update({
      where: { id: targetId },
      data: { ...(displayName && { displayName }), ...(avatarUrl !== undefined && { avatarUrl }) },
    });

    return c.json({ id: user.id, email: user.email, displayName: user.displayName, role: user.role, avatarUrl: user.avatarUrl, createdAt: user.createdAt.toISOString() });
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
    const authHeader = c.req.header("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return c.json({ statusCode: 401, message: "Unauthorized" }, 401);

    const prisma = getPrismaClient(c.env);
    const { gameId, name, tag, bio } = await c.req.json();
    const token = authHeader.slice(7);
    const decoded = jwt.verify(token, c.env.JWT_SECRET) as any;
    const userId = decoded.sub;

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
    const authHeader = c.req.header("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return c.json({ statusCode: 401, message: "Unauthorized" }, 401);

    const prisma = getPrismaClient(c.env);
    const { type, gameId, title, body } = await c.req.json();
    const token = authHeader.slice(7);
    const decoded = jwt.verify(token, c.env.JWT_SECRET) as any;
    const userId = decoded.sub;

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
    const authHeader = c.req.header("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return c.json({ statusCode: 401, message: "Unauthorized" }, 401);

    const prisma = getPrismaClient(c.env);
    const token = authHeader.slice(7);
    const decoded = jwt.verify(token, c.env.JWT_SECRET) as any;
    const userId = decoded.sub;
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
    const authHeader = c.req.header("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return c.json({ statusCode: 401, message: "Unauthorized" }, 401);

    const prisma = getPrismaClient(c.env);
    const token = authHeader.slice(7);
    const decoded = jwt.verify(token, c.env.JWT_SECRET) as any;
    const userId = decoded.sub;
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
    const authHeader = c.req.header("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return c.json({ statusCode: 401, message: "Unauthorized" }, 401);

    const prisma = getPrismaClient(c.env);
    const token = authHeader.slice(7);
    const decoded = jwt.verify(token, c.env.JWT_SECRET) as any;
    const userId = decoded.sub;

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
    const authHeader = c.req.header("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return c.json({ statusCode: 401, message: "Unauthorized" }, 401);

    const prisma = getPrismaClient(c.env);
    const { gameId, inGameHandle } = await c.req.json();
    const token = authHeader.slice(7);
    const decoded = jwt.verify(token, c.env.JWT_SECRET) as any;
    const userId = decoded.sub;

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
    const authHeader = c.req.header("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return c.json({ statusCode: 401, message: "Unauthorized" }, 401);

    const prisma = getPrismaClient(c.env);
    const token = authHeader.slice(7);
    const decoded = jwt.verify(token, c.env.JWT_SECRET) as any;
    const userId = decoded.sub;

    const links = await prisma.platformLink.findMany({
      where: { gameProfile: { userId } },
      include: { gameProfile: { include: { game: true } } }
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
    const authHeader = c.req.header("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return c.json({ statusCode: 401, message: "Unauthorized" }, 401);

    const prisma = getPrismaClient(c.env);
    const { gameProfileId, provider, externalId, externalHandle, hasRankData, accessToken, refreshToken } = await c.req.json();
    const token = authHeader.slice(7);
    const decoded = jwt.verify(token, c.env.JWT_SECRET) as any;
    const userId = decoded.sub;

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
    const authHeader = c.req.header("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return c.json({ statusCode: 401, message: "Unauthorized" }, 401);

    const prisma = getPrismaClient(c.env);
    const token = authHeader.slice(7);
    const decoded = jwt.verify(token, c.env.JWT_SECRET) as any;
    const userId = decoded.sub;
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

export default app;
