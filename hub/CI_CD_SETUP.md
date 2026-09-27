# CI/CD Setup & E2E Smoke Tests

## Overview

The GamER Hub project now has comprehensive GitHub Actions CI/CD pipelines that automatically:
1. Run E2E smoke tests on every push to main/develop and PR
2. Validate builds and deployments before reaching production
3. Catch configuration issues early (e.g., missing API URLs)
4. Prevent regressions with automated testing

## Architecture

### Frontend Pipeline (`.github/workflows/web-ci.yml`)

```
Push to main/develop
  ↓
Lint + Type Check
  ↓
Build Next.js App (with NEXT_PUBLIC_API_URL set)
  ↓
Build Cloudflare Workers Bundle
  ↓
Run Playwright E2E Smoke Tests
  ↓
✅ All Pass → Mark as deployment-ready
```

**Tests Included:**
- Page loading (homepage, login, register)
- API configuration detection
- Auth provider initialization
- No JavaScript errors or promise rejections
- CORS header validation
- Theme provider functionality
- Navigation links

### Backend Pipeline (`.github/workflows/api-ci.yml`)

```
Push to main/develop
  ↓
Lint + Type Check
  ↓
Build NestJS App
  ↓
Run Unit Tests (with Firestore Emulator)
  ↓
Run E2E Smoke Tests
  ↓
Build Docker Image
  ↓
✅ All Pass → Mark as deployment-ready
```

**Tests Included:**
- Health check endpoint
- CORS configuration
- Auth endpoints (register, login, refresh, logout, me)
- Error handling and validation
- Telemetry endpoint
- Database connectivity
- Response headers

## Environment Variables

### Frontend Build
The frontend build requires:
- `NEXT_PUBLIC_API_URL`: Backend API URL (e.g., `https://gamer-hub-api-*.run.app`)

Add this as a GitHub secret:
```bash
# In GitHub repo Settings → Secrets and variables → Actions
Secret name: API_URL
Value: https://gamer-hub-api-snbntgqyrq-uc.a.run.app
```

### Backend Smoke Tests
Automatically configured in CI:
- `FIREBASE_PROJECT_ID`: test-project
- `FIRESTORE_EMULATOR_HOST`: localhost:8080
- `JWT_SECRET`: test-secret-key-at-least-32-chars-long
- `WEB_ORIGIN`: http://localhost:3000

## Running Tests Locally

### Frontend Smoke Tests

```bash
# Start dev servers (in separate terminals)
pnpm dev
pnpm exec next dev --port 3100  # For visual tests

# Run smoke tests
pnpm --filter @gamer/web test

# Run all visual tests
pnpm --filter @gamer/web test:visual

# Update snapshots (for visual tests)
pnpm --filter @gamer/web test:visual:update
```

### Backend Smoke Tests

```bash
# Start Firestore Emulator
firebase emulators:start --project=gamer-hub-dev --only=firestore

# In another terminal, run smoke tests
pnpm --filter @gamer/api test:e2e -- --testNamePattern="smoke"

# Or run all E2E tests
pnpm --filter @gamer/api test:e2e
```

## Troubleshooting

### Issue: Frontend build fails with "API not configured"

**Cause**: `NEXT_PUBLIC_API_URL` environment variable not set during build

**Solution**:
1. Check GitHub Secrets: `API_URL` is set correctly
2. Rebuild locally with proper env var:
   ```bash
   NEXT_PUBLIC_API_URL=https://your-api.run.app pnpm -F @gamer/web build
   ```

### Issue: Smoke tests fail with "Cannot connect to API"

**Cause**: Either API URL is wrong or CORS is not configured

**Check CORS**:
```bash
curl -H "Origin: https://gameer.com.ar" \
  https://gamer-hub-api-*.run.app/api/health -v
```

Expected headers:
```
access-control-allow-origin: https://gameer.com.ar
access-control-allow-credentials: true
```

### Issue: Auth tests fail with "Invalid JWT"

**Cause**: JWT_SECRET mismatch between frontend and backend, or token expired

**Check**:
1. Verify `JWT_SECRET` is set in production (Cloud Run env vars)
2. Check token expiration times in code
3. Verify Firestore database has test users

### Issue: "Firestore Emulator not running"

**Solution**:
```bash
# Ensure Java is installed
java -version

# Start Firestore explicitly
firebase emulators:start --project=gamer-hub-dev --only=firestore

# In another terminal, export the env var
export FIRESTORE_EMULATOR_HOST=localhost:8080
```

## Deployment Workflow

### Manual Deployment (Before Auto-Deploy)

