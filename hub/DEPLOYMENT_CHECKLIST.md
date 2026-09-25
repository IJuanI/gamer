# GamER Hub Deployment Checklist

## ✅ Completed
- [x] Production Dockerfile created
- [x] Deployment scripts ready
- [x] Discord OAuth credentials obtained

## 🔄 In Progress (Manual Setup via GCP Console)

### Step 1: Create Google OAuth Credentials
**Time: 5 minutes**

1. Go to: https://console.cloud.google.com/
2. Select Project: `unity-dummy`
3. Navigate to: **APIs & Services** → **Credentials**
4. Click: **+ Create Credentials** → **OAuth client ID**
5. Application type: **Web application**
6. Name it: `GamER Hub API`
7. Under **Authorized redirect URIs**, add:
   - `https://gameer.com.ar/api/auth/google/callback`
   - `https://gameer.com.ar/api/auth/google`
8. Click **Create**
9. **Copy and save:**
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`

### Step 2: Create Cloud SQL PostgreSQL Instance
**Time: 10-15 minutes (instance creation takes a few minutes)**

1. Go to: https://console.cloud.google.com/sql/instances
2. Click: **Create Instance** → **PostgreSQL**
3. Configuration:
   - **Instance ID:** `gamer-hub-db`
   - **Password:** Generate a strong password (save it!)
   - **Database version:** PostgreSQL 15
   - **Region:** us-central1
   - **Machine type:** Shared core (db-f1-micro)
   - **Storage:** 10 GB, SSD
4. Click **Create Instance** (wait 5-10 minutes)

5. Once created, click on the instance
6. Go to **Databases** tab → Click **Create Database**
   - Name: `gamer_hub`
   - Click **Create**

7. Go to **Users** tab → Click **Create User Account**
   - Username: `gamer_hub`
   - Password: (use same as Step 3 or generate new)
   - Click **Create**

8. Go to **Overview** tab
9. **Copy the Connection Name** (looks like: `unity-dummy:us-central1:gamer-hub-db`)

### Step 3: Prepare Environment File
**Time: 2 minutes**

1. On your **local machine**, navigate to the project root
2. Copy the template:
   ```bash
   cp .env.production.example .env.production
   ```

3. Edit `.env.production` and fill in:
   ```
   GOOGLE_CLIENT_ID=<from Step 1>
   GOOGLE_CLIENT_SECRET=<from Step 1>
   DATABASE_URL=postgresql://gamer_hub:PASSWORD@/gamer_hub?host=/cloudsql/unity-dummy:us-central1:gamer-hub-db
   ```
   Replace `PASSWORD` with the password from Step 2

### Step 4: Build Docker Image Locally
**Time: 5-10 minutes**

On your **local machine** (with Docker installed):

```bash
cd D:/gamedevs/gamer/hub

# Build the image
docker build \
  -f apps/api/Dockerfile \
  -t gcr.io/unity-dummy/gamer-hub-api:latest \
  .

# Verify it built successfully
docker images | grep gamer-hub-api
```

### Step 5: Authenticate Docker with Google Cloud
**Time: 2 minutes**

```bash
# Configure Docker authentication
gcloud auth configure-docker

# This should now work (gcloud from PATH, not Python directly)
```

### Step 6: Push Image to Google Container Registry
**Time: 2-5 minutes**

```bash
docker push gcr.io/unity-dummy/gamer-hub-api:latest

# Verify in Cloud Console
# https://console.cloud.google.com/gcr/images/unity-dummy
```

### Step 7: Deploy to Cloud Run
**Time: 3-5 minutes**

```bash
# Export environment variables
export JWT_SECRET="a8afe0b022dde40a5c129bf335f0ef1c27b9c874f19e94e5d48a373897ab4836"
export DISCORD_CLIENT_ID="1553032775924187256"
export DISCORD_CLIENT_SECRET="2ztYlziDO5y2yJcOxvFTrOuDB9SoMzlb"
export GOOGLE_CLIENT_ID="<from Step 1>"
export GOOGLE_CLIENT_SECRET="<from Step 1>"
export DATABASE_URL="postgresql://gamer_hub:PASSWORD@/gamer_hub?host=/cloudsql/unity-dummy:us-central1:gamer-hub-db"

# Run deployment script
cd D:/gamedevs/gamer/hub
bash scripts/deploy.sh
```

The script will:
1. ✅ Check prerequisites
2. ✅ Set environment variables
3. ✅ Deploy to Cloud Run
4. ✅ Return the service URL

### Step 8: Update Frontend API URL
**Time: 2 minutes**

Once you have the Cloud Run URL from Step 7:

1. In `apps/web/.env.production`:
   ```
   NEXT_PUBLIC_API_URL=https://YOUR_CLOUD_RUN_URL
   ```

2. Redeploy the frontend:
   ```bash
   cd apps/web
   wrangler deploy
   ```

### Step 9: Test the Deployment
**Time: 5 minutes**

```bash
# Get the Cloud Run URL (from Step 7 output or)
CLOUD_RUN_URL=$(gcloud run services describe gamer-hub-api \
  --region=us-central1 \
  --format="value(status.url)")

# Test health endpoint
curl ${CLOUD_RUN_URL}/api/health

# Expected response:
# {"status":"ok","service":"gamer-hub-api"}

# Test Discord OAuth
curl -L ${CLOUD_RUN_URL}/api/auth/discord

# Test Google OAuth
curl -L ${CLOUD_RUN_URL}/api/auth/google
```

### Step 10: Unhide Jam CTA Section
**Once API is verified working**

1. Edit `apps/web/app/jam/page.tsx`
2. Remove `style={{ display: "none" }}` from the section:
   ```diff
   - <section id="comunidad" className="relative" style={{ display: "none" }}>
   + <section id="comunidad" className="relative">
   ```
3. Commit and redeploy:
   ```bash
   git commit -am "Enable jam CTA section - API is now live"
   git push
   cd apps/web && wrangler deploy
   ```

## Summary

| Step | Task | Estimated Time | Status |
|------|------|---|--------|
| 1 | Create Google OAuth | 5 min | ⏳ Manual |
| 2 | Create Cloud SQL | 15 min | ⏳ Manual |
| 3 | Prepare env file | 2 min | ⏳ Manual |
| 4 | Build Docker image | 10 min | ⏳ Local machine |
| 5 | Auth Docker | 2 min | ⏳ Local machine |
| 6 | Push image to GCR | 5 min | ⏳ Local machine |
| 7 | Deploy to Cloud Run | 5 min | ⏳ Local machine |
| 8 | Update frontend URL | 2 min | ⏳ Manual |
| 9 | Test deployment | 5 min | ⏳ Manual |
| 10 | Unhide CTA | 2 min | ⏳ After verify |

**Total estimated time: 50 minutes**

---

## Troubleshooting

### gcloud command not found
Make sure Google Cloud SDK is installed and in PATH:
```bash
which gcloud
gcloud --version
```

### Docker build fails
Check that you're in the project root and Docker is running:
```bash
docker ps
pwd
```

### Cloud SQL connection fails
Verify the connection string format:
```
postgresql://username:password@/database?host=/cloudsql/PROJECT:REGION:INSTANCE
```

### OAuth redirect URI mismatch
Ensure the redirect URI in GCP Console matches exactly:
- `https://gameer.com.ar/api/auth/google/callback`
- No trailing slashes, exact capitalization

### Cloud Run health check fails
Check the logs:
```bash
gcloud run logs read gamer-hub-api --limit=50
```
