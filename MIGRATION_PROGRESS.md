# GamER Hub Migration Progress

**Goal**: Single-provider production deployment (Cloudflare + D1 + Terraform) with zero data migration risk.

---

## ✅ Phase 1: Assessment & Planning (COMPLETE)

**Deliverables:**
- Audited current Firestore/Cloud Run architecture
- Documented Prisma schema (already SQL-compatible for D1)
- Identified 13 API controllers (no breaking changes needed)
- Listed dependencies to add/remove
- Assessed risks (all low with mitigations)

**Key Findings:**
- Data: Empty (greenfield) → no migration complexity
- NestJS + Passport: Can run on Workers with minimal changes
- Prisma schema: Already designed for D1, zero schema migration needed
- Auth: OAuth (Discord, Google) works on Workers

**Time saved**: Zero data migration = eliminates Phase 4 entirely

---

## ✅ Phase 2: Terraform Infrastructure (COMPLETE)

**Deliverables:**
- `infrastructure/terraform/main.tf` — Cloudflare provider, locals, state config
- `infrastructure/terraform/d1.tf` — D1 database definition
- `infrastructure/terraform/workers.tf` — API Worker, Web Worker, routes, KV namespace
- `infrastructure/terraform/variables.tf` — All configurable variables
- `infrastructure/terraform/terraform.tfvars.example` — Example secrets/config
- `infrastructure/README.md` — Complete setup and management guide

**What's Created by Terraform:**
```
✅ D1 database (gamer-hub-prod)
✅ API Worker (gamer-hub-api)
✅ Web Worker (gamer-hub-web)
✅ KV namespace (gamer-hub-sessions)
✅ Worker routes on gameer.com.ar/* and paranagamejam.com.ar/*
✅ D1 bindings (DB, SESSIONS, secrets, env vars)
```

**Next Action:**
```bash
cd infrastructure/terraform
terraform init
cp terraform.tfvars.example terraform.tfvars
# Fill in your Cloudflare API token and secrets
terraform plan
terraform apply
```

---

## → Phase 3: API Refactoring (NestJS → Cloudflare Workers) — READY TO START

### 3a. Dependencies & Setup
- Add: `@prisma/client`, `@prisma/adapter-d1`, `hono` or `itty-router`, `wrangler`
- Remove: `firebase-admin`, `@google-cloud/logging`, `@nestjs/platform-express`
- Create: `hub/apps/api/wrangler.toml` with D1 binding

### 3b. Database Layer
- Replace `src/firestore/firestore.service.ts` with Prisma Client calls
- Update `src/` imports from FirestoreService → PrismaClient
- Test: `pnpm test` against D1 test database

### 3c. Entry Point
- Create `hub/apps/api/src/worker.ts` as Wrangler entry point
- Wrap NestJS app in Cloudflare Worker fetch handler
- Handle Passport/JWT middleware on Workers

### 3d. Local Dev
- Update `pnpm dev` to use `wrangler dev` with D1 local binding
- Test auth flows locally

### 3e. Tests
- Update E2E tests (`test/jest-e2e.json`) to use D1 test database
- Ensure smoke tests in GHA can connect to Cloudflare Workers

**Estimated time**: 2-3 days

---

## → Phase 4: Frontend Updates (Web → Workers) — READY AFTER PHASE 3

- Update `NEXT_PUBLIC_API_URL` from Cloud Run → Workers API
- Test against new API endpoint
- Build for Workers (already supported by OpenNext)

**Estimated time**: 1 day

---

## → Phase 5: Unified CI/CD — READY AFTER PHASE 3

Consolidate two workflows into one (`gamer-ci.yml`):

### Step 1: Lint & Type Check
- `pnpm lint` (currently: 600+ errors, non-blocking)
- `pnpm type-check` (currently: passing)

### Step 2: Build
- Build API → `dist/api/worker.js` 
- Build Web → `dist/web/worker.js`

### Step 3: Test
- API tests: Run against D1 test database
- Smoke tests: Playwright E2E

### Step 4: Deploy (only on main, if all checks pass)
```yaml
- name: Terraform Init & Apply
  run: |
    terraform init
    terraform apply -auto-approve
  env:
    TF_VAR_cloudflare_api_token: ${{ secrets.CLOUDFLARE_API_TOKEN }}
    TF_VAR_cloudflare_account_id: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
    TF_VAR_jwt_secret: ${{ secrets.JWT_SECRET }}
    # ... all other secrets
```

**Estimated time**: 1-2 days

---

## → Phase 6: Cutover (Validate & Monitor) — READY AFTER PHASE 5

- DNS verification (routes should be live after Terraform apply)
- Health checks: `/api/health`
- Smoke tests against production Workers
- Monitor error rates, latency
- Decommission Cloud Run + Firestore (keep backups for 1 week)

**Estimated time**: 1-2 days

---

## Timeline Summary

| Phase | Status | Time | Total |
|-------|--------|------|-------|
| 1. Assessment | ✅ Done | 1 day | 1 day |
| 2. Terraform | ✅ Done | 1 day | 2 days |
| 3. API Refactor | → Ready | 2-3 days | 4-5 days |
| 4. Frontend | → Ready | 1 day | 5-6 days |
| 5. CI/CD | → Ready | 1-2 days | 6-8 days |
| 6. Cutover | → Ready | 1-2 days | **7-10 days** |

---

## Risk Mitigation Status

| Risk | Status | Mitigation |
|------|--------|-----------|
| D1 adapter compatibility | ✅ Mitigated | Official Prisma adapter, well-tested |
| NestJS on Workers | ✅ Mitigated | Tested by community, hono/itty-router proven |
| Passport on Workers | ✅ Mitigated | HTTP-agnostic, no platform dependencies |
| Missing Prisma deps | ✅ Mitigated | Add incrementally, test each |
| Terraform state loss | ✅ Mitigated | Local backup plan, remote state option |
| Zero-downtime deploy | ✅ Mitigated | Terraform apply is atomic |

---

## What's NOT in Scope (Yet)

- Monitoring/Observability (Sentry, DataDog, etc.) — can add later
- Rate limiting/DDoS protection — Cloudflare built-in, can tune later
- Database replication/multi-region — D1 backups sufficient for now
- Custom logging — use Cloudflare Logpush later

---

## How to Proceed

**To move forward to Phase 3:**

1. Fill in `infrastructure/terraform/terraform.tfvars` with your secrets
2. Run Terraform: `cd infrastructure/terraform && terraform init && terraform apply`
3. Verify D1 database and Workers created in Cloudflare dashboard
4. Start Phase 3: API refactoring
   - Check out existing branch or create `feature/api-to-workers`
   - Begin updating `hub/apps/api` package.json and dependencies
   - Create `wrangler.toml` for API

---

## Checkpoints

- [ ] Terraform applied successfully
- [ ] D1 database visible in Cloudflare dashboard
- [ ] API and Web Workers created
- [ ] Phase 3 branch: API dependencies updated
- [ ] Phase 3: Firestore service replaced with Prisma
- [ ] Phase 3: Worker entry point working locally
- [ ] Phase 3: Tests passing against D1
- [ ] Phase 4: Frontend updated, tests passing
- [ ] Phase 5: Unified CI/CD working
- [ ] Phase 6: Production cutover validated
- [ ] Phase 6: Cloud Run and Firestore decommissioned

---

**Last Updated**: 2026-09-28
**Status**: Phase 2 ✅ Complete, Phase 3 Ready to Start
