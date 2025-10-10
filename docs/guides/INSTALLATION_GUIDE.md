# Office Management System - Complete Installation Guide

## Overview

This guide provides step-by-step instructions for installing and setting up the Office Management System. The installer supports both **Desktop Application** and **Server Installation** modes.

---

## System Requirements

### Minimum Requirements
- **Operating System:** Windows 10 or Windows Server 2016+
- **RAM:** 4 GB minimum, 8 GB recommended
- **Disk Space:** 500 MB for application + 200 MB for PostgreSQL
- **Processor:** Intel Core i3 or equivalent
- **Network:** Internet connection for initial setup

### Software Prerequisites
- **PostgreSQL:** Version 12 or higher (automatically installed by the installer)
- **Node.js:** Included with the application (no separate installation needed)

---

## Installation Types

### 1. Desktop Application Installation
Perfect for single-user setups on workstations or laptops.

**Features:**
- Full GUI application
- Local database
- All management features
- Demo users pre-configured

### 2. Server Installation
Ideal for multi-user environments on Windows Server.

**Features:**
- Centralized database
- Multiple concurrent users
- Windows Service support
- Network access
- Production-ready configuration

---

## Installation Steps

### Step 1: Download the Installer

1. Navigate to the **Releases** section of the repository
2. Download `Office-Management-System-Setup.exe`
3. Save to a convenient location (e.g., Downloads folder)

### Step 2: Run the Installer

1. **Right-click** on `Office-Management-System-Setup.exe`
2. Select **"Run as administrator"**
3. If Windows SmartScreen appears, click **"More info"** then **"Run anyway"**

### Step 3: Choose Installation Type

The installer will present two options:

#### Option A: Desktop Application (Recommended for Single Users)
```
✓ Install for desktop use
  - Installs to: C:\Program Files\Office Management System
  - Creates desktop shortcut
  - Installs PostgreSQL locally
  - Sets up demo database
  - Ready to use immediately
```

#### Option B: Server Installation (Recommended for Multi-User)
```
✓ Install as server
  - Installs to: C:\Program Files\Office Management System
  - Configures for network access
  - Installs PostgreSQL with network support
  - Creates Windows Service
  - Sets up production database
```

### Step 4: Automatic Setup

The installer will automatically:
1. Install the application files
2. Download and install PostgreSQL (if not already installed)
3. Create the database schema
4. Insert demo users and data
5. Configure environment variables
6. Create shortcuts (Desktop installation) or Windows Service (Server installation)

**This process takes 5-15 minutes depending on your system.**

### Step 5: Verify Installation

After installation completes:

#### For Desktop Installation:
1. Look for the **Office Management System** icon on your desktop
2. Double-click to launch
3. Login with demo credentials (see below)

#### For Server Installation:
1. Open **Services** (`services.msc`)
2. Look for **Office Management System Service**
3. Verify it's running
4. Open browser and navigate to `http://localhost:3001`
5. Login with demo credentials

---

## Demo User Accounts

The system comes pre-configured with the following demo users:

| Username | Password | Role | Permissions |
|----------|----------|------|-------------|
| admin | admin123 | Administrator | Full system access |
| manager | manager123 | Manager | Most modules, limited settings |
| accountant | accountant123 | Accountant | Financial modules, reports |
| secretary | secretary123 | Secretary | Client management, scheduling |
| hr | hr123 | HR | User management, employee records |
| owner | owner123 | Owner | Full access, business reports |

**⚠️ IMPORTANT:** Change these passwords immediately in production environments!

---

## Post-Installation Configuration

### For Desktop Users

**No additional configuration needed!** The application is ready to use.

**Optional Steps:**
- Change demo user passwords (Settings → Users)
- Configure email notifications (Settings → Email)
- Customize company information (Settings → Company)

### For Server Installations

#### 1. Configure Network Access

Edit the environment file:
```
Location: C:\Program Files\Office Management System\.env
```

Update these settings:
```ini
DB_HOST=localhost
DB_PORT=5432
DB_NAME=office_management
DB_USER=postgres
DB_PASSWORD=your_secure_password
PORT=3001
NODE_ENV=production
```

#### 2. Configure Firewall

Open port 3001 for network access:
```powershell
# Open PowerShell as Administrator
New-NetFirewallRule -DisplayName "Office Management System" -Direction Inbound -LocalPort 3001 -Protocol TCP -Action Allow
```

#### 3. Configure PostgreSQL for Network Access

Edit PostgreSQL configuration:
```
Location: C:\Program Files\PostgreSQL\15\data\postgresql.conf
```

Add/modify:
```
listen_addresses = '*'
max_connections = 100
```

Edit PostgreSQL access control:
```
Location: C:\Program Files\PostgreSQL\15\data\pg_hba.conf
```

