# Office Management System

A comprehensive office management system built as a **Progressive Web Application (PWA)** with React and PostgreSQL. Access from any device, install on mobile/desktop, and work online or offline.

---

## 🚀 Quick Start

### Installation Options

Choose the installation method that fits your needs:

#### Option 1: Automated Local Installation (Recommended for Development)

```bash
# Clone repository
git clone https://github.com/Pawel-Sokolowski/Numera.git
cd Numera

# Run automated installation script
./scripts/install-local.sh
```

The script will guide you through:

- ✅ Dependency installation
- ✅ Database setup
- ✅ Environment configuration
- ✅ PWA icon generation

#### Option 2: Manual Installation

```bash
# Clone repository
git clone https://github.com/Pawel-Sokolowski/Numera.git
cd Numera

# Install dependencies
npm install

# Generate PWA icons
npm run generate-icons

# Setup database (PostgreSQL required)
npm run setup-db

# Start the application
npm run dev
```

#### Option 3: Server Installation (Docker or Native)

```bash
# Clone repository
git clone https://github.com/Pawel-Sokolowski/Numera.git
cd Numera

# Run server installation script
sudo ./scripts/install-server.sh
```

Choose between:

- **Docker** - Containerized deployment (recommended)
- **Native** - Direct installation with PM2

See [Server Installation Guide](docs/guides/SERVER_INSTALLATION.md) for details.

### Production Deployment

**Option 1: Docker Deployment (Recommended)**

```bash
# Configure environment
cp .env.example .env
nano .env  # Edit configuration

# Start with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f
```

**Option 2: Native Server Deployment**

```bash
# Build the application
npm run build

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
```

**Option 3: Static Deployment (GitHub Pages)**

```bash
# Build for static deployment
npm run build

# Deploy via GitHub Actions (automatic)
# Or deploy the 'build' folder to any static hosting
```

The application works in two modes:

- **Full Mode**: With backend server - all features available
- **Static Mode**: GitHub Pages - documents stored in browser LocalStorage (limited to 5MB per file)

See deployment guides:

- **[Server Installation Guide](docs/guides/SERVER_INSTALLATION.md)** - Complete production setup
- **[Static Deployment](docs/deployment/STATIC_DEPLOYMENT.md)** - GitHub Pages setup
- **[Deployment Guide](docs/deployment/DEPLOYMENT_GUIDE.md)** - Security and configuration

---

## 🌐 Progressive Web App (PWA)

This application is a **Progressive Web Application** that can be:

✅ **Accessed** from any modern web browser  
✅ **Installed** on desktop and mobile devices  
✅ **Used offline** after initial load (via service worker)  
✅ **Updated** automatically when new versions are deployed

### Installing as an App

**On Desktop (Chrome, Edge, Safari):**

1. Open the application in your browser
2. Look for the "Install" icon in the address bar
3. Click "Install" to add it to your desktop

**On Mobile (iOS/Android):**

1. Open the application in your browser
2. Tap the browser menu (three dots or share button)
3. Select "Add to Home Screen" or "Install"

---

## ✨ Features

- **Client Management** - Complete client database with contacts and documents
- **Invoice System** - Create, manage, and track invoices with PDF generation
- **Calendar & Scheduling** - Event management and team coordination
- **Team Chat** - Real-time collaboration
- **Email Center** - Integrated email management
- **Document Management** - Centralized document storage and PDF filling
- **Time Tracking** - Employee time tracking and reporting
- **Financial Reports** - Comprehensive analytics and charts
- **User Management** - Role-based access control
- **PDF Form Filling** - Fill official PDF templates with client data (UPL-1, PEL, tax forms) using template-based approach with pdf-lib
- **🎯 Automated Field Detection** - OCR-based automatic detection of form fields in PDFs using AI and image processing
- **📄 Multi-Page PDF Support** - Automatic filling of forms across multiple pages with coordinate mapping (NEW!)
- **✏️ Editable PDF Fields** - Generate PDFs with interactive, editable fields for user completion (NEW!)

---

## 📋 System Requirements

### Server

- **Operating System:** Linux (Ubuntu 20.04+ recommended), Windows Server, or macOS
- **Node.js:** 18.x or higher
- **PostgreSQL:** 13 or higher
- **RAM:** 2 GB minimum (4 GB recommended)
- **Disk Space:** 1 GB minimum
- **Network:** Internet connection for deployment

### Client (Browser)

- **Browsers:** Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Internet:** Required for initial load, offline support via service worker
- **Devices:** Desktop, tablet, or mobile

---

## 📖 Documentation

### Getting Started

- **[Quick Start Guide](docs/guides/QUICK_START_PDF_FILLING.md)** - PDF form filling quickstart
- **[Documentation Index](docs/README.md)** - Complete documentation overview

### Installation

- **[Local Installation Guide](docs/guides/LOCAL_INSTALLATION.md)** - Complete local setup for advanced users
- **[Server Installation Guide](docs/guides/SERVER_INSTALLATION.md)** - Production server deployment (Docker/Native)

### Deployment

