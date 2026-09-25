resource "google_cloud_run_service" "api" {
  name     = var.service_name
  location = var.region

  template {
    spec {
      service_account_name = var.service_account_email

      containers {
        image = var.image_url

        resources {
          limits = {
            memory = var.memory
            cpu    = var.cpu
          }
        }

        env {
          name  = "PORT"
          value = "4000"
        }

        dynamic "env" {
          for_each = var.environment_variables
          content {
            name  = env.key
            value = env.value
          }
        }

        # Probes configured via Cloud Run service settings
        # Health checks handled by Cloud Run platform
      }

      timeout_seconds = var.timeout
    }

    metadata {
      annotations = {
        "autoscaling.knative.dev/maxScale" = "100"
        "autoscaling.knative.dev/minScale" = "0"
      }
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }

  depends_on = []
}

resource "google_cloud_run_service_iam_binding" "public" {
  count   = var.allow_unauthenticated ? 1 : 0
  service = google_cloud_run_service.api.name
  role    = "roles/run.invoker"
  members = [
    "allUsers"
  ]
  location = var.region
}

resource "google_cloud_run_service_iam_binding" "authenticated" {
  count   = var.allow_unauthenticated ? 0 : 1
  service = google_cloud_run_service.api.name
  role    = "roles/run.invoker"
  members = [
    "serviceAccount:${var.service_account_email}"
  ]
  location = var.region
}
