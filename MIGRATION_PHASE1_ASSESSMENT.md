# GamER Hub: Firestore → D1 Migration - Phase 1 Assessment

## Data Model ✅
- **Prisma schema**: Already defined (`hub/apps/api/prisma/schema.prisma`)
- **Provider**: Currently SQLite (compatible with D1 — no schema changes needed)
- **Tables**: Users, Accounts, Games, GameProfiles, PlatformLinks, Teams, TeamMembers, RecruitmentPosts
- **Status**: Schema is production-ready, no modifications required

## Current Architecture
- **API**: NestJS (Express adapter, needs Workers adapter)
- **Database**: Firestore via firebase-admin service (`src/firestore/firestore.service.ts`)
- **Auth**: Passport.js (Discord OAuth, Google OAuth, JWT)
- **Endpoints**: 13 controllers (auth, games, users, teams, recruitment, etc.)

## Dependencies to Change

### Add:
- `@prisma/client`: Prisma ORM
- `@prisma/adapter-d1`: D1 adapter for Cloudflare Workers
- `itty-router` or `hono`: Lightweight routing for Workers (replace Express)
- `wrangler`: Local dev

### Remove:
- `firebase-admin`
- `@google-cloud/logging`
- `@nestjs/platform-express` (replace with Workers handler)

### Keep:
- `passport*`: Auth stays intact
- `@nestjs/core`, `@nestjs/common`: NestJS logic layer OK
- All validation/business logic

## Environment Variables Changes

### Remove:
- `FIREBASE_PROJECT_ID`
- `FIRESTORE_EMULATOR_HOST`

### Add:
- `DATABASE_URL`: D1 database URL (provided by Cloudflare binding)
- `CLOUDFLARE_ACCOUNT_ID`: For Terraform deployments

### Keep:
- `JWT_SECRET`, `JWT_EXPIRES_IN`
- `WEB_ORIGIN`, `API_PORT` → `WORKERS_LISTENING_PORT`
- OAuth credentials (Discord, Google, FACEIT, Riot)

## Data Volume
- **Current**: Empty (greenfield)
- **Migration complexity**: None (no data migration needed)
- **Advantage**: Can test D1 and API refactoring without worrying about data loss

## API Surface (No Changes Needed)
```
POST   /auth/register
POST   /auth/login
POST   /auth/oauth/:provider
GET    /users/:id
POST   /users
GET    /games
POST   /teams
GET    /teams/:id
GET    /recruitment-posts
POST   /recruitment-posts
GET    /game-profiles/:userId
... (13 controllers total)
```

## Key Refactoring Tasks
1. **Firestore Service → Prisma**: Replace `src/firestore/` with Prisma Client calls
2. **Express → Workers Handler**: Wrap NestJS in Cloudflare Workers fetch handler
3. **Database Initialization**: D1 schema setup (Prisma migrate apply)
4. **Local Dev**: Update `pnpm dev` to use Wrangler dev instead of `nest start`
5. **Testing**: Update E2E tests to use D1 test database

## Risk Assessment
| Risk | Likelihood | Mitigation |
|------|-----------|-----------|
| D1 adapter incompatibility | Low | D1 adapter is official Prisma, well-tested |
| Workers cold-start on Nest | Low | NestJS can run serverless (tested by others) |
| Passport.js on Workers | Low | Passport is HTTP-agnostic, should work |
| Missing dependencies | Medium | Add incrementally, test each |

## Next Steps
1. ✅ Phase 1 Complete: Assessment done
2. → Phase 2: Terraform infrastructure setup
3. → Phase 3: API refactoring (D1 + Workers)
4. → Phase 4: Frontend integration
5. → Phase 5: CI/CD consolidation

## Timeline Estimate
- Terraform setup: 1 day
- API refactoring: 2-3 days
- Frontend updates: 1 day
- Testing & cutover: 1-2 days
**Total: 5-7 days**
