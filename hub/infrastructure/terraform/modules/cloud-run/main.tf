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

        startup_probe {
          initial_delay_seconds = 30
          timeout_seconds       = 3
          period_seconds        = 10
          failure_threshold     = 3

          http_get {
            path   = "/api/health"
            port   = 4000
            scheme = "HTTP"
          }
        }

        liveness_probe {
          initial_delay_seconds = 60
          timeout_seconds       = 3
          period_seconds        = 30
          failure_threshold     = 3

          http_get {
            path   = "/api/health"
            port   = 4000
            scheme = "HTTP"
          }
        }
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
