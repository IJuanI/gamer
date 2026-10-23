# GamER Hub API - Features & Operations Guide

## Overview

The GamER Hub API is built with production-ready infrastructure for observability, reliability, and operational excellence.

## ✨ Features

### API Documentation

**Swagger/OpenAPI** - Interactive API documentation available at `/docs`
- Browse all endpoints with descriptions
- Test endpoints directly from the UI
- View request/response schemas
- Authentication support (Bearer token & cookies)

### Health Monitoring

**Three-level health checking** for Kubernetes deployments:

- `GET /health` - Comprehensive status including uptime and service checks
- `GET /health/live` - Liveness probe (responds if process is running)
- `GET /health/ready` - Readiness probe (checks database connectivity)

Example responses:
```json
// GET /health
{
  "status": "healthy",
  "timestamp": "2026-09-27T16:00:00.000Z",
  "environment": "production",
  "uptime": 3600000,
  "checks": {
    "firestore": "ok"
  }
}

// GET /health/live
{ "ok": true }

// GET /health/ready
{ "ok": true }
```

### Error Tracking

All errors are automatically logged to **Google Cloud Logging**:
- Frontend JavaScript errors (via `/api/telemetry/error`)
- Backend API errors (via global exception filter)
- Includes stack traces, user context, and request details
- No manual error reporting needed - automatic collection

Frontend errors include:
- Error message and stack trace
- Page URL
- User ID and browser info
- Custom context and metadata

### Request Tracing

**Request correlation IDs** enable tracing across services:
- Every request gets a unique `x-request-id` header
- Returned in error responses for reference
- Included in all logs
- Useful for debugging distributed systems

Example:
```bash
curl -H "x-request-id: custom-id-123" http://localhost:4000/api/me
# Response includes: "x-request-id: custom-id-123"
# Logs will show: "[custom-id-123] GET /api/me 200 45ms"
```

### API Resilience

**Automatic error recovery**:
- Request retry logic with exponential backoff for transient failures
- Rate limiting: 1000 requests/15min (general), 100 errors/min (telemetry)
- Refresh token auto-renewal to prevent session expiration
- Activity timeout tracking (90 days of inactivity)

### Authentication

**Token-based auth with refresh tokens**:
- Access tokens: 15-minute expiration
- Refresh tokens: 90-day expiration with auto-renewal
- Automatic refresh 10 minutes before expiration
- Cross-origin cookie support (SameSite=none in production)

Endpoints:
- `POST /auth/register` - Create account
- `POST /auth/login` - Login with email/password
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout
- `GET /auth/me` - Current user profile
- OAuth: Discord, Google (auto-redirect to dashboard)

### Database Management

**Automatic verification on startup**:
- Firestore connectivity check
- Collection existence verification
- Warnings for empty collections
- Fails startup on critical errors

### Graceful Shutdown

Proper cleanup on termination:
- SIGTERM/SIGINT signal handling
- Closes active connections gracefully
- 10-second timeout before force-exit
- Unhandled rejection tracking

## 🚀 Deployment

### Environment Variables

Required:
- `FIREBASE_PROJECT_ID` - GCP Firestore project
- `JWT_SECRET` - Secret for signing tokens (min 32 chars)

Recommended for production:
- `NODE_ENV=production`
- `GOOGLE_CLOUD_PROJECT` - For Cloud Logging
- `WEB_ORIGIN` - Frontend URL (CORS)
- `PORT` or `API_PORT` - Server port (default: 4000)

OAuth (optional):
- `DISCORD_CLIENT_ID` / `DISCORD_CLIENT_SECRET`
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`
- `FACEIT_CLIENT_ID` / `FACEIT_CLIENT_SECRET` / `FACEIT_API_KEY`
- `RIOT_CLIENT_ID` / `RIOT_CLIENT_SECRET` / `RIOT_API_KEY`

### Kubernetes

Health check configuration:
```yaml
livenessProbe:
  httpGet:
    path: /api/health/live
    port: 4000
  initialDelaySeconds: 10
  periodSeconds: 10

readinessProbe:
  httpGet:
    path: /api/health/ready
    port: 4000
  initialDelaySeconds: 5
  periodSeconds: 5
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm ci --production
EXPOSE 4000
CMD ["node", "dist/main.js"]
```

## 📊 Monitoring

### Cloud Logging

Access logs in Google Cloud Console:
```
resource.type="cloud_run_revision"
resource.labels.service_name="gamer-hub-api"
```

Log severity levels:
- `ERROR` - Application errors, failed requests
- `WARN` - Configuration issues, empty collections
- `INFO` - Request tracking, feature status
- `DEBUG` - Detailed operation logs

### Metrics to Monitor

- Uptime (via `/health` response)
- Response times (in request logs)
- Error rates (in Cloud Logging)
- Database status (from health checks)

## 🔌 API Usage

### Authentication

Session-based with cookies:
```bash
# Login
curl -c cookies.txt -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'

# Use session (cookies sent automatically)
curl -b cookies.txt http://localhost:4000/api/me
```

Bearer token (for programmatic access):
```bash
# Get token from login response or `/auth/me`
curl -H "Authorization: Bearer {token}" http://localhost:4000/api/me
```

### Pagination

List endpoints support pagination:
```bash
curl "http://localhost:4000/api/teams?page=1&limit=20"

# Response includes pagination info
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

### Error Handling

All errors return consistent format:
```json
{
  "statusCode": 400,
  "message": "Invalid request data",
  "path": "/api/teams",
  "timestamp": "2026-09-27T16:00:00.000Z",
  "requestId": "550e8400-e29b-41d4-a716-446655440000"
}
```

Use the `requestId` to correlate with Cloud Logging.

## 🛠️ Development

### Local Development

```bash
# Start dev server with hot-reload
npm run dev

# Build for production
npm run build

# Run built server
npm start
```

Swagger docs: http://localhost:4000/docs

### Testing Endpoints

```bash
# Health check
curl http://localhost:4000/api/health

# Register user
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "displayName": "New User",
    "password": "SecurePassword123"
  }'

# Get current user
curl -b cookies.txt http://localhost:4000/api/me
```

## 📋 Configuration Service

The API includes a type-safe configuration service in `src/config/config.service.ts`:

```typescript
const port = configService.port;
const isProduction = configService.isProduction;
const hasDiscordOAuth = configService.discordOAuthConfigured;
```

Methods:
- `nodeEnv` - Current environment
- `isProduction` - Check if production
- `isDevelopment` - Check if development
- `port` - Server port
- `firebaseProjectId` - GCP project ID
- `jwtSecret` - JWT signing secret
- `googleCloudProject` - For Cloud Logging
- `*OAuthConfigured` - Check if OAuth is set up

## 🎯 Common Tasks

### Check API Status
```bash
curl http://localhost:4000/api/health
```

### View API Docs
Open browser: http://localhost:4000/docs

### Debug Request
Look for `requestId` in error response, search Cloud Logging with:
```
jsonPayload.requestId="550e8400-e29b-41d4-a716-446655440000"
```

### Monitor Errors
Cloud Logging with severity=ERROR for all application errors

### Scale Deployment
Use Kubernetes readiness probe at `/api/health/ready` for load balancer configuration
