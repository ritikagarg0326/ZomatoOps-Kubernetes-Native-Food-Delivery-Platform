# Get available AZs
data "aws_availability_zones" "available" {}

# VPC
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "5.0.0"

  name = "zomato-vpc"
  cidr = "10.0.0.0/16"

  azs             = slice(data.aws_availability_zones.available.names, 0, 2)
  public_subnets  = ["10.0.1.0/24", "10.0.2.0/24"]

  # No private subnets, no NAT gateway = saves ~$32/month
  enable_nat_gateway = false
  enable_vpn_gateway = false
map_public_ip_on_launch = true
  # Required tags for EKS
  public_subnet_tags = {
    "kubernetes.io/role/elb" = 1
  }

  tags = {
    Project = "zomato"
  }
}

# EKS Cluster
module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "20.0.0"

  cluster_name    = var.cluster_name
  cluster_version = "1.29"

  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.public_subnets

  # Make API server public so you can access it from laptop
  cluster_endpoint_public_access = true

  eks_managed_node_groups = {
    zomato_nodes = {
      min_size       = 1
      max_size       = 1
      desired_size   = 1

      # t3.small = cheapest that can run k8s (2GB RAM)
      instance_types = ["t3.small"]

      # Spot instance = 70% cheaper than on-demand
      capacity_type  = "SPOT"
    }
  }

  tags = {
    Project = "zomato"
  }
}