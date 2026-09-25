variable "service_name" {
  description = "Cloud Run service name"
  type        = string
}

variable "region" {
  description = "GCP region"
  type        = string
}

variable "image_url" {
  description = "Container image URL"
  type        = string
}

variable "service_account_email" {
  description = "Service account email for the Cloud Run service"
  type        = string
}

variable "memory" {
  description = "Memory allocation (e.g., '512Mi', '1Gi')"
  type        = string
  default     = "512Mi"
}

variable "cpu" {
  description = "CPU allocation (e.g., '1', '2')"
  type        = string
  default     = "1"
}

variable "timeout" {
  description = "Request timeout in seconds"
  type        = number
  default     = 300
}

variable "allow_unauthenticated" {
  description = "Allow unauthenticated access"
  type        = bool
  default     = true
}

variable "environment_variables" {
  description = "Environment variables for the service"
  type        = map(string)
  sensitive   = true
  default     = {}
}
