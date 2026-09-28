# GamER Hub Infrastructure as Code

Terraform configuration for deploying GamER Hub on Cloudflare.

## Prerequisites

1. **Cloudflare Account**: 
   - API token with full permissions (get from https://dash.cloudflare.com/profile/api/tokens)
   - Account ID (visible in Cloudflare dashboard URL)
   - Zone IDs for gameer.com.ar and paranagamejam.com.ar

2. **Terraform** (>= 1.0):
   ```bash
   brew install terraform  # macOS
   # or download from https://www.terraform.io/downloads
   ```

3. **Secrets** (from .env.production.example):
   - JWT_SECRET
   - Discord OAuth credentials
   - Google OAuth credentials
   - (Optional) FACEIT and Riot API keys

## Setup

### 1. Initialize Terraform State

```bash
cd infrastructure/terraform
terraform init
```

This creates a local `.terraform` directory (keep it, don't commit it).

### 2. Configure Variables

Copy and fill in your secrets:

```bash
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your actual credentials
```

**IMPORTANT**: Never commit `terraform.tfvars` to Git. It's in `.gitignore` for safety.

### 3. Plan the Deployment

```bash
terraform plan -out=tfplan
```

This shows what Terraform will create without actually creating it. Review carefully.

### 4. Apply the Configuration

```bash
terraform apply tfplan
```

This creates:
- ✅ D1 database (`gamer-hub-prod`)
- ✅ API Worker (`gamer-hub-api`)
- ✅ Web Worker (`gamer-hub-web`)
- ✅ KV namespace for sessions
- ✅ Worker routes on gameer.com.ar and paranagamejam.com.ar
- ✅ Worker bindings for D1, secrets, and environment variables

### 5. Verify Deployment

```bash
terraform output
```

Shows the created resource IDs and names.

## Managing State

### Local State (Current Setup)

State is stored in `terraform.tfstate` (gitignored for safety).

**Backup before changes:**
```bash
cp terraform.tfstate terraform.tfstate.backup
```

### Remote State (Recommended for Production)

For team collaboration and safety, use Terraform Cloud:

1. Create account at https://app.terraform.io
2. Uncomment the `cloud` block in `main.tf`
3. Authenticate: `terraform login`
4. Run `terraform init` to migrate state

## Updating Resources

Edit `.tf` files, then:

```bash
terraform plan
terraform apply
```

## Destroying Resources (Careful!)

To delete all infrastructure:

```bash
terraform destroy
```

This will ask for confirmation. **This is destructive and cannot be undone.**

## Secrets Management

Sensitive values are marked as `sensitive = true` in Terraform. They won't be logged or printed.

To rotate a secret:

```bash
# Edit terraform.tfvars
vim terraform.tfvars

# Update in Terraform
terraform apply
```

## Troubleshooting

### API Token Issues

```bash
# Test your Cloudflare API token
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://api.cloudflare.com/client/v4/user/tokens/verify
```

### State Lock Issues

If Terraform locks unexpectedly:

```bash
# Force unlock (use with caution!)
terraform force-unlock LOCK_ID
```

### See Detailed Logs

```bash
TF_LOG=DEBUG terraform apply
```

## CI/CD Integration

GitHub Actions will run `terraform apply` automatically on successful tests. See `../.github/workflows/gamer-ci.yml`.

Environment variables needed in GitHub:
- `TF_VAR_cloudflare_api_token`
- `TF_VAR_cloudflare_account_id`
- `TF_VAR_jwt_secret`
- (all other secrets from terraform.tfvars)

## File Structure

```
infrastructure/
├── README.md                    (this file)
├── .env.example
└── terraform/
    ├── main.tf                  (provider, locals, outputs)
    ├── d1.tf                    (database)
    ├── workers.tf               (API and web workers)
    ├── variables.tf             (variable definitions)
    ├── terraform.tfvars.example (example values)
    ├── .gitignore               (protect secrets)
    └── .terraform/              (local cache, gitignored)
```

## Next Steps

1. Fill in `terraform.tfvars` with your secrets
2. Run `terraform plan` and review
3. Run `terraform apply` to create infrastructure
4. Proceed to Phase 3: API refactoring (NestJS → Workers)
