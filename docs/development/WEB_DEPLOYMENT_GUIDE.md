# Web Version Deployment Guide

This guide explains how to deploy the Office Management System as a pure web application (without Electron desktop wrapper).

---

## Overview

The Office Management System supports **two deployment modes**:

1. **Desktop Application Mode** (Electron) - For single-user installations on workstations
2. **Web Application Mode** (Browser-based) - For multi-user server deployments

This guide covers **Web Application Mode** deployment.

---

## Prerequisites

### Required Software
- **Node.js** 18.x or higher
- **PostgreSQL** 13 or higher
- **Web Server** (Apache, Nginx, or similar) for production deployment
- **Process Manager** (PM2 recommended) for keeping the server running

### System Requirements
- **Linux Server** (Ubuntu 20.04+ recommended) or Windows Server
- **2 GB RAM** minimum (4 GB recommended)
- **10 GB Disk Space**
- **Network Access** for clients to access the server

---

## Installation Steps

### Step 1: Clone the Repository

```bash
git clone https://github.com/Pawel-Sokolowski/ManagmentApp.git
cd ManagmentApp
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Set Up PostgreSQL Database

#### Install PostgreSQL (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### Create Database and User
```bash
sudo -u postgres psql

-- In PostgreSQL shell:
CREATE DATABASE office_management;
CREATE USER office_admin WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE office_management TO office_admin;
\q
```

### Step 4: Configure Environment Variables

Create a `.env` file in the project root:

```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=office_management
DB_USER=office_admin
DB_PASSWORD=your_secure_password

# Server Configuration
PORT=3001
NODE_ENV=production

# JWT Secret (generate a random string)
JWT_SECRET=your_random_jwt_secret_here
```

**Security Note:** Replace `your_secure_password` and `your_random_jwt_secret_here` with secure random strings.

### Step 5: Initialize the Database

```bash
npm run setup-db
```

Or manually initialize:

```bash
psql -U office_admin -d office_management -f src/database/complete_system_schema.sql
```

### Step 6: Build the Frontend

```bash
npm run build
```

This creates an optimized production build in the `build/` directory.

### Step 7: Start the Server

#### For Development/Testing:
```bash
npm run server
```

#### For Production (with PM2):
```bash
# Install PM2 globally
npm install -g pm2

# Start the server
pm2 start server/index.js --name "office-management"

# Save PM2 configuration
pm2 save

# Set up PM2 to start on system boot
pm2 startup
```

---

## Web Server Configuration

### Option A: Nginx (Recommended)

Create `/etc/nginx/sites-available/office-management`:

```nginx
server {
    listen 80;
    server_name your-domain.com;  # Replace with your domain

    # Frontend - Serve static files
    location / {
        root /path/to/ManagmentApp/build;
        try_files $uri $uri/ /index.html;
        
        # Enable gzip compression
        gzip on;
        gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
    }

    # Backend API - Proxy to Node.js
    location /api/ {
        proxy_pass http://localhost:3001;
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

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/office-management /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Option B: Apache

Create `/etc/apache2/sites-available/office-management.conf`:

```apache
<VirtualHost *:80>
    ServerName your-domain.com
    DocumentRoot /path/to/ManagmentApp/build

    <Directory /path/to/ManagmentApp/build>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
        
        # Enable React Router
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>

    # Proxy API requests to Node.js
    ProxyPreserveHost On
    ProxyPass /api/ http://localhost:3001/api/
    ProxyPassReverse /api/ http://localhost:3001/api/
</VirtualHost>
```

Enable required modules and site:
```bash
sudo a2enmod rewrite proxy proxy_http
sudo a2ensite office-management
sudo systemctl reload apache2
```

---

## SSL/HTTPS Configuration (Recommended for Production)

### Using Let's Encrypt (Free SSL)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx  # For Nginx
# or
sudo apt install certbot python3-certbot-apache  # For Apache

# Obtain and install certificate
sudo certbot --nginx -d your-domain.com  # For Nginx
# or
sudo certbot --apache -d your-domain.com  # For Apache

# Auto-renewal is configured automatically
```

---

## Firewall Configuration

Allow HTTP/HTTPS traffic:

```bash
# UFW (Ubuntu)
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3001/tcp  # Only if direct access needed

# Firewalld (CentOS/RHEL)
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

---

## Database Backup

Set up automated backups:

```bash
# Create backup script
cat > /home/youruser/backup-db.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/home/youruser/db-backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR
pg_dump -U office_admin office_management > "$BACKUP_DIR/backup_$DATE.sql"
# Keep only last 30 days of backups
find $BACKUP_DIR -name "backup_*.sql" -mtime +30 -delete
EOF

chmod +x /home/youruser/backup-db.sh

# Add to crontab (daily at 2 AM)
(crontab -l 2>/dev/null; echo "0 2 * * * /home/youruser/backup-db.sh") | crontab -
```

---

## Monitoring and Maintenance

### View Server Logs
```bash
# PM2 logs
pm2 logs office-management

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Restart Services
```bash
# Restart Node.js server
pm2 restart office-management

# Restart web server
sudo systemctl restart nginx  # or apache2
```

### Update Application
```bash
cd /path/to/ManagmentApp
git pull
npm install
npm run build
pm2 restart office-management
```

---

## Accessing the Application

Once deployed, access the application at:
- **HTTP:** `http://your-domain.com`
- **HTTPS:** `https://your-domain.com` (after SSL setup)

### Default Login Credentials
After database initialization, use demo users:
- **Admin:** admin@example.com / admin123
- **Manager:** manager@example.com / manager123
- **Employee:** employee@example.com / employee123

**Important:** Change these passwords immediately after first login!

---

## Troubleshooting

### Database Connection Issues
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Check database connectivity
psql -U office_admin -d office_management -c "SELECT 1"

# View PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-*.log
```

### Server Not Starting
```bash
# Check if port 3001 is already in use
sudo lsof -i :3001

# Check PM2 status
pm2 status

# View detailed logs
pm2 logs office-management --lines 100
```

### Frontend Not Loading
```bash
# Verify build files exist
ls -la build/

# Check web server configuration
sudo nginx -t  # or apache2ctl configtest

# Check web server logs
sudo tail -f /var/log/nginx/error.log
```

---

## Differences from Desktop Version

| Feature | Desktop Version | Web Version |
|---------|----------------|-------------|
| **Deployment** | Installed on each PC | Centralized server |
| **Access** | Desktop shortcut | Web browser |
| **Updates** | Manual reinstall | Update server once |
| **Database** | Local or remote | Centralized on server |
| **Multi-user** | Via network | Native multi-user |
| **Offline** | Works offline | Requires network |

---

## Security Best Practices

1. **Use HTTPS** - Always enable SSL in production
2. **Strong Passwords** - Use secure database and JWT secret
3. **Firewall** - Restrict access to necessary ports only
4. **Regular Updates** - Keep Node.js, PostgreSQL, and system packages updated
5. **Backup** - Automated daily backups of database
6. **User Permissions** - Use role-based access control
7. **Network Security** - Use VPN or restrict access by IP if needed

---

## Support

For issues or questions:
- **GitHub Issues:** https://github.com/Pawel-Sokolowski/ManagmentApp/issues
- **Documentation:** See DOCUMENTATION_INDEX.md

---

## License

See LICENSE file in the repository.
