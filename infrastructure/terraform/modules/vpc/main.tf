module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 5.0"
  
  name = var.name
  cidr = var.cidr
  
  azs             = var.availability_zones
  private_subnets = [for i, az in var.availability_zones : cidrsubnet(var.cidr, 4, i)]
  public_subnets  = [for i, az in var.availability_zones : cidrsubnet(var.cidr, 4, i + length(var.availability_zones))]
  database_subnets = [for i, az in var.availability_zones : cidrsubnet(var.cidr, 4, i + 2 * length(var.availability_zones))]
  
  enable_nat_gateway   = var.enable_nat_gateway
  single_nat_gateway   = var.environment != "production"
  enable_dns_hostnames = var.enable_dns_hostnames
  enable_dns_support   = var.enable_dns_support
  
  enable_vpn_gateway = var.enable_vpn_gateway
  
  # Database subnet group
  create_database_subnet_group       = true
  create_database_subnet_route_table = true
  
  # ElastiCache subnet group
  create_elasticache_subnet_group = true
  
  # Flow logs
  enable_flow_log                      = true
  create_flow_log_cloudwatch_log_group = true
  create_flow_log_cloudwatch_iam_role  = true
  flow_log_max_aggregation_interval    = 60
  
  public_subnet_tags  = var.public_subnet_tags
  private_subnet_tags = var.private_subnet_tags
  
  tags = {
    Environment = var.environment
    Terraform   = "true"
  }
}