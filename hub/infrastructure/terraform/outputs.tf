output "cloud_run_service_url" {
  description = "URL of the Cloud Run service"
  value       = module.cloud_run.service_url
}

output "cloud_run_service_name" {
  description = "Name of the Cloud Run service"
  value       = module.cloud_run.service_name
}

# output "firestore_database_id" {
#   description = "Firestore database ID"
#   value       = google_firestore_database.main.name
# }

# output "firestore_project_id" {
#   description = "GCP Project ID for Firestore access"
#   value       = var.gcp_project_id
# }

output "service_account_email" {
  description = "Service account email for Cloud Run"
  value       = google_service_account.gamer_hub_api.email
}

output "terraform_summary" {
  description = "Summary of deployed resources"
  value = {
    api_url     = module.cloud_run.service_url
    database    = "Firestore (gamer-hub)"
    region      = var.gcp_region
    project_id  = var.gcp_project_id
    cost_tier   = "Free (Firestore native)"
  }
}

output "github_actions_setup" {
  description = "Instructions for setting up GitHub Actions"
  value = {
    service_account_email = google_service_account.gamer_hub_api.email
    gcp_project_id        = var.gcp_project_id
    instructions          = "Add GCP_SERVICE_ACCOUNT (base64 encoded key) and other secrets to GitHub repository settings"
  }
}