1. **Push code to main**
   ```bash
   git push origin main
   ```

2. **Wait for GitHub Actions**
   - Frontend CI completes in ~5 minutes
   - Backend CI completes in ~8 minutes
   - Check: https://github.com/IJuanI/gamer/actions

3. **If all tests pass**, deployment is ready
   - Frontend: Run Wrangler deploy
   - Backend: Cloud Build automatic trigger (if configured)

### Frontend Deployment

```bash
# After tests pass
cd apps/web
NEXT_PUBLIC_API_URL=https://gamer-hub-api-snbntgqyrq-uc.a.run.app \
  pnpm pages:build

wrangler deploy --compatibility-date 2024-09-23
```

### Backend Deployment

```bash
# After tests pass
cd ..
pnpm run build:api
./scripts/deploy.sh  # Or Cloud Build trigger
```

## CI Workflow Details

### Frontend CI Stages

1. **Install & Lint** (30s)
   - Install dependencies with pnpm
   - Run ESLint on TS/TSX files
   - Run TypeScript compiler for type checking

2. **Build** (2m)
   - Build Next.js app
   - Build Cloudflare Workers bundle (OpenNext)

3. **E2E Smoke Tests** (3m)
   - Start dev servers
   - Run Playwright tests
   - Generate HTML report

4. **Build Deployment** (2m, main branch only)
   - Build final optimized bundle
   - Upload artifacts

### Backend CI Stages

1. **Install & Lint** (30s)
   - Install dependencies
   - Run ESLint
   - Run TypeScript compiler

2. **Build** (1m)
   - Compile NestJS application

3. **Unit Tests** (2m)
   - Run Jest tests
   - Coverage report

4. **E2E Smoke Tests** (3m)
   - Start Firestore Emulator
   - Test all major API endpoints
   - Test error handling

5. **Docker Build** (2m, main branch only)
   - Build Docker image
   - Cache layers for next build

6. **Production Ready** (instant)
   - Mark deployment as ready if all tests pass

## Monitoring CI

### View Run Results

1. Go to https://github.com/IJuanI/gamer/actions
2. Click on the workflow run (by commit message)
3. View logs for each job
4. Download artifacts (test reports, screenshots)

### Subscribe to Notifications

- GitHub: Settings → Notifications → Email
- Slack: Integrate with GitHub App

### Common Failure Patterns

| Error | Likely Cause | Fix |
|-------|-------------|-----|
| `NEXT_PUBLIC_API_URL is undefined` | Secret not set | Add `API_URL` secret in GitHub |
| `Cannot GET /api/health` | CORS issue or API down | Check backend logs, CORS config |
| `Jest: Cannot find module` | Dependency missing | Run `pnpm install` locally |
| `Playwright timeout` | Server too slow to start | Increase timeout in workflow |
| `Firestore Emulator not ready` | Docker image issue | Use latest Firebase CLI |

## Best Practices

### When Making Changes

1. **Test locally first**
   ```bash
   pnpm test  # Runs all tests
   ```

2. **Make a feature branch**
   ```bash
   git checkout -b feature/my-feature
   ```

3. **Push and wait for CI**
   - Don't merge until all checks pass
   - Check for failing tests in GitHub Actions

4. **Review logs if tests fail**
   - Click the failed job in GitHub Actions
   - Check the error message and stack trace

### Keeping Tests Current

- Update smoke tests when adding new UI elements
- Add new E2E tests for critical user flows
- Update snapshots for visual regressions (intentional)
- Keep dependencies updated (`pnpm update`)

## Environment-Specific Configs

### Development
- `NEXT_PUBLIC_API_URL`: http://localhost:4000
- `NODE_ENV`: development
- Firestore: Emulator on localhost:8080

### Testing (CI)
- `NEXT_PUBLIC_API_URL`: http://localhost:4000
- `NODE_ENV`: test
- Firestore: Docker container

### Production
- `NEXT_PUBLIC_API_URL`: https://gamer-hub-api-*.run.app
- `NODE_ENV`: production
- Firestore: Cloud project

## Future Enhancements

- [ ] Add performance benchmarks
- [ ] Add visual regression testing for dashboard
- [ ] Add security scanning (OWASP, dependency audit)
- [ ] Add load testing for API
- [ ] Add integration tests with real Firestore
- [ ] Add deployment notifications
- [ ] Add rollback capability

## Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Playwright Testing Guide](https://playwright.dev)
- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)
- [Jest Documentation](https://jestjs.io)
- [Firebase Emulator](https://firebase.google.com/docs/emulator-suite)
