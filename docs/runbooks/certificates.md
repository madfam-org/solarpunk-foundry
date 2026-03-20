# Certificate Renewal Runbook

## Overview

MADFAM uses Cloudflare for SSL/TLS termination, so most certificate management is automatic. This runbook covers edge cases and internal certificates.

## Cloudflare-Managed Certificates

### Status Check

Certificates for `*.janua.dev` and `*.enclii.madfam.io` are automatically managed by Cloudflare.

```bash
# Check Cloudflare certificate status (requires CF token)
curl -s -X GET "https://api.cloudflare.com/client/v4/zones/YOUR_ZONE_ID/ssl/certificate_packs" \
  -H "Authorization: Bearer $CF_TOKEN" \
  -H "Content-Type: application/json" | jq '.result[].status'
```

### Troubleshooting

If Cloudflare certificates aren't working:

1. Check DNS propagation: `dig api.janua.dev`
2. Verify tunnel status: `ssh ssh.madfam.io "sudo systemctl status cloudflared"`
3. Check Cloudflare dashboard for certificate status

## Internal Certificates

### JWT Signing Keys

Location: `/opt/solarpunk/secrets/jwt/`

```bash
# Check key expiry (if applicable)
ssh ssh.madfam.io "openssl x509 -in /opt/solarpunk/secrets/jwt/public.pem -noout -dates 2>/dev/null || echo 'Not an X.509 cert (likely RSA key pair)'"
```

### Generate New JWT Keys

```bash
# Generate new RSA key pair
ssh ssh.madfam.io "cd /opt/solarpunk/secrets/jwt && \
  openssl genrsa -out private.pem 4096 && \
  openssl rsa -in private.pem -pubout -out public.pem && \
  chmod 600 private.pem && chmod 644 public.pem"

# Restart services to pick up new keys
ssh ssh.madfam.io "sudo kubectl rollout restart deployment/janua-api -n janua"
```

### Database SSL Certificates

If using SSL for PostgreSQL connections:

```bash
# Check PostgreSQL SSL status
ssh ssh.madfam.io "docker exec janua-postgres psql -U janua -c 'SHOW ssl;'"

# Check certificate
ssh ssh.madfam.io "docker exec janua-postgres psql -U janua -c 'SELECT ssl_is_used FROM pg_stat_activity WHERE pid = pg_backend_pid();'"
```

## Cloudflare Tunnel Certificate

The tunnel uses Cloudflare-managed credentials.

```bash
# Check tunnel certificate
ssh ssh.madfam.io "sudo ls -la /etc/cloudflared/*.pem"

# Tunnel status
ssh ssh.madfam.io "sudo cloudflared tunnel info"
```

### Renew Tunnel Credentials

If tunnel needs re-authentication:

```bash
# Re-authenticate tunnel
ssh ssh.madfam.io "sudo cloudflared tunnel login"

# Restart tunnel
ssh ssh.madfam.io "sudo systemctl restart cloudflared"
```

## Certificate Expiry Monitoring

### Manual Check Script

```bash
#!/bin/bash
# check-certs.sh

echo "=== Cloudflare Tunnel ==="
sudo cloudflared tunnel info 2>/dev/null | head -5

echo ""
echo "=== JWT Keys ==="
ls -la /opt/solarpunk/secrets/jwt/

echo ""
echo "=== Domain SSL (via curl) ==="
for domain in api.janua.dev app.janua.dev admin.janua.dev; do
  echo -n "$domain: "
  echo | timeout 5 openssl s_client -servername $domain -connect $domain:443 2>/dev/null | \
    openssl x509 -noout -dates 2>/dev/null | grep notAfter || echo "Unable to check"
done
```

### Automated Monitoring (Future)

Consider adding:
- Prometheus certificate exporter
- Cloudflare API polling for cert status
- Slack/email alerts on expiry warnings

## Emergency Procedures

### Cloudflare Certificate Issues

1. Check Cloudflare dashboard for errors
2. Verify domain ownership/DNS
3. Contact Cloudflare support if needed

### Internal Certificate Emergency

1. Generate new certificates immediately
2. Update configuration
3. Rolling restart of affected services
4. Verify functionality

## Key Locations Summary

| Certificate | Location | Renewal |
|-------------|----------|---------|
| Cloudflare SSL | Cloudflare-managed | Automatic |
| Tunnel creds | /etc/cloudflared/ | `cloudflared tunnel login` |
| JWT keys | /opt/solarpunk/secrets/jwt/ | Manual (no expiry) |
| PostgreSQL SSL | Container-internal | Optional |
