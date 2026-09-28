# Cloudflare D1 Database
# SQLite database at the edge for GamER Hub API

resource "cloudflare_d1_database" "gamer" {
  account_id = var.cloudflare_account_id
  name       = "${local.project_name}-${local.environment}"
}

output "d1_database_id" {
  description = "D1 database ID for Wrangler bindings"
  value       = cloudflare_d1_database.gamer.id
}

output "d1_database_name" {
  description = "D1 database name"
  value       = cloudflare_d1_database.gamer.name
}
