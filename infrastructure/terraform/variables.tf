# Sensitive secrets (load from environment or terraform.tfvars)

variable "jwt_secret" {
  description = "JWT signing secret"
  type        = string
  sensitive   = true
}

variable "discord_client_id" {
  description = "Discord OAuth client ID"
  type        = string
  sensitive   = true
  default     = ""
}

variable "discord_client_secret" {
  description = "Discord OAuth client secret"
  type        = string
  sensitive   = true
  default     = ""
}

variable "google_client_id" {
  description = "Google OAuth client ID"
  type        = string
  sensitive   = true
  default     = ""
}

variable "google_client_secret" {
  description = "Google OAuth client secret"
  type        = string
  sensitive   = true
  default     = ""
}

variable "faceit_api_key" {
  description = "FACEIT API key for rank verification"
  type        = string
  sensitive   = true
  default     = ""
}

variable "riot_api_key" {
  description = "Riot API key for rank verification"
  type        = string
  sensitive   = true
  default     = ""
}

variable "web_origin" {
  description = "Frontend origin for CORS"
  type        = string
  default     = "https://gameer.com.ar,https://paranagamejam.com.ar"
}

variable "api_url" {
  description = "API base URL for frontend"
  type        = string
  default     = "https://api.gameer.com.ar"
}
