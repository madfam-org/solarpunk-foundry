# Janua Cloudflare Configuration
# ==============================
# Cloudflare Tunnel for zero-trust ingress (no exposed ports)
# DNS records, SSL certificates, and Zero Trust Access policies

# =============================================================================
# CLOUDFLARE TUNNEL
# =============================================================================

resource "cloudflare_tunnel" "janua" {
  account_id = var.cloudflare_account_id
  name       = "janua-${var.environment}"
  secret     = var.tunnel_secret != "" ? base64encode(var.tunnel_secret) : base64encode(random_password.tunnel_secret.result)
}

resource "random_password" "tunnel_secret" {
  length  = 32
  special = false
}

# Tunnel configuration - routes traffic to internal services
resource "cloudflare_tunnel_config" "janua" {
  account_id = var.cloudflare_account_id
  tunnel_id  = cloudflare_tunnel.janua.id

  config {
    # ==========================================================================
    # SSH ACCESS (Zero Trust - Requires WARP client or cloudflared ProxyCommand)
    # ==========================================================================
    ingress_rule {
      hostname = "ssh.${var.ssh_domain}"
      service  = "ssh://localhost:22"
      origin_request {
        connect_timeout = "30s"
      }
    }

    # ==========================================================================
    # JANUA SERVICES
    # ==========================================================================

    # Main auth API (port 4100 externally, 8000 internally)
    ingress_rule {
      hostname = "api.${var.domain}"
      service  = "http://localhost:4100"
      origin_request {
        connect_timeout = "30s"
        no_tls_verify   = true
      }
    }

    # Dashboard (port 4101)
    ingress_rule {
      hostname = "app.${var.domain}"
      service  = "http://localhost:4101"
      origin_request {
        connect_timeout = "30s"
        no_tls_verify   = true
      }
    }

    # Admin dashboard (port 4102)
    ingress_rule {
      hostname = "admin.${var.domain}"
      service  = "http://localhost:4102"
      origin_request {
        connect_timeout = "30s"
        no_tls_verify   = true
      }
    }

    # Documentation (port 4103)
    ingress_rule {
      hostname = "docs.${var.domain}"
      service  = "http://localhost:4103"
      origin_request {
        connect_timeout = "30s"
        no_tls_verify   = true
      }
    }

    # Website (port 4104)
    ingress_rule {
      hostname = "${var.domain}"
      service  = "http://localhost:4104"
      origin_request {
        connect_timeout = "30s"
        no_tls_verify   = true
      }
    }

    # Legacy auth endpoint (for backward compatibility)
    ingress_rule {
      hostname = "auth.${var.domain}"
      service  = "http://localhost:4100"
      origin_request {
        connect_timeout = "30s"
        no_tls_verify   = true
      }
    }

    # Health checks
    ingress_rule {
      hostname = "api.${var.domain}"
      path     = "/health"
      service  = "http://localhost:4100"
    }

    # Catch-all (required by Cloudflare)
    ingress_rule {
      service = "http_status:404"
    }
  }
}

# =============================================================================
# DNS RECORDS
# =============================================================================

resource "cloudflare_record" "auth" {
  zone_id = data.cloudflare_zone.main.id
  name    = "auth"
  value   = "${cloudflare_tunnel.janua.id}.cfargotunnel.com"
  type    = "CNAME"
  proxied = true
  comment = "Janua auth API via Cloudflare Tunnel"
}

resource "cloudflare_record" "auth_admin" {
  zone_id = data.cloudflare_zone.main.id
  name    = "auth-admin"
  value   = "${cloudflare_tunnel.janua.id}.cfargotunnel.com"
  type    = "CNAME"
  proxied = true
  comment = "Janua admin dashboard via Cloudflare Tunnel"
}

# =============================================================================
# SSL/TLS CONFIGURATION
# =============================================================================

resource "cloudflare_zone_settings_override" "ssl" {
  zone_id = data.cloudflare_zone.main.id

  settings {
    ssl                      = "strict"
    always_use_https         = "on"
    min_tls_version          = "1.2"
    automatic_https_rewrites = "on"
    security_header {
      enabled            = true
      include_subdomains = true
      max_age            = 31536000
      preload            = true
    }
  }
}

# =============================================================================
# SSH DNS RECORD (for ssh.madfam.io)
# =============================================================================

# DNS record for SSH access via tunnel
# NOTE: This requires the zone to be managed by Cloudflare
# If using external DNS (e.g., Porkbun), create a CNAME manually:
#   ssh -> <tunnel-id>.cfargotunnel.com (Proxied)
resource "cloudflare_record" "ssh" {
  count   = var.ssh_zone_id != "" ? 1 : 0
  zone_id = var.ssh_zone_id
  name    = "ssh"
  value   = "${cloudflare_tunnel.janua.id}.cfargotunnel.com"
  type    = "CNAME"
  proxied = true
  comment = "SSH access via Cloudflare Zero Trust Tunnel"
}

