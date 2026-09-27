# Login Persistence Fix - Verification Guide

## What Was Fixed

### Root Cause
The frontend's auth provider was checking for the `refresh_token` cookie using JavaScript's `document.cookie`, which **cannot read httpOnly cookies** (a security feature). This check was always failing, causing the frontend to skip the API refresh call and immediately log out users on page refresh.

### Changes Made

#### 1. Frontend Code Fix (`apps/web/components/auth-provider.tsx`)
- ❌ Removed: Flawed JavaScript-side cookie presence check
- ✅ Added: Direct token refresh API call (browser sends httpOnly cookies automatically)
- ✅ Enhanced: Telemetry reporting for API configuration issues

**Key insight**: Browser automatically sends httpOnly cookies with requests when `credentials: "include"` is used. JavaScript checking doesn't needed.

#### 2. Deployment
- Frontend rebuilt with correct `NEXT_PUBLIC_API_URL`
- Deployed to Cloudflare Workers on `gameer.com.ar`
- Backend API accessible via `https://gamer-hub-api-snbntgqyrq-uc.a.run.app`

## Verification Steps

### 1. Test Login Persistence (Manual)

```bash
# 1. Open https://gameer.com.ar/login
# 2. Login with test account
# 3. Check browser DevTools → Application → Cookies
#    Should see: access_token (httpOnly) + refresh_token (httpOnly)
# 4. Refresh the page (F5)
# 5. Verify you remain logged in (dashboard loads without re-login)
```

### 2. Check Cloud Logging for Token Refresh Events

```bash
# View all token refresh attempts
gcloud logging read \
  "resource.type=cloud_run_revision AND jsonPayload.context=tokenRefresh" \
  --limit=50 --format=json --project=unity-dummy | \
  jq '.[] | {message: .jsonPayload.message, event: .jsonPayload.metadata.event, timestamp: .timestamp}'

# Watch for successful refresh events:
# {
#   "message": "Token refresh successful",
#   "event": "refresh_success",
#   "userId": "<user_id>"
# }

# Or check for specific failures:
gcloud logging read \
  "resource.type=cloud_run_revision AND jsonPayload.context=tokenRefresh AND jsonPayload.metadata.event=refresh_failed" \
  --limit=20 --format=json --project=unity-dummy
```

### 3. Verify CORS Configuration

```bash
# Should respond with CORS headers allowing credentials
curl -s "https://gamer-hub-api-snbntgqyrq-uc.a.run.app/api/health" \
  -H "Origin: https://gameer.com.ar" -i | grep -E "access-control|allow-credentials"

# Expected output:
# access-control-allow-origin: https://gameer.com.ar
# access-control-allow-credentials: true
```

### 4. Verify API Configuration in Frontend

The frontend should be configured to connect to the backend:
- Environment: `NEXT_PUBLIC_API_URL=https://gamer-hub-api-snbntgqyrq-uc.a.run.app`
- Check: `gameer.com.ar` frontend can reach this API
- Fallback: If not configured, frontend gracefully skips auth initialization (see telemetry)

## Expected Behavior

### Before Fix
1. User logs in → Cookies set ✓
2. User refreshes page → Check fails (can't read httpOnly) ✗
3. Token refresh skipped → User logged out ✗

### After Fix
1. User logs in → Cookies set ✓
2. User refreshes page → Browser auto-sends httpOnly cookies ✓
3. Token refresh succeeds → User stays logged in ✓
4. Telemetry logged → Visible in Cloud Logging ✓

## Troubleshooting

### Issue: "Token refresh failed: API error"
- **Cause**: Frontend can't reach the backend API
- **Check**: `NEXT_PUBLIC_API_URL` is set correctly in deployed frontend
- **Verify**: `curl https://gamer-hub-api-*.run.app/api/health` responds with 200

### Issue: "Token refresh failed: no user in response"
- **Cause**: Backend returned empty user data
- **Check**: Backend database has the user
- **Verify**: Check backend logs for JWT validation errors

### Issue: Browser won't send cookies
- **Cause**: CORS not properly configured
- **Check**: Response headers include `access-control-allow-credentials: true`
- **Verify**: `credentials: "include"` in frontend fetch calls

## Deployment Verification Checklist

- [x] Code fix committed and pushed to main
- [x] Frontend rebuilt with correct API URL
- [x] Frontend deployed to Cloudflare Workers
- [x] Backend CORS headers configured correctly
- [x] Cloud Logging enabled for token refresh events

## Next Steps

1. Monitor Cloud Logging for token refresh events
2. Test login/refresh cycle on production (gameer.com.ar)
3. Check for any errors in telemetry reports
4. If issues persist, check:
   - Browser console for fetch errors
   - Cloud Logging for backend errors
   - Network tab in DevTools for CORS issues
