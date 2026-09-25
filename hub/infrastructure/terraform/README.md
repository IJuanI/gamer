# GamER Hub Infrastructure as Code - Terraform

This directory contains Terraform configuration for deploying the GamER Hub API and supporting infrastructure to Google Cloud Platform (GCP).

## Overview

The Terraform configuration manages:
- **Cloud SQL PostgreSQL 15** database instance
- **Cloud Run** service for the NestJS API
- **Service Accounts** and IAM permissions
- **Environment variables** and secrets
- **Networking** and security configuration

## Prerequisites

1. **Terraform CLI** installed (`terraform --version`)
2. **Google Cloud SDK** installed and authenticated
   ```bash
   gcloud auth application-default login
   ```
3. **GCP Project** with billing enabled
4. **Docker image** built and pushed to Google Container Registry
5. **OAuth credentials** from Discord and Google

## Quick Start

### 1. Initialize Terraform Backend

First, create a Cloud Storage bucket for Terraform state:

```bash
gsutil mb gs://unity-dummy-terraform-state

# Enable versioning for state backup
gsutil versioning set on gs://unity-dummy-terraform-state
```

Then initialize Terraform with the backend:

```bash
cd infrastructure/terraform
terraform init -backend-config="bucket=unity-dummy-terraform-state"
```

### 2. Set Environment Variables

Option A: Use environment variables
```bash
export TF_VAR_jwt_secret=$(openssl rand -hex 32)
export TF_VAR_discord_client_id="1553032775924187256"
export TF_VAR_discord_client_secret="2ztYlziDO5y2yJcOxvFTrOuDB9SoMzlb"
export TF_VAR_google_client_id="YOUR_GOOGLE_CLIENT_ID"
export TF_VAR_google_client_secret="YOUR_GOOGLE_CLIENT_SECRET"
export TF_VAR_container_image_url="gcr.io/unity-dummy/gamer-hub-api:latest"
```

