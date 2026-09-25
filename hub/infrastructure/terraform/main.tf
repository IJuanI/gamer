terraform {
  required_version = ">= 1.0"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.0"
    }
  }

  # Backend configuration - uses Cloud Storage for state
  # Initialize with: terraform init -backend-config="bucket=YOUR_BUCKET"
  backend "gcs" {
    prefix = "gamer-hub/terraform"
  }
}

provider "google" {
  project = var.gcp_project_id
  region  = var.gcp_region
}

# Generate secure random password for database
resource "random_password" "db_password" {
  length  = 32
  special = true
}

# Cloud SQL PostgreSQL Instance
module "cloud_sql" {
  source = "./modules/cloud-sql"

  instance_name         = var.db_instance_name
  database_version      = var.db_version
  region                = var.gcp_region
  tier                  = var.db_tier
  database_name         = var.db_name
  db_username           = var.db_username
  db_password           = random_password.db_password.result
  backup_start_time     = var.db_backup_start_time
  availability_type     = var.db_availability_type
}

# Cloud Run Service Account
resource "google_service_account" "gamer_hub_api" {
  account_id   = "gamer-hub-api"
  display_name = "GamER Hub API Service Account"
  description  = "Service account for GamER Hub API running on Cloud Run"
}

# IAM binding for Cloud SQL Client role
resource "google_project_iam_member" "cloud_sql_client" {
  project = var.gcp_project_id
  role    = "roles/cloudsql.client"
  member  = "serviceAccount:${google_service_account.gamer_hub_api.email}"
}

# Cloud Run Service
module "cloud_run" {
  source = "./modules/cloud-run"

  service_name           = var.cloud_run_service_name
  region                 = var.gcp_region
  image_url              = var.container_image_url
  service_account_email  = google_service_account.gamer_hub_api.email
  memory                 = var.cloud_run_memory
  cpu                    = var.cloud_run_cpu
  timeout                = var.cloud_run_timeout
  allow_unauthenticated  = var.cloud_run_allow_unauthenticated

  environment_variables = {
    NODE_ENV                   = "production"
    API_PORT                   = "4000"
    JWT_SECRET                 = var.jwt_secret
    WEB_ORIGIN                 = var.web_origin
    DATABASE_URL               = module.cloud_sql.connection_string
    DISCORD_CLIENT_ID          = var.discord_client_id
    DISCORD_CLIENT_SECRET      = var.discord_client_secret
    GOOGLE_CLIENT_ID           = var.google_client_id
    GOOGLE_CLIENT_SECRET       = var.google_client_secret
  }

  depends_on = [
    google_project_iam_member.cloud_sql_client
  ]
}

# Enable required APIs
resource "google_project_service" "required_apis" {
  for_each = toset([
    "run.googleapis.com",
    "sqladmin.googleapis.com",
    "compute.googleapis.com",
    "cloudresourcemanager.googleapis.com",
    "iap.googleapis.com",
  ])

  project            = var.gcp_project_id
  service            = each.value
  disable_on_destroy = false
}
