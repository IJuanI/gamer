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
  # Temporarily disabled for local deployment
  # backend "gcs" {
  #   prefix = "gamer-hub/terraform"
  # }
}

provider "google" {
  project = var.gcp_project_id
  region  = var.gcp_region
}

# Enable Firestore API
# TEMPORARILY COMMENTED - billing configuration issue
# resource "google_project_service" "firestore_api" {
#   project = var.gcp_project_id
#   service = "firestore.googleapis.com"
#   disable_on_destroy = false
# }

# Create Firestore database (free tier)
# TEMPORARILY COMMENTED - billing configuration issue
# resource "google_firestore_database" "main" {
#   project = var.gcp_project_id
#   name = "gamer-hub"
#   location_id = var.gcp_region
#   type = "FIRESTORE_NATIVE"
#
#   depends_on = [google_project_service.firestore_api]
# }

# Cloud Run Service Account
resource "google_service_account" "gamer_hub_api" {
  account_id   = "gamer-hub-api"
  display_name = "GamER Hub API Service Account"
  description  = "Service account for GamER Hub API running on Cloud Run"
}

# IAM binding for Firestore access
resource "google_project_iam_member" "firestore_user" {
  project = var.gcp_project_id
  role    = "roles/datastore.user"
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
    FIREBASE_PROJECT_ID        = var.gcp_project_id
    DISCORD_CLIENT_ID          = var.discord_client_id
    DISCORD_CLIENT_SECRET      = var.discord_client_secret
    GOOGLE_CLIENT_ID           = var.google_client_id
    GOOGLE_CLIENT_SECRET       = var.google_client_secret
  }

  depends_on = [
    google_project_iam_member.firestore_user
  ]
}

# Enable required APIs
resource "google_project_service" "required_apis" {
  for_each = toset([
    "run.googleapis.com",
    "compute.googleapis.com",
    "cloudresourcemanager.googleapis.com",
    "iap.googleapis.com",
  ])

  project            = var.gcp_project_id
  service            = each.value
  disable_on_destroy = false
}

# GitHub Actions service account key (for CI/CD)
resource "google_service_account_key" "github_actions" {
  service_account_id = google_service_account.gamer_hub_api.name
  public_key_type    = "TYPE_X509_PEM_FILE"
}

# IAM role for Cloud Run deployments and artifact registry
resource "google_project_iam_member" "github_cloud_run" {
  project = var.gcp_project_id
  role    = "roles/run.admin"
  member  = "serviceAccount:${google_service_account.gamer_hub_api.email}"
}

resource "google_project_iam_member" "github_artifact_registry" {
  project = var.gcp_project_id
  role    = "roles/artifactregistry.writer"
  member  = "serviceAccount:${google_service_account.gamer_hub_api.email}"
}

# Enable Cloud Build API
resource "google_project_service" "cloudbuild_api" {
  project            = var.gcp_project_id
  service            = "cloudbuild.googleapis.com"
  disable_on_destroy = false
}

# Enable Container Registry API
resource "google_project_service" "container_registry_api" {
  project            = var.gcp_project_id
  service            = "containerregistry.googleapis.com"
  disable_on_destroy = false
}

# IAM role for Cloud Build
resource "google_project_iam_member" "cloud_build_editor" {
  project = var.gcp_project_id
  role    = "roles/cloudbuild.builds.editor"
  member  = "serviceAccount:${google_service_account.gamer_hub_api.email}"
}

# IAM role for logging (Cloud Build needs this)
resource "google_project_iam_member" "logging_log_writer" {
  project = var.gcp_project_id
  role    = "roles/logging.logWriter"
  member  = "serviceAccount:${google_service_account.gamer_hub_api.email}"
}

# IAM role for pushing to GCR
resource "google_project_iam_member" "container_registry_writer" {
  project = var.gcp_project_id
  role    = "roles/storage.admin"
  member  = "serviceAccount:${google_service_account.gamer_hub_api.email}"
}