Option B: Use terraform.tfvars (less secure, don't commit!)
```bash
# Edit environments/production/terraform.tfvars with your values
# Then apply with:
terraform apply -var-file="environments/production/terraform.tfvars"
```

### 3. Review the Plan

```bash
terraform plan -out=tfplan
```

Review the output to ensure all resources are correct.

### 4. Apply the Configuration

```bash
terraform apply tfplan
```

Terraform will create:
1. Cloud SQL instance (takes ~5 minutes)
2. Database and user
3. Cloud Run service
4. Service account and IAM bindings

### 5. Get Outputs

After successful deployment:

```bash
terraform output

# Or specific outputs:
terraform output cloud_run_service_url
terraform output database_connection_string
```

Save these values, especially:
- `cloud_run_service_url`: Update `NEXT_PUBLIC_API_URL` in frontend
- `database_connection_string`: Already configured in Cloud Run

## File Structure

```
infrastructure/terraform/
├── README.md                          # This file
├── main.tf                            # Primary configuration
├── variables.tf                       # Variable definitions
├── outputs.tf                         # Output values
├── modules/
│   ├── cloud-sql/                     # Cloud SQL module
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   └── cloud-run/                     # Cloud Run module
│       ├── main.tf
│       ├── variables.tf
│       └── outputs.tf
└── environments/
    └── production/                    # Production configuration
        └── terraform.tfvars           # Environment-specific values
```

## Common Operations

### View Current State

```bash
terraform show
```

### Update Specific Resource

```bash
# Update only the Cloud Run image
terraform apply -target=module.cloud_run \
  -var="container_image_url=gcr.io/unity-dummy/gamer-hub-api:v2"
```

### Destroy All Resources

⚠️ **WARNING: This will delete all resources including the database!**

```bash
terraform destroy

# To skip the prompt:
terraform destroy -auto-approve
```

### Destroy Only Specific Resources

```bash
# Destroy only Cloud Run, keep database
terraform destroy -target=module.cloud_run
```

### View Terraform State

```bash
# List all resources
terraform state list

# Show specific resource
terraform state show google_sql_database_instance.main

# Advanced: Debug state
terraform state show -json | jq '.'
```

## Handling Sensitive Data

Sensitive variables (secrets) should **never** be committed to git:

1. **Use environment variables:**
   ```bash
   export TF_VAR_jwt_secret="..."
   export TF_VAR_discord_client_secret="..."
   ```

2. **Use .tfvars.secret (gitignored):**
   ```bash
   # Create file and add to .gitignore
   echo ".tfvars.secret" >> .gitignore
   # Then: terraform apply -var-file=".tfvars.secret"
   ```

3. **Use Google Cloud Secret Manager:**
   ```bash
   gcloud secrets create gamer-hub-jwt-secret --data-file=-
   ```

## Troubleshooting

### Error: `terraform init` fails

**Solution:** Ensure gcloud is authenticated:
```bash
gcloud auth application-default login
gcloud config set project unity-dummy
```

### Error: Cloud SQL instance creation fails

**Solution:** Check API is enabled:
```bash
gcloud services enable sqladmin.googleapis.com
```

### Error: Container image not found

**Solution:** Ensure image is built and pushed:
```bash
docker build -f apps/api/Dockerfile -t gcr.io/unity-dummy/gamer-hub-api:latest .
docker push gcr.io/unity-dummy/gamer-hub-api:latest
```

### Error: Cloud Run service unhealthy

**Solution:** Check logs:
```bash
gcloud run logs read gamer-hub-api --limit=50
```

### State Lock Error

If Terraform locks the state (interrupted apply):
```bash
terraform force-unlock <LOCK_ID>
```

## Monitoring

After deployment, monitor your resources:

```bash
# Cloud Run metrics and logs
gcloud run logs read gamer-hub-api --limit=50
gcloud run services describe gamer-hub-api

# Cloud SQL metrics
gcloud sql instances describe gamer-hub-db
gcloud sql backups list --instance=gamer-hub-db

# Check Cloud Run revisions
gcloud run revisions list --service=gamer-hub-api
```

## Disaster Recovery

### Backup Database

Cloud SQL automatic backups run daily. To create manual backup:

```bash
gcloud sql backups create \
  --instance=gamer-hub-db \
  --description="Manual backup before deployment"
```

### Restore from Backup

```bash
gcloud sql backups restore BACKUP_ID \
  --backup-instance=gamer-hub-db
```

### Rollback Cloud Run

```bash
# List previous revisions
gcloud run revisions list --service=gamer-hub-api

# Promote previous revision (blue-green deployment)
gcloud run services update-traffic gamer-hub-api \
  --to-revisions=REVISION_NAME=100
```

## Cost Optimization

1. **Cloud Run Auto-scaling:** Scales to 0 when idle (free tier applies)
2. **Cloud SQL db-f1-micro:** Shared core tier (~$10/month)
3. **Cloud Storage state bucket:** < $0.01/month

Current estimated monthly cost: **~$10-15**

## Next Steps

1. ✅ Configure Terraform backend (Cloud Storage bucket)
2. ✅ Set environment variables with secrets
3. ✅ Run `terraform plan` to review
4. ✅ Run `terraform apply` to deploy
5. ✅ Update frontend `NEXT_PUBLIC_API_URL` with Cloud Run URL
6. ✅ Redeploy frontend
7. ✅ Test OAuth flows
8. ✅ Unhide jam CTA section in frontend

## Support

For issues:
1. Check Terraform logs: `TF_LOG=debug terraform apply`
2. Check GCP Console: https://console.cloud.google.com
3. Review Cloud Run logs: `gcloud run logs read gamer-hub-api`
4. Check Cloud SQL logs: GCP Console → Cloud SQL → gamer-hub-db → Logs

## References

- [Terraform Google Provider](https://registry.terraform.io/providers/hashicorp/google/latest/docs)
- [Cloud SQL Terraform](https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/sql_database_instance)
- [Cloud Run Terraform](https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/cloud_run_service)
- [Terraform Backend Configuration](https://www.terraform.io/docs/language/settings/backends/gcs.html)
