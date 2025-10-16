# Local Installation Guide for Advanced Users

Complete guide for installing the Office Management System locally for development or single-user use.

---

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Manual Installation](#manual-installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [PWA Installation](#pwa-installation)
- [Troubleshooting](#troubleshooting)

---

## Overview

The Office Management System is a Progressive Web Application (PWA) that can be installed locally on your machine for development or personal use. This guide covers installation for:

- **Development**: Hot-reload enabled, debugging tools
- **Local Production**: Optimized build for single-user use
- **Testing**: Trying out features before server deployment

---

## Prerequisites

### Required Software

1. **Node.js 18.x or higher**
   ```bash
   # Check version
   node --version  # Should be v18.0.0 or higher
   
   # Install from https://nodejs.org/
   # Or use nvm:
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
   nvm install 18
   nvm use 18
   ```

2. **PostgreSQL 13 or higher**
   ```bash
   # Ubuntu/Debian
   sudo apt update
   sudo apt install postgresql postgresql-contrib
   
   # macOS
   brew install postgresql@15
   brew services start postgresql@15
   
   # Verify installation
   psql --version
   ```

3. **Git**
   ```bash
   # Ubuntu/Debian
   sudo apt install git
   
   # macOS (usually pre-installed)
   git --version
   ```

### System Requirements

- **OS**: Linux, macOS, or Windows (with WSL recommended)
- **RAM**: 4 GB minimum, 8 GB recommended
- **Disk Space**: 2 GB free space
- **Network**: Internet connection for initial setup

---

## Quick Start

### Automated Installation (Recommended)

Use our installation script for the easiest setup:

```bash
# Clone the repository
git clone https://github.com/Pawel-Sokolowski/Numera.git
cd Numera

# Run the installation script
./scripts/install-local.sh
```

The script will:
1. ✅ Check prerequisites
2. ✅ Install dependencies
3. ✅ Configure environment
4. ✅ Set up database
5. ✅ Generate PWA icons
6. ✅ Build the application

**That's it!** Skip to [Running the Application](#running-the-application).

---

## Manual Installation

If you prefer manual control over the installation process:

### Step 1: Clone Repository

```bash
git clone https://github.com/Pawel-Sokolowski/Numera.git
cd Numera
```

### Step 2: Install Dependencies

```bash
# Install all dependencies
npm install

# Or use clean install (recommended)
npm ci
```

### Step 3: Environment Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit configuration
nano .env
```

**Required environment variables:**

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=office_management
DB_USER=postgres
DB_PASSWORD=your_password

# Server Configuration
PORT=3000
NODE_ENV=development

# Security (IMPORTANT!)
JWT_SECRET=your-super-secure-jwt-secret-at-least-32-characters
```

**Generate secure JWT secret:**

```bash
# Generate a random 32-byte hex string
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 4: Database Setup

#### Option A: Automated Setup (Recommended)

```bash
npm run setup-db
```

This interactive wizard will:
- Create the database
- Set up schema
- Create demo users
- Insert sample data

#### Option B: Manual Setup

```bash
# Create database
psql -U postgres -c "CREATE DATABASE office_management;"

# Run schema file
psql -U postgres -d office_management -f src/database/complete_system_schema.sql
```

### Step 5: Generate PWA Icons

```bash
# Generate icons from SVG
node scripts/generate-pwa-icons.js
```

This creates:
- `icon-192.png` - PWA installation icon
- `icon-512.png` - PWA splash screen
- `apple-touch-icon.png` - iOS home screen
- `favicon-32x32.png` - Browser tab icon
- `favicon-16x16.png` - Browser tab icon

### Step 6: Build Application (Optional)

For development, you can skip this step. For production:

```bash
npm run build
```

---

## Configuration

### Database Configuration

**PostgreSQL User Setup:**

```sql
-- Create dedicated user (recommended)
CREATE USER office_user WITH PASSWORD 'secure_password';

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE office_management TO office_user;

-- Update .env to use this user
```

**Connection Settings:**

```env
DB_HOST=localhost          # Database host
DB_PORT=5432              # Default PostgreSQL port
DB_NAME=office_management # Database name
DB_USER=office_user       # Database user
DB_PASSWORD=secure_pass   # Strong password
```

### Application Configuration

**Development Mode:**

```env
NODE_ENV=development
PORT=3000
```

**Production Mode (Local):**

```env
NODE_ENV=production
PORT=3000
```

### Advanced Configuration

**Session Configuration:**

```env
SESSION_SECRET=another-secure-random-string
SESSION_MAX_AGE=86400000  # 24 hours in milliseconds
```

**Email Configuration (Optional):**

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@yourdomain.com
```

---

## Running the Application

### Development Mode

**With hot-reload and debugging:**

```bash
npm run dev
```

This starts:
- React dev server on port 3000 (frontend)
- Express API server on port 3001 (backend)
- Hot-reload for code changes
- Source maps for debugging

**Access at:** `http://localhost:3000`

### Production Mode (Local)

**Optimized build:**

```bash
# Build once
npm run build

# Start production server
npm run start
```

**Access at:** `http://localhost:3000`

### Backend Only

**Run just the API server:**

```bash
npm run server
```

### Preview Build

**Test production build locally:**

```bash
npm run preview
```

---

## PWA Installation

Once the application is running, you can install it as a PWA:

### Desktop Installation

#### Chrome / Edge / Brave
1. Open `http://localhost:3000`
2. Look for install icon (⊕) in address bar
3. Click and select **"Install"**
4. App appears as standalone application

#### Firefox
1. Open `http://localhost:3000`
2. Click menu (≡) → **"Install"**
3. Confirm installation

### Mobile Installation

#### iOS (Safari)
1. Open `http://localhost:3000` (use your computer's IP if accessing from mobile)
2. Tap **Share** button (□↑)
3. Scroll and tap **"Add to Home Screen"**
4. Name the app and tap **"Add"**

#### Android (Chrome)
1. Open `http://localhost:3000`
2. Tap menu (⋮) → **"Add to Home screen"**
3. Confirm installation

### Accessing from Other Devices

To access from mobile devices on the same network:

```bash
# Find your local IP
# Linux/macOS:
ip addr show | grep "inet " | grep -v 127.0.0.1

# Then access from mobile:
# http://192.168.1.xxx:3000
```

---

## Troubleshooting

### Installation Issues

#### npm install fails

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### PostgreSQL connection fails

```bash
# Check PostgreSQL is running
sudo systemctl status postgresql    # Linux
brew services list                  # macOS

# Start PostgreSQL if stopped
sudo systemctl start postgresql     # Linux
brew services start postgresql@15   # macOS

# Verify connection
psql -U postgres -c "SELECT version();"
```

#### Database setup fails

```bash
# Check PostgreSQL user has permissions
psql -U postgres

# In psql console:
\l                                  # List databases
\du                                 # List users

# Grant permissions if needed
GRANT ALL PRIVILEGES ON DATABASE office_management TO postgres;
```

### Runtime Issues

#### Port already in use

```bash
# Find process using port 3000
lsof -i :3000              # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Kill the process
kill -9 <PID>              # macOS/Linux
```

#### Build fails

```bash
# Clear build cache
rm -rf build/

# Rebuild
npm run build
```

#### PWA not installing

1. Ensure you're using HTTPS or localhost
2. Check browser console for service worker errors
3. Clear browser cache and reload
4. Verify `manifest.webmanifest` is accessible

### Database Issues

#### Cannot connect to database

```bash
# Verify PostgreSQL is running
pg_isready

# Check connection settings in .env
cat .env | grep DB_

# Test connection manually
psql -h localhost -U postgres -d office_management
```

#### Database schema errors

```bash
# Drop and recreate database
psql -U postgres -c "DROP DATABASE IF EXISTS office_management;"
psql -U postgres -c "CREATE DATABASE office_management;"

# Re-run setup
npm run setup-db
```

### Common Errors

**Error: JWT_SECRET not configured**
```bash
# Generate and add to .env
echo "JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")" >> .env
```

**Error: Module not found**
```bash
# Reinstall dependencies
npm ci
```

**Error: Permission denied**
```bash
# Fix file permissions
chmod +x scripts/*.sh
```

---

## Development Tips

### Code Hot-Reload

In development mode, changes to React code automatically refresh the browser.

### Database Migrations

After schema changes:

```bash
# Export current data
pg_dump -U postgres office_management > backup.sql

# Apply changes
psql -U postgres -d office_management -f src/database/updated_schema.sql

# Restore data if needed
psql -U postgres -d office_management < backup.sql
```

### Testing PDF Generation

```bash
# Test form filling
npm run test:pdf-filling

# Test universal PDF filling
npm run test:universal-pdf-filling
```

### Debugging

**Backend logs:**
```bash
# View server logs
npm run server  # Logs appear in console
```

**Frontend debugging:**
- Open browser DevTools (F12)
- Check Console tab for errors
- Use React DevTools extension

---

## Next Steps

After successful installation:

1. **Login**: Use demo credentials (admin/admin123)
2. **Explore**: Try different modules and features
3. **Configure**: Customize settings for your needs
4. **Secure**: Change default passwords
5. **Backup**: Set up regular database backups

---

## Additional Resources

- **Quick Start Guide**: [docs/guides/QUICK_START_PDF_FILLING.md](QUICK_START_PDF_FILLING.md)
- **PDF Generation**: [docs/guides/PDF_GENERATION_GUIDE.md](../PDF_GENERATION_GUIDE.md)
- **API Documentation**: [docs/development/](../development/)
- **Deployment Guide**: [docs/deployment/DEPLOYMENT_GUIDE.md](../deployment/DEPLOYMENT_GUIDE.md)

---

## Getting Help

If you encounter issues:

1. Check this troubleshooting section
2. Review application logs
3. Check PostgreSQL logs
4. Search existing GitHub issues
5. Create new issue with:
   - Detailed description
   - Error messages
   - System information
   - Steps to reproduce

---

**Happy developing! 🚀**
