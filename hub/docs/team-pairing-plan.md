# Team pairing & gaming profiles — implementation plan

Status: draft, not yet implemented. Covers gaming profiles, platform linking
(CS2/FACEIT, League of Legends, Valorant, Rocket League), team registration,
and recruitment posts.

## 1. Goals

- Members build a gaming profile: which games they play, in-game handle per
  game.
- Members link external platform accounts so rank/ELO/stats come from the
  platform itself, never typed in by hand — **no field anywhere lets a user
  self-claim a rank, ELO, or stat**. If a game can't be verified yet, we show
  no rank at all for it rather than trust user input.
- Every displayed rank/stat is visibly tagged as verified (synced from a
  platform, with a timestamp) — unverified is the default, silent state for
  anything without a live platform link, never a user-editable "trust me"
  field.
- Members create/manage teams and join teams others created.
- Members post "looking for team" (LFT) or "looking for players" (LFP) ads,
  scoped to a game, browsable/filterable by other members.

Out of scope for this pass: real-time matchmaking/queueing, in-app chat,
tournament bracket integration (already partly covered by `jam`/events).

## 2. Research notes

### Verification strategy per game — this is the core design constraint

The requirement "no self-claimed rank/ELO" means: for each game we only show
a rank if we have an official (or FACEIT, for CS2) API-backed source of
truth. Researched each of the four target titles — they are **not**
equally supported:

