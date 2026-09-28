terraform {
  required_version = ">= 1.0"

  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.0"
    }
  }

}

provider "cloudflare" {
  api_token = var.cloudflare_api_token
}

locals {
  domain = "gameer.com.ar"
}

# ── Cloudflare D1 Database ─────────────────────────────
resource "cloudflare_d1_database" "gamer_hub" {
  account_id = var.cloudflare_account_id
  name       = "gamer-hub-prod"
}

# NOTE: The gamer-hub Worker itself (routes, GitHub build trigger, and its
# route for gameer.com.ar/* + paranagamejam.com.ar/*) is managed by Cloudflare
# Workers Builds (GitHub integration) and apps/web/wrangler.toml, not
# Terraform. This file only manages the D1 database that the Worker binds to.
# After `terraform apply`, take the `d1_database_id` output and either:
#   - uncomment the [[d1_databases]] block in apps/web/wrangler.toml, or
#   - bind it manually via `cf d1`.

# ── Outputs ────────────────────────────────────────────
output "d1_database_id" {
  description = "D1 Database ID — set as database_id in apps/web/wrangler.toml"
  value       = cloudflare_d1_database.gamer_hub.id
}

output "web_url" {
  description = "Web app + API URL (single Worker)"
  value       = "https://${local.domain}"
}
