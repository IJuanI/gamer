# GamER Hub — Deployment Guide

This guide covers deploying the GamER Hub monorepo (Next.js frontend + NestJS backend) to Google Cloud Platform (GCP).

## Prerequisites

1. **GCP Project**: Created and billing enabled
2. **gcloud CLI**: Installed and authenticated (`gcloud auth login`)
3. **Docker**: Installed locally for building container images
4. **Discord OAuth App**: Created in Discord Developer Portal
5. **Google OAuth Consent Screen**: Configured in GCP Console

## Step 1: Create Discord OAuth Credentials

### Manual Setup (via Discord Developer Portal)

1. Go to https://discord.com/developers/applications
2. Click "New Application" and name it "GamER Hub"
3. In the left sidebar, click "OAuth2" → "General"
4. Copy the **Client ID** and **Client Secret**
5. Under "Redirects", add:
   - `https://gameer.com.ar/api/auth/discord/callback`
   - `https://gameer.com.ar/api/auth/discord`
6. Save and store the credentials securely

## Step 2: Create Google OAuth Credentials

### Using gcloud CLI

```bash
# Set your GCP project
gcloud config set project YOUR_PROJECT_ID

# Create a service account for the API
gcloud iam service-accounts create gamer-hub-api \
  --display-name="GamER Hub API"

# Grant necessary roles
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:gamer-hub-api@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/cloudsql.client"

# Create OAuth 2.0 credentials (user type)
# Go to: https://console.cloud.google.com/apis/credentials
# 1. Click "Create Credentials" → "OAuth client ID"
# 2. Choose "Web application"
# 3. Add Authorized redirect URIs:
#    - https://gameer.com.ar/api/auth/google/callback
#    - https://gameer.com.ar/api/auth/google
# 4. Click Create and save the Client ID and Secret
```

## Step 3: Set Up Cloud SQL Database

```bash
# Create Cloud SQL PostgreSQL instance
gcloud sql instances create gamer-hub-db \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=us-central1 \
  --network=default

# Create the main database
gcloud sql databases create gamer_hub \
  --instance=gamer-hub-db

# Create a database user
gcloud sql users create gamer_hub \
  --instance=gamer-hub-db \
  --password=SECURE_PASSWORD_HERE

# Get the Cloud SQL instance connection name (you'll need this)
gcloud sql instances describe gamer-hub-db --format="value(connectionName)"
```

## Step 4: Set Environment Variables in Cloud Run

Create a `.env.production` file with these variables:

```bash
# API Configuration
NODE_ENV=production
API_PORT=4000
JWT_SECRET=YOUR_SECURE_JWT_SECRET_HERE

# Database (Cloud SQL)
# Format: postgresql://username:password@cloud-sql-instance-ip:5432/database_name
DATABASE_URL="postgresql://gamer_hub:SECURE_PASSWORD_HERE@/gamer_hub?host=/cloudsql/PROJECT_ID:us-central1:gamer-hub-db"

# Frontend URLs
WEB_ORIGIN=https://gameer.com.ar,https://paranagamejam.com.ar

# Discord OAuth
DISCORD_CLIENT_ID=YOUR_DISCORD_CLIENT_ID
DISCORD_CLIENT_SECRET=YOUR_DISCORD_CLIENT_SECRET

# Google OAuth
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET

# Optional: Gaming Platform APIs
# FACEIT_CLIENT_ID=...
# FACEIT_CLIENT_SECRET=...
# FACEIT_API_KEY=...
# RIOT_CLIENT_ID=...
# RIOT_CLIENT_SECRET=...
# RIOT_API_KEY=...

# Next.js Frontend API URL (for the web app)
NEXT_PUBLIC_API_URL=https://gameer.com.ar/api
```

## Step 5: Build and Push Docker Image to Container Registry

```bash
# Set project variables
export PROJECT_ID=$(gcloud config get-value project)
export IMAGE_NAME=gcr.io/${PROJECT_ID}/gamer-hub-api
export IMAGE_TAG=latest

# Build the Docker image
docker build \
  -f apps/api/Dockerfile \
  -t ${IMAGE_NAME}:${IMAGE_TAG} \
  .

# Push to Google Container Registry
docker push ${IMAGE_NAME}:${IMAGE_TAG}
```

