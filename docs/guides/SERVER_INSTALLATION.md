# Server Installation Guide

Complete guide for deploying the Office Management System on a production server with multiple deployment options.

---

## Table of Contents

- [Overview](#overview)
- [Installation Methods](#installation-methods)
- [Docker Installation (Recommended)](#docker-installation-recommended)
- [Native Installation](#native-installation)
- [Cloud Platform Deployment](#cloud-platform-deployment)
- [SSL/HTTPS Configuration](#sslhttps-configuration)
- [Production Optimization](#production-optimization)
- [Monitoring and Maintenance](#monitoring-and-maintenance)

---

## Overview

This guide covers production deployment of the Office Management System for multi-user environments. Choose the installation method that best fits your infrastructure.

### Deployment Options

| Method | Difficulty | Best For | Pros | Cons |
|--------|-----------|----------|------|------|
| **Docker** | Easy | Most scenarios | Isolated, portable, easy updates | Requires Docker knowledge |
| **Native** | Medium | Full control | Direct access, customizable | Manual dependency management |
| **Cloud PaaS** | Easy | Scalability | Managed infrastructure | Vendor lock-in, ongoing costs |

---

## Prerequisites

### Server Requirements

**Minimum Specifications:**
- **CPU**: 2 cores
- **RAM**: 4 GB
- **Storage**: 20 GB SSD
- **OS**: Ubuntu 20.04+, Debian 11+, CentOS 8+, or similar
- **Network**: Static IP or domain name

**Recommended Specifications:**
- **CPU**: 4 cores
- **RAM**: 8 GB
- **Storage**: 50 GB SSD
- **OS**: Ubuntu 22.04 LTS

### Software Requirements

Will be installed by the script or documented below:
- Node.js 18.x or higher
- PostgreSQL 13 or higher
- Nginx (for reverse proxy)
- Docker & Docker Compose (for Docker method)

---

## Installation Methods

### Quick Start with Installation Script

```bash
# Clone repository
git clone https://github.com/Pawel-Sokolowski/Numera.git
cd Numera

# Run server installation script
sudo ./scripts/install-server.sh
```

The script will guide you through:
1. Choosing installation method (Docker or Native)
2. Checking prerequisites
3. Setting up the application
4. Configuring services

**Continue reading for detailed manual instructions.**

---

## Docker Installation (Recommended)

Docker provides the easiest and most reliable deployment method.

### Step 1: Install Docker

```bash
# Install Docker
curl -fsSL https://get.docker.com | sh

# Add your user to docker group (optional, for non-root usage)
sudo usermod -aG docker $USER

# Install Docker Compose (if not included)
sudo apt install docker-compose-plugin

# Verify installation
docker --version
docker compose version
```

### Step 2: Clone and Configure

```bash
# Clone repository
git clone https://github.com/Pawel-Sokolowski/Numera.git
cd Numera

# Create environment file
cp .env.example .env
nano .env
```

**Configure .env file:**

```env
# Database Configuration
DB_NAME=office_management
DB_USER=postgres
DB_PASSWORD=your-secure-database-password

# Application Configuration
PORT=3000
NODE_ENV=production

# Security (CRITICAL!)
JWT_SECRET=generate-a-secure-random-string-at-least-32-characters
```

**Generate secure secrets:**

```bash
# Generate JWT secret
openssl rand -hex 32

# Generate database password
openssl rand -base64 24
```

### Step 3: Start Services

```bash
# Build and start containers
docker-compose up -d

# View logs
docker-compose logs -f

# Check status
docker-compose ps
```

### Step 4: Initialize Database

```bash
# Wait for PostgreSQL to be ready (about 10 seconds)
sleep 10

# Run database setup (if schema is in initdb folder, it runs automatically)
# Otherwise, access the app container:
docker-compose exec app npm run setup-db
```

### Step 5: Verify Installation

```bash
# Check container health
docker-compose ps

# Test application
curl http://localhost:3000

# Access in browser
# http://your-server-ip:3000
```

### Docker Management Commands

```bash
# View logs
docker-compose logs -f app          # Application logs
docker-compose logs -f postgres     # Database logs

# Restart services
docker-compose restart              # All services
docker-compose restart app          # Just the app

# Stop services
docker-compose stop

# Start stopped services
docker-compose start

# Update application
git pull
docker-compose up -d --build

# Backup database
docker-compose exec postgres pg_dump -U postgres office_management > backup.sql

# Restore database
docker-compose exec -T postgres psql -U postgres office_management < backup.sql

# Remove everything (WARNING: deletes data)
docker-compose down -v
```

---

## Native Installation

Direct installation on the server without Docker.

### Step 1: Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install PM2 (process manager)
sudo npm install -g pm2

# Verify installations
node --version
npm --version
psql --version
pm2 --version
```

### Step 2: Configure PostgreSQL

```bash
# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql << EOF
CREATE DATABASE office_management;
CREATE USER office_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE office_management TO office_user;
\q
EOF
```

### Step 3: Clone and Setup Application

```bash
# Create application directory
sudo mkdir -p /var/www/office-management
sudo chown $USER:$USER /var/www/office-management

# Clone repository
cd /var/www/office-management
git clone https://github.com/Pawel-Sokolowski/Numera.git .

# Install dependencies
npm ci --production

# Create environment file
cp .env.example .env
nano .env
```

**Configure .env:**

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=office_management
DB_USER=office_user
DB_PASSWORD=your_secure_password

PORT=3000
NODE_ENV=production

JWT_SECRET=$(openssl rand -hex 32)
```

### Step 4: Build Application

```bash
# Build the frontend
npm run build

# Generate PWA icons
node scripts/generate-pwa-icons.js

# Setup database
npm run setup-db
```

### Step 5: Configure PM2

```bash
# Create PM2 configuration
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'office-management',
    script: './server/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production'
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s',
    max_memory_restart: '500M'
  }]
}
EOF

# Start application
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup systemd
# Run the command it outputs
```

### Step 6: Verify Installation

```bash
# Check PM2 status
pm2 status

# View logs
pm2 logs office-management

# Test application
curl http://localhost:3000
```

---

## SSL/HTTPS Configuration

### Install Nginx

```bash
sudo apt install -y nginx
```

### Configure Nginx as Reverse Proxy

```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/office-management
```

**Basic HTTP Configuration:**

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
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

    # Static assets caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        proxy_pass http://localhost:3000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### Enable SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com

# Certbot automatically updates the Nginx config
# Test renewal
sudo certbot renew --dry-run
```

**Enable and start Nginx:**

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/office-management /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

---

## Cloud Platform Deployment

### Heroku

```bash
# Install Heroku CLI
curl https://cli-assets.heroku.com/install.sh | sh

# Login
heroku login

# Create app
heroku create your-app-name

# Add PostgreSQL
heroku addons:create heroku-postgresql:mini

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=$(openssl rand -hex 32)

# Deploy
git push heroku main

# Run database setup
heroku run npm run setup-db
```

### DigitalOcean App Platform

1. Connect GitHub repository
2. Configure build settings:
   - Build Command: `npm ci && npm run build`
   - Run Command: `npm run start`
3. Add PostgreSQL database
4. Set environment variables
5. Deploy

### AWS Elastic Beanstalk

```bash
# Install EB CLI
pip install awsebcli

# Initialize
eb init

# Create environment
eb create production-env

# Set environment variables
eb setenv NODE_ENV=production JWT_SECRET=your-secret

# Deploy
eb deploy
```

---

## Production Optimization

### 1. Database Optimization

```sql
-- Add indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_clients_nip ON clients(nip);
CREATE INDEX idx_invoices_issue_date ON invoices(issue_date);

-- Configure PostgreSQL
-- Edit /etc/postgresql/15/main/postgresql.conf
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
work_mem = 16MB
```

### 2. Application Optimization

**Enable compression in Nginx:**

```nginx
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/javascript application/json;
```

**Configure rate limiting:**

```nginx
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
limit_req zone=api burst=20 nodelay;
```

### 3. Security Hardening

```bash
# Configure firewall
sudo ufw enable
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS

# Disable direct access to app port
sudo ufw deny 3000/tcp
```

---

## Monitoring and Maintenance

### Monitoring with PM2

```bash
# Real-time monitoring
pm2 monit

# View logs
pm2 logs office-management

# View metrics
pm2 describe office-management
```

### Automated Backups

Create backup script `/usr/local/bin/backup-office-db.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/backups/office-management"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup database
pg_dump -U office_user office_management | gzip > $BACKUP_DIR/db_backup_$DATE.sql.gz

# Keep only last 30 days
find $BACKUP_DIR -name "db_backup_*.sql.gz" -mtime +30 -delete

# Backup application files
tar -czf $BACKUP_DIR/app_backup_$DATE.tar.gz -C /var/www/office-management .

echo "Backup completed: $DATE"
```

**Schedule with cron:**

```bash
# Add to crontab
crontab -e

# Add this line (daily at 2 AM)
0 2 * * * /usr/local/bin/backup-office-db.sh >> /var/log/backup.log 2>&1
```

### Update Procedure

**Docker:**
```bash
cd /path/to/Numera
git pull
docker-compose up -d --build
```

**Native:**
```bash
cd /var/www/office-management
git pull
npm ci --production
npm run build
pm2 restart office-management
```

---

## Troubleshooting

See [Local Installation Guide](LOCAL_INSTALLATION.md#troubleshooting) for common issues.

**Production-specific issues:**

### High memory usage
```bash
# Monitor with PM2
pm2 monit

# Adjust max memory in ecosystem.config.js
max_memory_restart: '500M'
```

### Slow database queries
```sql
-- Check slow queries
SELECT * FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10;

-- Analyze query performance
EXPLAIN ANALYZE SELECT ...;
```

---

## Support

For production deployment assistance:
1. Review this guide carefully
2. Check application and system logs
3. Review [Deployment Guide](../deployment/DEPLOYMENT_GUIDE.md)
4. Create GitHub issue with detailed information

---

**Happy deploying! 🚀**
