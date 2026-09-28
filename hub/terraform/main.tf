terraform {
  required_version = ">= 1.0"

  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.0"
    }
  }

  cloud {
    organization = "gamer"

    workspaces {
      name = "production"
    }
  }
}

provider "cloudflare" {
  api_token = var.cloudflare_api_token
}

locals {
  domain = "gameer.com.ar"
  api_subdomain = "api"
}

# ── Cloudflare D1 Database ─────────────────────────────
resource "cloudflare_d1_database" "gamer_hub" {
  account_id = var.cloudflare_account_id
  name       = "gamer-hub"
}

# ── DNS Records ────────────────────────────────────────
# API worker route: routes requests to the Workers script
resource "cloudflare_workers_route" "api" {
  zone_id     = var.cloudflare_zone_id
  pattern     = "api.${local.domain}/*"
  script_name = "gamer-hub-api"
}

# Primary domain A record (points to Cloudflare)
# The actual deployment is handled by Cloudflare Pages via GitHub integration
resource "cloudflare_record" "root" {
  zone_id = var.cloudflare_zone_id
  name    = "@"
  type    = "CNAME"
  value   = "gameer-com-ar.pages.dev"
  ttl     = 1
  proxied = true
}

# API subdomain CNAME
resource "cloudflare_record" "api" {
  zone_id = var.cloudflare_zone_id
  name    = local.api_subdomain
  type    = "CNAME"
  value   = "gameer-hub-api.workers.dev"
  ttl     = 1
  proxied = true
}

# ── Outputs ────────────────────────────────────────────
output "d1_database_id" {
  description = "D1 Database ID"
  value       = cloudflare_d1_database.gamer_hub.id
}

output "api_url" {
  description = "API URL"
  value       = "https://${local.api_subdomain}.${local.domain}"
}

output "web_url" {
  description = "Web app URL"
  value       = "https://${local.domain}"
}
