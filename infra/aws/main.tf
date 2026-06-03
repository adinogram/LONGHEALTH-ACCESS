# ==============================================================================
# LongHealth Enterprise AWS Cloud Infrastructure-as-Code (Terraform Blueprints)
# Target Architecture: Multi-AZ HIPAA-Compliant ECS Fargate Cluster
# Provider: HashiCorp AWS Provider v5.x
# ==============================================================================

terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# ==============================================================================
# 1. NETWORKING (VPC, Multi-AZ, Public/Private Subnets, Routing, NAT)
# ==============================================================================
data "aws_availability_zones" "available" {
  state = "available"
}

resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name        = "longhealth-vpc"
    Environment = var.environment
  }
}

# Internet Gateway for Public Routing
resource "aws_internet_gateway" "gw" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name        = "longhealth-igw"
    Environment = var.environment
  }
}

# Public Subnets (routing to ALB & NAT Gateways)
resource "aws_subnet" "public" {
  count                   = 2
  vpc_id                  = aws_vpc.main.id
  cidr_block              = cidrsubnet(var.vpc_cidr, 8, count.index)
  availability_zone       = data.aws_availability_zones.available.names[count.index]
  map_public_ip_on_launch = true

  tags = {
    Name        = "longhealth-public-subnet-${count.index + 1}"
    Environment = var.environment
  }
}

# Private Subnets (routing Fargate Tasks and Data Tiers securely)
resource "aws_subnet" "private" {
  count             = 2
  vpc_id            = aws_vpc.main.id
  cidr_block        = cidrsubnet(var.vpc_cidr, 8, count.index + 10)
  availability_zone = data.aws_availability_zones.available.names[count.index]

  tags = {
    Name        = "longhealth-private-subnet-${count.index + 1}"
    Environment = var.environment
  }
}

# Elastic IP for NAT Gateway
resource "aws_eip" "nat" {
  count  = 1
  domain = "vpc"

  tags = {
    Name = "longhealth-nat-eip"
  }
}

# NAT Gateway for Secure egress Internet Access from Private Fargate Applications
resource "aws_nat_gateway" "nat" {
  count         = 1
  allocation_id = aws_eip.nat[0].id
  subnet_id     = aws_subnet.public[0].id

  tags = {
    Name = "longhealth-nat-gateway"
  }

  depends_on = [aws_internet_gateway.gw]
}

# Public Subnet Routing Tables
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.gw.id
  }

  tags = {
    Name = "longhealth-public-rt"
  }
}

# Private Subnet Routing Tables (utilizing NAT for secure API limits & SMTP hooks)
resource "aws_route_table" "private" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.nat[0].id
  }

  tags = {
    Name = "longhealth-private-rt"
  }
}

resource "aws_route_table_association" "public" {
  count          = 2
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "private" {
  count          = 2
  subnet_id      = aws_subnet.private[count.index].id
  route_table_id = aws_route_table.private.id
}


# ==============================================================================
# 2. KMS KEYS FOR SECURE HIPAA STORAGE-AT-REST
# ==============================================================================
resource "aws_kms_key" "storage_key" {
  description             = "CMK for encrypting S3 objects, RDS tables, and Redis queues"
  deletion_window_in_days = 30
  enable_key_rotation     = true

  tags = {
    Name = "longhealth-kms"
  }
}


# ==============================================================================
# 3. AWS RDS POSTGRESQL INSTANCE (Secure Multi-AZ Relational Core)
# ==============================================================================
resource "aws_db_subnet_group" "rds" {
  name       = "longhealth-rds-subnet-group"
  subnet_ids = aws_subnet.private[*].id

  tags = {
    Name = "longhealth-rds-subnets"
  }
}

resource "aws_security_group" "rds" {
  name        = "longhealth-rds-sg"
  description = "Permit inbound traffic to the database exclusively from RDS Clients"
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "PostgreSQL from Fargate backend cluster"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.fargate_backend.id]
  }

  egress {
    from_port        = 0
    to_port          = 0
    protocol         = "-1"
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

  tags = {
    Name = "longhealth-rds-sg"
  }
}