## Step 6: Deploy to Cloud Run

```bash
# Deploy the API to Cloud Run
gcloud run deploy gamer-hub-api \
  --image=gcr.io/${PROJECT_ID}/gamer-hub-api:latest \
  --platform=managed \
  --region=us-central1 \
  --allow-unauthenticated \
  --memory=512Mi \
  --cpu=1 \
  --timeout=300 \
  --set-env-vars=NODE_ENV=production \
  --set-env-vars=JWT_SECRET=${JWT_SECRET} \
  --set-env-vars=WEB_ORIGIN=https://gameer.com.ar,https://paranagamejam.com.ar \
  --set-env-vars=DATABASE_URL=${DATABASE_URL} \
  --set-env-vars=DISCORD_CLIENT_ID=${DISCORD_CLIENT_ID} \
  --set-env-vars=DISCORD_CLIENT_SECRET=${DISCORD_CLIENT_SECRET} \
  --set-env-vars=GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID} \
  --set-env-vars=GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}

# Get the Cloud Run service URL
gcloud run services describe gamer-hub-api --region=us-central1 --format="value(status.url)"
```

## Step 7: Deploy Next.js Frontend

The Next.js frontend is already deployed to Cloudflare Workers. To connect it to the new API:

1. Update `NEXT_PUBLIC_API_URL` in your Cloudflare deployment
2. Redeploy the frontend

```bash
# In the hub directory
cd apps/web
wrangler deploy
```

## Step 8: Verify Deployment

```bash
# Check Cloud Run service status
gcloud run services describe gamer-hub-api --region=us-central1

# View logs
gcloud run logs read gamer-hub-api --limit=50

# Test the API
curl https://YOUR_CLOUD_RUN_URL/api/health

# Test OAuth callback (should redirect to Discord/Google)
curl -L https://YOUR_CLOUD_RUN_URL/api/auth/discord
```

## Troubleshooting

### Cloud SQL Connection Issues
- Verify the instance is running: `gcloud sql instances list`
- Check firewall rules: `gcloud sql instances describe gamer-hub-db`
- Verify DATABASE_URL format in Cloud Run environment variables

### OAuth Redirect Errors
- Verify redirect URIs are exact matches in Discord/Google Developer consoles
- Check that `WEB_ORIGIN` environment variable includes both domains
- Review CORS configuration in `apps/api/src/main.ts`

### Image Build Issues
- Ensure Docker is running: `docker ps`
- Clean build cache: `docker builder prune`
- Check available disk space for multi-stage build

## Rollback

```bash
# List previous revisions
gcloud run revisions list --service=gamer-hub-api --region=us-central1

# Promote a previous revision to 100% traffic
gcloud run services update-traffic gamer-hub-api \
  --to-revisions=REVISION_NAME=100 \
  --region=us-central1
```

## Monitoring

```bash
# View Cloud Run metrics in Cloud Console
# https://console.cloud.google.com/run

# Set up monitoring alerts
gcloud alpha monitoring policies create \
  --notification-channels=CHANNEL_ID \
  --display-name="GamER Hub API Errors"

# View Cloud SQL metrics
# https://console.cloud.google.com/sql/instances/gamer-hub-db
```

## Cost Optimization

- **Cloud Run**: Auto-scales to zero when not in use
- **Cloud SQL**: Use db-f1-micro for development, scale up for production
- **Container Registry**: Clean old images: `gcloud container images delete gcr.io/${PROJECT_ID}/...`
- **Monitoring**: Set up budget alerts in GCP Console

## Next Steps

1. ✅ Create Discord and Google OAuth credentials
2. ✅ Set up Cloud SQL PostgreSQL
3. ✅ Build and push Docker image
4. ✅ Deploy to Cloud Run with environment variables
5. ✅ Update `NEXT_PUBLIC_API_URL` in Next.js frontend
6. ✅ Redeploy frontend to Cloudflare Workers
7. ✅ Test OAuth flows on both domains
8. ✅ Unhide jam CTA section once verified
