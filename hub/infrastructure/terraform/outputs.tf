output "cloud_run_service_url" {
  description = "URL of the Cloud Run service"
  value       = module.cloud_run.service_url
}

output "cloud_run_service_name" {
  description = "Name of the Cloud Run service"
  value       = module.cloud_run.service_name
}

output "database_instance_name" {
  description = "Cloud SQL instance name"
  value       = module.cloud_sql.instance_name
}

output "database_connection_name" {
  description = "Cloud SQL connection name (for Cloud Run connection)"
  value       = module.cloud_sql.connection_name
}

output "database_private_ip" {
  description = "Private IP address of Cloud SQL instance"
  value       = module.cloud_sql.private_ip
  sensitive   = true
}

output "database_connection_string" {
  description = "PostgreSQL connection string (with /cloudsql/ for Cloud Run)"
  value       = module.cloud_sql.connection_string
  sensitive   = true
}

output "service_account_email" {
  description = "Service account email for Cloud Run"
  value       = google_service_account.gamer_hub_api.email
}

output "database_password" {
  description = "Generated database password"
  value       = random_password.db_password.result
  sensitive   = true
}

output "terraform_summary" {
  description = "Summary of deployed resources"
  value = {
    api_url    = module.cloud_run.service_url
    db_instance = module.cloud_sql.instance_name
    region     = var.gcp_region
    project_id = var.gcp_project_id
  }
}