resource "aws_db_instance" "postgres" {
  identifier             = "longhealth-production-rds"
  engine                 = "postgres"
  engine_version         = "15.6"
  instance_class         = var.rds_instance_class
  allocated_storage      = var.rds_allocated_storage
  max_allocated_storage  = 500 # Auto-scaling cap
  db_name                = "longhealth_db"
  username               = var.rds_master_username
  password               = var.rds_master_password
  db_subnet_group_name   = aws_db_subnet_group.rds.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  
  # High Availability setup
  multi_az               = var.rds_multi_az
  
  # Security Hardening
  storage_encrypted      = true
  kms_key_id             = aws_kms_key.storage_key.arn
  publicly_accessible    = false
  skip_final_snapshot    = true
  deletion_protection    = true

  # Backup Windows
  backup_retention_period = 14
  backup_window           = "02:00-03:00"
  maintenance_window      = "Sun:04:00-Sun:05:00"

  tags = {
    Name = "longhealth-rds"
  }
}


# ==============================================================================
# 4. AWS ELASTICACHE FOR REDIS (Failover Sharding Core)
# ==============================================================================
resource "aws_elasticache_subnet_group" "redis" {
  name       = "longhealth-redis-subnet-group"
  subnet_ids = aws_subnet.private[*].id
}

resource "aws_security_group" "redis" {
  name        = "longhealth-redis-sg"
  description = "Managed inbound ports for cluster caches"
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "Redis from Fargate nodes"
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [aws_security_group.fargate_backend.id]
  }

  egress {
    from_port        = 0
    to_port          = 0
    protocol         = "-1"
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

  tags = {
    Name = "longhealth-redis-sg"
  }
}

resource "aws_elasticache_replication_group" "redis" {
  replication_group_id        = "longhealth-redis-cluster"
  description                 = "In-memory cache array for LongHealth HIPAA queues"
  node_type                   = var.redis_node_type
  num_cache_clusters          = 2 # One primary, one replica
  port                        = 6379
  parameter_group_name        = "default.redis7"
  subnet_group_name           = aws_elasticache_subnet_group.redis.name
  security_group_ids          = [aws_security_group.redis.id]
  
  # Secure networking with encryption-at-transit & rest
  at_rest_encryption_enabled  = true
  transit_encryption_enabled = true
  kms_key_id                  = aws_kms_key.storage_key.arn
  auth_token                  = var.redis_auth_token # Password string

  # Failover configuration
  automatic_failover_enabled  = true
  multi_az_enabled            = true

  # Backup snapshot configuration
  snapshot_retention_limit   = 7
  snapshot_window            = "01:00-02:00"

  tags = {
    Name = "longhealth-redis"
  }
}


# ==============================================================================
# 5. S3 & CLOUDFRONT SETUP (File Attachments, EHR Data & Global Edge Cache)
# ==============================================================================

# Private attachments storage bucket
resource "aws_s3_bucket" "attachments" {
  bucket        = "longhealth-ehr-attachments-${var.environment}"
  force_destroy = false

  tags = {
    Name = "longhealth-s3-attachments"
  }
}

# Encrypt S3 bucket at rest under KMS
resource "aws_s3_bucket_server_side_encryption_configuration" "attachments" {
  bucket = aws_s3_bucket.attachments.id

  rule {
    apply_server_side_encryption_by_default {
      kms_master_key_id = aws_kms_key.storage_key.arn
      sse_algorithm     = "aws:kms"
    }
  }
}

