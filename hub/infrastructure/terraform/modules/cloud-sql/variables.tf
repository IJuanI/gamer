variable "instance_name" {
  description = "Name of the Cloud SQL instance"
  type        = string
}

variable "database_version" {
  description = "PostgreSQL version"
  type        = string
}

variable "region" {
  description = "GCP region"
  type        = string
}

variable "tier" {
  description = "Cloud SQL tier (machine type)"
  type        = string
}

variable "database_name" {
  description = "Name of the database to create"
  type        = string
}

variable "db_username" {
  description = "Database username"
  type        = string
  sensitive   = true
}

variable "db_password" {
  description = "Database password"
  type        = string
  sensitive   = true
}

variable "backup_start_time" {
  description = "Time when automated backups start (HH:MM format)"
  type        = string
  default     = "03:00"
}

variable "availability_type" {
  description = "High availability type (REGIONAL or ZONAL)"
  type        = string
  default     = "ZONAL"
}
