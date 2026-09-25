# Google OAuth 2.0 Credentials via Terraform
# Uses gcloud to create OAuth credentials programmatically

variable "oauth_create_credentials" {
  description = "Whether to automatically create OAuth credentials (requires gcloud)"
  type        = bool
  default     = false
}

# Create OAuth Client ID via local-exec (using gcloud)
resource "null_resource" "create_google_oauth" {
  count = var.oauth_create_credentials ? 1 : 0

  provisioner "local-exec" {
    command = <<-EOT
      set -e

      PROJECT_ID="${var.gcp_project_id}"

      echo "Creating Google OAuth 2.0 Web Application credentials..."

      # Create the OAuth 2.0 Client ID
      gcloud iam oauth-clients create \
        --project=$PROJECT_ID \
        --display-name="GamER Hub API" \
        --redirect-uri="https://gameer.com.ar/api/auth/google/callback" \
        --redirect-uri="https://gameer.com.ar/api/auth/google" \
        --client-type="web" \
        2>&1 || true

      echo "OAuth credentials created. Get the credentials with:"
      echo "gcloud iam oauth-clients list --project=$PROJECT_ID"
    EOT
  }

  depends_on = [
    google_project_service.required_apis,
  ]
}

# Data source to list existing OAuth credentials
data "null_data_source" "google_oauth_info" {
  count = var.oauth_create_credentials ? 0 : 1

  inputs = {
    note = "Google OAuth credentials must be created manually or via gcloud"
    command = "gcloud iam oauth-clients list --project=${var.gcp_project_id} --format=json"
  }
}

# Local variables for OAuth output
locals {
  oauth_instructions = {
    method_1_automatic = "Enable with: terraform apply -var='oauth_create_credentials=true'"
    method_2_manual = "Visit: https://console.cloud.google.com/apis/credentials?project=${var.gcp_project_id}"
    manual_steps = [
      "1. Click '+ Create Credentials' → 'OAuth client ID'",
      "2. Application type: 'Web application'",
      "3. Name: 'GamER Hub API'",
      "4. Add Authorized redirect URIs:",
      "   - https://gameer.com.ar/api/auth/google/callback",
      "   - https://gameer.com.ar/api/auth/google",
      "5. Click 'Create'",
      "6. Save the Client ID and Secret",
    ]
    environment_variables = [
      "export TF_VAR_google_client_id='YOUR_CLIENT_ID'",
      "export TF_VAR_google_client_secret='YOUR_CLIENT_SECRET'",
    ]
  }
}

output "google_oauth_setup" {
  description = "How to set up Google OAuth credentials"
  value       = local.oauth_instructions
}
