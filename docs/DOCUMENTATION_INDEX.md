# 📚 Documentation Index

Welcome! This document helps you find the right guide for your needs.

---

## 🎯 Quick Navigation

### I want to...

#### ✅ Use the application
→ [INSTALLATION_GUIDE.md](INSTALLATION_GUIDE.md) - Install and use the app

#### ✅ Build an executable (I'm not technical)
→ [QUICK_START.md](QUICK_START.md) - Simple step-by-step guide

#### ✅ Build an executable (I'm a developer)
→ [BUILD_GUIDE.md](BUILD_GUIDE.md) - Comprehensive build documentation

#### ✅ Build without Windows (using GitHub Actions)
→ [GITHUB_ACTIONS_GUIDE.md](GITHUB_ACTIONS_GUIDE.md) - Cloud building

#### ✅ Understand the project
→ [README.md](README.md) - Project overview and features

#### ✅ Build from source (advanced)
→ [BUILD_GUIDE.md](BUILD_GUIDE.md) - Advanced build options

---

## 📖 All Documentation

### For End Users

| Document | Purpose | Time Required |
|----------|---------|---------------|
| [INSTALLATION_GUIDE.md](INSTALLATION_GUIDE.md) | Install and configure the desktop application | 15-30 minutes |
| [WEB_DEPLOYMENT_GUIDE.md](WEB_DEPLOYMENT_GUIDE.md) | Deploy as a web application on a server | 30-60 minutes |
| [VERIFICATION_GUIDE.md](VERIFICATION_GUIDE.md) | Verify installation and troubleshoot issues | 10-20 minutes |
| [README.md](README.md) | Project overview, features, and quick start | 5 minutes |

### For Builders (Creating the .exe)

| Document | Purpose | Difficulty | Time Required |
|----------|---------|------------|---------------|
| [QUICK_START.md](QUICK_START.md) | Build executable - simple guide | ⭐ Easy | 10-15 minutes |
| [GITHUB_ACTIONS_GUIDE.md](GITHUB_ACTIONS_GUIDE.md) | Build using GitHub Actions (no Windows needed) | ⭐ Easy | 5-10 minutes |
| [BUILD_GUIDE.md](BUILD_GUIDE.md) | Comprehensive build documentation | ⭐⭐ Moderate | 20-30 minutes |

### For Developers

| Document | Purpose | Technical Level |
|----------|---------|-----------------|
| [BUILD_GUIDE.md](BUILD_GUIDE.md) | Build configuration and customization | Advanced |
| [package.json](package.json) | Dependencies and build scripts | Advanced |
| [vite.config.ts](vite.config.ts) | Vite build configuration | Advanced |

### In the Repository

| Location | Contents |
|----------|----------|
| `installer/` | Pre-built installers (if available) |
| `installer-resources/` | NSIS installer scripts and resources |
| `scripts/` | Database setup and utility scripts |
| `public/` | Electron main process files |
| `src/` | React application source code |

---

## 🚀 Recommended Paths

### Path 1: I Just Want the Executable Now! (Fastest)

