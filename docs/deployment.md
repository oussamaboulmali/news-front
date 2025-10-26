# Deployment Guide

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Development Deployment](#development-deployment)
- [Production Deployment](#production-deployment)
- [Apache Configuration](#apache-configuration)
- [Nginx Configuration](#nginx-configuration)
- [Docker Deployment](#docker-deployment)
- [Environment Variables](#environment-variables)
- [SSL/TLS Configuration](#ssltls-configuration)
- [Reverse Proxy Setup](#reverse-proxy-setup)
- [Performance Optimization](#performance-optimization)
- [Monitoring & Maintenance](#monitoring--maintenance)
- [Troubleshooting](#troubleshooting)

## Overview

This guide covers deploying the News Dashboard frontend application in various environments. The application is a static React SPA that requires:
1. A web server (Apache, Nginx, or similar)
2. HTTPS configuration
3. Proper routing for SPA
4. Connection to backend API

## Prerequisites

### System Requirements

**Minimum**:
- 2 CPU cores
- 2GB RAM
- 10GB disk space
- Linux/Unix-based OS

**Recommended**:
- 4+ CPU cores
- 4GB+ RAM
- 20GB+ disk space
- Ubuntu 20.04 LTS or newer

### Software Requirements

- **Node.js**: 18.x or higher
- **npm**: 9.x or higher
- **Web Server**: Apache 2.4+ or Nginx 1.18+
- **SSL Certificate**: Let's Encrypt or commercial cert
- **Git**: For version control

### Network Requirements

- **Ports**: 80 (HTTP), 443 (HTTPS)
- **Backend API**: Accessible from frontend server
- **Firewall**: Configured to allow HTTP/HTTPS traffic

## Development Deployment

### Local Development

1. **Clone Repository**
```bash
git clone <repository-url>
cd newonline-dashbord
```

2. **Install Dependencies**
```bash
npm install
```

3. **Create Environment File**
```bash
cp .env.example .env
```

Edit `.env`:
```env
VITE_APP_STATUS=dev
VITE_BASE_URL=http://localhost:3000/api/v1/
VITE_IMAGE_URL=http://localhost:3000/uploads/
VITE_APP_ID=your-dev-api-key
VITE_KEY=your-dev-encryption-key
VITE_PREF=_app
```

4. **Start Development Server**
```bash
npm run dev
```

Access at: `http://localhost:5173`

### Development Server Configuration

Edit `vite.config.js`:
```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    host: 'localhost',
    port: 5173,
    strictPort: true,
    open: false,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
});
```

## Production Deployment

### Step 1: Build Application

```bash
# Set production environment
export NODE_ENV=production

# Build the application
npm run build
```

This creates an optimized build in `dist/` directory:
```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── [images]
└── favicon.ico
```

### Step 2: Test Build Locally

```bash
npm run preview
```

Access at: `http://localhost:4173`

### Step 3: Prepare Production Environment

Create `.env.production`:
```env
VITE_APP_STATUS=prod
VITE_BASE_URL=/api/v1/
VITE_IMAGE_URL=/uploads/
VITE_APP_ID=your-prod-api-key
VITE_KEY=your-prod-encryption-key
VITE_PREF=_app
```

### Step 4: Deploy to Server

#### Option A: Manual Deployment

```bash
# On your local machine
npm run build

# Copy to server
scp -r dist/* user@your-server:/var/www/html/

# On server, set permissions
sudo chown -R www-data:www-data /var/www/html
sudo chmod -R 755 /var/www/html
```

#### Option B: Automated Deployment Script

Create `deploy.sh`:
```bash
#!/bin/bash

echo "Building application..."
npm run build

echo "Copying files to server..."
rsync -avz --delete dist/ user@your-server:/var/www/html/

echo "Setting permissions..."
ssh user@your-server 'sudo chown -R www-data:www-data /var/www/html && sudo chmod -R 755 /var/www/html'

echo "Restarting web server..."
ssh user@your-server 'sudo systemctl restart apache2'

echo "Deployment complete!"
```

Make executable and run:
```bash
chmod +x deploy.sh
./deploy.sh
```

## Apache Configuration

### Install Apache

```bash
sudo apt update
sudo apt install apache2
sudo systemctl enable apache2
sudo systemctl start apache2
```

### Virtual Host Configuration

Create `/etc/apache2/sites-available/news-dashboard.conf`:

```apache
<VirtualHost *:80>
    ServerName your-domain.com
    ServerAlias www.your-domain.com
    
    # Redirect HTTP to HTTPS
    RewriteEngine On
    RewriteCond %{HTTPS} off
    RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
</VirtualHost>

<VirtualHost *:443>
    ServerName your-domain.com
    ServerAlias www.your-domain.com
    
    DocumentRoot /var/www/html
    
    # SSL Configuration
    SSLEngine on
    SSLCertificateFile /etc/ssl/certs/your-cert.crt
    SSLCertificateKeyFile /etc/ssl/private/your-key.key
    SSLCertificateChainFile /etc/ssl/certs/chain.crt
    
    # Security Headers
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Referrer-Policy "no-referrer"
    Header always set Permissions-Policy "geolocation=(), microphone=(), camera=()"
    Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
    
    # SPA Routing (Rewrite all requests to index.html)
    <Directory /var/www/html>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
        
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>
    
    # Compression
    <IfModule mod_deflate.c>
        AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
    </IfModule>
    
    # Browser Caching
    <IfModule mod_expires.c>
        ExpiresActive On
        ExpiresByType image/jpg "access plus 1 year"
        ExpiresByType image/jpeg "access plus 1 year"
        ExpiresByType image/gif "access plus 1 year"
        ExpiresByType image/png "access plus 1 year"
        ExpiresByType image/svg+xml "access plus 1 year"
        ExpiresByType text/css "access plus 1 month"
        ExpiresByType application/javascript "access plus 1 month"
        ExpiresByType text/html "access plus 0 seconds"
    </IfModule>
    
    # API Proxy (if backend on same server)
    ProxyPreserveHost On
    ProxyPass /api http://localhost:3000/api
    ProxyPassReverse /api http://localhost:3000/api
    
    # Error Logging
    ErrorLog ${APACHE_LOG_DIR}/news-dashboard-error.log
    CustomLog ${APACHE_LOG_DIR}/news-dashboard-access.log combined
</VirtualHost>
```

### Enable Required Modules

```bash
sudo a2enmod rewrite
sudo a2enmod headers
sudo a2enmod ssl
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo a2enmod deflate
sudo a2enmod expires
```

### Enable Site and Restart

```bash
sudo a2ensite news-dashboard.conf
sudo systemctl restart apache2
```

### .htaccess Alternative

If you can't modify virtual host, use `.htaccess` in `/var/www/html/`:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>

<IfModule mod_headers.c>
  Header set X-Content-Type-Options "nosniff"
  Header set X-Frame-Options "SAMEORIGIN"
  Header set X-XSS-Protection "1; mode=block"
  Header set Referrer-Policy "no-referrer"
  Header set Permissions-Policy "geolocation=(), microphone=(), camera=()"
  Header set Strict-Transport-Security "max-age=31536000; includeSubDomains"
</IfModule>
```

## Nginx Configuration

### Install Nginx

```bash
sudo apt update
sudo apt install nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

### Site Configuration

Create `/etc/nginx/sites-available/news-dashboard`:

```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name your-domain.com www.your-domain.com;
    
    return 301 https://$server_name$request_uri;
}

# HTTPS Configuration
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name your-domain.com www.your-domain.com;
    
    # SSL Configuration
    ssl_certificate /etc/ssl/certs/your-cert.crt;
    ssl_certificate_key /etc/ssl/private/your-key.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Root Directory
    root /var/www/html;
    index index.html;
    
    # Security Headers
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer" always;
    add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    
    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss;
    
    # SPA Routing
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Static Assets Caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }
    
    # API Proxy (if backend on same server)
    location /api {
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
    
    # Logging
    access_log /var/log/nginx/news-dashboard-access.log;
    error_log /var/log/nginx/news-dashboard-error.log;
}
```

### Enable Site

```bash
sudo ln -s /etc/nginx/sites-available/news-dashboard /etc/nginx/sites-enabled/
sudo nginx -t  # Test configuration
sudo systemctl reload nginx
```

## Docker Deployment

### Dockerfile

Create `Dockerfile`:

```dockerfile
# Build Stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production Stage
FROM nginx:alpine

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
```

### nginx.conf for Docker

Create `nginx.conf`:

```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  frontend:
    build: .
    container_name: news-dashboard
    ports:
      - "80:80"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
    networks:
      - news-network
    volumes:
      - ./logs:/var/log/nginx
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost/"]
      interval: 30s
      timeout: 10s
      retries: 3

networks:
  news-network:
    driver: bridge
```

### Build and Run

```bash
# Build image
docker build -t news-dashboard:latest .

# Run container
docker run -d -p 80:80 --name news-dashboard news-dashboard:latest

# Or use docker-compose
docker-compose up -d

# View logs
docker logs -f news-dashboard

# Stop container
docker stop news-dashboard

# Remove container
docker rm news-dashboard
```

## Environment Variables

### Production Environment

Create `.env.production`:

```env
# Application Status
VITE_APP_STATUS=prod

# API Configuration
VITE_BASE_URL=/api/v1/
VITE_IMAGE_URL=/uploads/

# Security (IMPORTANT: Use strong, unique values)
VITE_APP_ID=your-strong-api-key-here
VITE_KEY=your-strong-encryption-key-here
VITE_PREF=_app

# Data Configuration
VITE_EMPTY_DATA=No data available
```

### Generating Secure Keys

```bash
# Generate random API key
openssl rand -base64 32

# Generate encryption key
openssl rand -hex 32
```

**IMPORTANT**: Never commit production keys to version control!

## SSL/TLS Configuration

### Using Let's Encrypt (Recommended)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-apache  # For Apache
sudo apt install certbot python3-certbot-nginx   # For Nginx

# Obtain certificate
sudo certbot --apache -d your-domain.com -d www.your-domain.com  # Apache
sudo certbot --nginx -d your-domain.com -d www.your-domain.com   # Nginx

# Auto-renewal (runs twice daily)
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer

# Test renewal
sudo certbot renew --dry-run
```

### Using Commercial Certificate

1. **Generate CSR**:
```bash
openssl req -new -newkey rsa:2048 -nodes \
  -keyout your-domain.key \
  -out your-domain.csr
```

2. **Submit CSR** to certificate authority

3. **Download certificates** and install:
```bash
sudo cp your-domain.crt /etc/ssl/certs/
sudo cp your-domain.key /etc/ssl/private/
sudo chmod 600 /etc/ssl/private/your-domain.key
```

4. **Update web server configuration** with certificate paths

## Reverse Proxy Setup

### Backend API on Same Server

**Apache**:
```apache
ProxyPreserveHost On
ProxyPass /api http://localhost:3000/api
ProxyPassReverse /api http://localhost:3000/api
```

**Nginx**:
```nginx
location /api {
    proxy_pass http://localhost:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

### Backend API on Different Server

**Apache**:
```apache
ProxyPass /api https://api.backend-server.com/api
ProxyPassReverse /api https://api.backend-server.com/api
```

**Nginx**:
```nginx
location /api {
    proxy_pass https://api.backend-server.com;
    proxy_ssl_verify off;
}
```

## Performance Optimization

### 1. Enable Compression

Already configured in Apache/Nginx examples above.

### 2. Browser Caching

Set appropriate cache headers (configured above).

### 3. CDN Configuration

Use CDN for static assets:
```javascript
// vite.config.js
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name]-[hash][extname]'
      }
    }
  }
});
```

### 4. Load Balancing (Multiple Servers)

**Nginx Load Balancer**:
```nginx
upstream frontend_servers {
    server 192.168.1.10:80;
    server 192.168.1.11:80;
    server 192.168.1.12:80;
}

server {
    listen 443 ssl;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://frontend_servers;
    }
}
```

## Monitoring & Maintenance

### Log Rotation

**Apache** (`/etc/logrotate.d/apache2`):
```
/var/log/apache2/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 640 root adm
    sharedscripts
    postrotate
        systemctl reload apache2 > /dev/null 2>&1
    endscript
}
```

**Nginx** (`/etc/logrotate.d/nginx`):
```
/var/log/nginx/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data adm
    sharedscripts
    postrotate
        [ -f /var/run/nginx.pid ] && kill -USR1 `cat /var/run/nginx.pid`
    endscript
}
```

### Health Monitoring Script

Create `monitor.sh`:
```bash
#!/bin/bash

URL="https://your-domain.com"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" $URL)

if [ $STATUS -ne 200 ]; then
    echo "Website is down! Status: $STATUS"
    # Send alert email
    echo "Website down at $(date)" | mail -s "Alert: Website Down" admin@example.com
    # Restart web server
    sudo systemctl restart apache2  # or nginx
fi
```

Add to crontab:
```bash
*/5 * * * * /path/to/monitor.sh
```

### Update Procedure

```bash
# 1. Backup current version
sudo cp -r /var/www/html /var/www/html.backup.$(date +%Y%m%d)

# 2. Build new version
npm run build

# 3. Deploy
sudo rsync -av dist/ /var/www/html/

# 4. Clear cache (if using)
sudo systemctl reload apache2  # or nginx

# 5. Test
curl -I https://your-domain.com

# 6. Rollback if needed
# sudo cp -r /var/www/html.backup.20240115 /var/www/html
```

## Troubleshooting

### Issue: 404 on Refresh

**Cause**: Server not configured for SPA routing

**Solution**: Ensure rewrite rules are enabled (see Apache/Nginx configs above)

---

### Issue: CORS Errors

**Cause**: Backend not allowing frontend domain

**Solution**: Configure CORS on backend or use reverse proxy

---

### Issue: SSL Certificate Errors

**Cause**: Certificate expired or incorrect

**Solution**:
```bash
# Check certificate
openssl s_client -connect your-domain.com:443 -servername your-domain.com

# Renew Let's Encrypt
sudo certbot renew
```

---

### Issue: Slow Page Load

**Causes**: No compression, caching, or optimization

**Solutions**:
1. Enable gzip/brotli compression
2. Configure browser caching
3. Use CDN for assets
4. Optimize images

---

### Issue: Permission Denied

**Solution**:
```bash
sudo chown -R www-data:www-data /var/www/html
sudo chmod -R 755 /var/www/html
```

---

**Last Updated**: 2024
**Author**: APS Development Team