Add:
```
# Allow network connections
host    all    all    0.0.0.0/0    md5
```

Restart PostgreSQL service:
```powershell
Restart-Service postgresql-x64-15
```

#### 4. Set Up Windows Service

The Windows Service is automatically created during server installation.

**Verify Service:**
```powershell
Get-Service "OfficeManagementSystem"
```

**Start/Stop Service:**
```powershell
Start-Service "OfficeManagementSystem"
Stop-Service "OfficeManagementSystem"
```

**Configure Auto-Start:**
```powershell
Set-Service "OfficeManagementSystem" -StartupType Automatic
```

---

## Accessing the Application

### Desktop Application
- Launch from desktop shortcut
- Or navigate to: `C:\Program Files\Office Management System\Office Management System.exe`

### Server Installation (Browser Access)
- Local access: `http://localhost:3001`
- Network access: `http://[server-ip]:3001`
- Example: `http://192.168.1.100:3001`

---

## Troubleshooting

### Issue: Installer fails to start
**Solution:**
- Ensure you're running as Administrator
- Disable antivirus temporarily
- Check Windows Event Viewer for errors

### Issue: PostgreSQL installation fails
**Solution:**
- Check if PostgreSQL is already installed
- Ensure sufficient disk space (500 MB minimum)
- Check Windows Services for existing PostgreSQL service

### Issue: Application won't start
**Solution:**
1. Check PostgreSQL is running:
   ```powershell
   Get-Service postgresql-*
   ```
2. Verify database connection in `.env` file
3. Check application logs:
   ```
   C:\Program Files\Office Management System\logs\
   ```

### Issue: Cannot login with demo credentials
**Solution:**
- Verify database was created successfully
- Check PostgreSQL connection
- Re-run database setup (see Manual Database Setup below)

### Issue: Service won't start (Server Installation)
**Solution:**
1. Check service status:
   ```powershell
   Get-Service "OfficeManagementSystem"
   ```
2. Check service logs:
   ```
   C:\Program Files\Office Management System\logs\service.log
   ```
3. Verify `.env` configuration
4. Ensure PostgreSQL is running

### Issue: Network access not working (Server Installation)
**Solution:**
- Verify firewall rules are configured
- Check PostgreSQL network configuration
- Ensure `DB_HOST` in `.env` is correct
- Test with: `telnet [server-ip] 3001`

---

## Manual Database Setup (If Needed)

If the automatic database setup fails, you can run it manually:

### Option 1: Using psql
```powershell
# Open PowerShell as Administrator
cd "C:\Program Files\Office Management System"

# Connect to PostgreSQL
psql -U postgres -h localhost

# Create database
CREATE DATABASE office_management;
\c office_management

# Run schema file
\i src/database/complete_system_schema.sql

# Exit
\q
```

### Option 2: Using pgAdmin
1. Open pgAdmin
2. Connect to PostgreSQL server
3. Create new database: `office_management`
4. Open Query Tool
5. Load and execute: `src/database/complete_system_schema.sql`

---

## Uninstalling

### Desktop Installation
1. Go to **Settings → Apps & Features**
2. Find **Office Management System**
3. Click **Uninstall**
4. Follow the prompts

### Server Installation
1. Stop the Windows Service:
   ```powershell
   Stop-Service "OfficeManagementSystem"
   ```
2. Go to **Settings → Apps & Features**
3. Find **Office Management System**
4. Click **Uninstall**
5. Optionally uninstall PostgreSQL if no longer needed

---

## Upgrading

### To upgrade to a new version:
1. Backup your database:
   ```powershell
   pg_dump -U postgres office_management > backup.sql
   ```
2. Uninstall current version
3. Install new version
4. Restore database if needed

---

## Security Best Practices

### For All Installations
- ✅ Change all demo user passwords immediately
- ✅ Use strong passwords (12+ characters, mixed case, numbers, symbols)
- ✅ Regularly backup the database
- ✅ Keep PostgreSQL updated
- ✅ Monitor application logs

### For Server Installations (Additional)
- ✅ Use HTTPS/SSL for network access
- ✅ Configure PostgreSQL with strong authentication
- ✅ Implement network segmentation
- ✅ Regular security audits
- ✅ Enable PostgreSQL logging
- ✅ Set up automated backups
- ✅ Use Windows Firewall rules
- ✅ Limit PostgreSQL network access to trusted IPs

---

## Backup and Recovery

### Automated Backup Script

Create a backup script at `C:\BackupScripts\backup-office-db.bat`:

```batch
@echo off
SET BACKUP_DIR=D:\Backups\OfficeManagement
SET TIMESTAMP=%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%
SET TIMESTAMP=%TIMESTAMP: =0%
SET BACKUP_FILE=%BACKUP_DIR%\office_management_%TIMESTAMP%.sql
SET PGPASSWORD=your_postgres_password

mkdir %BACKUP_DIR% 2>nul

echo Starting backup at %date% %time%
pg_dump -h localhost -U postgres office_management > "%BACKUP_FILE%"

if %ERRORLEVEL% EQU 0 (
    echo Backup completed successfully: %BACKUP_FILE%
    
    REM Delete backups older than 30 days
    forfiles /p "%BACKUP_DIR%" /s /m *.sql /d -30 /c "cmd /c del @path"
) else (
    echo Backup failed with error code %ERRORLEVEL%
)
```

Schedule with Task Scheduler:
```powershell
$action = New-ScheduledTaskAction -Execute "C:\BackupScripts\backup-office-db.bat"
$trigger = New-ScheduledTaskTrigger -Daily -At 2am
Register-ScheduledTask -Action $action -Trigger $trigger -TaskName "Office DB Backup" -Description "Daily backup of Office Management database"
```

### Restoring from Backup

```powershell
# Stop the service (if running)
Stop-Service "OfficeManagementSystem"

# Restore database
psql -U postgres -h localhost -c "DROP DATABASE office_management;"
psql -U postgres -h localhost -c "CREATE DATABASE office_management;"
psql -U postgres -h localhost office_management < backup.sql

# Start the service
Start-Service "OfficeManagementSystem"
```

---

## Module Permissions Reference

| Module | Admin | Manager | Accountant | Secretary | HR | Owner |
|--------|-------|---------|------------|-----------|----|----|
| Dashboard | ✅ Full | ✅ Full | ✅ Full | ✅ Full | ✅ Full | ✅ Full |
| Clients | ✅ CRUD | ✅ CRD | ✅ CR | ✅ CR | ✅ R | ✅ CRD |
| Invoices | ✅ CRUD | ✅ CR | ✅ CRD | ✅ R | ❌ None | ✅ CRD |
| Projects | ✅ CRUD | ✅ CRD | ✅ R | ✅ R | ❌ None | ✅ CRD |
| Users | ✅ CRUD | ✅ R | ❌ None | ❌ None | ✅ CR | ✅ CR |
| Reports | ✅ Full | ✅ Full | ✅ Full | ✅ Limited | ✅ Limited | ✅ Full |
| Settings | ✅ Full | ✅ Limited | ❌ None | ❌ None | ❌ None | ✅ Limited |

**Legend:** C=Create, R=Read, U=Update, D=Delete

---

## Advanced Configuration

### Environment Variables

Full list of configurable environment variables:

```ini
# Database Configuration
DB_HOST=localhost           # Database host
DB_PORT=5432               # Database port
DB_NAME=office_management  # Database name
DB_USER=postgres           # Database user
DB_PASSWORD=password       # Database password

# Application Configuration
PORT=3001                  # Application port
NODE_ENV=production        # Environment (development/production)

# Session Configuration
SESSION_SECRET=your-secret-key-here
SESSION_MAX_AGE=86400000   # Session timeout (ms)

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-password
SMTP_FROM=noreply@yourdomain.com

# Security Configuration
BCRYPT_ROUNDS=10           # Password hashing rounds
JWT_SECRET=your-jwt-secret # JWT token secret
```

### Performance Tuning

For better performance on server installations:

**PostgreSQL Configuration:**
```
# In postgresql.conf
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
work_mem = 16MB
```

**Node.js Configuration:**
```
# Set Node.js memory limit
NODE_OPTIONS=--max-old-space-size=2048
```

---

## Support and Resources

### Documentation
- This installation guide covers all installation scenarios
- Check logs for detailed error messages
- Review environment configuration for connection issues

### Getting Help
1. Check the Troubleshooting section above
2. Review application logs in installation directory
3. Check Windows Event Viewer for system errors
4. Submit issues on GitHub repository with:
   - Detailed description of the problem
   - Steps to reproduce
   - Error messages from logs
   - System information (OS version, RAM, etc.)

### Log Locations
- Application logs: `C:\Program Files\Office Management System\logs\`
- PostgreSQL logs: `C:\Program Files\PostgreSQL\15\data\log\`
- Windows Event Viewer: Application and System logs

---

## Version Information

**Current Version:** 1.0.0
**Last Updated:** 2024
**Installer Type:** NSIS EXE with unified server/desktop options

---

## License

This software is provided as-is. Please refer to the LICENSE file in the repository for detailed terms and conditions.

---

## Conclusion

You now have a complete Office Management System installation. Whether you chose desktop or server installation, your system is ready to use with demo accounts and full functionality.

**Next Steps:**
1. Login with demo credentials
2. Change passwords for security
3. Explore the system features
4. Configure for your organization's needs
5. Set up regular backups (especially for server installations)

For questions or issues, refer to the Troubleshooting section or submit an issue on GitHub.

**Happy managing! 🚀**
