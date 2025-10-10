# System Verification Guide

This guide helps you verify that the Office Management System is correctly configured and working properly for both **Desktop** and **Web** deployment modes.

---

## Table of Contents

1. [PostgreSQL Detection Verification](#postgresql-detection-verification)
2. [Desktop Application Verification](#desktop-application-verification)
3. [Web Application Verification](#web-application-verification)
4. [Database Setup Wizard Verification](#database-setup-wizard-verification)
5. [Common Issues and Solutions](#common-issues-and-solutions)

---

## PostgreSQL Detection Verification

### Verify PostgreSQL is Installed and Running

#### Windows

**Method 1: Check Services**
```powershell
Get-Service -Name postgresql*
```
Should show status as "Running"

**Method 2: Check with psql**
```powershell
psql --version
```
Should display PostgreSQL version (e.g., "psql (PostgreSQL) 15.3")

**Method 3: Check Installation Paths**
```powershell
# Check common paths
Test-Path "C:\Program Files\PostgreSQL\"
Test-Path "C:\Program Files (x86)\PostgreSQL\"
```

**Method 4: Check Registry**
```powershell
Get-ItemProperty "HKLM:\SOFTWARE\PostgreSQL\Installations\*"
```

#### Linux

```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Check version
psql --version

# Check if listening on port 5432
sudo netstat -tulpn | grep 5432
```

### Test Database Connection

```bash
# Windows/Linux - Replace with your credentials
psql -h localhost -U postgres -d postgres -c "SELECT version();"
```

Expected output: PostgreSQL version information

---

## Desktop Application Verification

### After Installation (Windows)

1. **Verify Installation Completed**
   ```powershell
   # Check if installed
   Test-Path "$env:LOCALAPPDATA\Programs\Office Management System"
   ```

2. **Check .env File Created**
   ```powershell
   # View configuration
   Get-Content "$env:LOCALAPPDATA\Programs\Office Management System\.env"
   ```
   
   Should contain:
   ```
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=office_management
   DB_USER=postgres
   DB_PASSWORD=postgres
   PORT=3001
   NODE_ENV=development
   ```

3. **Launch Application**
   - Double-click desktop shortcut
   - Or run from Start Menu
   
4. **Expected Behavior on First Launch**
   
   **Scenario A: PostgreSQL Detected and Database Not Setup**
   - Application should show Database Setup Wizard
   - Fill in PostgreSQL credentials
   - Click "Test Connection" - should succeed
   - Click "Initialize Database" - should complete successfully
   - Application should proceed to login screen
   
   **Scenario B: Database Already Configured**
   - Application should go directly to login screen
   
   **Scenario C: PostgreSQL Not Detected**
   - Application should show Database Setup Wizard
   - Test Connection will fail with clear error message
   - Instructions should guide user to install PostgreSQL

5. **Verify Login**
   - Default credentials (after database setup):
     - Email: `admin@example.com`
     - Password: `admin123`
   - Should successfully log in to dashboard

### Development Testing

```bash
# Clone repository
git clone https://github.com/Pawel-Sokolowski/ManagmentApp.git
cd ManagmentApp

# Install dependencies
npm install

# Start development mode
npm run electron-dev
```

**Expected Behavior:**
1. Vite dev server starts on port 3000
2. Electron window opens
3. If database not configured, Setup Wizard appears
4. After setup, login screen appears

---

## Web Application Verification

### Local Web Server Testing

1. **Build and Start Server**
   ```bash
   cd ManagmentApp
   npm install
   npm run build
   npm run server:prod
   ```

2. **Verify Server Started**
   ```bash
   # Check server is listening
   curl http://localhost:3001/api/health
   ```
   
   Expected output:
   ```json
   {
     "status": "healthy",
     "database": "connected",
     "timestamp": "2024-..."
   }
   ```

3. **Check Database Status**
   ```bash
   curl http://localhost:3001/api/db-status
   ```
   
   Expected output:
   ```json
   {
     "connected": true,
     "schemaInitialized": true,
     "userCount": 3,
     "requiresSetup": false,
     "database": "office_management",
     "host": "localhost"
   }
   ```

4. **Access Web Application**
   - Open browser: http://localhost:3001
   - Should see application interface
   - If database not setup, should see Setup Wizard
   - After setup, should see login screen

### Production Web Server Testing

After deploying with Nginx/Apache (see WEB_DEPLOYMENT_GUIDE.md):

1. **Test Frontend**
   ```bash
   curl -I https://your-domain.com
   ```
   Should return HTTP 200 OK

2. **Test API**
   ```bash
   curl https://your-domain.com/api/health
   ```
   Should return health status

3. **Test in Browser**
   - Navigate to your domain
   - Check browser console for errors (F12)
   - Should load without JavaScript errors

---

## Database Setup Wizard Verification

### Desktop Mode (Electron)

1. **Fresh Installation Test**
   - Install application on a clean system
   - Launch application
   - Setup Wizard should appear automatically

2. **Wizard Flow Test**
   ```
   Step 1: Enter database credentials
   Step 2: Click "Test Connection"
     ✓ Should show success/failure message
   Step 3: Click "Initialize Database"
     ✓ Should show progress steps:
       - Connection Test
       - Create Database
       - Check Schema
       - Initialize Schema
       - Save Configuration
   Step 4: On success
     ✓ Should redirect to login screen after 2 seconds
   ```

3. **Test Invalid Credentials**
   - Enter wrong password
   - Click "Test Connection"
   - Should show clear error: "password authentication failed"

4. **Test Missing PostgreSQL**
   - Stop PostgreSQL service
   - Click "Test Connection"
   - Should show error: "connection refused" or similar

### Web Mode (Browser)

1. **Fresh Database Test**
   ```bash
   # Drop existing database
   psql -U postgres -c "DROP DATABASE IF EXISTS office_management;"
   
   # Start server
   npm run server:prod
   ```

2. **Access in Browser**
   - Navigate to http://localhost:3001
   - Should see Database Setup Wizard
   
3. **Complete Setup**
   - Enter credentials
   - Test connection
   - Initialize database
   - Should proceed to login

---

## Common Issues and Solutions

### Issue 1: "PostgreSQL not detected" but it's installed

**Solution:**
The installer now checks multiple locations:
- PATH (psql command)
- Windows Registry
- Common installation paths
- Windows Services

If still not detected, verify:
```powershell
# Check if service exists
Get-Service postgresql*

# Check registry
Get-ItemProperty "HKLM:\SOFTWARE\PostgreSQL\Installations\*"
```

### Issue 2: Database Setup Wizard doesn't appear

**Desktop Version:**
- Check if `.env` file exists with valid configuration
- Delete `.env` file to force wizard to appear:
  ```powershell
  Remove-Item "$env:LOCALAPPDATA\Programs\Office Management System\.env"
  ```

**Web Version:**
- Check database status: `curl http://localhost:3001/api/db-status`
- If `requiresSetup: false`, database is already configured

### Issue 3: "Connection Test" fails

**Check 1: PostgreSQL is Running**
```bash
# Windows
Get-Service postgresql*

# Linux
sudo systemctl status postgresql
```

**Check 2: Credentials are Correct**
```bash
psql -h localhost -U postgres -c "SELECT 1"
# Enter the password when prompted
```

**Check 3: PostgreSQL Allows Connections**
Edit `pg_hba.conf`:
```
# Add this line if missing:
host    all             all             127.0.0.1/32            md5
```

Restart PostgreSQL after changes.

**Check 4: Firewall**
```powershell
# Windows - Allow port 5432
New-NetFirewallRule -DisplayName "PostgreSQL" -Direction Inbound -LocalPort 5432 -Protocol TCP -Action Allow
```

### Issue 4: Electron app shows blank screen

**Solution 1: Check Developer Console**
- Press Ctrl+Shift+I (or Cmd+Option+I on Mac)
- Look for errors in Console tab

**Solution 2: Check Backend Server**
- Backend should auto-start in production mode
- Check if port 3001 is listening:
  ```bash
  netstat -an | findstr 3001
  ```

**Solution 3: Rebuild**
```bash
npm run build
npm run electron
```

### Issue 5: Web version - 404 errors

**Solution: Check Nginx/Apache Configuration**

Nginx should have:
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

Apache should have:
```apache
RewriteEngine On
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

---

## Verification Checklist

### Desktop Application
- [ ] PostgreSQL installed and running
- [ ] Application installed successfully
- [ ] Desktop shortcut created
- [ ] .env file created with correct values
- [ ] Database Setup Wizard appears on first run (if needed)
- [ ] Test Connection succeeds with valid credentials
- [ ] Database initializes successfully
- [ ] Login screen appears after setup
- [ ] Can log in with default credentials
- [ ] Dashboard loads without errors

### Web Application
- [ ] PostgreSQL installed and running
- [ ] Dependencies installed (`npm install`)
- [ ] Frontend built successfully (`npm run build`)
- [ ] Backend server starts (`npm run server:prod`)
- [ ] Health check endpoint responds
- [ ] Database status endpoint responds
- [ ] Frontend loads in browser
- [ ] Database Setup Wizard works (if fresh database)
- [ ] Login screen appears after setup
- [ ] Can log in with default credentials
- [ ] Dashboard loads without errors

### Production Web Deployment
- [ ] Web server (Nginx/Apache) configured
- [ ] Static files served correctly
- [ ] API requests proxied to backend
- [ ] SSL/HTTPS configured (recommended)
- [ ] Firewall rules configured
- [ ] PM2 or similar process manager running backend
- [ ] Backend auto-starts on server reboot
- [ ] Database backups configured
- [ ] Monitoring/logging configured

---

## Performance Testing

### Desktop Application
```bash
# Memory usage should be reasonable
# Check Task Manager:
# - Electron process: ~150-300 MB
# - Node.js backend: ~50-100 MB
```

### Web Application
```bash
# Test concurrent users
# Use Apache Bench:
ab -n 100 -c 10 http://localhost:3001/api/health

# Should handle 10 concurrent requests without errors
```

---

## Security Verification

### Desktop
- [ ] Database password not stored in plain text (use environment variables)
- [ ] Application runs with user privileges (not admin)
- [ ] No sensitive data in logs

### Web Application
- [ ] HTTPS enabled in production
- [ ] Strong database password configured
- [ ] JWT secret is random and secure
- [ ] CORS configured appropriately
- [ ] Rate limiting configured (if needed)
- [ ] Database access restricted to application only
- [ ] Regular security updates applied

---

## Getting Help

If verification fails:

1. **Check logs:**
   - Desktop: Press Ctrl+Shift+I to open DevTools
   - Web: Check browser console and server logs

2. **Review documentation:**
   - [INSTALLATION_GUIDE.md](INSTALLATION_GUIDE.md)
   - [WEB_DEPLOYMENT_GUIDE.md](WEB_DEPLOYMENT_GUIDE.md)
   - [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md)

3. **Report issues:**
   - Include verification checklist results
   - Include error messages and logs
   - Specify deployment mode (Desktop vs Web)
   - GitHub Issues: https://github.com/Pawel-Sokolowski/ManagmentApp/issues

---

**Last Updated:** 2024
**Version:** 1.0.0