1. Go to [Releases](https://github.com/Pawel-Sokolowski/ManagmentApp/releases)
2. Download `Office-Management-System-Setup-*.exe`
3. Done! ✅

**No release available?** → Use Path 2 or 3

---

### Path 2: Build Using GitHub Actions (No Windows PC)

**Perfect if:** You don't have Windows or don't want to install anything

1. Read: [GITHUB_ACTIONS_GUIDE.md](GITHUB_ACTIONS_GUIDE.md)
2. Go to repository Actions tab
3. Run "Build Windows Executable" workflow
4. Download artifact
5. Done! ✅

**Time:** 5-10 minutes (mostly waiting for build)

---

### Path 3: Build Locally on Windows (Recommended for Developers)

**Perfect if:** You have Windows and want full control

1. Read: [BUILD_GUIDE.md](BUILD_GUIDE.md) (detailed)
   - OR: [QUICK_START.md](QUICK_START.md) (simple)
2. Install Node.js
3. Run build commands
4. Get executable from `dist-electron/` folder
5. Done! ✅

**Time:** 15-20 minutes (includes setup)

---

### Path 4: Build on Linux/Mac

**Options:**
- Use GitHub Actions (Path 2) - **Recommended**
- Install Wine and build locally (See [BUILD_GUIDE.md](BUILD_GUIDE.md))
- Use a Windows VM

---

## 🎓 Learning Path

### Complete Beginner

1. Start with [README.md](README.md) - Understand what the app does
2. Try the [online demo](https://pawel-sokolowski.github.io/ManagmentApp/)
3. If you like it, use [GITHUB_ACTIONS_GUIDE.md](GITHUB_ACTIONS_GUIDE.md) to build
4. Install using [INSTALLATION_GUIDE.md](INSTALLATION_GUIDE.md)

### Semi-Technical User

1. [README.md](README.md) - Project overview
2. [QUICK_START.md](QUICK_START.md) - Build executable
3. [INSTALLATION_GUIDE.md](INSTALLATION_GUIDE.md) - Install and configure

### Developer

1. [README.md](README.md) - Project overview
2. [BUILD_GUIDE.md](BUILD_GUIDE.md) - Build system
3. Explore source code in `src/` and `server/`
4. Review `package.json` for scripts

---

## 🔍 Find Information By Topic

### Building

- **Basic build:** [QUICK_START.md](QUICK_START.md)
- **Detailed build:** [BUILD_GUIDE.md](BUILD_GUIDE.md)
- **Cloud build:** [GITHUB_ACTIONS_GUIDE.md](GITHUB_ACTIONS_GUIDE.md)
- **Build scripts:** `package.json` → `scripts` section

### Installation

- **User installation:** [INSTALLATION_GUIDE.md](INSTALLATION_GUIDE.md)
- **System requirements:** [README.md](README.md) + [INSTALLATION_GUIDE.md](INSTALLATION_GUIDE.md)
- **Troubleshooting:** [INSTALLATION_GUIDE.md](INSTALLATION_GUIDE.md) → Troubleshooting section

### Configuration

- **Electron config:** `package.json` → `build` section
- **Build config:** [vite.config.ts](vite.config.ts)
- **Database setup:** [scripts/setup-database.js](scripts/setup-database.js)
- **Environment variables:** [.env.example](.env.example)

### Features

- **Feature list:** [README.md](README.md) → Features section
- **Live demo:** https://pawel-sokolowski.github.io/ManagmentApp/
- **Screenshots:** [README.md](README.md)

---

## ❓ Common Questions

### Q: Where do I start?
**A:** Read [README.md](README.md) first, then choose your path above.

### Q: I don't have Windows, how do I build?
**A:** Use [GITHUB_ACTIONS_GUIDE.md](GITHUB_ACTIONS_GUIDE.md) - builds in the cloud for free!

### Q: Where's the .exe file?
**A:** Either download from [Releases](https://github.com/Pawel-Sokolowski/ManagmentApp/releases) or build it yourself (see paths above).

### Q: Is there a pre-built executable?
**A:** Check [Releases](https://github.com/Pawel-Sokolowski/ManagmentApp/releases). If not, use GitHub Actions to build one.

### Q: How long does building take?
**A:** 
- GitHub Actions: 5-10 minutes (waiting)
- Local build: 10-15 minutes (active work)

### Q: Can I build on Mac/Linux?
**A:** Yes! Use [GITHUB_ACTIONS_GUIDE.md](GITHUB_ACTIONS_GUIDE.md) for cloud building, or see [BUILD_GUIDE.md](BUILD_GUIDE.md) for Wine setup.

### Q: What if something breaks?
**A:** Each guide has a Troubleshooting section. Start there!

---

## 🛠️ Technical Documentation

For developers who want to understand the architecture:

### Project Structure
```
ManagmentApp/
├── src/                    # React frontend source
│   ├── components/        # React components
│   ├── pages/            # Page components
│   └── database/         # Database schemas
├── server/                # Express.js backend
├── public/               # Electron main process
│   ├── electron.js       # Main process
│   └── preload.js        # Preload script
├── scripts/              # Utility scripts
│   └── setup-database.js # DB setup
├── installer-resources/  # NSIS installer config
└── .github/workflows/    # GitHub Actions
    ├── build-windows.yml # Windows build
    └── release.yml       # Multi-platform release
```

### Build System
- **Frontend:** Vite + React + TypeScript
- **Backend:** Express.js + PostgreSQL
- **Desktop:** Electron
- **Installer:** electron-builder + NSIS

### Dependencies
See [package.json](package.json) for complete list.

---

## 📞 Getting Help

1. **Check documentation** - Most answers are here!
2. **Read the relevant guide** - Each guide has troubleshooting
3. **Search existing issues** on GitHub
4. **Create a new issue** with:
   - What you're trying to do
   - What went wrong
   - Error messages
   - What you've tried

---

## 🎉 Quick Links

- **Repository:** https://github.com/Pawel-Sokolowski/ManagmentApp
- **Releases:** https://github.com/Pawel-Sokolowski/ManagmentApp/releases
- **Live Demo:** https://pawel-sokolowski.github.io/ManagmentApp/
- **Issues:** https://github.com/Pawel-Sokolowski/ManagmentApp/issues

---

**Last Updated:** 2024
**Version:** 1.0.0

*Need something else? Open an issue and we'll add documentation for it!*
