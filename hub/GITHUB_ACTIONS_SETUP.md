# GitHub Actions Deployment Setup

This document explains the automated CI/CD pipeline for deploying the GamER Hub API to Cloud Run using GitHub Actions.

## Architecture

```
PR opened
  ↓
  └─→ GitHub Actions builds Docker image
       ├─ Tag: pr-###
       ├─ Deploy to Cloud Run (NO TRAFFIC)
       └─ Comment PR with ephemeral API URL
          
PR merged to main
  ↓
  └─→ GitHub Actions builds Docker image
       ├─ Tag: latest
       ├─ Deploy to Cloud Run (100% TRAFFIC)
       └─ Previous revision kept for rollback
       
PR closed
  ↓
  └─→ GitHub Actions cleanup
       └─ Delete ephemeral revision pr-###
```

## Features

- **Ephemeral PR deployments**: Each PR gets its own Cloud Run revision with no traffic
- **Production deployments**: Main branch deploys with 100% traffic
- **Automatic cleanup**: PR revisions are deleted when PR is closed
- **Developer testing**: Use `ephemeralApi(pr-###)` in browser console to test PR versions
- **Zero Docker setup**: Docker build handled automatically in GitHub Actions

## Initial Setup

### 1. Create GCP Service Account Key

The Terraform deployment creates a service account key. Export it:

```bash
cd hub/infrastructure/terraform
terraform apply

# Export the key (you'll need to manually create it via gcloud since Terraform won't output it)
gcloud iam service-accounts keys create key.json \
  --iam-account=gamer-hub-api@unity-dummy.iam.gserviceaccount.com
```

### 2. Add GitHub Repository Secrets

In your GitHub repository settings (Settings → Secrets and variables → Actions), add:

```
GCP_PROJECT: unity-dummy
GCP_SERVICE_ACCOUNT: [base64 encoded content of key.json]
```

To base64 encode the key on Linux/Mac:
```bash
base64 -w 0 key.json | pbcopy  # Mac
base64 -w 0 key.json           # Linux (copy manually)
```

On Windows PowerShell:
```powershell
[Convert]::ToBase64String([System.IO.File]::ReadAllBytes("key.json")) | Set-Clipboard
```

### 3. (Optional) Environment Variables

You can also add other secrets needed by the API:

```
DISCORD_CLIENT_ID
DISCORD_CLIENT_SECRET
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
JWT_SECRET
WEB_ORIGIN
```

These will be passed to Cloud Run as environment variables.

## Workflow Files

### `.github/workflows/deploy-api.yml`

Main deployment workflow:
- Triggers on pushes to `main` or PRs modifying `apps/api/`
- Builds Docker image
- Pushes to Google Container Registry
- Deploys to Cloud Run
- Comments on PRs with ephemeral API URL

## Usage

### Testing a PR

1. Push to a PR branch
2. GitHub Actions automatically builds and deploys
3. PR comment includes ephemeral API URL
4. In browser console (frontend page): `ephemeralApi(123)` to switch to PR version
5. Test the API
6. `ephemeralApi()` to switch back to production
7. Merge when ready

### Deploying to Production

Simply merge the PR to `main` branch. GitHub Actions will:
1. Build Docker image
2. Tag as `latest`
3. Deploy to Cloud Run with 100% traffic

### Monitoring Deployments

Monitor deployments in:
- GitHub Actions tab
- Google Cloud Run console
- Cloud Run revisions list

## Troubleshooting

### Docker build fails

Check GitHub Actions logs for Docker build errors. Common issues:
- Missing dependencies in `apps/api/package.json`
- Dockerfile syntax errors
- Missing environment variables at build time

### Cloud Run deployment fails

Check Cloud Run service details:
```bash
gcloud run services describe gamer-hub-api --region=us-central1
gcloud run revisions list --service=gamer-hub-api --region=us-central1
```

### Ephemeral API not accessible

Ensure:
1. PR revision has been deployed (check GitHub Actions)
2. DNS propagation (usually instant)
3. Browser has cached old URL (hard refresh)
4. CORS headers are correct (dev.module might need adjustment)

## Cost Implications

- **Cloud Run**: Free tier includes 2 million requests/month
- **Container Registry**: $0.10/GB/month for storage
- **Ephemeral PRs**: Don't consume traffic quota (0% traffic)
- **No additional cost** for the CD pipeline itself

## Security Notes

- Service account key is sensitive - treat like a password
- Never commit `key.json` to git
- GitHub secrets are encrypted and only available to Actions
- Ephemeral revisions are visible but receive no production traffic
- Consider rotating service account keys periodically

## Architecture Decisions

### Why Ephemeral PR Deployments?

1. **Isolation**: Each PR has its own Cloud Run revision
2. **Testing**: Easy to test in exact production environment
3. **Zero Risk**: No traffic routed to PR versions
4. **Cost**: Ephemeral versions don't consume quota
5. **Rollback**: Previous production version always available

### Why Not Blue-Green Deployments?

Cloud Run handles this for us via revisions and traffic splitting. We're using the simpler approach of separate revisions rather than managing traffic percentages.

## Future Enhancements

- [ ] Automatic performance testing on PR revisions
- [ ] Database backup before production deploy
- [ ] Slack notifications on deployment status
- [ ] Gradual traffic migration (canary deployments)
- [ ] Workload Identity Federation (instead of service account keys)