# =============================================================================
# ZERO TRUST ACCESS (Admin Protection)
# =============================================================================

# Access application for SSH (Zero Trust)
resource "cloudflare_access_application" "ssh" {
  count            = var.ssh_zone_id != "" ? 1 : 0
  zone_id          = var.ssh_zone_id
  name             = "Server SSH Access"
  domain           = "ssh.${var.ssh_domain}"
  type             = "ssh"
  session_duration = "1h"  # Short sessions for SSH security

  allowed_idps = [cloudflare_access_identity_provider.github.id]
}

# Access policy for SSH - only allowed team members
resource "cloudflare_access_policy" "ssh_policy" {
  count          = var.ssh_zone_id != "" ? 1 : 0
  zone_id        = var.ssh_zone_id
  application_id = cloudflare_access_application.ssh[0].id
  name           = "SSH Access - Team Members"
  precedence     = 1
  decision       = "allow"

  include {
    email = var.ssh_allowed_emails
  }
}

# Access application for admin dashboard
resource "cloudflare_access_application" "admin" {
  zone_id          = data.cloudflare_zone.main.id
  name             = "Janua Admin Dashboard"
  domain           = "admin.${var.domain}"
  type             = "self_hosted"
  session_duration = "24h"

  allowed_idps = [cloudflare_access_identity_provider.github.id]
}

# GitHub identity provider for admin access
resource "cloudflare_access_identity_provider" "github" {
  zone_id = data.cloudflare_zone.main.id
  name    = "GitHub"
  type    = "github"
  config {
    client_id     = var.github_oauth_client_id
    client_secret = var.github_oauth_client_secret
  }
}

# Access policy - only allow specific GitHub users
resource "cloudflare_access_policy" "admin_policy" {
  zone_id        = data.cloudflare_zone.main.id
  application_id = cloudflare_access_application.admin.id
  name           = "Admin Users"
  precedence     = 1
  decision       = "allow"

  include {
    email = var.admin_emails
  }
}

# =============================================================================
# R2 BUCKET (for backups if needed)
# =============================================================================

resource "cloudflare_r2_bucket" "backups" {
  account_id = var.cloudflare_account_id
  name       = "janua-backups-${var.environment}"
  location   = "WEUR" # Western Europe
}

# =============================================================================
# ADDITIONAL VARIABLES FOR CLOUDFLARE
# =============================================================================

variable "github_oauth_client_id" {
  description = "GitHub OAuth client ID for Zero Trust Access"
  type        = string
  default     = ""
}

variable "github_oauth_client_secret" {
  description = "GitHub OAuth client secret for Zero Trust Access"
  type        = string
  sensitive   = true
  default     = ""
}

variable "admin_emails" {
  description = "Email addresses allowed to access admin dashboard"
  type        = list(string)
  default     = []
}

# =============================================================================
# SSH ZERO TRUST VARIABLES
# =============================================================================

variable "ssh_domain" {
  description = "Domain for SSH access (e.g., madfam.io for ssh.madfam.io)"
  type        = string
  default     = "madfam.io"
}

variable "ssh_zone_id" {
  description = "Cloudflare Zone ID for SSH domain. Leave empty if DNS is managed externally (e.g., Porkbun)"
  type        = string
  default     = ""
}

variable "ssh_allowed_emails" {
  description = "Email addresses allowed SSH access via Zero Trust"
  type        = list(string)
  default     = []
}

# =============================================================================
# OUTPUTS
# =============================================================================

output "tunnel_id" {
  description = "Cloudflare Tunnel ID"
  value       = cloudflare_tunnel.janua.id
}

output "tunnel_token" {
  description = "Cloudflare Tunnel token for cloudflared"
  value       = cloudflare_tunnel.janua.tunnel_token
  sensitive   = true
}

output "auth_url" {
  description = "Janua auth API URL"
  value       = "https://auth.${var.domain}"
}

output "admin_url" {
  description = "Janua admin dashboard URL"
  value       = "https://auth-admin.${var.domain}"
}

output "r2_bucket_name" {
  description = "R2 bucket name for backups"
  value       = cloudflare_r2_bucket.backups.name
}

# =============================================================================
# SSH ACCESS OUTPUTS
# =============================================================================

output "ssh_hostname" {
  description = "SSH hostname for Zero Trust access"
  value       = "ssh.${var.ssh_domain}"
}

output "ssh_cname_target" {
  description = "CNAME target for SSH DNS record (use if DNS managed externally)"
  value       = "${cloudflare_tunnel.janua.id}.cfargotunnel.com"
}

output "ssh_connection_command" {
  description = "SSH connection command (requires WARP client or cloudflared)"
  value       = "ssh -o ProxyCommand='cloudflared access ssh --hostname ssh.${var.ssh_domain}' solarpunk@ssh.${var.ssh_domain}"
}
