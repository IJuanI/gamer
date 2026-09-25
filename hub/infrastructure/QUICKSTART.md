# GamER Hub API Deployment - Quick Start

Complete deployment in 5 steps. Estimated time: **30 minutes**

## Prerequisites

On your local machine, ensure you have:
- ✅ Docker installed and running (`docker ps`)
- ✅ Terraform CLI v1.0+ (`terraform --version`)
- ✅ Google Cloud SDK (`gcloud --version`)
- ✅ gcloud authenticated (`gcloud auth application-default login`)
- ✅ Discord OAuth credentials (provided)
- ✅ Google OAuth credentials (from GCP Console)

## Step 1: Clone and Setup (2 min)

```bash
cd gamer/hub
git pull origin main
cd infrastructure
```

## Step 2: Initialize Terraform (3 min)

```bash
cd terraform
bash setup.sh
```

This will:
- Create GCS bucket for state
- Initialize Terraform backend
- Validate configuration

## Step 3: Set Environment Variables (1-5 min)

### Option A: Automated OAuth Setup (Recommended)
```bash
# Run this to create Google OAuth credentials automatically
bash infrastructure/scripts/setup-google-oauth.sh

# Then set Discord and other variables
export TF_VAR_discord_client_id="1553032775924187256"
export TF_VAR_discord_client_secret="2ztYlziDO5y2yJcOxvFTrOuDB9SoMzlb"
export TF_VAR_jwt_secret=$(openssl rand -hex 32)
export TF_VAR_container_image_url="gcr.io/unity-dummy/gamer-hub-api:latest"
```

### Option B: Manual Setup
```bash
# Discord credentials (provided)
export TF_VAR_discord_client_id="1553032775924187256"
export TF_VAR_discord_client_secret="2ztYlziDO5y2yJcOxvFTrOuDB9SoMzlb"

# Google OAuth (from GCP Console)
export TF_VAR_google_client_id="YOUR_CLIENT_ID_HERE"
export TF_VAR_google_client_secret="YOUR_CLIENT_SECRET_HERE"

# Auto-generate secure secrets
export TF_VAR_jwt_secret=$(openssl rand -hex 32)

# Container image
export TF_VAR_container_image_url="gcr.io/unity-dummy/gamer-hub-api:latest"
```

## Step 4: Build and Deploy (20 min)

From the `hub` directory:

```bash
bash infrastructure/scripts/deploy-api.sh
```

This will:
1. ✅ Build Docker image
2. ✅ Push to Google Container Registry
3. ✅ Plan Terraform deployment
4. ✅ Apply infrastructure changes
5. ✅ Create Cloud SQL database
6. ✅ Deploy Cloud Run service
7. ✅ Show deployment outputs

## Step 5: Update Frontend and Verify (5 min)

```bash
# Get the API URL from deployment output
API_URL=$(cd infrastructure/terraform && terraform output -raw cloud_run_service_url)

# Update frontend
export NEXT_PUBLIC_API_URL="$API_URL"

# Redeploy
cd apps/web
wrangler deploy

# Test the API
curl $API_URL/api/health
# Should return: {"status":"ok","service":"gamer-hub-api"}
```

## Deployment Outputs

After `terraform apply`, you'll get:
- **API URL**: `https://gamer-hub-api-xxx.run.app`
- **Database**: PostgreSQL 15 with automated backups
- **Service Account**: Configured with Cloud SQL access
- **Auto-scaling**: 0-100 replicas based on traffic

## Important Notes

### Secrets Management
- Never commit `.tfstate` files to git
- Never hardcode secrets in environment
- Use environment variables or Google Secret Manager
- Terraform state is encrypted in GCS

### Cost
- **Cloud Run**: $0 when idle (free tier applies)
- **Cloud SQL db-f1-micro**: ~$10/month
- **Storage**: < $0.01/month
- **Total**: ~$10-15/month

### Verify Deployment

```bash
# Check Cloud Run
gcloud run services describe gamer-hub-api --region=us-central1

# Check logs
gcloud run logs read gamer-hub-api --limit=50

# Check database
gcloud sql instances describe gamer-hub-db

# Test OAuth flows
curl -L https://YOUR_API_URL/api/auth/discord
curl -L https://YOUR_API_URL/api/auth/google
```

## Troubleshooting

### Docker build fails
```bash
# Check Docker is running
docker ps

# Check permissions
docker run hello-world
```

### Terraform fails
```bash
# Check backend
terraform backend config

# Debug
TF_LOG=debug terraform plan
```

### Cloud Run won't start
```bash
# Check logs
gcloud run logs read gamer-hub-api --limit=50

# Common issues:
# - Database connection string wrong
# - Missing environment variables
# - Image doesn't exist in GCR
```

### Database connection fails
```bash
# Verify Cloud SQL instance
gcloud sql instances describe gamer-hub-db

# Check database exists
gcloud sql databases list --instance=gamer-hub-db

# Check user exists
gcloud sql users list --instance=gamer-hub-db
```

## Rollback

If something goes wrong:

```bash
# Destroy everything (careful!)
cd infrastructure/terraform
terraform destroy

# Or just destroy specific resources
terraform destroy -target=module.cloud_run
terraform destroy -target=module.cloud_sql
```

To restore from backup:
```bash
# List backups
gcloud sql backups list --instance=gamer-hub-db

# Restore
gcloud sql backups restore BACKUP_ID --backup-instance=gamer-hub-db
```

## Next After Deployment

1. ✅ Test OAuth flows on both domains
2. ✅ Verify database connections work
3. ✅ Update frontend API URL
4. ✅ Redeploy frontend
5. ✅ Unhide jam CTA section in `apps/web/app/jam/page.tsx`
6. ✅ Test login/registration on gameer.com.ar
7. ✅ Monitor logs and metrics

## Support

For detailed information:
- See `terraform/README.md` for complete guide
- Check GCP Console: https://console.cloud.google.com
- Review logs: `gcloud run logs read gamer-hub-api`
- Debug Terraform: `TF_LOG=debug terraform apply`

---

**You're ready to deploy!** Run `bash infrastructure/scripts/deploy-api.sh` when ready.
