# 🚀 Deploy GamER Hub API NOW

**Everything is ready. Run this on your local machine to deploy.**

## What You Need Locally

- ✅ Docker (running: `docker ps`)
- ✅ Terraform v1.0+ (`terraform --version`)
- ✅ Google Cloud SDK (`gcloud auth application-default login`)
- ✅ curl and bash

## One Command to Deploy Everything

```bash
cd gamer/hub
bash infrastructure/scripts/full-deploy.sh
```

This single script will:
1. ✅ Set up Google OAuth credentials (opens browser)
2. ✅ Build Docker image (~5 min)
3. ✅ Push to Google Container Registry (~2 min)
4. ✅ Create Terraform backend
5. ✅ Deploy Firestore + Cloud Run (~15 min)
6. ✅ Update frontend with new API URL
7. ✅ Test that everything works
8. ✅ Output the live API URL

**Total time: ~25 minutes** (faster with Firestore, no DB setup)

## What Happens

```
Infrastructure before:
❌ No database
❌ No API

After full-deploy.sh:
✅ Firestore database (free tier, $0/month)
✅ Cloud Run API with auto-scaling (0-100 replicas)
✅ Discord + Google OAuth configured
✅ Health checks and monitoring
✅ Frontend updated and working
```

## After Deployment

The script outputs:

```
API URL: https://gamer-hub-api-xxx.run.app
Database: Firestore (gamer-hub)
Cost: $0/month (free tier)
```

### Test the API

```bash
# Once deployed, test it:
export API_URL=$(cd infrastructure/terraform && terraform output -raw cloud_run_service_url)
bash infrastructure/scripts/test-api.sh
```

Expected output:
```
✓ Health check (200)
✓ Discord OAuth redirect
✓ Google OAuth redirect
✓ HTTPS protocol confirmed
✓ TLS certificate valid
✓ JSON response format
✓ Response time: 150ms

All tests passed! API is working.
```

### Access the Deployed API

- **Health:** `https://gamer-hub-api-xxx.run.app/api/health`
- **Discord Login:** `https://gamer-hub-api-xxx.run.app/api/auth/discord`
- **Google Login:** `https://gamer-hub-api-xxx.run.app/api/auth/google`

### Test on Frontend

1. Visit: `https://gameer.com.ar/registro`
2. Click "Ingresar con Discord" or "Ingresar con Google"
3. Complete OAuth flow
4. Should successfully log in

### Unhide Jam CTA

Once verified, the "Crear mi cuenta" button on `https://paranagamejam.com.ar` can be unhidden:

```bash
# Edit the file
code apps/web/app/jam/page.tsx

# Find: <section id="comunidad" className="relative" style={{ display: "none" }}>
# Change to: <section id="comunidad" className="relative">

# Redeploy
cd apps/web && wrangler deploy
```

## What If Something Goes Wrong?

### Docker build fails
```bash
docker system prune
bash infrastructure/scripts/full-deploy.sh
```

### Terraform fails
```bash
# Check logs
TF_LOG=debug bash infrastructure/scripts/full-deploy.sh

# Or check specific resource
cd infrastructure/terraform
terraform show google_sql_database_instance.main
```

### API won't start
```bash
# Check Cloud Run logs
gcloud run logs read gamer-hub-api --limit=50

# Common issues:
# - Database connection string wrong
# - Missing environment variables
# - Image doesn't exist in GCR
```

### Can't push to GCR
```bash
# Re-authenticate
gcloud auth configure-docker

# Try push again
docker push gcr.io/unity-dummy/gamer-hub-api:latest
```

## Deployment Files

- **Main script:** `infrastructure/scripts/full-deploy.sh`
- **Terraform config:** `infrastructure/terraform/` 
- **Docker image:** `apps/api/Dockerfile`
- **Quick test:** `infrastructure/scripts/test-api.sh`

## Expected Outputs

When complete:

```
API URL: https://gamer-hub-api-xxx.run.app
Database Connection: unity-dummy:us-central1:gamer-hub-db
Status: ✓ All tests passed! API is working.

Frontend can now use:
  NEXT_PUBLIC_API_URL=https://gamer-hub-api-xxx.run.app
```

## Credentials Used

- **Discord:** Already configured (provided earlier)
- **Google:** Created via OAuth setup script (browser-based)
- **JWT Secret:** Auto-generated (32-byte random)
- **Database:** Auto-generated password (stored in Terraform state)

## Cost

- **Cloud Run:** $0/month (scales to 0 when idle)
- **Cloud SQL:** ~$10/month (db-f1-micro tier)
- **Storage:** < $1/month
- **Total:** ~$10-15/month

## Monitoring

After deployment:

```bash
# View API logs
gcloud run logs read gamer-hub-api --limit=100

# Monitor Cloud Run
gcloud run services describe gamer-hub-api

# Check database
gcloud sql instances describe gamer-hub-db

# View metrics
# https://console.cloud.google.com/run/detail/us-central1/gamer-hub-api
```

## Support

- **Terraform docs:** `infrastructure/terraform/README.md`
- **Quick reference:** `infrastructure/QUICKSTART.md`
- **Detailed guide:** `DEPLOYMENT_READY.md`

---

## Ready?

```bash
cd gamer/hub
bash infrastructure/scripts/full-deploy.sh
```

**This is the only command you need to run.** Everything else is automated.

The API will be live, the frontend will be updated, and you'll have a working production deployment with:
- ✅ PostgreSQL database
- ✅ Node.js API on Cloud Run
- ✅ Discord + Google OAuth
- ✅ Auto-scaling
- ✅ Monitoring and logs
- ✅ Daily backups

**~30 minutes to production. Let's go! 🚀**
