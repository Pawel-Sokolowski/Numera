# 🛠️ Building the Office Management System Executable

This guide provides detailed step-by-step instructions for building an executable (.exe) file for the Office Management System.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Build (Windows)](#quick-build-windows)
3. [Step-by-Step Instructions](#step-by-step-instructions)
4. [Build Options](#build-options)
5. [Troubleshooting](#troubleshooting)
6. [Understanding the Output](#understanding-the-output)

---

## Prerequisites

### Required Software

1. **Node.js** (v18 or higher)
   - Download from: https://nodejs.org/
   - Verify installation: Open Command Prompt and run `node --version`

2. **Git** (optional, for cloning)
   - Download from: https://git-scm.com/
   - Or download the repository as a ZIP file from GitHub

3. **Windows Operating System**
   - Windows 10 or Windows 11 (64-bit)
   - Building Windows executables is best done on Windows
   - Linux/Mac users: See [Building on Linux/Mac](#building-on-linuxmac) section

### System Requirements

- **RAM:** 4 GB minimum (8 GB recommended)
- **Disk Space:** ~2 GB free space for dependencies and build
- **Internet Connection:** Required for downloading dependencies

---

## Quick Build (Windows)

If you're comfortable with the command line, here's the quick version:

```bash
# 1. Clone or download the repository
git clone https://github.com/Pawel-Sokolowski/ManagmentApp.git
cd ManagmentApp

# 2. Install dependencies
npm install

# 3. Build the Windows installer
npm run dist-win
```

**The executable will be in:** `dist-electron/Office-Management-System-Setup-*.exe`

---

## Step-by-Step Instructions

### Step 1: Download the Repository

**Option A: Using Git**
1. Open Command Prompt or PowerShell
2. Navigate to where you want to download the project:
   ```bash
   cd C:\Users\YourName\Desktop
   ```
3. Clone the repository:
   ```bash
   git clone https://github.com/Pawel-Sokolowski/ManagmentApp.git
   ```
4. Enter the project folder:
   ```bash
   cd ManagmentApp
   ```

**Option B: Download ZIP**
1. Go to: https://github.com/Pawel-Sokolowski/ManagmentApp
2. Click the green "Code" button
3. Click "Download ZIP"
4. Extract the ZIP file to a folder (e.g., `C:\Users\YourName\Desktop\ManagmentApp`)
5. Open Command Prompt and navigate to the extracted folder:
   ```bash
   cd C:\Users\YourName\Desktop\ManagmentApp
   ```

### Step 2: Install Dependencies

This step downloads all required libraries and tools. It takes about 2-5 minutes.

```bash
npm install
```

You'll see progress messages. Wait until you see a message like:
```
added 706 packages, and audited 707 packages in 35s
```

**Common Issues:**
- If you see "npm not found", Node.js is not installed correctly
- If installation fails, try running Command Prompt as Administrator

### Step 3: Build the Application

Now build the React application:

```bash
npm run build
```

This compiles your web application and takes about 10-30 seconds. You'll see:
```
✓ built in 6.93s
```

### Step 4: Create the Windows Installer

Build the complete Windows installer with Electron:

```bash
npm run dist-win
```

This process:
- Packages the application with Electron
- Downloads Windows-specific dependencies
- Creates both an installer and a portable version
- Takes about 2-5 minutes

You'll see progress messages like:
```
• packaging       platform=win32 arch=x64 electron=38.1.2
• building        target=nsis file=dist-electron/Office-Management-System-Setup-*.exe
```

### Step 5: Find Your Executable

After building completes, your executable files will be in the `dist-electron` folder:

```
dist-electron/
├── Office-Management-System-Setup-1.0.0.exe    ← Full installer (recommended)
├── Office-Management-System-1.0.0-portable.exe ← Portable version
└── win-unpacked/                                ← Unpacked application files
```

**Which file to use?**

- **Office-Management-System-Setup-1.0.0.exe** - Full installer with desktop shortcuts and uninstaller
- **Office-Management-System-1.0.0-portable.exe** - No installation needed, runs directly

---

## Build Options

### Build Different Formats

**Windows Installer (NSIS):**
```bash
npm run dist-win
```

**Portable Executable:**
The portable version is automatically created with `npm run dist-win`

**All Platforms:**
```bash
npm run dist        # Builds for your current platform
```

**Individual Platforms:**
```bash
npm run dist-win    # Windows
npm run dist-mac    # macOS (only works on Mac)
npm run dist-linux  # Linux
```

### Build for Development

Test the application without building an installer:

```bash
npm run electron-dev
```

This opens the application in development mode with hot-reload enabled.

---

## Troubleshooting

### Issue: "npm is not recognized"

**Solution:** Node.js is not installed or not in your PATH
1. Download and install Node.js from https://nodejs.org/
2. Restart your Command Prompt
3. Try again

### Issue: "electron-builder not found"

**Solution:** Dependencies not installed
```bash
npm install
```

### Issue: Build fails with "Permission Denied"

**Solution:** Run Command Prompt as Administrator
1. Right-click on Command Prompt
2. Select "Run as administrator"
3. Navigate to your project folder
4. Try building again

### Issue: "Cannot find module"

**Solution:** Clean install
```bash
# Delete node_modules and package-lock.json
rmdir /s /q node_modules
del package-lock.json

# Reinstall
npm install
npm run dist-win
```

### Issue: Antivirus blocks the executable

**Solution:** This is common with unsigned executables
1. Add an exception to your antivirus
2. Or sign the executable (requires a code signing certificate)

### Issue: Build runs out of memory

**Solution:** Increase Node.js memory
```bash
set NODE_OPTIONS=--max-old-space-size=4096
npm run dist-win
```

---

## Understanding the Output

### File Structure

After building, you'll have:

```
ManagmentApp/
├── build/              ← Compiled React application
├── dist-electron/      ← Electron executables
│   ├── *.exe          ← Your installers!
│   └── win-unpacked/  ← Unpacked application
├── node_modules/       ← Dependencies (can be deleted after build)
└── ...
```

### Installer Types

**NSIS Installer (.exe)**
- Full Windows installer
- Creates Start Menu shortcuts
- Includes uninstaller
- Recommended for end users

**Portable (.exe)**
- No installation required
- Can run from USB drive
- No registry entries
- Good for testing

### File Sizes

- **Installer:** ~120-150 MB
- **Portable:** ~120-150 MB
- **Unpacked:** ~300-400 MB

The executables are large because they include:
- Electron runtime (Chromium + Node.js)
- Your application code
- All dependencies

---

## Building on Linux/Mac

Building Windows executables on Linux/Mac requires additional setup.

### Option 1: Using Wine (Linux)

```bash
# Install Wine
sudo apt-get install wine64

# Then build normally
npm run dist-win
```

### Option 2: Use a Windows VM

1. Install VirtualBox or VMware
2. Create a Windows 10/11 VM
3. Follow the Windows build instructions

### Option 3: Use GitHub Actions (Recommended)

Create a GitHub Actions workflow to build on Windows runners:

1. Push your code to GitHub
2. GitHub Actions will build automatically
3. Download the executable from the Actions artifacts

See `.github/workflows/build.yml` for an example (if available).

---

## Advanced Options

### Customizing the Build

Edit the `build` section in `package.json` to customize:

- **Application name:** Change `productName`
- **Application ID:** Change `appId`
- **Icon:** Add custom icon files
- **Installer options:** Modify `nsis` section

Example:
```json
"build": {
  "appId": "com.yourcompany.office",
  "productName": "My Office App",
  "nsis": {
    "oneClick": false,
    "allowToChangeInstallationDirectory": true
  }
}
```

### Code Signing

To remove "Unknown Publisher" warnings:

1. Obtain a code signing certificate
2. Add to your `package.json`:
```json
"win": {
  "certificateFile": "path/to/cert.pfx",
  "certificatePassword": "your-password"
}
```

---

## Next Steps

After building your executable:

1. **Test it:** Run the installer on a clean Windows machine
2. **Share it:** Upload to GitHub Releases or your website
3. **Update documentation:** Update README.md with download links

### Creating a GitHub Release

1. Go to your repository on GitHub
2. Click "Releases" → "Draft a new release"
3. Create a tag (e.g., `v1.0.0`)
4. Upload your `.exe` files
5. Publish the release

---

## Additional Resources

- **Electron Builder Documentation:** https://www.electron.build/
- **Electron Documentation:** https://www.electronjs.org/docs
- **Node.js Documentation:** https://nodejs.org/docs

---

## Getting Help

If you encounter issues:

1. Check the [Troubleshooting](#troubleshooting) section above
2. Search existing issues on GitHub
3. Create a new issue with:
   - Your operating system
   - Node.js version (`node --version`)
   - Complete error message
   - Steps you've tried

---

**Last Updated:** 2024
**Version:** 1.0.0
