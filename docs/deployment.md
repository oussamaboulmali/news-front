# 🚀 Deployment Guide

## Table of Contents

- [Overview](#overview)
- [Pre-Deployment Checklist](#pre-deployment-checklist)
- [Server Requirements](#server-requirements)
- [Environment Setup](#environment-setup)
- [Build Process](#build-process)
- [Deployment Options](#deployment-options)
  - [Nginx Deployment](#nginx-deployment)
  - [Apache Deployment](#apache-deployment)
  - [Docker Deployment](#docker-deployment)
  - [Cloud Platforms](#cloud-platforms)
- [SSL/TLS Configuration](#ssltls-configuration)
- [Performance Optimization](#performance-optimization)
- [Monitoring & Logging](#monitoring--logging)
- [Backup & Recovery](#backup--recovery)
- [Rollback Procedures](#rollback-procedures)
- [Troubleshooting](#troubleshooting)

---

## Overview

This guide provides detailed instructions for deploying the APS News Dashboard to production environments. Follow these steps carefully to ensure a secure and stable deployment.

### Deployment Architecture

```
Users → CDN/Load Balancer → Web Server → Application
                                ↓
                          Backend API Server
                                ↓
                            Database
```

---

## Pre-Deployment Checklist

### Code Quality

- [ ] All tests passing
- [ ] Code reviewed and approved
- [ ] No console errors or warnings
- [ ] Linter passes without errors
- [ ] Security audit completed

### Configuration

- [ ] Environment variables configured
- [ ] API endpoints verified
- [ ] SSL certificates obtained
- [ ] Domain name configured
- [ ] DNS records set up

### Security

- [ ] Security headers configured
- [ ] HTTPS enforced
- [ ] API keys secured
- [ ] No secrets in code
- [ ] CORS properly configured

### Performance

- [ ] Assets optimized (images, fonts)
- [ ] Bundle size analyzed
- [ ] Lazy loading implemented
- [ ] Caching strategy defined
- [ ] CDN configured (if applicable)

### Documentation

- [ ] Deployment documentation updated
- [ ] Environment variables documented
- [ ] Rollback procedures documented
- [ ] Monitoring setup documented

---

## Server Requirements

### Minimum Requirements

| Resource | Requirement |
|----------|-------------|
| **OS** | Ubuntu 20.04+ / CentOS 8+ / Debian 11+ |
| **CPU** | 2 cores |
| **RAM** | 4GB |
| **Storage** | 20GB SSD |
| **Network** | 100 Mbps |

### Recommended Requirements

| Resource | Requirement |
|----------|-------------|
| **OS** | Ubuntu 22.04 LTS |
| **CPU** | 4+ cores |
| **RAM** | 8GB+ |
| **Storage** | 50GB+ SSD |
| **Network** | 1 Gbps |

### Software Requirements

```bash
# Node.js (for build process)
Node.js 18+ and npm 9+

# Web Server (choose one)
Nginx 1.18+ or Apache 2.4+

# SSL/TLS
Certbot for Let's Encrypt

# Optional
Docker 20+
PM2 for process management
```

---

## Environment Setup

### 1. Install Node.js

```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

### 2. Install Web Server

#### Nginx

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nginx

# Start and enable
sudo systemctl start nginx
sudo systemctl enable nginx

# Verify
sudo systemctl status nginx
```

#### Apache

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install apache2

# Enable required modules
sudo a2enmod rewrite
sudo a2enmod headers
sudo a2enmod ssl

# Start and enable
sudo systemctl start apache2
sudo systemctl enable apache2
```

### 3. Install Certbot (for SSL)

```bash
# Ubuntu/Debian
sudo apt install certbot

# For Nginx
sudo apt install python3-certbot-nginx

# For Apache
sudo apt install python3-certbot-apache
```

---

## Build Process

### 1. Clone Repository

```bash
# Clone the repository
git clone https://github.com/your-org/aps-news-dashboard.git
cd aps-news-dashboard

# Checkout production branch
git checkout main
```

### 2. Install Dependencies

```bash
# Install all dependencies
npm ci

# This uses package-lock.json for deterministic builds
```

### 3. Configure Environment

```bash
# Create production environment file
cp .env.example .env

# Edit environment variables
nano .env
```

**Production .env:**

```env
# Production configuration
VITE_APP_STATUS=prod
VITE_BASE_URL=https://api.aps.dz/api/v1/
VITE_IMAGE_URL=https://api.aps.dz
VITE_APP_ID=your-production-api-key
VITE_EMPTY_DATA=No data available
VITE_KEY=your-production-encryption-key-32-chars-min
VITE_PREF=_aps_
```

### 4. Build for Production

```bash
# Build optimized production bundle
npm run build

# Output will be in ./dist directory
ls -la dist/
```

### 5. Test Production Build

```bash
# Preview production build locally
npm run preview

# Test in browser at http://localhost:4173
```

---

## Deployment Options

### Nginx Deployment

#### 1. Configure Nginx

```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/aps-dashboard
```

**Configuration:**

```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name dashboard.aps.dz www.dashboard.aps.dz;
    
    return 301 https://$server_name$request_uri;
}

# HTTPS Server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name dashboard.aps.dz www.dashboard.aps.dz;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/dashboard.aps.dz/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/dashboard.aps.dz/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # Root directory
    root /var/www/aps-dashboard/dist;
    index index.html;

    # Logging
    access_log /var/log/nginx/aps-dashboard-access.log;
    error_log /var/log/nginx/aps-dashboard-error.log;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript 
               application/x-javascript application/xml+rss 
               application/json application/javascript;

    # SPA routing - serve index.html for all routes
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Disable access to sensitive files
    location ~ /\. {
        deny all;
    }

    # API proxy (optional - if backend on same server)
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### 2. Deploy Application

```bash
# Create deployment directory
sudo mkdir -p /var/www/aps-dashboard

# Copy build files
sudo cp -r dist/* /var/www/aps-dashboard/

# Set proper permissions
sudo chown -R www-data:www-data /var/www/aps-dashboard
sudo chmod -R 755 /var/www/aps-dashboard
```

#### 3. Enable Site

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/aps-dashboard /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

---

### Apache Deployment

#### 1. Configure Apache

```bash
# Create Apache configuration
sudo nano /etc/apache2/sites-available/aps-dashboard.conf
```

**Configuration:**

```apache
# Redirect HTTP to HTTPS
<VirtualHost *:80>
    ServerName dashboard.aps.dz
    ServerAlias www.dashboard.aps.dz
    
    Redirect permanent / https://dashboard.aps.dz/
</VirtualHost>

# HTTPS Virtual Host
<VirtualHost *:443>
    ServerName dashboard.aps.dz
    ServerAlias www.dashboard.aps.dz
    
    DocumentRoot /var/www/aps-dashboard/dist
    
    # SSL Configuration
    SSLEngine on
    SSLCertificateFile /etc/letsencrypt/live/dashboard.aps.dz/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/dashboard.aps.dz/privkey.pem
    SSLProtocol all -SSLv2 -SSLv3 -TLSv1 -TLSv1.1
    SSLCipherSuite HIGH:!aNULL:!MD5
    
    # Logging
    ErrorLog ${APACHE_LOG_DIR}/aps-dashboard-error.log
    CustomLog ${APACHE_LOG_DIR}/aps-dashboard-access.log combined
    
    # Security Headers
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Referrer-Policy "no-referrer"
    Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
    
    # Directory Configuration
    <Directory /var/www/aps-dashboard/dist>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
        
        # SPA routing
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>
    
    # Cache static assets
    <FilesMatch "\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$">
        Header set Cache-Control "max-age=31536000, public, immutable"
    </FilesMatch>
    
    # Gzip compression
    <IfModule mod_deflate.c>
        AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
    </IfModule>
</VirtualHost>
```

#### 2. Deploy Application

```bash
# Create deployment directory
sudo mkdir -p /var/www/aps-dashboard

# Copy build files
sudo cp -r dist /var/www/aps-dashboard/

# Set permissions
sudo chown -R www-data:www-data /var/www/aps-dashboard
sudo chmod -R 755 /var/www/aps-dashboard
```

#### 3. Enable Site

```bash
# Enable site
sudo a2ensite aps-dashboard.conf

# Test configuration
sudo apache2ctl configtest

# Reload Apache
sudo systemctl reload apache2
```

---

### Docker Deployment

#### 1. Create Dockerfile

```dockerfile
# Build stage
FROM node:18-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built application
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
```

#### 2. Create nginx.conf for Docker

```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
}
```

#### 3. Build and Run Docker Container

```bash
# Build image
docker build -t aps-dashboard:latest .

# Run container
docker run -d \
  --name aps-dashboard \
  -p 80:80 \
  --restart unless-stopped \
  aps-dashboard:latest

# Check logs
docker logs aps-dashboard

# Check status
docker ps
```

#### 4. Docker Compose (Optional)

**docker-compose.yml:**

```yaml
version: '3.8'

services:
  frontend:
    build: .
    container_name: aps-dashboard
    ports:
      - "80:80"
    restart: unless-stopped
    networks:
      - aps-network

networks:
  aps-network:
    driver: bridge
```

```bash
# Deploy with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

---

### Cloud Platforms

#### Vercel Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod

# Configure environment variables in Vercel dashboard
```

#### Netlify Deployment

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod --dir=dist

# Configure environment variables in Netlify dashboard
```

#### AWS S3 + CloudFront

```bash
# Build application
npm run build

# Upload to S3
aws s3 sync dist/ s3://your-bucket-name --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

---

## SSL/TLS Configuration

### Let's Encrypt with Certbot

#### For Nginx

```bash
# Obtain certificate
sudo certbot --nginx -d dashboard.aps.dz -d www.dashboard.aps.dz

# Follow prompts to configure HTTPS

# Test automatic renewal
sudo certbot renew --dry-run

# Renewal happens automatically via cron/systemd timer
```

#### For Apache

```bash
# Obtain certificate
sudo certbot --apache -d dashboard.aps.dz -d www.dashboard.aps.dz

# Test automatic renewal
sudo certbot renew --dry-run
```

### Custom SSL Certificate

```nginx
# Nginx
ssl_certificate /path/to/your/certificate.crt;
ssl_certificate_key /path/to/your/private.key;
ssl_trusted_certificate /path/to/ca-bundle.crt;
```

```apache
# Apache
SSLCertificateFile /path/to/your/certificate.crt
SSLCertificateKeyFile /path/to/your/private.key
SSLCertificateChainFile /path/to/ca-bundle.crt
```

---

## Performance Optimization

### 1. Enable Compression

**Nginx:**

```nginx
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript 
           application/x-javascript application/xml+rss 
           application/json application/javascript;
```

**Apache:**

```apache
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>
```

### 2. Browser Caching

```nginx
# Nginx - Cache static assets for 1 year
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 3. CDN Integration

```bash
# Upload static assets to CDN
# Update VITE_IMAGE_URL to CDN URL
```

### 4. HTTP/2 Support

```nginx
# Nginx - Enable HTTP/2
listen 443 ssl http2;
```

---

## Monitoring & Logging

### Application Logs

```bash
# Nginx access logs
tail -f /var/log/nginx/aps-dashboard-access.log

# Nginx error logs
tail -f /var/log/nginx/aps-dashboard-error.log

# Apache access logs
tail -f /var/log/apache2/aps-dashboard-access.log

# Apache error logs
tail -f /var/log/apache2/aps-dashboard-error.log
```

### Monitoring Tools

**1. Basic Monitoring:**

```bash
# Server resources
htop

# Disk usage
df -h

# Network connections
netstat -tulpn
```

**2. Log Analysis:**

```bash
# Analyze Nginx logs
sudo goaccess /var/log/nginx/aps-dashboard-access.log -o /var/www/html/report.html --log-format=COMBINED

# View most accessed pages
awk '{print $7}' /var/log/nginx/aps-dashboard-access.log | sort | uniq -c | sort -rn | head -10
```

---

## Backup & Recovery

### Backup Strategy

```bash
#!/bin/bash
# backup.sh - Backup script

BACKUP_DIR="/backups/aps-dashboard"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup application files
tar -czf $BACKUP_DIR/app_$DATE.tar.gz /var/www/aps-dashboard

# Backup nginx config
cp /etc/nginx/sites-available/aps-dashboard $BACKUP_DIR/nginx_config_$DATE

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
```

### Schedule Backups

```bash
# Add to crontab
crontab -e

# Daily backup at 2 AM
0 2 * * * /path/to/backup.sh
```

### Recovery Procedure

```bash
# Stop web server
sudo systemctl stop nginx

# Extract backup
tar -xzf /backups/aps-dashboard/app_20241026_020000.tar.gz -C /

# Restore configuration
sudo cp /backups/aps-dashboard/nginx_config_20241026_020000 /etc/nginx/sites-available/aps-dashboard

# Start web server
sudo systemctl start nginx
```

---

## Rollback Procedures

### Quick Rollback

```bash
# 1. Keep previous version
mv /var/www/aps-dashboard /var/www/aps-dashboard.backup
mv /var/www/aps-dashboard.old /var/www/aps-dashboard

# 2. Reload web server
sudo systemctl reload nginx

# 3. Verify application works
```

### Git-based Rollback

```bash
# Identify commit to rollback to
git log --oneline

# Checkout previous version
git checkout <commit-hash>

# Rebuild
npm ci
npm run build

# Deploy
sudo cp -r dist/* /var/www/aps-dashboard/
sudo systemctl reload nginx
```

---

## Troubleshooting

### Common Issues

#### 1. 404 Errors on Page Refresh

**Cause**: Web server not configured for SPA routing

**Solution**: Ensure try_files directive (Nginx) or RewriteRule (Apache) is configured

#### 2. Assets Not Loading

**Cause**: Incorrect base URL or permissions

**Solution**:
```bash
# Check permissions
ls -la /var/www/aps-dashboard/

# Should be readable by web server
sudo chown -R www-data:www-data /var/www/aps-dashboard
```

#### 3. API Connection Issues

**Cause**: CORS or incorrect API URL

**Solution**: Verify VITE_BASE_URL and backend CORS configuration

#### 4. SSL Certificate Errors

**Cause**: Expired or misconfigured certificate

**Solution**:
```bash
# Check certificate expiration
sudo certbot certificates

# Renew certificate
sudo certbot renew

# Reload web server
sudo systemctl reload nginx
```

---

**Document Version**: 1.0  
**Last Updated**: October 2024  
**Maintained By**: APS DevOps Team
