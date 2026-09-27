# Token Refresh Debugging Guide

This guide explains how to debug the "need to login after page refresh" issue using Cloud Logging.

## Overview

The token refresh flow has been instrumented with comprehensive Cloud Logging telemetry. All diagnostics are captured server-side and client-side, making them available for analysis even if the user can't access their browser console.

## The Token Refresh Flow

```
User refreshes page
    ↓
Frontend: AuthProvider.initializeAuth() called
    ↓
Frontend: Reports "Token refresh attempt" to Cloud Logging
    ↓
Frontend: Checks for refresh_token cookie (reports status)
    ↓
Frontend: Calls api.refresh() → POST /api/auth/refresh
    ↓
Backend: RefreshStrategy extracts refresh_token from cookies
    ↓
Backend: /auth/refresh endpoint receives request
    ↓
Backend: Reports refresh attempt to Cloud Logging
    ↓
Backend: Validates token and user inactivity
    ↓
Backend: Returns new access/refresh tokens (cookies)
    ↓
Frontend: Reports "Token refresh successful" to Cloud Logging
    ↓
User is logged in
```

## Debugging the Issue

### Step 1: Check if refresh attempts are happening

**Query:**
```
jsonPayload.context="tokenRefresh"
AND jsonPayload.metadata.event="refresh_attempt"
```

**Expected logs:**
- Frontend: `"Token refresh attempt"` with `hasRefreshTokenCookie: true/false`
- Backend: `"Token refresh endpoint called"` with `hasRefreshTokenCookie: true/false`

**If no logs appear:** The refresh flow isn't being triggered at all.

### Step 2: Check if refresh_token cookie exists

**Query:**
```
jsonPayload.context="tokenRefresh"
AND jsonPayload.metadata.event="refresh_attempt"
```

**Look for:** `hasRefreshTokenCookie: true`

**If false:** The refresh_token cookie wasn't stored or was cleared.
- Check browser DevTools: Application → Cookies → refresh_token
- Verify cookies were set after login (check login flow logs)

### Step 3: Check for API failures

**Query:**
```
jsonPayload.context="apiError"
AND jsonPayload.path="/auth/refresh"
```

**Look for:** The `status` field
- 401: Refresh token invalid/expired
- 500: Server error
- Other: Connection issue

### Step 4: Check backend token validation

**Query:**
```
jsonPayload.context="tokenRefresh"
AND jsonPayload.metadata.event="refresh_failed"
```

**Look for:** The `reason` field:
- `no_refresh_token_cookie`: Cookie not received by backend
- `no_user_in_response`: User not found in database
- `no_user_from_guard`: Refresh strategy rejected the token
- `exception`: Other error

### Step 5: Check max retry failures

**Query:**
```
jsonPayload.context="tokenRefresh"
AND jsonPayload.metadata.event="max_failures_reached"
```

**This appears when:** Frontend gives up after 3 failed refresh attempts.

## Example Scenarios

### Scenario 1: Cookie not persisted

**Symptoms:** Refresh fails immediately, hasRefreshTokenCookie is false

**Logs to find:**
```
refresh_attempt → hasRefreshTokenCookie: false
```

**Causes:**
- Browser not accepting cookies (check CORS credentials)
- sameSite/secure settings wrong for environment
- Cookie storage quota exceeded
- Private browsing mode

**Solution:** Check `setSessionCookies()` in auth.controller.ts:
- Verify `sameSite: "lax"` in development
- Verify `secure: false` in development
- Clear browser cookies and login again

### Scenario 2: Backend not receiving cookie

**Symptoms:** hasRefreshTokenCookie true on frontend, false on backend

**Logs to find:**
```
Frontend: refresh_attempt → hasRefreshTokenCookie: true
Backend: refresh_attempt → hasRefreshTokenCookie: false
```

**Causes:**
- CORS not sending credentials (`credentials: "include"` missing)
- Cookie path/domain mismatch
- Frontend and backend on different origins

**Solution:** Verify:
- Frontend: `credentials: "include"` in fetch (apps/web/lib/api.ts)
- Backend: CORS config allows credentials (apps/api/src/main.ts)

### Scenario 3: Token expired or invalid

**Symptoms:** hasRefreshTokenCookie true on backend, but validation fails

**Logs to find:**
```
Backend: refresh_failed → reason: "no_user_from_guard"
```

**Causes:**
- Refresh token was corrupted/modified
- Refresh token signature invalid (JWT_SECRET mismatch)
- User deleted from database
- Token expired (90-day window passed)

**Solution:**
- Check JWT_SECRET consistency between systems
- Verify user exists in Firestore
- Check token expiry time in refresh token

### Scenario 4: Inactivity timeout

**Symptoms:** Refresh fails after 90+ days of inactivity

**Logs to find:**
```
Backend: refresh_failed → reason: "inactivity_timeout"
```

**Solution:** User must login again. This is by design.

## Correlation Across Services

Use `requestId` to correlate frontend and backend logs:

**Query:**
```
jsonPayload.metadata.requestId="550e8400-e29b-41d4-a716-446655440000"
```

This will show all logs for a single request across both frontend and backend.

## Cloud Logging Queries

### Find all token refresh attempts
```
resource.type="cloud_run_service"
AND (
  jsonPayload.context="tokenRefresh"
  OR jsonPayload.context="apiError" AND jsonPayload.path="/auth/refresh"
)
ORDER BY timestamp DESC
```

### Find refresh failures for a specific user
```
jsonPayload.context="tokenRefresh"
AND jsonPayload.metadata.userId="user-123"
AND jsonPayload.metadata.event="refresh_failed"
```

### Find requests that hit max retry limit
```
jsonPayload.context="tokenRefresh"
AND jsonPayload.metadata.event="max_failures_reached"
```

### Timeline of all auth events for a user
```
(jsonPayload.context="tokenRefresh"
OR jsonPayload.context="login"
OR jsonPayload.context="apiError")
AND jsonPayload.metadata.userId="user-123"
ORDER BY timestamp DESC
```

## Adding New Diagnostics

To add more debugging info to the refresh flow:

1. **Frontend:** Add to `reportError()` call in `auth-provider.tsx`
2. **Backend:** Add to `cloudLogging.logInfo()` call in `auth.controller.ts`
3. **API Layer:** Add to metadata in `lib/api.ts` request function

Example:
```typescript
// Frontend
await reportError({
  message: "Custom diagnostic",
  context: "tokenRefresh",
  metadata: {
    customField: value,
    timestamp: new Date().toISOString(),
  },
}).catch(() => {});

// Backend
await this.cloudLogging.logInfo("Custom diagnostic", {
  customField: value,
  requestId,
}, "tokenRefresh").catch(() => {});
```

## Testing the Fix

After fixing the refresh issue:

1. Login to the app
2. Open Cloud Logging console
3. Set filter: `jsonPayload.context="tokenRefresh"`
4. Refresh the page
5. Verify logs appear within 1-2 seconds showing:
   - Frontend: "Token refresh attempt" 
   - Backend: "Token refresh endpoint called"
   - Backend: "Token refresh successful"
6. User should remain logged in

## Production vs Development

- **Production:** Logs go to Google Cloud Logging
- **Development:** Logs go to both console and (optionally) Cloud Logging

In development, check `console` for fallback messages like:
```
[INFO] tokenRefresh Token refresh attempt { ... }
```

To enable Cloud Logging in development:
```bash
export GOOGLE_CLOUD_PROJECT=your-project-id
gcloud auth application-default login
```
