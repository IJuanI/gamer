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

- **DB**: PostgreSQL 16 via Docker (`docker-compose.yml`), host port **5433**.
- **ORM**: Prisma (`apps/api/prisma/schema.prisma`) — `User` + `Account` + `Role` enum.
- **Auth**: email/password (bcrypt) **and** OAuth (Discord + Google), session via
  httpOnly JWT cookie. RBAC with `ADMIN` / `EDITOR` / `MEMBER` roles enforced by a
  global `RolesGuard` + `@Roles()` decorator.

## Quick start

```bash
cd hub
cp .env.example .env          # adjust secrets / add OAuth creds if you have them
pnpm install
pnpm db:up                    # start Postgres in Docker
pnpm db:migrate               # create tables
pnpm db:seed                  # seed ADMIN / EDITOR / MEMBER demo users
pnpm dev                      # runs api (:4000) + web (:3000) together
```

Open http://localhost:3000.

### Seeded demo accounts

| Role   | Email                  | Password    |
|--------|------------------------|-------------|
| Admin  | admin@gamer.net.ar     | admin1234   |
| Editor | editor@gamer.net.ar    | editor1234  |
| Member | miembro@gamer.net.ar   | miembro1234 |

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
