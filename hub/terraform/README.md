# GamER Hub — Terraform Infrastructure

This directory contains Terraform configuration for managing GamER Hub's Cloudflare infrastructure.

## Overview

The Terraform configuration manages:
- **D1 Database**: SQLite-based SQL database for application data
- **DNS Records**: CNAME records for API and web app subdomains
- **Workers Routes**: Route binding for API requests to the Workers script

## Prerequisites

1. **Terraform** >= 1.0
   ```bash
   terraform --version
   ```

2. **Cloudflare Account**
   - Zone must be delegated to Cloudflare
   - API token with appropriate permissions

3. **Required Secrets**
   - `CLOUDFLARE_API_TOKEN`: Cloudflare API token
   - `CLOUDFLARE_ACCOUNT_ID`: Cloudflare account ID
   - `CLOUDFLARE_ZONE_ID`: Zone ID for gameer.com.ar

## Setup

### 1. Get Cloudflare credentials

```bash
# From Cloudflare Dashboard:
# 1. API Tokens → Create Token → "Edit Cloudflare Workers" template
# 2. Account details → Account ID
# 3. Zone details → Zone ID
```

### 2. Create terraform.tfvars

```bash
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your credentials
```

**Important:** Never commit `terraform.tfvars` to git!

### 3. Initialize Terraform

```bash
terraform init
```

This will:
- Download required providers (cloudflare)
- Set up local state management (or remote state if configured)

## Usage

### Plan Infrastructure

```bash
terraform plan
```

Review the output to verify all resources will be created correctly.

### Apply Configuration

```bash
terraform apply
```

This will:
1. Create D1 database
2. Create DNS records
3. Set up Workers routes
4. Output URLs for verification

### Destroy Infrastructure (Caution!)

```bash
terraform destroy
```

**Warning:** This will delete all managed resources, including the database!

## Variables

### Required

- `cloudflare_api_token`: Cloudflare API token (sensitive)
- `cloudflare_account_id`: Cloudflare account ID
- `cloudflare_zone_id`: Zone ID for gameer.com.ar
- `jwt_secret`: JWT secret for signing tokens (sensitive)

### Optional

- `discord_client_id`: Discord OAuth client ID
- `discord_client_secret`: Discord OAuth client secret
- `google_client_id`: Google OAuth client ID
- `google_client_secret`: Google OAuth client secret
- `cloudflare_web_analytics_tag`: Cloudflare Web Analytics tag

See `variables.tf` for detailed descriptions.

## Outputs

After applying, Terraform outputs:
- `d1_database_id`: ID of created D1 database
- `api_url`: Production API URL
- `web_url`: Production web app URL

## State Management

### Local State (Development)

By default, Terraform stores state in `terraform.tfstate`. This file:
- Contains sensitive data
- Must be gitignored
- Should be backed up

### Remote State (Production)

For production, use Terraform Cloud or S3:

```hcl
# terraform/cloud.tf
terraform {
  cloud {
    organization = "your-org"
    workspaces {
      name = "production"
    }
  }
}
```

## CI/CD Integration

The GitHub Actions workflow (`.github/workflows/gamer-ci.yml`) includes:

1. **Terraform Plan**: On all PRs
2. **Terraform Apply**: On main branch push (production only)

Required secrets in GitHub:
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_ZONE_ID`
- `JWT_SECRET`

## Troubleshooting

### Terraform state lock

If state is locked:
```bash
terraform force-unlock LOCK_ID
```

### DNS records not updating

- Check Cloudflare dashboard for the new records
- Verify zone delegation: `dig +trace gameer.com.ar`
- Allow 5-30 minutes for global DNS propagation

### D1 database binding fails

- Ensure D1 database name matches `wrangler.toml`
- Check database ID in Terraform outputs
- Update `wrangler.toml` with correct binding

## Resources

- [Cloudflare Terraform Provider](https://registry.terraform.io/providers/cloudflare/cloudflare/latest)
- [Terraform Documentation](https://www.terraform.io/docs)
- [Cloudflare D1 Documentation](https://developers.cloudflare.com/d1/)
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)

## Maintenance

### Regular updates

```bash
# Update Terraform providers
terraform init -upgrade

# Plan and review changes
terraform plan

# Apply if safe
terraform apply
```

### Backup state

```bash
# Backup current state
cp terraform.tfstate terraform.tfstate.backup.$(date +%Y%m%d)
```

## Support

For issues or questions:
1. Check Cloudflare documentation
2. Review `.github/workflows/gamer-ci.yml` for CI/CD patterns
3. Open an issue in the repository
