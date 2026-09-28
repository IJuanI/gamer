# GamER Hub — Production Cutover Plan

This document outlines the production cutover from Cloud Run + Firestore to Cloudflare Workers + D1.

## Pre-Cutover Checklist

- [ ] All tests pass (`pnpm test`)
- [ ] Linting passes (`pnpm lint`)
- [ ] Build succeeds for both web and API (`pnpm build`)
- [ ] Terraform plan is clean (`terraform plan`)
- [ ] Secrets configured in Terraform Cloud/GitHub Actions
- [ ] DNS zone delegated to Cloudflare
- [ ] Cloudflare account and API tokens ready

## Phase 1: Infrastructure Setup (Terraform)

```bash
cd terraform
terraform init
terraform plan -out=tfplan
terraform apply tfplan
```

**Resources created:**
- D1 database `gamer-hub`
- DNS records for `api.gameer.com.ar` and `gameer.com.ar`
- Workers route binding

**Outputs to note:**
- D1 Database ID
- API URL: `https://api.gameer.com.ar`
- Web URL: `https://gameer.com.ar`

## Phase 2: Database Migration

### 1. Export Firestore data

```bash
# Export from production Firestore
firebase firestore:export gs://gamer-hub-backups/firestore-export-$(date +%Y%m%d)

# Wait for export to complete
```

### 2. Transform and load into D1

```bash
# Generate Prisma migrations from schema
cd apps/api
pnpm prisma migrate dev --name init

# Run migrations in D1
wrangler d1 execute gamer-hub --file=./prisma/migrations/init.sql
```

### 3. Data transformation script

Create a transformation script to convert Firestore documents to D1 records:

```bash
# apps/api/prisma/migrate-firestore-to-d1.ts
# This script reads from Firestore export and populates D1
```

## Phase 3: Worker Deployment

### 1. Build the API

```bash
cd apps/api
pnpm build
```

### 2. Deploy to Cloudflare Workers

```bash
# Production deployment
wrangler deploy --env production

# This will:
# - Deploy worker.ts as the API handler
# - Bind D1 database
# - Inject environment variables from wrangler.toml
```

### 3. Verify deployment

```bash
curl https://api.gameer.com.ar/api/health
# Expected response: { "status": "ok", "environment": "production" }
```

## Phase 4: Web App Deployment

### 1. Build the web app

```bash
NEXT_PUBLIC_API_URL=https://api.gameer.com.ar pnpm --filter @gamer/web build
```

### 2. Deploy to Cloudflare Pages

```bash
# Pages deployment via GitHub integration (automatic)
# or manual:
wrangler pages deploy apps/web/.next/static
```

### 3. Verify deployment

```bash
curl https://gameer.com.ar
# Should return HTML homepage
```

## Phase 5: DNS Cutover

### Current Setup (Before Cutover)
- `api.gameer.com.ar` → Cloud Run (cloud.google.com)
- `gameer.com.ar` → DNS A record to static IP or similar

### New Setup (After Cutover)
- `api.gameer.com.ar` → CNAME to `gameer-hub-api.workers.dev`
- `gameer.com.ar` → CNAME to `gameer-com-ar.pages.dev`

**Execution:**
```bash
# Update DNS records (via Terraform or Cloudflare UI)
terraform apply

# DNS propagation: typically 5-30 minutes globally
# Monitor with: dig api.gameer.com.ar
```

## Phase 6: Traffic Verification

### 1. Health checks (every 2 minutes)

```bash
#!/bin/bash
for i in {1..30}; do
  echo "Check $i - $(date)"
  
  # API health
  curl -s https://api.gameer.com.ar/api/health | jq .
  
  # Web app response
  curl -s -I https://gameer.com.ar | head -1
  
  sleep 120
done
```

### 2. Application monitoring

Monitor these metrics:
- **API response time**: Target < 200ms p50, < 500ms p99
- **Error rate**: Target < 0.1%
- **Database queries**: D1 query latency
- **Worker CPU time**: Target < 50ms per request

### 3. User-facing tests

- [ ] Can register new account
- [ ] Can login with credentials
- [ ] Can view games list
- [ ] Can create team
- [ ] Can view recruitment posts
- [ ] Can create recruitment post
- [ ] Can link game profile

## Phase 7: Decommissioning Old Infrastructure

Once verified stable for 24 hours:

### 1. Stop Cloud Run service

```bash
gcloud run services update gamer-hub-api --no-traffic
# or delete:
gcloud run services delete gamer-hub-api
```

### 2. Backup Firestore

```bash
# Create final backup before deletion
firebase firestore:export gs://gamer-hub-backups/firestore-final-backup-$(date +%Y%m%d)
```

### 3. Disable Firestore (keep backup)

```bash
# Don't delete immediately; keep for 30 days as safety net
# Then schedule deletion in 30 days
```

### 4. Remove Cloud Run credentials from GitHub Actions

- Delete `GOOGLE_CLOUD_DEPLOY_KEY` secret
- Remove Cloud Run deployment steps from CI/CD

## Rollback Plan

If critical issues occur:

### 1. Immediate (< 5 minutes)

```bash
# Revert DNS to Cloud Run
# Update Cloudflare DNS records to point api.gameer.com.ar back to Cloud Run
```

### 2. Data safety

- D1 has full production data snapshot
- Firestore backup exists (from Phase 7)
- Can restore either database within 1 hour

### 3. Full rollback (if needed)

```bash
# Keep both systems running for 48 hours
# Monitor error rates and user reports
# If critical issues, restore Cloud Run as primary
```

## Post-Cutover Tasks

- [ ] Update deployment documentation
- [ ] Update API documentation with new endpoint
- [ ] Notify users of any endpoint changes
- [ ] Monitor production metrics for 7 days
- [ ] Schedule post-mortem/lessons learned session
- [ ] Plan long-term cost optimization

## Cost Analysis

**Previous (Cloud Run + Firestore):**
- Cloud Run: ~$60/month (always on)
- Firestore: ~$40/month (includes free tier)
- Total: ~$100/month

**New (Cloudflare Workers + D1):**
- Workers: $5/month base + $0.50 per 1M requests (est. ~$5-15/month)
- D1: ~$5/month base + variable reads/writes (est. ~$5-20/month)
- Pages: Included with Workers
- Total: ~$10-35/month

**Estimated savings: 65-90%**

## Timeline

| Phase | Duration | Date |
|-------|----------|------|
| Infrastructure setup | 30 min | 2026-09-28 |
| Database migration | 2-4 hours | 2026-09-28 |
| Worker deployment | 10 min | 2026-09-28 |
| Web app deployment | 10 min | 2026-09-28 |
| DNS cutover | Variable | 2026-09-28 |
| Traffic verification | 1 hour | 2026-09-28 |
| Old infrastructure decommission | 24+ hours | 2026-09-29 |

**Total: ~6 hours from start to verification**
