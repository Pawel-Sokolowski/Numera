# 🚀 Secure Deployment Guide

## Pre-Deployment Checklist

### ✅ Security Requirements
- [ ] Environment variables configured
- [ ] JWT secret set (minimum 32 characters)
- [ ] Database password is secure
- [ ] SSL certificate ready
- [ ] Security headers configured
- [ ] Rate limiting enabled

### ✅ PDF Forms Setup
- [ ] Official PDF templates in `/public/pdf-templates/`
- [ ] Form mappings configured
- [ ] Field coordinates validated
- [ ] Test forms generated successfully

## Environment Configuration

### 1. Create Environment File
```bash
# Copy the example file
cp env.example .env

# Edit with your values
nano .env
```

### 2. Required Environment Variables
```bash
# Database Configuration
DB_HOST=your-production-db-host
DB_PORT=5432
DB_NAME=office_management
DB_USER=your-db-user
DB_PASSWORD=your-secure-password

# JWT Configuration (CRITICAL)
JWT_SECRET=your-super-secure-jwt-secret-key-at-least-32-characters-long

# Server Configuration
PORT=3001
NODE_ENV=production

# Frontend URL (for CORS)
FRONTEND_URL=https://yourdomain.com

# SSL Configuration (optional)
SSL_CERT_PATH=/path/to/cert.pem
SSL_KEY_PATH=/path/to/private.key
```

### 3. Generate Secure Secrets
```bash
# Generate JWT secret (32+ characters)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate session secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Database Setup

### 1. PostgreSQL Configuration
```sql
-- Create database
CREATE DATABASE office_management;

-- Create user with limited permissions
CREATE USER office_user WITH PASSWORD 'your-secure-password';

-- Grant permissions
GRANT CONNECT ON DATABASE office_management TO office_user;
GRANT USAGE ON SCHEMA public TO office_user;
GRANT CREATE ON SCHEMA public TO office_user;
```

### 2. Initialize Database Schema
```bash
# Run database setup
npm run setup-db

# Or manually run the schema
psql -U office_user -d office_management -f src/database/complete_system_schema.sql
```

## PDF Templates Setup

### 1. Organize PDF Files
```
public/pdf-templates/
├── UPL-1/
│   └── 2023/
│       └── UPL-1_2023.pdf
├── PEL/
│   └── 2023/
│       └── PEL_2023.pdf
└── [other forms]/
```

### 2. Verify Template Paths
```bash
# Check if templates are accessible
curl -I http://localhost:3000/pdf-templates/UPL-1/2023/UPL-1_2023.pdf
```

## Build and Deploy

### 1. Install Dependencies
```bash
# Install production dependencies
npm ci --production

# Install all dependencies (including dev)
npm ci
```

### 2. Build Application
```bash
# Build React app
npm run build

# Verify build output
ls -la build/
```

### 3. Start Production Server
```bash
# Start with PM2 (recommended)
npm install -g pm2
pm2 start server/index.js --name "office-management"

# Or start directly
npm run start
```

## Security Configuration

### 1. Nginx Configuration (Recommended)
```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    # SSL Configuration
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;

    # Security Headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload";

    # Rate Limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=auth:10m rate=1r/s;

    # API Routes
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Auth Routes (stricter rate limiting)
    location /api/auth/ {
        limit_req zone=auth burst=5 nodelay;
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static Files
    location / {
        root /path/to/build;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

### 2. Firewall Configuration
```bash
# UFW (Ubuntu)
sudo ufw enable
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw deny 3001/tcp   # Block direct access to Node.js

# Or iptables
iptables -A INPUT -p tcp --dport 22 -j ACCEPT
iptables -A INPUT -p tcp --dport 80 -j ACCEPT
iptables -A INPUT -p tcp --dport 443 -j ACCEPT
iptables -A INPUT -p tcp --dport 3001 -j DROP
```

## Monitoring and Maintenance

### 1. Log Monitoring
```bash
# View application logs
pm2 logs office-management

# View Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# View system logs
journalctl -u nginx -f
```

### 2. Health Checks
```bash
# Check application health
curl https://yourdomain.com/api/health

# Check database connection
curl https://yourdomain.com/api/db-status
```

### 3. Security Monitoring
```bash
# Monitor failed login attempts
grep "Invalid credentials" /var/log/nginx/access.log

# Monitor rate limiting
grep "Too many requests" /var/log/nginx/access.log

# Check for suspicious activity
grep "POST /api/auth" /var/log/nginx/access.log | tail -100
```

## Backup Strategy

### 1. Database Backup
```bash
#!/bin/bash
# daily-backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/database"
DB_NAME="office_management"

# Create backup
pg_dump -U office_user -h localhost $DB_NAME > $BACKUP_DIR/backup_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/backup_$DATE.sql

# Keep only last 30 days
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete
```

### 2. Application Backup
```bash
#!/bin/bash
# app-backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/app"
APP_DIR="/path/to/application"

# Create backup
tar -czf $BACKUP_DIR/app_backup_$DATE.tar.gz -C $APP_DIR .

# Keep only last 7 days
find $BACKUP_DIR -name "app_backup_*.tar.gz" -mtime +7 -delete
```

## Troubleshooting

### Common Issues

#### 1. JWT Secret Error
```
Error: JWT_SECRET not properly configured
```
**Solution:** Set a secure JWT secret in environment variables.

#### 2. Database Connection Failed
```
Error: Connection terminated unexpectedly
```
**Solution:** Check database credentials and network connectivity.

#### 3. PDF Template Not Found
```
Error: Failed to load PDF template
```
**Solution:** Ensure PDF files are in correct `/public/pdf-templates/` directory.

#### 4. Rate Limiting Too Strict
```
Error: Too many requests from this IP
```
**Solution:** Adjust rate limiting in `server/middleware/security.js`.

### Performance Optimization

#### 1. Database Optimization
```sql
-- Add indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_clients_nip ON clients(nip);
CREATE INDEX idx_invoices_issue_date ON invoices(issue_date);
```

#### 2. Caching
```javascript
// Enable Redis caching (optional)
const redis = require('redis');
const client = redis.createClient();

// Cache frequently accessed data
app.get('/api/clients', cache(300), (req, res) => {
  // 5-minute cache
});
```

## Security Audit

### Monthly Security Checklist
- [ ] Review access logs for suspicious activity
- [ ] Update dependencies: `npm audit`
- [ ] Check SSL certificate expiration
- [ ] Review user permissions
- [ ] Test backup restoration
- [ ] Update security patches
- [ ] Review rate limiting effectiveness

### Quarterly Security Review
- [ ] Penetration testing
- [ ] Security configuration review
- [ ] Database security audit
- [ ] Code security review
- [ ] Incident response plan update

## Support and Maintenance

### Regular Tasks
1. **Daily:** Monitor logs and health checks
2. **Weekly:** Review security logs and performance metrics
3. **Monthly:** Update dependencies and security patches
4. **Quarterly:** Full security audit and penetration testing

### Emergency Procedures
1. **Security Incident:** Immediately isolate affected systems
2. **Data Breach:** Follow incident response plan
3. **System Downtime:** Switch to backup systems
4. **Performance Issues:** Scale resources or optimize code

This deployment guide ensures your application is secure, performant, and maintainable in production.
