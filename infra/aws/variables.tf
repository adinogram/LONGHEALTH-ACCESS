# ==============================================================================
# LongHealth AWS Infrastructure Variables
# Target Architecture: Multi-AZ HIPAA-Compliant ECS Fargate Cluster
# ==============================================================================

variable "aws_region" {
  type        = string
  description = "The target AWS Region for all orchestrated enterprise resources"
  default     = "us-east-1"
}

variable "environment" {
  type        = string
  description = "Execution environment modifier tag"
  default     = "production"
}

variable "vpc_cidr" {
  type        = string
  description = "VPC class-less inter-domain IP CIDR base"
  default     = "10.0.0.0/16"
}

# Fargate Service allocations
variable "fargate_cpu" {
  type        = string
  description = "CPU task allocation specs (default 1 vCPU)"
  default     = "1024"
}

variable "fargate_memory" {
  type        = string
  description = "RAM task allocation specs (default 2GB)"
  default     = "2048"
}

variable "ecr_backend_image" {
  type        = string
  description = "Container ECR image routing string for Backend core"
  default     = "123456789012.dkr.ecr.us-east-1.amazonaws.com/longhealth-backend"
}

# RDS settings
variable "rds_instance_class" {
  type        = string
  description = "RDS cluster server node compute spec"
  default     = "db.t4g.medium" # Arm64 compute optimal
}

variable "rds_allocated_storage" {
  type        = number
  description = "Allocated relational core storage minimum in gigabytes"
  default     = 20
}

variable "rds_master_username" {
  type        = string
  description = "Primary relational account administrative superuser login"
  default     = "longhealth_infra"
}

variable "rds_master_password" {
  type        = string
  description = "Primary relational account administrative superuser signature"
  sensitive   = true
  default     = "SuperSecurePass_H_999!"
}

variable "rds_multi_az" {
  type        = bool
  description = "Enables multi-Availability Zone primary-secondary replication loops"
  default     = true
}

# Redis memory cluster settings
variable "redis_node_type" {
  type        = string
  description = "AWS ElastiCache Redis memory engine compute spec"
  default     = "cache.t4g.small" # Arm64 cost-performance optimal
}

variable "redis_auth_token" {
  type        = string
  description = "System-level cache socket verification signature"
  sensitive   = true
  default     = "AuthSecureRedisTokenValue_9911"
}

# CloudWatch Log variables
variable "log_retention_days" {
  type        = number
  description = "Fidelity lifespan in days for standard application event strings"
  default     = 30
}
