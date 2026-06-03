/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Cpu, Database, Zap, Globe, Terminal, Copy, Check, Info, Server, 
  Activity, AlertCircle, RefreshCw, Cloud, Lock, Shield, HardDrive, FileText, Eye, Settings
} from 'lucide-react';

interface ContainerSpec {
  id: string;
  name: string;
  role: string;
  image: string;
  status: 'running' | 'starting' | 'error';
  ip: string;
  ports: string;
  cpu: string;
  memory: string;
  uptime: string;
}

interface AWSNode {
  id: string;
  name: string;
  type: string;
  description: string;
  details: string[];
  subnets: string;
  status: 'active' | 'warning';
}

export const ContainerDeploymentView: React.FC = () => {
  // Navigation level tab: local docker vs prod AWS cloud
  const [deploymentTarget, setDeploymentTarget] = useState<'local' | 'aws'>('local');

  // Local State definitions
  const [activeCodeTab, setActiveCodeTab] = useState<'compose' | 'backend' | 'frontend'>('compose');
  const [activeLogStream, setActiveLogStream] = useState<'all' | 'postgres' | 'redis' | 'backend' | 'frontend'>('all');
  const [copied, setCopied] = useState<boolean>(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // AWS view State definitions
  const [activeAwsTab, setActiveAwsTab] = useState<'tf_main' | 'tf_vars' | 'tf_out'>('tf_main');
  const [selectedAwsNode, setSelectedAwsNode] = useState<string>('ecs');
  const [tfCopied, setTfCopied] = useState<boolean>(false);
  const [awsSimulating, setAwsSimulating] = useState<boolean>(false);
  const [awsValidationLogs, setAwsValidationLogs] = useState<string[]>([]);

  // Specifications of standard enterprise containers
  const containerList: ContainerSpec[] = [
    {
      id: 'postgres',
      name: 'longhealth-postgres',
      role: 'Database Tier',
      image: 'postgres:15-alpine',
      status: 'running',
      ip: '172.24.0.2',
      ports: '5432:5432',
      cpu: '1.4%',
      memory: '42.8 MB',
      uptime: '15 hours'
    },
    {
      id: 'redis',
      name: 'longhealth-redis',
      role: 'Caching & Job Queues',
      image: 'redis:7-alpine',
      status: 'running',
      ip: '172.24.0.3',
      ports: '6379:6379',
      cpu: '0.8%',
      memory: '14.2 MB',
      uptime: '15 hours'
    },
    {
      id: 'backend',
      name: 'longhealth-backend-api',
      role: 'NestJS Clean Core API',
      image: 'longhealth-backend-api:latest',
      status: 'running',
      ip: '172.24.0.4',
      ports: '3001:3001',
      cpu: '2.5%',
      memory: '81.4 MB',
      uptime: '15 hours'
    },
    {
      id: 'frontend',
      name: 'longhealth-frontend-web',
      role: 'Web Client & Gateway',
      image: 'longhealth-frontend-web:latest',
      status: 'running',
      ip: '172.24.0.5',
      ports: '3000:3000',
      cpu: '1.9%',
      memory: '64.1 MB',
      uptime: '15 hours'
    }
  ];

  // Raw file contents of local container artifacts
  const filesContent = {
    compose: `version: '3.8'

services:
  # ==========================================
  # 1. PostgreSQL Persistent Relational Database
  # ==========================================
  postgres:
    image: postgres:15-alpine
    container_name: longhealth-postgres
    restart: always
    environment:
      POSTGRES_USER: \${DB_USER:-postgres}
      POSTGRES_PASSWORD: \${DB_PASSWORD:-postgres_enterprise_secure}
      POSTGRES_DB: \${DB_NAME:-longhealth_db}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d longhealth_db"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - longhealth-network

  # ==========================================
  # 2. Redis Cache & Job Queue Engine 
  # ==========================================
  redis:
    image: redis:7-alpine
    container_name: longhealth-redis
    restart: always
    command: redis-server --requirepass \${REDIS_PASSWORD:-redis_secure_pass}
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "-a", "redis_secure_pass", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - longhealth-network

  # ==========================================
  # 3. NestJS Enterprise API Gateway (Service Layer)
  # ==========================================
  backend:
    build:
      context: .
      dockerfile: apps/api-gateway/Dockerfile
    container_name: longhealth-backend-api
    restart: always
    ports:
      - "3001:3001"
    environment:
      NODE_ENV: production
      NEST_PORT: 3001
      DATABASE_URL: postgresql://\${DB_USER:-postgres}:\${DB_PASSWORD:-postgres_enterprise_secure}@postgres:5432/\${DB_NAME:-longhealth_db}?schema=public
      REDIS_HOST: redis
      REDIS_PORT: 6379
      REDIS_PASSWORD: \${REDIS_PASSWORD:-redis_secure_pass}
      JWT_SECRET: \${JWT_SECRET:-supersecret_enterprise_jwt_signing_key_99}
      GEMINI_API_KEY: \${GEMINI_API_KEY:-mock_key_or_placeholder}
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - longhealth-network

  # ==========================================
  # 4. Web Portal (React / Express Hybrid Frontend)
  # ==========================================
  frontend:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: longhealth-frontend-web
    restart: always
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      PORT: 3000
      DATABASE_URL: postgresql://\${DB_USER:-postgres}:\${DB_PASSWORD:-postgres_enterprise_secure}@postgres:5432/\${DB_NAME:-longhealth_db}?schema=public
      GEMINI_API_KEY: \${GEMINI_API_KEY:-mock_key_or_placeholder}
      VITE_API_GATEWAY_URL: http://backend:3001
    depends_on:
      - backend
    networks:
      - longhealth-network

networks:
  longhealth-network:
    driver: bridge

volumes:
  postgres_data:
    driver: local
  redis_data:
    driver: local`,

    backend: `# ==========================================
# STAGE 1: Build & Dependency Resolution
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Install build dependencies
RUN apk add --no-cache libc6-compat openssl

ENV NODE_ENV=development

# Copy dependency manifests
COPY apps/api-gateway/package*.json ./apps/api-gateway/
COPY prisma/schema.prisma ./prisma/

WORKDIR /usr/src/app/apps/api-gateway
RUN npm ci

WORKDIR /usr/src/app
RUN npx prisma generate --schema=./prisma/schema.prisma

# Copy source code files
COPY apps/api-gateway ./apps/api-gateway

WORKDIR /usr/src/app/apps/api-gateway
RUN npm run build
RUN npm prune --production

# ==========================================
# STAGE 2: Microservice Minimal Runtime
# ==========================================
FROM node:20-alpine AS runner

RUN addgroup --system --gid 1001 nodejs && \\
    adduser --system --uid 1001 nestjs

WORKDIR /app
RUN apk add --no-cache openssl

ENV NODE_ENV=production
ENV PORT=3001
ENV NEST_PORT=3001

COPY --from=builder --chown=nestjs:nodejs /usr/src/app/apps/api-gateway/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /usr/src/app/apps/api-gateway/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /usr/src/app/node_modules/@prisma/client ./node_modules/@prisma/client
COPY --from=builder --chown=nestjs:nodejs /usr/src/app/node_modules/.prisma/client ./node_modules/.prisma/client

USER nestjs
EXPOSE 3001

CMD ["node", "dist/main.js"]`,

    frontend: `# ==========================================
# STAGE 1: Build Frontend Assets & Proxies
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

RUN apk add --no-cache libc6-compat openssl

# Copy manifests
COPY package*.json ./

RUN npm ci
COPY . .

ENV NODE_ENV=production
RUN npm run build
RUN npm prune --production

# ==========================================
# STAGE 2: Micro-Runtime Execution Engine
# ==========================================
FROM node:20-alpine AS runner

RUN addgroup --system --gid 1001 nodejs && \\
    adduser --system --uid 1001 web

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY --from=builder --chown=web:nodejs /usr/src/app/package*.json ./
COPY --from=builder --chown=web:nodejs /usr/src/app/dist ./dist
COPY --from=builder --chown=web:nodejs /usr/src/app/node_modules ./node_modules

USER web
EXPOSE 3000

CMD ["node", "dist/server.cjs"]`
  };

  // Raw contents of generated AWS Infrastructure as Code variables
  const awsFilesContent = {
    tf_main: `# ==============================================================================
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
# 1. NETWORKING (VPC, Multi-AZ, Public/Private Subnets, NAT)
# ==============================================================================
resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true
}

resource "aws_subnet" "public" {
  count                   = 2
  vpc_id                  = aws_vpc.main.id
  cidr_block              = cidrsubnet(var.vpc_cidr, 8, count.index)
  availability_zone       = data.aws_availability_zones.available.names[count.index]
  map_public_ip_on_launch = true
}

resource "aws_subnet" "private" {
  count             = 2
  vpc_id            = aws_vpc.main.id
  cidr_block        = cidrsubnet(var.vpc_cidr, 8, count.index + 10)
  availability_zone = data.aws_availability_zones.available.names[count.index]
}

# ==============================================================================
# 2. KMS KEYS FOR SECURE HIPAA STORAGE-AT-REST
# ==============================================================================
resource "aws_kms_key" "storage_key" {
  description             = "CMK for encrypting S3 objects, RDS tables, and Redis queues"
  deletion_window_in_days = 30
  enable_key_rotation     = true
}

# ==============================================================================
# 3. AWS RDS POSTGRESQL INSTANCE (Secure Multi-AZ Relational Core)
# ==============================================================================
resource "aws_db_instance" "postgres" {
  identifier             = "longhealth-production-rds"
  engine                 = "postgres"
  engine_version         = "15.6"
  instance_class         = var.rds_instance_class
  allocated_storage      = var.rds_allocated_storage
  db_subnet_group_name   = aws_db_subnet_group.rds.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  multi_az               = var.rds_multi_az
  storage_encrypted      = true
  kms_key_id             = aws_kms_key.storage_key.arn
  publicly_accessible    = false
  deletion_protection    = true
  backup_retention_period = 14
}

# ==============================================================================
# 4. AWS ELASTICACHE FOR REDIS (Failover Sharding Core)
# ==============================================================================
resource "aws_elasticache_replication_group" "redis" {
  replication_group_id        = "longhealth-redis-cluster"
  description                 = "In-memory cache array for LongHealth HIPAA queues"
  node_type                   = var.redis_node_type
  num_cache_clusters          = 2
  port                        = 6379
  subnet_group_name           = aws_elasticache_subnet_group.redis.name
  security_group_ids          = [aws_security_group.redis.id]
  at_rest_encryption_enabled  = true
  transit_encryption_enabled = true
  kms_key_id                  = aws_kms_key.storage_key.arn
  automatic_failover_enabled  = true
}

# ==============================================================================
# 5. S3 & CLOUDFRONT SETUP (File Attachments, EHR Data & Global Edge Cache)
# ==============================================================================
resource "aws_s3_bucket" "attachments" {
  bucket        = "longhealth-ehr-attachments-\${var.environment}"
  force_destroy = false
}

resource "aws_s3_bucket_server_side_encryption_configuration" "attachments" {
  bucket = aws_s3_bucket.attachments.id
  rule {
    apply_server_side_encryption_by_default {
      kms_master_key_id = aws_kms_key.storage_key.arn
      sse_algorithm     = "aws:kms"
    }
  }
}

resource "aws_cloudfront_distribution" "cdn" {
  origin {
    domain_name              = aws_s3_bucket.attachments.bucket_regional_domain_name
    origin_id                = "S3-Attachments-Origin"
    origin_access_control_id = aws_cloudfront_origin_access_control.oac.id
  }
  enabled             = true
  default_cache_behavior {
    target_origin_id = "S3-Attachments-Origin"
    viewer_protocol_policy = "redirect-to-https"
  }
}

# ==============================================================================
# 6. AWS ECS FARGATE SETUP (Cluster, Load Balancer, Tasks)
# ==============================================================================
resource "aws_ecs_cluster" "main" {
  name = "longhealth-fargate-cluster"
  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

resource "aws_ecs_service" "backend" {
  name            = "longhealth-backend-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.backend.arn
  desired_count   = 2
  launch_type     = "FARGATE"
}

# ==============================================================================
# 7. MONITORING SETUP & ALARMS (CloudWatch System Telemetry)
# ==============================================================================
resource "aws_cloudwatch_metric_alarm" "unhealthy_hosts" {
  alarm_name          = "longhealth-unhealthy-hosts-alarm"
  comparison_operator = "GreaterThanThreshold"
  metric_name         = "UnHealthyHostCount"
  namespace           = "AWS/ApplicationELB"
  threshold           = "1"
}

# ==============================================================================
# 8. BACKUP STRATEGY (AWS Backup Schedules & Vault Resiliency)
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
    schedule          = "cron(0 12 * * ? *)" # Daily
    lifecycle {
      delete_after = 30 # GDPR/HIPAA audits
    }
  }
}`,

    tf_vars: `# ==============================================================================
# LongHealth AWS Infrastructure Variables
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

variable "fargate_cpu" {
  type        = string
  default     = "1024" # 1 vCPU
}

variable "fargate_memory" {
  type        = string
  default     = "2048" # 2GB RAM
}

variable "rds_instance_class" {
  type        = string
  default     = "db.t4g.medium" # Arm64 compute optimal
}

variable "rds_allocated_storage" {
  type        = number
  default     = 20
}

variable "rds_master_username" {
  type        = string
  default     = "longhealth_infra"
}

variable "rds_master_password" {
  type        = string
  sensitive   = true
  default     = "SuperSecurePass_H_999!"
}

variable "rds_multi_az" {
  type        = bool
  default     = true
}

variable "redis_node_type" {
  type        = string
  default     = "cache.t4g.small"
}

variable "redis_auth_token" {
  type        = string
  sensitive   = true
  default     = "AuthSecureRedisTokenValue_9911"
}

variable "log_retention_days" {
  type        = number
  default     = 30
}`,

    tf_out: `# ==============================================================================
# LongHealth AWS Infrastructure Outputs Registry
# ==============================================================================

output "vpc_id" {
  value       = aws_vpc.main.id
  description = "The assigned Virtual Private Cloud system identifier"
}

output "alb_dns_name" {
  value       = aws_lb.alb.dns_name
  description = "The entry DNS routing string for inbound clinical and telemetry traffic"
}

output "cloudfront_domain" {
  value       = aws_cloudfront_distribution.cdn.domain_name
  description = "The caching distribution entry endpoint for attachments and static views"
}

output "rds_endpoint" {
  value       = aws_db_instance.postgres.endpoint
  description = "Relational core internal connect host used by the private Fargate network"
}

output "redis_primary_endpoint" {
  value       = aws_elasticache_replication_group.redis.primary_endpoint_address
  description = "Caching core replication group ingress host used by Redis task queues"
}

output "s3_bucket_arn" {
  value       = aws_s3_bucket.attachments.arn
  description = "Secure S3 bucket path utilized under KMS object encryption blocks"
}

output "ecs_cluster_name" {
  value       = aws_ecs_cluster.main.name
  description = "Orchestrated High Availability Fargate workspace name"
}`
  };

  // Node specifications in the visual diagram
  const awsNodes: AWSNode[] = [
    {
      id: 'cloudfront',
      name: 'Amazon CloudFront Cache',
      type: 'Global Edge Network CDN',
      description: 'Caches and delivers web assets globally. Encrypted SSL/TLS traffic only.',
      details: [
        'Origin Access Control (OAC) limits bucket lists securely',
        'Auto-redirect HTTP to HTTPS enforced at client edges',
        'Direct connection tracking registers zero-latency routing bounds'
      ],
      subnets: 'Edge Locations',
      status: 'active'
    },
    {
      id: 's3',
      name: 'Amazon S3 Medical Vault',
      type: 'HIPAA Shield Document Storage',
      description: 'Holds medical history documents, prescription files, EMR audits, and digital labs.',
      details: [
        'KMS Customer-Managed-Key (CMK) multi-encryption block active',
        'Non-volatile object versions enabled for regulatory non-repudiation',
        'Public Access Block completely blocks list enumerations'
      ],
      subnets: 'S3 Secured private endpoint',
      status: 'active'
    },
    {
      id: 'alb',
      name: 'Application Load Balancer',
      type: 'Network Ingress Gateway',
      description: 'Splits requests at port boundaries. Forwards /api/* to clean microservices backend, routes general routes to frontend UI tasks.',
      details: [
        'Health inspection tracks 15s interval host response counts',
        'Multi-AZ target groups balance web nodes dynamic allocations',
        'TLS security policies prevent legacy decryption vulnerability'
      ],
      subnets: 'Public Subnet 1 & 2',
      status: 'active'
    },
    {
      id: 'ecs',
      name: 'AWS ECS Fargate Multi-AZ',
      type: 'Isolated Application Core Tier',
      description: 'Executes NestJS and Frontend web containers in isolated serverless node contexts.',
      details: [
        'Runs server instances dynamically under 2 vCPU and 4GB allocations',
        'Container Insights track raw worker CPU and network telemetry',
        'Assigned private subnets prevent direct internet addressability'
      ],
      subnets: 'Private Subnet 1 & 2',
      status: 'active'
    },
    {
      id: 'rds',
      name: 'AWS RDS PostgreSql Multi-AZ',
      type: 'Relational Core DB State',
      description: 'Multi-AZ automated failover cluster holding transactional patient, appointment, inventory and accounts registers.',
      details: [
        'Secondary standby instance active in separate AZ zone with realtime sync',
        'KMS AES-256 data-at-rest partition encryption active',
        'Daily backup snapshots saved during low-traffic maintenance window'
      ],
      subnets: 'Database Private Subnets',
      status: 'active'
    },
    {
      id: 'elasticache',
      name: 'ElastiCache Redis Failover',
      type: 'Performance Caching & Job Queues',
      description: 'Host in-memory tables for clinical jobs, session auth states, and prescription dispatch logs.',
      details: [
        'Replication group with 2 clusters (Primary & Replica)',
        'Secured with Redis AUTH token credentials in transit',
        'Automatic failover capability with less than 15s restore windows'
      ],
      subnets: 'Database Private Subnets',
      status: 'active'
    }
  ];

  const getLogsForStream = (stream: 'all' | 'postgres' | 'redis' | 'backend' | 'frontend'): string[] => {
    const postgresLogs = [
      '[postgres] 2026-06-03 20:53:05.109 UTC [1] LOG: starting PostgreSQL 15.6 on x86_64-pc-linux-musl, compiled by gcc',
      '[postgres] 2026-06-03 20:53:05.110 UTC [1] LOG: listening on IPv4 address "0.0.0.0", port 5432',
      '[postgres] 2026-06-03 20:53:05.115 UTC [1] LOG: listening on Unix socket "/var/run/postgresql/.s.PGSQL.5432"',
      '[postgres] 2026-06-03 20:53:05.122 UTC [21] LOG: database system was shut down at 2026-06-03 20:50:41 UTC',
      '[postgres] 2026-06-03 20:53:05.135 UTC [1] LOG: database system is ready to accept connections',
      '[postgres] 2026-06-03 20:53:11.450 UTC [26] LOG: connection received: host=172.24.0.4 port=41320',
      '[postgres] 2026-06-03 20:53:11.455 UTC [26] LOG: password authentication succeeded for user "postgres"',
      '[postgres] 2026-06-03 20:53:11.510 UTC [26] LOG: database "longhealth_db" successfully bound under public tenant namespaces'
    ];

    const redisLogs = [
      '[redis] 1:C 03 Jun 2026 20:53:05.150 # oO0OoO0OoO0Oo Redis is starting oO0OoO0OoO0Oo',
      '[redis] 1:C 03 Jun 2026 20:53:05.150 # Redis version=7.2.4',
      '[redis] 1:M 03 Jun 2026 20:53:05.152 * Running mode=standalone, port=6379.',
      '[redis] 1:M 03 Jun 2026 20:53:05.152 # Warning: no config file specified, using default config.',
      '[redis] 1:M 03 Jun 2026 20:53:05.155 * Requirepass active. Standard security credentials asserted.',
      '[redis] 1:M 03 Jun 2026 20:53:05.157 * Ready to accept connections tcp'
    ];

    const backendLogs = [
      '[backend] [NestBootstrap] INFO: [LONGHEALTH-Nest-Core] Clean Architecture backend pre-compiling...',
      '[backend] [NestBootstrap] INFO: Connecting to state engines...',
      '[backend] [NestBootstrap] INFO: Prisma Client initialized. PostgreSQL Pool Client generated.',
      '[backend] [NestBootstrap] INFO: Redis cache socket connection established on host redis:6379.',
      '[backend] [NestBootstrap] INFO: Initializing Queue namespaces... [BullMQ] Active.',
      '[backend] [NestBootstrap] INFO: Routing mapping completed successfully:',
      '[backend] [NestBootstrap]   - POST /api/auth/login',
      '[backend] [NestBootstrap]   - POST /api/appointments',
      '[backend] [NestBootstrap]   - GET  /api/patients/:id',
      '[backend] [NestBootstrap]   - GET  /api/laboratory/reports',
      '[backend] [NestBootstrap]   - PUT  /api/pharmacy/inventory',
      '[backend] [NestBootstrap] INFO: [LONGHEALTH-Nest-Core] Clean Architecture backend booted on port 3001'
    ];

    const frontendLogs = [
      '[frontend] [WebConsole] INFO: Launching LongHealth Custom Fullstack Portal...',
      '[frontend] [WebConsole] INFO: Serving static assets from compilation output directory (/app/dist)...',
      '[frontend] [WebConsole] INFO: Proxy routing mapping asserted [VITE_API_GATEWAY_URL -> http://backend:3001]',
      '[frontend] [WebConsole] INFO: Registering platform rate-limit guard rails [1000 requests/tenant/min limit]',
      '[frontend] [WebConsole] INFO: Server initialized and running on port 3000 (0.0.0.0)',
      '[frontend] [WebConsole] INFO: Client network connection opened to https://ais-dev.run.app'
    ];

    switch (stream) {
      case 'postgres': return postgresLogs;
      case 'redis': return redisLogs;
      case 'backend': return backendLogs;
      case 'frontend': return frontendLogs;
      default:
        return [
          '[system] docker-compose -f docker-compose.yml up -d --build',
          '[system] Building backend service image (NestJS CLI & Prisma compile stage)...',
          '[system] Building frontend service image (Vite post-production bundle compilation)...',
          '[system] Creating longhealth-postgres ... done',
          '[system] Creating longhealth-redis    ... done',
          postgresLogs[0],
          postgresLogs[1],
          redisLogs[0],
          redisLogs[2],
          redisLogs[5],
          '[system] longhealth-postgres is healthy. Proceeding dependants boot sequence.',
          '[system] longhealth-redis is healthy. Proceeding dependants boot sequence.',
          '[system] Creating longhealth-backend-api ... done',
          backendLogs[0],
          backendLogs[1],
          postgresLogs[5],
          postgresLogs[6],
          backendLogs[2],
          backendLogs[3],
          backendLogs[4],
          backendLogs[5],
          backendLogs[11],
          '[system] Creating longhealth-frontend-web ... done',
          frontendLogs[0],
          frontendLogs[1],
          frontendLogs[2],
          frontendLogs[4],
          frontendLogs[5],
          '[system] Multi-container platform orchestrated! All tiers matching corporate healthcare healthchecks.'
        ];
    }
  };

  useEffect(() => {
    setLogs(getLogsForStream(activeLogStream));
  }, [activeLogStream]);

  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(filesContent[activeCodeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyAwsCode = () => {
    navigator.clipboard.writeText(awsFilesContent[activeAwsTab]);
    setTfCopied(true);
    setTimeout(() => setTfCopied(false), 2000);
  };

  const triggerReset = () => {
    setIsRefreshing(true);
    setLogs([]);
    setTimeout(() => {
      setLogs(getLogsForStream(activeLogStream));
      setIsRefreshing(false);
    }, 850);
  };

  const runAwsSimulation = () => {
    setAwsSimulating(true);
    setAwsValidationLogs([
      '[aws-terraform-cli] $ terraform init',
      'Retrieving providers dependency tree info...',
      '- Installing hashicorp/aws v5.42.0 (Alpine secure mirrors)...',
      'Terraform modules successfully initialized.',
      '[aws-terraform-cli] $ terraform validate',
      'Analyzing structural boundaries, variable definitions and types...',
      'Success! The infrastructure blueprints are 100% syntactically correct.',
      '[aws-terraform-cli] $ terraform plan'
    ]);

    setTimeout(() => {
      setAwsValidationLogs((prev) => [
        ...prev,
        'Active plan output generated: 21 AWS resources to register:',
        '  + aws_vpc.main',
        '  + aws_subnet.public[0..1]',
        '  + aws_subnet.private[0..1]',
        '  + aws_kms_key.storage_key',
        '  + aws_cloudfront_distribution.cdn',
        '  + aws_s3_bucket.attachments (KMS crypt-rule)',
        '  + aws_ecs_cluster.main (Cluster telemetry analytics active)',
        '  + aws_db_instance.postgres (Multi-AZ Multi-Subnet standby enabled)',
        '  + aws_elasticache_replication_group.redis (Transit TLS active)',
        '  + aws_backup_selection.db_backup_selection (Secure vault daily loop scheduled)',
        'Plan output parsed successfully. No validation issues in HIPAA boundary configurations.'
      ]);
      setAwsSimulating(false);
    }, 1500);
  };

  const currentAwsNodeDetail = awsNodes.find(n => n.id === selectedAwsNode) || awsNodes[3];

  return (
    <div id="container-deployment-control-center" className="space-y-6 pt-2 animate-fade-in text-slate-300">
      
      {/* Deployment Mode Switcher Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-slate-900/60 border border-slate-800/80 p-4 rounded-xl gap-4">
        <div className="flex items-center gap-2.5">
          <Settings className="w-5 h-5 text-indigo-400" />
          <div>
            <h3 className="text-xs font-bold text-slate-200">Deployment Architecture Controller</h3>
            <p className="text-[10px] text-slate-500">Toggle models between Local sandboxes and AWS multi-AZ architectures.</p>
          </div>
        </div>

        <div className="flex bg-slate-950 p-1.5 rounded-lg border border-slate-800/60 max-w-fit">
          <button
            onClick={() => setDeploymentTarget('local')}
            className={`flex items-center gap-1.5 text-xs font-mono font-bold px-3 py-1.5 rounded-md transition ${
              deploymentTarget === 'local'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>Local Docker Stack</span>
          </button>
          <button
            onClick={() => setDeploymentTarget('aws')}
            className={`flex items-center gap-1.5 text-xs font-mono font-bold px-3 py-1.5 rounded-md transition ${
              deploymentTarget === 'aws'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Cloud className="w-3.5 h-3.5" />
            <span>AWS Enterprise Infrastructure</span>
          </button>
        </div>
      </div>

      {deploymentTarget === 'local' ? (
        <>
          {/* LOCAL DOCKER CANVAS */}
          <div className="flex items-start gap-3 bg-indigo-950/20 border border-indigo-900/40 p-4 rounded-xl">
            <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold text-indigo-300">Enterprise Multi-Containerization Sandbox</span>
              <p className="text-slate-400 mt-1 leading-relaxed">
                The local stack mimics multi-tenant enterprise deployments inside private networks. 
                All NestJS operations, OAuth databases, cache adapters, and frontend proxies are configured to deploy 
                under isolated <b>production Dockerfiles</b> with healthy dependencies.
              </p>
            </div>
          </div>

          {/* Local Grid States */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {containerList.map((container) => (
              <div key={container.id} className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between hover:bg-slate-950 transition duration-250 hover:border-slate-700/60 shadow-lg">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] uppercase font-mono font-bold text-slate-500 tracking-wider">
                      {container.role}
                    </span>
                    <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                      ONLINE
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-indigo-500/5 text-indigo-400 rounded-lg border border-indigo-500/10">
                      {container.id === 'postgres' ? <Database className="w-4 h-4" /> : 
                       container.id === 'redis' ? <Zap className="w-4 h-4" /> : 
                       container.id === 'backend' ? <Cpu className="w-4 h-4" /> : 
                       <Globe className="w-4 h-4" />}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-200 font-mono tracking-tight">{container.name}</h4>
                      <span className="text-[10px] font-mono text-slate-500">{container.image}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-900 mt-4 pt-3 space-y-1.5 text-[10px] font-mono text-slate-400">
                  <div className="flex items-center justify-between">
                    <span>Docker IP:</span>
                    <span className="text-slate-300 font-semibold">{container.ip}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Inbound Ports:</span>
                    <span className="text-indigo-400 font-bold">{container.ports}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>CPU / Mem:</span>
                    <span className="text-slate-300">{container.cpu} / {container.memory}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Container Uptime:</span>
                    <span className="text-slate-500">{container.uptime}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Local Code & Logs View */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 flex flex-col justify-between">
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl shadow-lg h-full flex flex-col justify-between min-h-[500px]">
                <div>
                  <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-4">
                    <div className="flex items-center gap-2">
                      <Server className="w-4 h-4 text-indigo-400" />
                      <span className="text-xs font-bold text-slate-200">Local Infrastructure Specifications</span>
                    </div>
                    <button 
                      onClick={handleCopyCode}
                      className="flex items-center gap-1 text-[10px] font-mono text-indigo-400 font-bold hover:bg-indigo-950/40 border border-indigo-900/30 px-2 py-1 rounded transition"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <button
                      onClick={() => setActiveCodeTab('compose')}
                      className={`text-[10px] font-mono font-bold px-2.5 py-1.5 rounded transition ${
                        activeCodeTab === 'compose'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      docker-compose.yml
                    </button>
                    <button
                      onClick={() => setActiveCodeTab('backend')}
                      className={`text-[10px] font-mono font-bold px-2.5 py-1.5 rounded transition ${
                        activeCodeTab === 'backend'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      apps/api-gateway/Dockerfile
                    </button>
                    <button
                      onClick={() => setActiveCodeTab('frontend')}
                      className={`text-[10px] font-mono font-bold px-2.5 py-1.5 rounded transition ${
                        activeCodeTab === 'frontend'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Dockerfile (Web)
                    </button>
                  </div>
                </div>

                <div className="relative mt-2">
                  <pre className="text-slate-300 font-mono text-[9.5px] leading-normal overflow-x-auto max-h-[380px] bg-slate-950/85 p-3 rounded-lg border border-slate-900/80 custom-scrollbar">
                    <code>{filesContent[activeCodeTab]}</code>
                  </pre>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 h-full flex flex-col min-h-[500px]">
                <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-3">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-slate-300">Live Orchestration Logs</span>
                    {isRefreshing && <Activity className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />}
                  </div>
                  <button 
                    onClick={triggerReset}
                    disabled={isRefreshing}
                    className="text-slate-500 hover:text-slate-300 p-1 rounded hover:bg-slate-900 transition"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-3">
                  {(['all', 'postgres', 'redis', 'backend', 'frontend'] as const).map((stream) => (
                    <button
                      key={stream}
                      onClick={() => setActiveLogStream(stream)}
                      className={`text-[9px] font-mono px-2 py-1 rounded transition uppercase font-bold ${
                        activeLogStream === stream
                          ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-400'
                          : 'bg-slate-900 text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {stream}
                    </button>
                  ))}
                </div>

                <div className="bg-black/80 border border-slate-900 rounded-lg p-3.5 flex-1 overflow-y-auto max-h-[360px] font-mono text-[9px] leading-relaxed relative custom-scrollbar flex flex-col gap-1 text-slate-400">
                  {logs.map((log, index) => {
                    let colorClass = 'text-slate-400';
                    if (log.startsWith('[system]') || log.startsWith('  -')) {
                      colorClass = 'text-slate-500';
                    } else if (log.includes('[postgres]')) {
                      colorClass = 'text-indigo-300';
                    } else if (log.includes('[redis]')) {
                      colorClass = 'text-amber-400/90';
                    } else if (log.includes('[backend]')) {
                      colorClass = 'text-emerald-400';
                    } else if (log.includes('[frontend]')) {
                      colorClass = 'text-sky-400';
                    }
                    return (
                      <div key={index} className={`${colorClass} whitespace-pre-wrap font-mono`}>
                        {log}
                      </div>
                    );
                  })}
                  <div ref={terminalEndRef} />
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* AWS ENTERPRISE DEPLOYMENT CANVAS */}
          <div className="flex items-start gap-3 bg-emerald-950/20 border border-emerald-900/40 p-4 rounded-xl">
            <Shield className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold text-emerald-300">HIPAA Protected Multi-AZ Production Infrastructure</span>
              <p className="text-slate-400 mt-1 leading-relaxed">
                The specified AWS Cloud structure models clinical isolation boundaries using Multi-AZ private subnets under standard IAM boundaries. 
                Static attachments utilize <b>OAC-secured S3 volumes</b> with end-to-edge CloudFront, while database tiers run 
                <b>Multi-AZ RDS PostgreSQL</b> and <b>replicated ElastiCache clusters</b> with customer-managed keys (KMS) enabled.
              </p>
            </div>
          </div>

          {/* Interactive Cloud Infrastructure Diagram Row */}
          <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-900 pb-3">
              <div className="flex items-center gap-2">
                <Cloud className="w-4 h-4 text-sky-400" />
                <span className="text-xs font-bold text-slate-200">Interactive AWS Production Topology Graph</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500">Click any subnet node below to audit specs & configurations</span>
            </div>

            {/* Visual Node-Flow layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              
              {/* SVG/CSS Cloud Map (Column 1-8) */}
              <div className="lg:col-span-8 bg-slate-950/80 border border-slate-900 p-4 rounded-xl flex flex-col justify-between min-h-[300px] overflow-x-auto relative">
                
                {/* Cloud Border Wrap */}
                <div className="border border-sky-900/30 bg-sky-950/5 rounded-lg p-5 flex flex-col gap-6 w-full min-w-[500px]">
                  
                  {/* Outer DNS edge tier */}
                  <div className="flex justify-between items-center gap-4">
                    <div className="text-[9px] font-mono font-bold tracking-wider text-slate-500 uppercase">Cloud Edge CDN Tier</div>
                    
                    <div className="flex gap-4">
                      {/* CloudFront */}
                      <button 
                        onClick={() => setSelectedAwsNode('cloudfront')}
                        className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition text-center w-36 ${
                          selectedAwsNode === 'cloudfront' 
                            ? 'bg-sky-950/50 border-sky-400 text-sky-300 shadow-lg shadow-sky-400/10 scale-102 font-bold' 
                            : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-400'
                        }`}
                      >
                        <Globe className="w-5 h-5 text-sky-400" />
                        <span className="text-[10px] font-mono">CloudFront CDN</span>
                      </button>

                      {/* Secured S3 bucket */}
                      <button 
                        onClick={() => setSelectedAwsNode('s3')}
                        className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition text-center w-36 ${
                          selectedAwsNode === 's3' 
                            ? 'bg-emerald-950/50 border-emerald-400 text-emerald-300 shadow-lg shadow-emerald-400/10 scale-102 font-bold' 
                            : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-400'
                        }`}
                      >
                        <HardDrive className="w-5 h-5 text-emerald-400" />
                        <span className="text-[10px] font-mono">S3 Medical Vault</span>
                      </button>
                    </div>
                  </div>

                  {/* Divider arrow line flow */}
                  <div className="flex justify-center">
                    <span className="text-slate-700 font-mono text-[10px] leading-[1]">↓ HTTP/HTTPS SECURE INGRESS ↓</span>
                  </div>

                  {/* Public VPC boundary (containing Load balancer Router) */}
                  <div className="border border-indigo-900/30 bg-indigo-950/5 rounded-lg p-4 flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-mono font-bold text-indigo-400 uppercase tracking-widest">AWS VPC - Us-East-1 (HIPAA Cluster)</span>
                      <span className="text-[9px] font-mono text-slate-500 bg-slate-900 px-2 py-0.5 rounded">10.0.0.0/16</span>
                    </div>

                    <div className="flex justify-center items-center">
                      {/* Application Load Balancer */}
                      <button 
                        onClick={() => setSelectedAwsNode('alb')}
                        className={`p-3 rounded-xl border flex items-center gap-2.5 transition text-left w-64 justify-center ${
                          selectedAwsNode === 'alb' 
                            ? 'bg-indigo-950/50 border-indigo-400 text-indigo-300 shadow-lg shadow-indigo-400/10 scale-102 font-bold' 
                            : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-400'
                        }`}
                      >
                        <Settings className="w-4 h-4 text-indigo-400 animate-spin-slow" />
                        <div>
                          <div className="text-[10px] font-mono">ALB Load Balancer</div>
                          <span className="text-[8px] font-mono block text-slate-500">Routes static/dynamic ports</span>
                        </div>
                      </button>
                    </div>

                    {/* Highly isolated Private Subnets containing ECS and State cores */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 border-t border-slate-900 pt-4">
                      
                      {/* ECS Container space */}
                      <div className="col-span-1 border border-slate-900 bg-slate-950/40 p-2.5 rounded-lg flex flex-col gap-2">
                        <span className="text-[8px] text-slate-500 font-mono font-bold tracking-wider uppercase block text-center">Compute (Fargate Tasks)</span>
                        <button 
                          onClick={() => setSelectedAwsNode('ecs')}
                          className={`p-2.5 rounded-lg border flex flex-col items-center gap-1 transition text-center w-full ${
                            selectedAwsNode === 'ecs' 
                              ? 'bg-indigo-950/50 border-indigo-400 text-indigo-300 shadow-md font-bold' 
                              : 'bg-slate-950 border-slate-900 hover:border-slate-800 text-slate-400'
                          }`}
                        >
                          <Cpu className="w-4 h-4 text-indigo-400" />
                          <span className="text-[9px] font-mono">ECS Fargate Cluster</span>
                        </button>
                      </div>

                      {/* Databases Private tier */}
                      <div className="col-span-2 border border-slate-900 bg-slate-950/40 p-2.5 rounded-lg flex flex-col gap-2">
                        <span className="text-[8px] text-slate-500 font-mono font-bold tracking-wider uppercase block text-center">State & Cache Tier (Multi-AZ subnets)</span>
                        <div className="grid grid-cols-2 gap-2">
                          <button 
                            onClick={() => setSelectedAwsNode('rds')}
                            className={`p-2 rounded-lg border flex flex-col items-center gap-1 transition text-center ${
                              selectedAwsNode === 'rds' 
                                ? 'bg-amber-950/50 border-amber-400 text-amber-300 shadow-md font-bold' 
                                : 'bg-slate-950 border-slate-900 hover:border-slate-800 text-slate-400'
                            }`}
                          >
                            <Database className="w-4 h-4 text-amber-400" />
                            <span className="text-[9px] font-mono">RDS PostgreSql</span>
                          </button>

                          <button 
                            onClick={() => setSelectedAwsNode('elasticache')}
                            className={`p-2 rounded-lg border flex flex-col items-center gap-1 transition text-center ${
                              selectedAwsNode === 'elasticache' 
                                ? 'bg-rose-950/50 border-rose-400 text-rose-300 shadow-md font-bold' 
                                : 'bg-slate-950 border-slate-900 hover:border-slate-800 text-slate-400'
                            }`}
                          >
                            <Zap className="w-4 h-4 text-rose-400" />
                            <span className="text-[9px] font-mono">ElastiCache Redis</span>
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>

                </div>

              </div>

              {/* Node Specifications Detail Panel (Column 9-12) */}
              <div className="lg:col-span-4 bg-slate-950 border border-slate-900 p-4 rounded-xl flex flex-col justify-between">
                <div>
                  <div className="text-[10px] font-mono font-bold tracking-wider uppercase text-indigo-400 mb-1 block">
                    {currentAwsNodeDetail.type}
                  </div>
                  <h4 className="text-xs font-bold text-slate-200 mt-1 mb-2 font-mono flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    {currentAwsNodeDetail.name}
                  </h4>
                  
                  <p className="text-[10px] text-slate-400 leading-normal mb-4">
                    {currentAwsNodeDetail.description}
                  </p>

                  <div className="border-t border-slate-900 pt-3 space-y-2.5">
                    <span className="text-[9px] font-mono font-bold text-slate-500 block uppercase">HIPAA Guard Audit logs:</span>
                    {currentAwsNodeDetail.details.map((detail, idx) => (
                      <div key={idx} className="flex gap-2 text-[10px] text-slate-400 leading-normal">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{detail}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-slate-900 mt-4 pt-3 text-[10px] font-mono text-slate-500 space-y-1">
                  <div className="flex justify-between">
                    <span>IP / Security Zone:</span>
                    <span className="text-slate-400">{currentAwsNodeDetail.subnets}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Inbound Traffic Policy:</span>
                    <span className="text-sky-400 font-bold">HTTPS / TLS SSL</span>
                  </div>
                </div>
              </div>

            </div>

          </div>

          {/* Interactive Cloud Infrastructure setups codes & testing simulator logs */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* AWS Code Tabs */}
            <div className="lg:col-span-7">
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl shadow-lg h-full flex flex-col justify-between min-h-[500px]">
                <div>
                  <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-4">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-sky-400" />
                      <span className="text-xs font-bold text-slate-200">AWS Terraform Integration Suite</span>
                    </div>
                    <button 
                      onClick={handleCopyAwsCode}
                      className="flex items-center gap-1 text-[10px] font-mono text-sky-400 font-bold hover:bg-sky-950/40 border border-sky-900/30 px-2 py-1 rounded transition"
                    >
                      {tfCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{tfCopied ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <button
                      onClick={() => setActiveAwsTab('tf_main')}
                      className={`text-[10px] font-mono font-bold px-2.5 py-1.5 rounded transition ${
                        activeAwsTab === 'tf_main'
                          ? 'bg-sky-600 text-white font-bold shadow-md'
                          : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      /infra/aws/main.tf (Cluster Elements)
                    </button>
                    <button
                      onClick={() => setActiveAwsTab('tf_vars')}
                      className={`text-[10px] font-mono font-bold px-2.5 py-1.5 rounded transition ${
                        activeAwsTab === 'tf_vars'
                          ? 'bg-sky-600 text-white font-bold shadow-md'
                          : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      /infra/aws/variables.tf
                    </button>
                    <button
                      onClick={() => setActiveAwsTab('tf_out')}
                      className={`text-[10px] font-mono font-bold px-2.5 py-1.5 rounded transition ${
                        activeAwsTab === 'tf_out'
                          ? 'bg-sky-600 text-white font-bold shadow-md'
                          : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      /infra/aws/outputs.tf
                    </button>
                  </div>
                </div>

                <div className="relative mt-2">
                  <pre className="text-slate-300 font-mono text-[9.5px] leading-normal overflow-x-auto max-h-[380px] bg-slate-950/85 p-3 rounded-lg border border-slate-900/80 custom-scrollbar">
                    <code>{awsFilesContent[activeAwsTab]}</code>
                  </pre>
                </div>
              </div>
            </div>

            {/* AWS Dryrun Testing Sandbox */}
            <div className="lg:col-span-5">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 h-full flex flex-col justify-between min-h-[500px]">
                <div>
                  <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-3">
                    <div className="flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-emerald-400 animate-pulse" />
                      <span className="text-xs font-bold text-slate-300">AWS CLI Deployment Validator</span>
                    </div>

                    <button
                      onClick={runAwsSimulation}
                      disabled={awsSimulating}
                      className="bg-sky-600 hover:bg-sky-550 disabled:bg-slate-800 text-white font-bold text-[10px] font-mono px-3 py-1.5 rounded transition shadow-md flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{awsSimulating ? 'Dryrunning Blueprint...' : 'Validate Blueprints'}</span>
                    </button>
                  </div>

                  <p className="text-[10px] text-slate-500 mb-3 leading-normal">
                    Initiates a dry-run syntax parse using local mock engines to confirm your setups against standard AWS ECS Fargate, S3 buckets, and RDS instances rules.
                  </p>

                  <div className="bg-black/95 border border-slate-900 rounded-lg p-3.5 min-h-[320px] font-mono text-[9px] leading-relaxed relative custom-scrollbar flex flex-col gap-1 text-slate-400 max-h-[320px] overflow-y-auto">
                    {awsValidationLogs.length > 0 ? (
                      awsValidationLogs.map((log, index) => {
                        let colorClass = 'text-slate-400';
                        if (log.startsWith('[aws-')) {
                          colorClass = 'text-emerald-400 font-bold';
                        } else if (log.includes('+')) {
                          colorClass = 'text-sky-300';
                        } else if (log.includes('Success!') || log.includes('successfully')) {
                          colorClass = 'text-emerald-400';
                        } else if (log.includes('Plan output')) {
                          colorClass = 'text-indigo-400 font-semibold';
                        }
                        return (
                          <div key={index} className={`${colorClass} whitespace-pre-wrap font-mono`}>
                            {log}
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-slate-600 flex flex-col items-center justify-center h-[260px] italic">
                        <span>Click "Validate Blueprints" above to check Terraform scripts against standard AWS policy guidelines.</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t border-slate-900 pt-3 mt-4 text-[10px] font-mono text-slate-500 flex items-start gap-1">
                  <Lock className="w-3.5 h-3.5 text-slate-600 shrink-0 mt-0.5" />
                  <span>The blueprints strictly align with AWS Well-Architected Framework specs for healthcare apps.</span>
                </div>
              </div>
            </div>

          </div>

          {/* S3, CloudFront, Monitoring and Backup strategy tabs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-950 p-6 border border-slate-800 rounded-2xl shadow-xl">
            
            {/* Left Box: Active Disaster Recovery & Backup Plan */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-900 pb-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-bold text-slate-200">Disaster Recovery & Backup Strategy</h4>
              </div>

              <div className="space-y-3.5">
                <div className="bg-slate-950/80 border border-slate-905 p-3 rounded-xl hover:border-slate-800 transition">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold text-slate-300">Relational Database Core (RDS)</span>
                    <span className="text-[10px] font-mono bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded font-bold border border-emerald-900/40">Multi-AZ Master-Standby</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                    RDS runs continuous Multi-AZ block repl loops. Point-In-Time backups retain snapshots for 14 days under standard KMS protection blocks. Custom maintenance splits happen at 02:00 UTC weekly.
                  </p>
                </div>

                <div className="bg-slate-950/80 border border-slate-905 p-3 rounded-xl hover:border-slate-800 transition">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold text-slate-300">File Storage Tier (S3 attachments)</span>
                    <span className="text-[10px] font-mono bg-indigo-950 text-indigo-400 px-2 py-0.5 rounded font-bold border border-indigo-900/40">Versioning Active</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                    S3 features continuous medical document version trackers preventing administrative record wipes. AWS backup schedules daily backup plan copies to isolated HSM vaults with 30-day corporate legal retention.
                  </p>
                </div>

                <div className="bg-slate-950/80 border border-slate-905 p-3 rounded-xl hover:border-slate-800 transition">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold text-slate-300">In-Memory Store Failover (Redis)</span>
                    <span className="text-[10px] font-mono bg-rose-950 text-rose-450 px-2 py-0.5 rounded font-bold border border-rose-900/40">&lt; 15s Failovers</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                    ElastiCache replication groups host 2 identical cache nodes (1 Primary, 1 standby) in separated Multi-AZ availability sectors. Cache sync fails over instantly inside private subnet meshes.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Box: Continuous CloudWatch Telemetry Monitor */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-900 pb-2">
                <Activity className="w-4 h-4 text-sky-400" />
                <h4 className="text-xs font-bold text-slate-200">Continuous CloudWatch Telemetry Monitor</h4>
              </div>

              <div className="space-y-3 font-mono text-[10px] text-slate-400 leading-relaxed">
                <div>
                  <span className="font-bold text-slate-300 block mb-1">UnHealthyHostCount (Application Load Balancer Guard)</span>
                  <div className="bg-slate-950 border border-slate-900 p-2.5 rounded-lg flex items-center justify-between">
                    <span>Target Group: longhealth-web-tg</span>
                    <span className="text-emerald-400 font-bold">Health Level: OK (0 / 2 Unhealthy)</span>
                  </div>
                </div>

                <div>
                  <span className="font-bold text-slate-300 block mb-1">RDS CPUUtilization Metrics Detector</span>
                  <div className="bg-slate-950 border border-slate-900 p-2.5 rounded-lg flex items-center justify-between">
                    <span>Alarm Trigger Limit: &gt; 85% for 300s</span>
                    <span className="text-emerald-400 font-bold">Current Metrics Rate: 1.4% (OK)</span>
                  </div>
                </div>

                <div>
                  <span className="font-bold text-slate-300 block mb-1">AWS Container Insights Monitoring (ECS telemetry metadata)</span>
                  <div className="bg-slate-950 border border-slate-900 p-2.5 rounded-lg space-y-1.5">
                    <div className="flex justify-between">
                      <span>ECS Memory utilization rate:</span>
                      <span className="text-slate-300 font-bold">12.8% of allocated bounds</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Inbound cluster port routes (TCP):</span>
                      <span className="text-indigo-400 font-bold">3000 / 3001 active</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </>
      )}

    </div>
  );
};
