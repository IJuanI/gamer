# GamER Hub

Community hub for **Entre Ríos Gamers** — landing page, accounts, and role-based
access for the GamER community. Branding and look-and-feel are inherited from the
sibling `banners` project (same palette, AZONIX/Inter fonts, neon/HUD effects).

## Architecture

A pnpm monorepo with a clean BE/FE split:

```
hub/
├─ apps/
│  ├─ api/   NestJS 11 + Prisma + PostgreSQL — REST API & auth
│  └─ web/   Next.js 16 + Tailwind v4 — landing, auth pages, dashboard
└─ packages/
   └─ shared/  shared TypeScript types (roles, DTOs)
```

- **DB**: Firestore (production) / Firestore Emulator (local) — direct firebase-admin SDK.
- **Auth**: email/password (bcrypt) **and** OAuth (Discord + Google), session via
  httpOnly JWT cookie. RBAC with `ADMIN` / `EDITOR` / `MEMBER` roles enforced by a
  global `RolesGuard` + `@Roles()` decorator.
- **Local dev DB**: Firestore Emulator auto-starts via `pnpm dev` (no Docker required).

## Quick start

```bash
cd hub
pnpm install                  # install dependencies + firebase-tools
pnpm dev                      # starts Firestore Emulator + api (:4000) + web (:3000)
```

The first run will take ~30s as the emulator starts. Open http://localhost:3000.

### Seed demo accounts (optional)

To populate demo accounts for quick testing:

```bash
pnpm db:seed:local            # seed ADMIN / EDITOR / MEMBER demo users
```

### Demo accounts (after seeding)

| Role   | Email                  | Password    |
|--------|------------------------|-------------|
| Admin  | admin@gamer.net.ar     | admin1234   |
| Editor | editor@gamer.net.ar    | editor1234  |
| Member | miembro@gamer.net.ar   | miembro1234 |

## Local Development Database

### Firestore Emulator

The `pnpm dev` command automatically starts Firestore Emulator at `localhost:8080`. The emulator:
- ✅ Requires no GCP credentials or authentication
- ✅ Matches production Firestore schema exactly
- ✅ Auto-stops when `pnpm dev` exits
- ✅ Data persists across restarts (stored in `~/.cache/firebase/emulators`)

### Seed Demo Accounts

After `pnpm dev` is running, in another terminal:

```bash
pnpm db:seed:local
```

This seeds:
- Games: CS2, League of Legends, Valorant, Rocket League
- Users: Admin, Editor, Member (see Demo accounts table above)

### Reset Emulator Data

```bash
# Clear all emulator data
rm -rf ~/.cache/firebase/emulators/firestore.ldb

# Next `pnpm dev` starts with clean slate
```

## OAuth (optional)

OAuth strategies register **only when their env vars are set** — leave them blank
to develop with email/password alone. To enable:

1. Create a Discord and/or Google OAuth app.
2. Set redirect URIs to `http://localhost:4000/api/auth/{discord,google}/callback`.
3. Fill `DISCORD_CLIENT_ID/SECRET` and/or `GOOGLE_CLIENT_ID/SECRET` in `.env`.

## API surface

| Method | Route                       | Auth        | Notes                       |
|--------|-----------------------------|-------------|-----------------------------|
| POST   | `/api/auth/register`        | —           | email/password signup       |
| POST   | `/api/auth/login`           | —           | sets session cookie         |
| POST   | `/api/auth/logout`          | —           | clears cookie               |
| GET    | `/api/auth/me`              | cookie      | current user                |
| GET    | `/api/auth/discord`         | —           | OAuth start (if configured) |
| GET    | `/api/auth/google`          | —           | OAuth start (if configured) |
| GET    | `/api/users`                | ADMIN       | member list (RBAC demo)     |
| GET    | `/api/health`               | —           | healthcheck                 |
```