# Block all public exposure
resource "aws_s3_bucket_public_access_block" "attachments_block" {
  bucket = aws_s3_bucket.attachments.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Versioning for non-volatile medical audit records
resource "aws_s3_bucket_versioning" "attachments_versioning" {
  bucket = aws_s3_bucket.attachments.id
  versioning_configuration {
    status = "Enabled"
  }
}

# Origin Access Control (OAC) setup for CloudFront access
resource "aws_cloudfront_origin_access_control" "oac" {
  name                              = "longhealth-s3-oac"
  description                       = "Origin Access Control for secure S3 attachment retrieval"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# S3 Policy allowing CloudFront reading exclusively
resource "aws_s3_bucket_policy" "cloudfront_access" {
  bucket = aws_s3_bucket.attachments.id
  policy = data.aws_iam_policy_document.s3_cf_access_doc.json
}

data "aws_iam_policy_document" "s3_cf_access_doc" {
  statement {
    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.attachments.arn}/*"]

    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }

    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"
      values   = [aws_cloudfront_distribution.cdn.arn]
    }
  }
}

# CloudFront Distribution (Web and Static EHR edge caching layer)
resource "aws_cloudfront_distribution" "cdn" {
  origin {
    domain_name              = aws_s3_bucket.attachments.bucket_regional_domain_name
    origin_id                = "S3-Attachments-Origin"
    origin_access_control_id = aws_cloudfront_origin_access_control.oac.id
  }

  enabled             = true
  is_ipv6_enabled     = true
  comment             = "LongHealth Production Clinical CDN"
  default_root_object = "index.html"

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-Attachments-Origin"

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }

  tags = {
    Name = "longhealth-cloudfront"
  }
}


# ==============================================================================
# 6. AWS ECS FARGATE SETUP (Cluster, Load Balancer, Tasks, and Security Groups)
# ==============================================================================

resource "aws_ecs_cluster" "main" {
  name = "longhealth-fargate-cluster"

  setting {
    name  = "containerInsights"
    value = "enabled" # Activated for Monitoring Setup
  }
}

# Application Load Balancer
resource "aws_lb" "alb" {
  name               = "longhealth-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = aws_subnet.public[*].id

  tags = {
    Name = "longhealth-alb"
  }
}

resource "aws_lb_target_group" "web" {
  name        = "longhealth-web-tg"
  port        = 3000
  protocol    = "HTTP"
  vpc_id      = aws_vpc.main.id
  target_type = "ip"

  health_check {
    path                = "/"
    healthy_threshold   = 3
    unhealthy_threshold = 3
    timeout             = 5
    interval            = 15
    matcher             = "200-399"
  }
}

resource "aws_lb_target_group" "api" {
  name        = "longhealth-api-tg"
  port        = 3001
  protocol    = "HTTP"
  vpc_id      = aws_vpc.main.id
  target_type = "ip"

  health_check {
    path                = "/api/health"
    healthy_threshold   = 3
    unhealthy_threshold = 3
    timeout             = 5
    interval            = 15
    matcher             = "200-399"
  }
}

# HTTP Gateway Listener forwarding traffic to React front-end Web tasks
resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.alb.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.web.arn
  }
}

# Listener rule to split and route /api/* directly to NestJS Fargate backend tasks
resource "aws_lb_listener_rule" "api_routing" {
  listener_arn = aws_lb_listener.http.arn
  priority     = 10

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.api.arn
  }

  condition {
    path_pattern {
      values = ["/api/*"]
    }
  }
}

# Security Groups for AWS Elastic Core Infrastructure
resource "aws_security_group" "alb" {
  name        = "longhealth-alb-sg"
  description = "Incoming public interface rules"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port        = 80
    to_port          = 80
    protocol         = "tcp"
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

  ingress {
    from_port        = 443
    to_port          = 443
    protocol         = "tcp"
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

  egress {
    from_port        = 0
    to_port          = 0
    protocol         = "-1"
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }
}

resource "aws_security_group" "fargate_backend" {
  name        = "longhealth-fargate-backend-sg"
  description = "VPC isolated private back-end access policy"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port       = 3001
    to_port         = 3001
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id, aws_security_group.fargate_frontend.id]
  }

  egress {
    from_port        = 0
    to_port          = 0
    protocol         = "-1"
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }
}

resource "aws_security_group" "fargate_frontend" {
  name        = "longhealth-fargate-frontend-sg"
  description = "VPC private front-end routing rule"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port       = 3000
    to_port         = 3000
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  egress {
    from_port        = 0
    to_port          = 0
    protocol         = "-1"
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }
}

# Task Execution Roles & CloudWatch logger permissions
resource "aws_iam_role" "ecs_execution" {
  name               = "longhealth-ecs-execution-role"
  assume_role_policy = data.aws_iam_policy_document.ecs_trust_doc.json
}

data "aws_iam_policy_document" "ecs_trust_doc" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
  }
}

resource "aws_iam_role_policy_attachment" "ecs_execution_base" {
  role       = aws_iam_role.ecs_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# AWS CloudWatch Logs integration
resource "aws_cloudwatch_log_group" "ecs" {
  name              = "/aws/ecs/longhealth-production"
  retention_in_days = var.log_retention_days
}

# Task definitions: NestJS Business Logic Core
resource "aws_ecs_task_definition" "backend" {
  family                   = "longhealth-api-core"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.fargate_cpu
  memory                   = var.fargate_memory
  execution_role_arn       = aws_iam_role.ecs_execution.arn
  task_role_arn            = aws_iam_role.ecs_execution.arn

  container_definitions = jsonencode([
    {
      name      = "nestjs-service"
      image     = "${var.ecr_backend_image}:latest"
      essential = true
      portMappings = [
        {
          containerPort = 3001
          hostPort      = 3001
        }
      ]
      environment = [
        { name = "NODE_ENV", value = "production" },
        { name = "NEST_PORT", value = "3001" },
        { name = "DATABASE_URL", value = "postgresql://${var.rds_master_username}:${var.rds_master_password}@${aws_db_instance.postgres.endpoint}/${aws_db_instance.postgres.db_name}" },
        { name = "REDIS_HOST", value = aws_elasticache_replication_group.redis.primary_endpoint_address },
        { name = "REDIS_PASSWORD", value = var.redis_auth_token }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.ecs.name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "backend"
        }
      }
    }
  ])
}

# ECS Service definitions for Orchestrating Tasks
resource "aws_ecs_service" "backend" {
  name            = "longhealth-backend-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.backend.arn
  desired_count   = 2 # High Availability deployment
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = aws_subnet.private[*].id
    security_groups  = [aws_security_group.fargate_backend.id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.api.arn
    container_name   = "nestjs-service"
    container_port   = 3001
  }

  depends_on = [aws_lb_listener.http, aws_db_instance.postgres, aws_elasticache_replication_group.redis]
}


# ==============================================================================
# 7. MONITORING SETUP & ALARMS (CloudWatch System Telemetry)
# ==============================================================================

# Central health-check failure alarm (Trigger operations paging instantly on RDS or Fargate fault)
resource "aws_cloudwatch_metric_alarm" "unhealthy_hosts" {
  alarm_name          = "longhealth-unhealthy-hosts-alarm"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "1"
  metric_name         = "UnHealthyHostCount"
  namespace           = "AWS/ApplicationELB"
  period              = "60"
  statistic           = "Average"
  threshold           = "1"
  alarm_description   = "Medical records access pipeline is compromised under host failures."

  dimensions = {
    TargetGroup  = aws_lb_target_group.web.arn_suffix
    LoadBalancer = aws_lb.alb.arn_suffix
  }
}

# Database CPU alarm for tracking spike triggers
resource "aws_cloudwatch_metric_alarm" "rds_high_cpu" {
  alarm_name          = "longhealth-rds-high-cpu"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/RDS"
  period              = "300"
  statistic           = "Average"
  threshold           = "85"
  alarm_description   = "RDS processing pipeline utilization of key-space locks exceeds 85% limits."

  dimensions = {
    DBInstanceIdentifier = aws_db_instance.postgres.identifier
  }
}


# ==============================================================================
# 8. BACKUP STRATEGY (AWS Backup Schedules & Cross-Region Resiliency)
# ==============================================================================
resource "aws_backup_vault" "vault" {
  name        = "longhealth-secure-vault"
  kms_key_arn = aws_kms_key.storage_key.arn
}

resource "aws_backup_plan" "plan" {
  name = "longhealth-recovery-plan"

  rule {
    rule_name         = "daily-replicated-backups"
    target_vault_name = aws_backup_vault.vault.name
    schedule          = "cron(0 12 * * ? *)" # Trigger daily at noon UTC

    lifecycle {
      delete_after = 30 # Maintain snapshots for corporate legal audits (30 days)
    }
  }
}

resource "aws_iam_role" "backup_role" {
  name               = "longhealth-backup-iam-role"
  assume_role_policy = data.aws_iam_policy_document.backup_trust_doc.json
}

data "aws_iam_policy_document" "backup_trust_doc" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["backup.amazonaws.com"]
    }
  }
}

resource "aws_iam_role_policy_attachment" "backup_attachment" {
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSBackupServiceRolePolicyForBackup"
  role       = aws_iam_role.backup_role.name
}

resource "aws_backup_selection" "db_backup_selection" {
  iam_role_arn = aws_iam_role.backup_role.arn
  name         = "longhealth-rds-selection"
  plan_id      = aws_backup_plan.plan.id

  resources = [
    aws_db_instance.postgres.arn,
    aws_s3_bucket.attachments.arn
  ]
}
