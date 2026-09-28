variable "cloudflare_api_token" {
  description = "Cloudflare API Token"
  type        = string
  sensitive   = true
}

variable "cloudflare_account_id" {
  description = "Cloudflare Account ID"
  type        = string
}

variable "cloudflare_zone_id" {
  description = "Cloudflare Zone ID for gameer.com.ar"
  type        = string
}

variable "jwt_secret" {
  description = "JWT Secret for signing tokens"
  type        = string
  sensitive   = true
}

variable "discord_client_id" {
  description = "Discord OAuth Client ID"
  type        = string
  sensitive   = true
  default     = ""
}

variable "discord_client_secret" {
  description = "Discord OAuth Client Secret"
  type        = string
  sensitive   = true
  default     = ""
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

variable "cloudflare_web_analytics_tag" {
  description = "Cloudflare Web Analytics tag"
  type        = string
  default     = ""
}
