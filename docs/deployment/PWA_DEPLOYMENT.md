# Progressive Web App (PWA) Deployment Guide

This guide explains how to deploy the Office Management System as a Progressive Web Application.

---

## Overview

The Office Management System is now a **Progressive Web Application (PWA)** that can be:

- ✅ Accessed from any modern web browser
- ✅ Installed on desktop and mobile devices
- ✅ Used offline after initial load (via service worker)
- ✅ Updated automatically when new versions are deployed

---

## Prerequisites

### Server Requirements
- **Node.js** 18.x or higher
- **PostgreSQL** 13 or higher
- **2 GB RAM** minimum (4 GB recommended)
- **10 GB Disk Space**
- **Network Access** for clients

### Supported Browsers
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

## Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/Pawel-Sokolowski/ManagmentApp.git
cd ManagmentApp
npm install
```

### 2. Configure Database

Create a `.env` file in the root directory:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=office_management
DB_USER=your_db_user
DB_PASSWORD=your_db_password

# Server Configuration
PORT=3000
NODE_ENV=production

# JWT Secret (generate a secure random string)
JWT_SECRET=your_secure_random_string_here
```

### 3. Setup Database

```bash
npm run setup-db
```

### 4. Build and Start

```bash
npm run build
npm run start
```

The application will be available at `http://localhost:3000`

---

## Production Deployment

### Using PM2 (Recommended)

```bash
npm install -g pm2
pm2 start server/index.js --name office-management
pm2 startup
pm2 save
```

### Using systemd (Linux)

Create `/etc/systemd/system/office-management.service`:

```ini
[Unit]
Description=Office Management System
After=network.target postgresql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/office-management
ExecStart=/usr/bin/node server/index.js
Restart=always
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

---

## PWA Installation

### Desktop
1. Open in Chrome/Edge
2. Click install icon (⊕) in address bar
3. Click "Install"

### Mobile (iOS)
1. Open in Safari
2. Tap Share button
3. Select "Add to Home Screen"

### Mobile (Android)
1. Open in Chrome
2. Tap menu (⋮)
3. Select "Add to Home screen"

---

## Security Best Practices

1. **Use HTTPS** - Always enable SSL in production
2. **Strong Passwords** - Use secure database and JWT secrets
3. **Firewall** - Restrict access to necessary ports
4. **Regular Updates** - Keep dependencies updated
5. **Backup** - Automated daily database backups

---

## Support

- GitHub: https://github.com/Pawel-Sokolowski/ManagmentApp
- Issues: https://github.com/Pawel-Sokolowski/ManagmentApp/issues

---

**Version**: 1.0.0  
**Platform**: Web (PWA)
