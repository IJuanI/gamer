variable "gcp_project_id" {
  description = "GCP Project ID"
  type        = string
}

variable "gcp_region" {
  description = "GCP region for resources"
  type        = string
  default     = "us-central1"
}

# Cloud Run Configuration
variable "cloud_run_service_name" {
  description = "Cloud Run service name"
  type        = string
  default     = "gamer-hub-api"
}

variable "container_image_url" {
  description = "Container image URL in Google Container Registry"
  type        = string
}

variable "cloud_run_memory" {
  description = "Memory allocation for Cloud Run (e.g., '512Mi', '1Gi')"
  type        = string
  default     = "512Mi"
}

variable "cloud_run_cpu" {
  description = "CPU allocation for Cloud Run (e.g., '1', '2', '4')"
  type        = string
  default     = "1"
}

variable "cloud_run_timeout" {
  description = "Request timeout in seconds"
  type        = number
  default     = 300
}

variable "cloud_run_allow_unauthenticated" {
  description = "Allow unauthenticated requests to Cloud Run"
  type        = bool
  default     = true
}

# API Secrets (sensitive)
variable "jwt_secret" {
  description = "JWT signing secret"
  type        = string
  sensitive   = true
}

variable "discord_client_id" {
  description = "Discord OAuth Client ID"
  type        = string
  sensitive   = true
}

variable "discord_client_secret" {
  description = "Discord OAuth Client Secret"
  type        = string
  sensitive   = true
}

variable "google_client_id" {
  description = "Google OAuth Client ID"
  type        = string
  sensitive   = true
  default     = ""
}

variable "google_client_secret" {
  description = "Google OAuth Client Secret"
  type        = string
  sensitive   = true
  default     = ""
}

# Frontend Configuration
variable "web_origin" {
  description = "Comma-separated list of allowed CORS origins"
  type        = string
  default     = "https://gameer.com.ar,https://paranagamejam.com.ar"
}