- **[Deployment Guide](docs/deployment/DEPLOYMENT_GUIDE.md)** - Security and production configuration
- **[PWA Deployment](docs/deployment/PWA_DEPLOYMENT.md)** - PWA-specific deployment details
- **[Static Deployment (GitHub Pages)](docs/deployment/STATIC_DEPLOYMENT.md)** - Static hosting guide
- **[Web Deployment Guide](docs/development/WEB_DEPLOYMENT_GUIDE.md)** - General deployment instructions

### Features

- **[🎯 Automated Field Detection](docs/features/AUTOMATED_FIELD_DETECTION_README.md)** - OCR-based form field detection
- **[📄 Multi-Page & Editable PDFs](docs/features/MULTI_PAGE_EDITABLE_FIELDS.md)** - Multi-page forms and editable field support (NEW!)
- **[PDF Form Filling Test Results](docs/guides/PDF_FORM_FILLING_TEST_RESULTS.md)** - Test results and usage examples
- **[Universal PDF Form Filling](docs/guides/UNIVERSAL_PDF_FORM_FILLING.md)** - Universal form filling guide

### Development

- **[API Documentation](docs/development/)** - Server API reference

---

## 🔧 Development

### Available Scripts

**Development:**

- `npm run dev` - Start development server (with hot reload)
- `npm run server` - Start backend server only
- `npm run preview` - Preview production build

**Production:**

- `npm run build` - Build for production
- `npm run start` - Build and start production server
- `npm run server:prod` - Start backend in production mode

**Setup:**

- `npm run setup-db` - Run database setup wizard
- `npm run generate-icons` - Generate PWA icons from SVG
- `npm run install:local` - Automated local installation
- `npm run install:server` - Automated server installation

**Docker:**

- `npm run docker:build` - Build Docker images
- `npm run docker:up` - Start Docker containers
- `npm run docker:down` - Stop Docker containers
- `npm run docker:logs` - View Docker logs

**Testing:**

- `npm run test:pdf-filling` - Test PDF form filling
- `npm run test:universal-pdf-filling` - Test universal PDF filling

### Project Structure

```
Numera/
├── public/              # Static assets and PWA files
│   ├── manifest.webmanifest  # PWA manifest
│   ├── sw.js            # Service worker
│   └── icon.svg         # App icon
├── src/                 # React application source
│   ├── components/      # React components
│   ├── utils/           # Utilities including PDF generation
│   └── App.tsx          # Main application component
├── server/              # Express backend server
├── scripts/             # Database setup and utility scripts
└── docs/                # Documentation
```

---

## 📱 PWA Features

### Offline Support

The application uses a service worker to cache essential resources, allowing basic functionality when offline.

### Install Prompts

Users can install the application directly to their device for a native app-like experience.

### Responsive Design

Fully responsive interface that works on desktop, tablet, and mobile devices.

---

## 🖨️ PDF Generation

The application includes robust PDF capabilities focused on **official template filling**:

### Supported Libraries

- **pdf-lib** - Official PDF template filling for government forms (primary approach)
- **jsPDF** - Invoice and custom document generation

### Features

- **Template-Based Form Filling** - Fills official PDF templates with client data using OCR/form fields
- **Multi-Page Support** - Automatically fills fields across multiple pages using coordinate mapping
- **Editable PDFs** - Generate PDFs with interactive fields that users can edit after filling
- **Polish Character Support** - Full Unicode support for Polish characters (ą, ć, ę, ł, ń, ó, ś, ź, ż)
- **Multiple Form Types** - UPL-1 (tax office), PEL (ZUS), PIT forms, and 20+ other official templates
- **Browser-based** - All PDF filling happens in the browser, no server-side dependencies
- **Official Forms Only** - Uses government-approved PDF templates (stored in `PDFFile` folder), ensuring compliance

### Form Generation

- **UPL-1 Forms** - Tax office authorization forms
- **PEL Forms** - ZUS (social insurance) authorization forms
- **Invoice PDFs** - Professional invoices with multiple templates
- **Custom Forms** - PIT, VAT, CIT, ZUS, and JPK forms

PDF generation is fully functional in the web version and works reliably in all modern browsers. See [PDF Library Improvement](docs/fixes/PDF_LIBRARY_IMPROVEMENT.md) for technical details.

---

## 🌐 Live Demo

**[Try it now on GitHub Pages](https://pawel-sokolowski.github.io/Numera/)**

Experience the application directly in your browser - no installation required!

---

## 🔐 Security

- HTTPS recommended for production
- JWT-based authentication
- Role-based access control
- Secure database connections
- Environment-based configuration

---

## 📊 Production Deployment Options

### Option 1: Traditional Server

Deploy on your own server (VPS, dedicated server, on-premise):

- Full control over data and infrastructure
- See [Web Deployment Guide](docs/development/WEB_DEPLOYMENT_GUIDE.md)

### Option 2: Cloud Platforms

Deploy to cloud services:

- **Heroku** - Easy deployment with PostgreSQL addon
- **DigitalOcean App Platform** - Managed deployment
- **AWS/Azure** - Enterprise-grade infrastructure
- **Vercel/Netlify** - Frontend hosting (requires separate backend)

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues.

---

**Version**: 1.0.0  
**License**: See LICENSE file  
**Platform**: Web (PWA) - All modern browsers and devices
