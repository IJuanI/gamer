resource "google_sql_database_instance" "main" {
  name             = var.instance_name
  database_version = var.database_version
  region           = var.region
  deletion_protection = false

  settings {
    tier              = var.tier
    availability_type = var.availability_type
    disk_size         = 10
    disk_type         = "PD_SSD"
    disk_autoresize   = true

    backup_configuration {
      enabled                        = true
      start_time                     = var.backup_start_time
      transaction_log_retention_days = 7
      backup_retention_settings {
        retained_backups = 7
        retention_unit   = "COUNT"
      }
    }

    ip_configuration {
      require_ssl = true
      # Allow Cloud Run to connect via Unix socket
      enable_private_path_for_cloudsql_instance = false
    }

    database_flags {
      name  = "log_statement"
      value = "all"
    }

    database_flags {
      name  = "log_duration"
      value = "on"
    }

    insights_config {
      query_insights_enabled  = true
      query_string_length     = 1024
      record_application_tags = true
    }

    maintenance_window {
      day          = 3  # Wednesday
      hour         = 2
      update_track = "stable"
    }
  }

  depends_on = []
}

resource "google_sql_database" "main" {
  name     = var.database_name
  instance = google_sql_database_instance.main.name
}

resource "google_sql_user" "db_user" {
  name     = var.db_username
  instance = google_sql_database_instance.main.name
  password = var.db_password
}

# Get the connection name for use in environment variables
data "google_sql_database_instance" "main" {
  name = google_sql_database_instance.main.name
}
