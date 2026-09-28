# Cloudflare Workers for API and Frontend
# Both workers are deployed from built artifacts in GHA

# API Worker
# Runs NestJS backend on Cloudflare Workers
resource "cloudflare_workers_script" "api" {
  account_id = var.cloudflare_account_id
  name       = "${local.project_name}-api"
  
  # Content loaded from built artifact during GHA deploy
  # For now, placeholder. GHA will upload the actual build
  content = "export default { async fetch(request) { return new Response('API Worker - building...'); } }"

  # D1 database binding
  plain_text_binding {
    name = "DB"
    text = cloudflare_d1_database.gamer.id
  }

  # Environment variables as secrets
  secret_text_binding {
    name = "JWT_SECRET"
    text = var.jwt_secret
  }

  secret_text_binding {
    name = "DISCORD_CLIENT_ID"
    text = var.discord_client_id
  }

  secret_text_binding {
    name = "DISCORD_CLIENT_SECRET"
    text = var.discord_client_secret
  }

  secret_text_binding {
    name = "GOOGLE_CLIENT_ID"
    text = var.google_client_id
  }

  secret_text_binding {
    name = "GOOGLE_CLIENT_SECRET"
    text = var.google_client_secret
  }

  # Optional: Gaming platform integrations
  secret_text_binding {
    name = "FACEIT_API_KEY"
    text = var.faceit_api_key
  }

  secret_text_binding {
    name = "RIOT_API_KEY"
    text = var.riot_api_key
  }

  plain_text_binding {
    name = "WEB_ORIGIN"
    text = var.web_origin
  }

  plain_text_binding {
    name = "NODE_ENV"
    text = local.environment
  }
}

# Frontend Worker
# Serves Next.js frontend on Cloudflare Workers
resource "cloudflare_workers_script" "web" {
  account_id = var.cloudflare_account_id
  name       = "${local.project_name}-web"
  
  # Content loaded from built artifact during GHA deploy
  content = "export default { async fetch(request) { return new Response('Web Worker - building...'); } }"

  # API URL binding
  plain_text_binding {
    name = "NEXT_PUBLIC_API_URL"
    text = var.api_url
  }
}

# Routes: API on gameer.com.ar and paranagamejam.com.ar
resource "cloudflare_workers_route" "api_gameer" {
  zone_id     = var.gameer_zone_id
  pattern     = "api.gameer.com.ar/*"
  script_name = cloudflare_workers_script.api.name
}

resource "cloudflare_workers_route" "api_paranagamejam" {
  zone_id     = var.paranagamejam_zone_id
  pattern     = "api.paranagamejam.com.ar/*"
  script_name = cloudflare_workers_script.api.name
}

# Routes: Web on main domains
resource "cloudflare_workers_route" "web_gameer" {
  zone_id     = var.gameer_zone_id
  pattern     = "gameer.com.ar/*"
  script_name = cloudflare_workers_script.web.name
}

resource "cloudflare_workers_route" "web_paranagamejam" {
  zone_id     = var.paranagamejam_zone_id
  pattern     = "paranagamejam.com.ar/*"
  script_name = cloudflare_workers_script.web.name
}

# KV Namespace for sessions (if needed)
resource "cloudflare_workers_kv_namespace" "sessions" {
  account_id = var.cloudflare_account_id
  title      = "${local.project_name}-sessions"
}

output "api_worker_name" {
  value = cloudflare_workers_script.api.name
}

output "web_worker_name" {
  value = cloudflare_workers_script.web.name
}

output "sessions_kv_namespace_id" {
  value = cloudflare_workers_kv_namespace.sessions.id
}
