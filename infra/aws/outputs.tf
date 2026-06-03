# ==============================================================================
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
}
