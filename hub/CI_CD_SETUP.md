# CI/CD Setup

## Pipelines

Two GitHub Actions workflows run on push/PR to main/develop:

**Frontend** (`.github/workflows/web-ci.yml`):
- Lint, type-check, build Next.js + Cloudflare Workers
- Run Playwright E2E smoke tests (10 tests)
- Deploy if main branch

**Backend** (`.github/workflows/api-ci.yml`):
- Lint, type-check, build NestJS
- Run unit + E2E smoke tests (20+ tests, Firestore Emulator)
- Build Docker image if main branch

## Setup

Add GitHub secret:
```
API_URL = https://gamer-hub-api-snbntgqyrq-uc.a.run.app
```

## Local Testing

Frontend:
```bash
pnpm dev                              # Start dev server
pnpm --filter @gamer/web test        # Smoke tests (Playwright)
pnpm --filter @gamer/web test:visual # Visual tests
```

Backend:
```bash
firebase emulators:start --project=gamer-hub-dev --only=firestore
pnpm --filter @gamer/api test:e2e -- --testNamePattern="smoke"
```

## Deployment

After CI passes:
```bash
# Frontend
cd apps/web
NEXT_PUBLIC_API_URL=https://gamer-hub-api-snbntgqyrq-uc.a.run.app pnpm pages:build
wrangler deploy --compatibility-date 2024-09-23

# Backend
pnpm run build:api
# Or trigger Cloud Build
```

## Troubleshooting

| Issue | Cause | Fix |
|-------|-------|-----|
| `NEXT_PUBLIC_API_URL undefined` | Secret not set | Add `API_URL` to GitHub secrets |
| `Cannot connect to API` | CORS misconfigured | Check `access-control-allow-origin` headers |
| `Firestore Emulator not found` | Java/Firebase CLI missing | `firebase emulators:start` |
| `Auth tests fail (Invalid JWT)` | `JWT_SECRET` mismatch | Verify Cloud Run env vars |

See `.github/workflows/*.yml` and `apps/*/e2e/smoke.spec.ts` for details.
