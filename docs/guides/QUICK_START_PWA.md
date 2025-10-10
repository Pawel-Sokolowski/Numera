# Quick Start - PWA Version

## 🚀 5-Minute Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 13+

### 1. Install
```bash
git clone https://github.com/Pawel-Sokolowski/ManagmentApp.git
cd ManagmentApp
npm install
```

### 2. Configure
Create `.env` file:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=office_management
DB_USER=your_username
DB_PASSWORD=your_password
PORT=3000
JWT_SECRET=your_secret_key_here
```

### 3. Setup Database
```bash
npm run setup-db
```

### 4. Run
```bash
# Development
npm run dev

# Production
npm run start
```

### 5. Access
Open browser: `http://localhost:3000`

---

## 📱 Install as App

### Desktop (Chrome/Edge)
1. Look for ⊕ icon in address bar
2. Click "Install"
3. Done! Opens like a native app

### iOS
1. Safari → Share button
2. "Add to Home Screen"
3. Done!

### Android
1. Chrome → Menu (⋮)
2. "Add to Home screen"
3. Done!

---

## ✅ Verify Installation

Run verification:
```bash
./verify-pwa.sh
```

Should see all green checkmarks ✓

---

## 📦 What's Included

✅ **Full Office Management**
- Client Management
- Invoice System (with PDF)
- Calendar & Events
- Team Chat
- Email Center
- Document Management
- Time Tracking
- Financial Reports

✅ **Progressive Web App**
- Install on any device
- Works offline
- Automatic updates
- Mobile friendly

✅ **PDF Generation**
- Fill official forms (UPL-1)
- Generate invoices
- Create custom documents
- 100% browser-based

---

## 🔧 Common Commands

```bash
# Development
npm run dev          # Start dev server with hot reload

# Production
npm run build        # Build for production
npm run start        # Build and start server
npm run server:prod  # Start production server only

# Database
npm run setup-db     # Setup database

# Verification
./verify-pwa.sh      # Verify PWA installation
```

---

## 📚 Documentation

- **README.md** - Overview
- **docs/deployment/PWA_DEPLOYMENT.md** - Full deployment guide
- **docs/MIGRATION_FROM_DESKTOP.md** - Migrating from desktop
- **CONVERSION_SUMMARY.md** - Technical details

---

## 🐛 Troubleshooting

### Build fails?
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Database connection issues?
1. Check PostgreSQL is running
2. Verify `.env` credentials
3. Test connection: `psql -U user -h host -d database`

### Port 3000 in use?
Change in `.env`:
```env
PORT=8080
```

---

## 🌐 Browser Requirements

**Minimum versions:**
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

---

## 🔒 Security Note

**For production:**
1. Use HTTPS (required for PWA)
2. Strong JWT secret
3. Secure database password
4. Configure firewall
5. Regular backups

See [PWA_DEPLOYMENT.md](docs/deployment/PWA_DEPLOYMENT.md) for details.

---

## 💬 Support

- **Issues:** https://github.com/Pawel-Sokolowski/ManagmentApp/issues
- **Docs:** https://github.com/Pawel-Sokolowski/ManagmentApp/docs

---

**Version:** 1.0.0 (PWA)  
**Status:** ✅ Production Ready
