output "instance_name" {
  description = "Cloud SQL instance name"
  value       = google_sql_database_instance.main.name
}

output "instance_connection_name" {
  description = "Connection name of the instance"
  value       = google_sql_database_instance.main.connection_name
}

output "connection_name" {
  description = "Cloud SQL connection name (PROJECT:REGION:INSTANCE)"
  value       = data.google_sql_database_instance.main.connection_name
}

output "private_ip" {
  description = "Private IP address of the instance"
  value       = google_sql_database_instance.main.private_ip_address
  sensitive   = true
}

output "public_ip" {
  description = "Public IP address of the instance"
  value       = google_sql_database_instance.main.public_ip_address
  sensitive   = true
}

output "database_name" {
  description = "Name of the database created"
  value       = google_sql_database.main.name
}

output "database_username" {
  description = "Database username"
  value       = google_sql_user.db_user.name
  sensitive   = true
}

output "connection_string" {
  description = "PostgreSQL connection string for Cloud Run (/cloudsql/ format)"
  value       = "postgresql://${var.db_username}:${var.db_password}@/{{db_name}}?host=/cloudsql/${data.google_sql_database_instance.main.connection_name}"
  sensitive   = true
}