**CS2 → FACEIT Data API.** Two FACEIT products: the **Data API** (read-only,
server-side, static API key from the FACEIT Developer Portal) and
**OAuth2** (user consents, proves account ownership). Flow: user does FACEIT
OAuth2 (auth code + PKCE) → we get their `player_id` with consent → server
calls Data API `GET /players/{player_id}` for nickname/avatar/skill level/ELO,
optionally `GET /players/{player_id}/stats/{game_id}` for detailed stats.
FACEIT is the de facto competitive layer for CS2 (Valve doesn't expose
competitive rank via a public API at all), so this is both the most reliable
and the first one to build. Cache responses — FACEIT rate-limits the Data
API — refresh on a cooldown (manual "refresh" button, not on every page
view), never live-poll.
Sources: [Data API | FACEIT for Developers](https://docs.faceit.com/api/data/),
[Docs | FACEIT for Developers](https://docs.faceit.com/docs/data-api/data/),
[Intro | FACEIT for Developers](https://docs.faceit.com/docs/)

**League of Legends → Riot Sign-On (RSO) + League-V4 API.** Officially
supported: RSO is Riot's OAuth2 flow to link a Riot account with consent;
once linked, the League-V4 ranked endpoints return tier/division/LP for that
account — a real verified source. Caveat: RSO clients and production-level
keys require Riot's application/approval process (a "Development API Key"
only lasts 24h and can't be used for a public product; a "Personal API Key"
explicitly can't be used for public consumption either — only a **Production
API Key**, which needs an approved RSO client and typically a working
prototype, is legitimate for the live site). Build against a dev key first,
apply for production/RSO access before this ships publicly.
Sources: [RSO (Riot Sign On) – Developer Relations](https://support-developer.riotgames.com/hc/en-us/articles/22801670382739-RSO-Riot-Sign-On),
[Production Key Applications - Developer Relations](https://support-developer.riotgames.com/hc/en-us/articles/22801383038867-Production-Key-Applications),
[APIs - Riot Developer Portal](https://developer.riotgames.com/apis)

**Valorant → identity verification only, no rank.** Valorant also uses RSO
for account linking, but Riot does not offer a generally-available public
API for Valorant ranked/competitive data, and Riot's developer policy
explicitly **prohibits building alternative rank/MMR/ELO systems** (which
rules out scraping or third-party rank APIs as a substitute). Practical
consequence for us: we can verify *that* a member owns a given Riot ID via
RSO and show a "cuenta de Riot verificada" badge + their Riot ID, but we
must not display or store a Valorant rank/RR at all until Riot ships a
public ranked endpoint — anything else would effectively be a self-claimed
or scraped number, which is exactly what's disallowed.
Sources: [Valorant - Riot Developer Portal](https://developer.riotgames.com/docs/valorant),
[VALORANT - Developer Relations](https://support-developer.riotgames.com/hc/en-us/articles/22698769097107-VALORANT)

**Rocket League → no verification available yet.** Psyonix/Epic have never
shipped a public API that returns a player's rank/MMR; the only sources are
unofficial third-party trackers (e.g. Tracker Network) scraping data with no
stability/ToS guarantee. Given the hard "no self-claim, no unverifiable
numbers" requirement, we do **not** build rank display for Rocket League in
this pass: members can still add a Rocket League `GameProfile` (game +
handle, for team/recruitment purposes) but the UI never shows a rank for it
and it's always in the "unverified" visual state, by design, not as a bug to
fix later. Revisit if Psyonix ships an official endpoint.
Sources: [State of Public API? v4 | Rocket League Dev Tracker](https://devtrackers.gg/rocket-league/p/7e44d9dd-state-of-public-api-v4),
[Rocket League Rank Tracker: Build One in 11 Steps](https://shattered.io/rocket-league-rank-tracker-2026/)

**Net effect on the data model:** there is no manual "rank" text field
anywhere. Rank only ever comes from `PlatformLink.cachedStats`, and only
CS2 (now) and League of Legends (once a production key is approved) will
ever populate it; Valorant gets identity verification with no rank; Rocket
League gets neither until an official API exists.

### Existing codebase conventions to follow

- NestJS module-per-domain under `apps/api/src/<domain>/` (`*.module.ts`,
  `*.controller.ts`, `*.service.ts`, `*.spec.ts`), same shape as `users/` and
  `auth/`.
- Auth: httpOnly JWT cookie session; `@Roles()` + `RolesGuard` for RBAC;
  `AuthenticatedGuard`-style decorators from `auth/guards.ts` /
  `auth/decorators.ts` protect member-only routes.
- OAuth strategies are registered conditionally on env vars being present —
  the FACEIT strategy must follow the same optional-registration pattern.
- Prisma schema is a single file (`apps/api/prisma/schema.prisma`), snake_case
  table names via `@@map`, cuid ids, `createdAt`/`updatedAt` on every model.
- **Note:** `schema.prisma` currently declares `provider = "sqlite"` while
  `README.md` / `.env.example` describe Postgres via Docker on port 5433, and
  a stray `apps/api/prisma/dev.db` sqlite file exists. This is a pre-existing
  inconsistency, not something introduced by this feature — worth a quick
  sanity check (`echo $DATABASE_URL`, `pnpm db:migrate`) before writing new
  migrations, but not this plan's problem to redesign.
- Shared DTOs/types live in `packages/shared/src/index.ts` and are imported
  in web as `@gamer/shared` — new types (e.g. `PublicTeam`, `GameProfileDto`)
  belong there, not duplicated in both apps.
- Web: Next.js App Router, `"use client"` pages under `app/<route>/page.tsx`,
  data fetched through `lib/api.ts`, auth/user state via `components/auth-provider`,
  styling via Tailwind v4 + the existing neon/HUD utility classes
  (`panel-clip`, `neon-border-purple`, `hud-bracket-*`, `font-azonix` for
  headings only), Spanish copy throughout (see dashboard page for the
  reference pattern).

## 3. Data model (Prisma)

```prisma
// FACEIT and RIOT verify identity + can supply real stats/rank.
// EPIC (Rocket League) is identity-only today — no official rank source exists.
enum PlatformProvider {
  FACEIT
  RIOT
  EPIC
}

model Game {
  id        String   @id @default(cuid())
  slug      String   @unique   // "cs2", "valorant", "lol", "rocket-league"
  name      String
  iconUrl   String?
  // Whether this game currently has any verified rank source at all
  // (true for cs2/lol, false for valorant/rocket-league) — drives whether
  // the UI even attempts to render a rank badge for this game.
  rankVerifiable Boolean @default(false)
  profiles  GameProfile[]
  teams     Team[]
  posts     RecruitmentPost[]
  createdAt DateTime @default(now())

  @@map("games")
}

// A user's per-game profile: self-reported handle only — never a rank.
// Rank/ELO, when it exists, always comes from PlatformLink.cachedStats.
model GameProfile {
  id            String    @id @default(cuid())
  user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId        String
  game          Game      @relation(fields: [gameId], references: [id], onDelete: Cascade)
  gameId        String
  inGameHandle  String                 // e.g. Riot ID, Steam name — for display only, not proof
  platformLink  PlatformLink?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@unique([userId, gameId])
  @@map("game_profiles")
}

// External platform account linked to one GameProfile.
// hasRankData distinguishes "verified identity" (Valorant, Rocket League)
// from "verified identity + real rank/stats" (CS2 via FACEIT, LoL via Riot).
model PlatformLink {
  id             String           @id @default(cuid())
  gameProfile    GameProfile      @relation(fields: [gameProfileId], references: [id], onDelete: Cascade)
  gameProfileId  String           @unique
  provider       PlatformProvider
  externalId     String                    // FACEIT player_id / Riot PUUID / Epic account id
  externalHandle String                    // display nickname from the platform
  hasRankData    Boolean          @default(false)
  accessToken    String?                   // encrypted at rest
  refreshToken   String?
  cachedStats    Json?                     // last fetched {elo, level, tier, division, ...}, null if hasRankData=false
  statsFetchedAt DateTime?
  createdAt      DateTime         @default(now())

  @@unique([provider, externalId])
  @@map("platform_links")
}

enum TeamRole {
  CAPTAIN
  MEMBER
}

model Team {
  id          String       @id @default(cuid())
  name        String
  tag         String?                  // short clan tag
  logoUrl     String?
  bio         String?
  game        Game         @relation(fields: [gameId], references: [id])
  gameId      String
  members     TeamMember[]
  posts       RecruitmentPost[]
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt

  @@unique([name, gameId])
  @@map("teams")
}

model TeamMember {
  id        String    @id @default(cuid())
  team      Team      @relation(fields: [teamId], references: [id], onDelete: Cascade)
  teamId    String
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId    String
  role      TeamRole  @default(MEMBER)
  joinedAt  DateTime  @default(now())

  @@unique([teamId, userId])
  @@map("team_members")
}

enum RecruitmentPostType {
  LOOKING_FOR_TEAM
  LOOKING_FOR_PLAYERS
}

model RecruitmentPost {
  id          String              @id @default(cuid())
  type        RecruitmentPostType
  author      User                @relation(fields: [authorId], references: [id], onDelete: Cascade)
  authorId    String
  game        Game                @relation(fields: [gameId], references: [id])
  gameId      String
  // Only set when type = LOOKING_FOR_PLAYERS and the post is on behalf of a team.
  team        Team?               @relation(fields: [teamId], references: [id], onDelete: SetNull)
  teamId      String?
  title       String
  body        String
  isOpen      Boolean             @default(true)
  createdAt   DateTime            @default(now())
  updatedAt   DateTime            @updatedAt

  @@index([gameId, type, isOpen])
  @@map("recruitment_posts")
}
```

`User` gains back-relations: `gameProfiles GameProfile[]`, `teamMemberships
TeamMember[]`, `recruitmentPosts RecruitmentPost[]`.

Design choices worth flagging:
- No column anywhere accepts a user-typed rank/ELO. `GameProfile` only holds
  a display handle; all rank/stat data lives in `PlatformLink.cachedStats`
  and only exists once a real OAuth flow to the platform has run server-side.
- `PlatformLink.hasRankData` + `Game.rankVerifiable` let the UI hide rank
  badges entirely for Valorant/Rocket League without special-casing them in
  every component — it's driven by data, not an `if (game === "valorant")`
  scattered around.
- `PlatformLink` is 1:1 with `GameProfile` (link a platform per game, not per
  user) since skill level/rank is per-game even on the same platform account
  (CS2 FACEIT level differs from other FACEIT-supported titles).
- A team is scoped to one `Game` — matches how competitive teams actually
  work (a CS2 roster is a different team from the same players' Valorant
  roster), and keeps team rosters/recruitment simple to filter.

## 4. API surface (NestJS, `apps/api/src`)

New modules, following the `users`/`auth` module shape:

- `games/` — `GET /api/games` (list, public, seed-only data for now, admin
  create/edit later if needed).
- `game-profiles/` — `GET /api/users/:id/game-profiles` (public),
  `GET /api/me/game-profiles`, `POST /api/me/game-profiles`,
  `PATCH /api/me/game-profiles/:id`, `DELETE /api/me/game-profiles/:id`
  (all auth-guarded, owner-only).
- `platform-links/faceit/`, `platform-links/riot/`, `platform-links/epic/` —
  one sub-module per provider, each with `GET .../connect` (redirect to that
  platform's OAuth), `GET .../callback` (exchange code, create/update
  `PlatformLink`, set `hasRankData` per provider capability), `POST
  /api/platform-links/:id/refresh` (re-fetch cached stats, rate-limited
  server-side, no-op if `hasRankData=false`), `DELETE
  /api/platform-links/:id` (unlink). Each provider strategy registers only
  if its env vars are set, mirroring `discord.strategy.ts` /
  `google.strategy.ts`. Riot's module covers both League of Legends
  (`hasRankData: true`) and Valorant (`hasRankData: false`, identity only) —
  same RSO flow, different downstream API call.
- `teams/` — `GET /api/teams` (filter by game/name), `GET /api/teams/:id`,
  `POST /api/teams` (creator becomes CAPTAIN), `PATCH /api/teams/:id`
  (captain-only), `POST /api/teams/:id/members` (captain invites/adds),
  `DELETE /api/teams/:id/members/:userId` (captain removes, or self-leave).
- `recruitment-posts/` — `GET /api/recruitment-posts` (filter by game, type,
  isOpen), `POST /api/recruitment-posts` (auth), `PATCH
  /api/recruitment-posts/:id` (author/captain-only, e.g. close it), `DELETE
  /api/recruitment-posts/:id`.

Shared types added to `packages/shared/src/index.ts`: `PublicGame`,
`PublicGameProfile`, `PublicPlatformLink`, `PublicTeam`, `PublicTeamMember`,
`PublicRecruitmentPost`, plus their `*Payload` create/update DTOs — same
pairing as `PublicUser`/`RegisterPayload` today.

## 5. Web surface (`apps/web`)

- `app/profile/page.tsx` (new): current user's gaming profile — list of
  `GameProfile` cards, add-game form, per-card "Conectar" button for that
  game's provider (FACEIT for CS2, Riot for LoL/Valorant, Epic for Rocket
  League). Connected + `hasRankData` shows synced rank/ELO with a "Verificado
  · hace Nm" timestamp and manual refresh action; connected but
  `hasRankData=false` (Valorant, Rocket League) shows a "Cuenta verificada"
  badge with no rank; not connected shows a neutral "Sin verificar" tag, no
  numeric value ever rendered from unverified state.
- `app/teams/page.tsx`: browse/filter teams by game; `app/teams/[id]/page.tsx`:
  team detail + roster + captain management actions;
  `app/teams/new/page.tsx`: create-team form.
- `app/recruitment/page.tsx`: browse LFT/LFP posts, filter by game/type;
  `app/recruitment/new/page.tsx`: create post (choose type, game, optional
  team if LOOKING_FOR_PLAYERS).
- Dashboard (`app/dashboard/page.tsx`) gains new `Tile`s linking to these
  routes, same pattern as the existing "Eventos" tile.
- All copy in Argentine Spanish, reusing `panel-clip`, `neon-border-*`,
  `hud-bracket-*`, `font-azonix` headings — no new visual language.

## 6. Sequencing

Single continuous build, in this dependency order (schema must exist before
API, API before web):

1. Prisma schema + migration for `Game`, `GameProfile`, `PlatformLink`,
   `Team`, `TeamMember`, `RecruitmentPost`; seed the four target games
   (CS2, League of Legends, Valorant, Rocket League) with `rankVerifiable`
   set per the research above (true for CS2/LoL, false for the other two).
2. `games`, `game-profiles` API modules + shared types + `/profile` web page
   — handle-only, no rank field exists to fill in, so this is safe to ship
   before any platform integration and is independently useful.
3. `teams` API module + shared types + `/teams` web pages — no caps or
   restrictions on roster size, per your direction.
4. `recruitment-posts` API module + shared types + `/recruitment` web pages
   — no restriction on posting without a `GameProfile` first, per your
   direction (keeps friction low).
5. FACEIT OAuth strategy + `platform-links/faceit` module, wired into
   `/profile` — CS2 verified rank. No external credentials needed to start
   coding the flow against FACEIT's docs; you'll need to register a FACEIT
   app before this can run against real data.
6. Riot RSO strategy + `platform-links/riot` module (League of Legends
   ranked tier/division/LP + Valorant identity-only), wired into `/profile`.
   Same caveat: needs a Riot developer app, and going live publicly needs
   Riot's production-key/RSO approval, which has a lead time — worth
   starting that application early since it's outside our control.
7. Epic/Rocket League: add `GameProfile` support (game + handle, already
   covered by step 2) but explicitly do **not** build a rank display or
   `platform-links/epic` module — there is no official API to back it.
   Revisit if Psyonix ships one.

## 7. Answered / working assumptions

- No FACEIT credentials yet → build the integration code now, register the
  FACEIT app when ready to test against real data (step 5).
- Games: CS2, League of Legends, Valorant, Rocket League — fixed, no other
  titles in this pass.
- No caps or restrictions on team size or on posting recruitment ads without
  a matching `GameProfile`.
- Hard rule carried through the whole design: no user-editable rank/ELO
  field exists anywhere; verified state is always visually distinct from
  unverified, and unverified never shows a number.
