terraform {
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.0"
    }
  }

  # Use remote state (Terraform Cloud)
  # Uncomment and configure after creating a Terraform Cloud account
  # cloud {
  #   organization = "your-org-name"
  #   workspaces {
  #     name = "gamer-hub"
  #   }
  # }

  # For local state (not recommended for production)
  backend "local" {
    path = "terraform.tfstate"
  }
}

provider "cloudflare" {
  api_token = var.cloudflare_api_token
}

variable "cloudflare_api_token" {
  description = "Cloudflare API token"
  sensitive   = true
  type        = string
}

variable "cloudflare_account_id" {
  description = "Cloudflare account ID"
  type        = string
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "prod"
}

variable "gameer_zone_id" {
  description = "Cloudflare zone ID for gameer.com.ar"
  type        = string
}

variable "paranagamejam_zone_id" {
  description = "Cloudflare zone ID for paranagamejam.com.ar"
  type        = string
}

# Locals for resource naming
locals {
  project_name = "gamer-hub"
  environment  = var.environment
  common_tags = {
    Project     = "GamER Hub"
    Environment = local.environment
    ManagedBy   = "Terraform"
  }
}

output "cloudflare_account_id" {
  value = var.cloudflare_account_id
}

output "environment" {
  value = var.environment
}
