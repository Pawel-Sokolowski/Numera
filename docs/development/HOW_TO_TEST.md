# How to Test the Fix

This document explains how to verify that the NSIS build errors have been fixed.

## Quick Test via GitHub Actions (Recommended)

1. **Navigate to GitHub Actions:**
   - Go to https://github.com/Pawel-Sokolowski/ManagmentApp
   - Click the **Actions** tab

2. **Run the Build Workflow:**
   - Select **Build Windows Executable** from the left sidebar
   - Click **Run workflow** button (top right)
   - Click the green **Run workflow** button in the dropdown

3. **Monitor the Build:**
   - Wait for the build to complete (usually 10-15 minutes)
   - Check that all steps complete successfully with green checkmarks

4. **Download and Test:**
   - Click on the completed workflow run
   - Scroll to **Artifacts** section at the bottom
   - Download `windows-installer`
   - Extract and test the installer

## Expected Build Output

If the fix is successful, you should see:
```
✓ built in 10.70s
• electron-builder  version=26.0.12
• loaded configuration  file=package.json ("build" field)
• packaging       platform=win32 arch=x64 electron=38.1.2
• building        target=nsis file=dist-electron\Office Management System Setup 1.0.0.exe
✓ Built successfully
```

## What Was Fixed

### Latest Fix: "MUI_HEADER_TEXT not found" Error
**Problem:** The custom NSIS script was using `!insertmacro MUI_HEADER_TEXT` but MUI2.nsh wasn't included.

**Solution:** Added `!include "MUI2.nsh"` to the custom script. NSIS include guards prevent duplicate definitions, so this is safe even though electron-builder also includes MUI2.nsh.

### Previous Fixes (Still Active)
The error was caused by the custom NSIS script redefining elements that electron-builder already provides. Previous fixes:

1. ✅ Removed `Name`, `OutFile`, `InstallDir`, etc. directives
2. ✅ Removed all standard MUI page macros
3. ✅ Removed all uninstaller page macros
4. ✅ Removed language definition (`MUI_LANGUAGE "English"`)

All custom functionality is preserved:
- Installation type selection (Desktop vs Server)
- .env file creation
- PostgreSQL check
- Custom post-installation page

## Local Testing (Windows Only)

If you have a Windows machine with Node.js installed:

```bash
# Clone the repository
git clone https://github.com/Pawel-Sokolowski/ManagmentApp.git
cd ManagmentApp

# Install dependencies
npm install

# Run the build
npm run dist-win
```

The installer will be created in `dist-electron/` directory.

## If the Build Still Fails

1. **Check the error message:**
   - Look for specific NSIS errors in the build log
   - Note the line number and error type

2. **Common issues:**
   - Missing dependencies: Run `npm install` again
   - Node.js version: Ensure you're using Node.js 18 or higher
   - Build cache: Try deleting `node_modules` and `dist-electron` folders, then reinstall

3. **Get help:**
   - Open a GitHub issue with the full error log
   - Include your operating system and Node.js version
   - Mention what step failed

## Documentation

For more details, see:
- `FIX_EXPLANATION.md` - Complete fix history and explanations
- `NSIS_FIX_SUMMARY.md` - Summary of all fixes applied
- `installer-resources/README.md` - NSIS script documentation

---

**Note:** The Windows NSIS build can only be fully tested on Windows or via GitHub Actions. The React build (`npm run build`) works on all platforms and has been verified.

1. **Go to your GitHub repository**
   - Navigate to: https://github.com/Pawel-Sokolowski/ManagmentApp

2. **Open the Actions tab**
   - Click on the "Actions" tab at the top

3. **Run the Build Windows Executable workflow**
   - Find "Build Windows Executable" in the left sidebar
   - Click "Run workflow" button (top right)
   - Select the branch: `copilot/fix-9bbe41f4-91cc-4516-b276-9a7c206625a9`
   - Click the green "Run workflow" button

4. **Wait for the build to complete**
   - The workflow should complete in about 5-10 minutes
   - ✅ SUCCESS: Build completes without errors
   - ❌ FAILURE: If it fails, check the error logs

5. **Download the installer**
   - Click on the completed workflow run
   - Scroll down to "Artifacts"
   - Download "windows-installer"
   - Extract and test the installer

## Expected Build Output

If the fix is successful, you should see:
```
✓ built in 10.70s
• electron-builder  version=26.0.12
• loaded configuration  file=package.json ("build" field)
• packaging       platform=win32 arch=x64 electron=38.1.2
• building        target=nsis file=dist-electron\Office Management System Setup 1.0.0.exe
✓ Built successfully
```

## What Was Fixed

The error was caused by the custom NSIS script redefining elements that electron-builder already provides. The fix:

1. ✅ Removed `!include "MUI2.nsh"` (electron-builder includes this)
2. ✅ Removed all standard MUI page macros
3. ✅ Removed all uninstaller page macros
4. ✅ Removed language definition (`MUI_LANGUAGE "English"`)

All custom functionality is preserved:
- Installation type selection (Desktop vs Server)
- .env file creation
- PostgreSQL check
- Custom post-installation page

## Local Testing (Windows Only)

If you have a Windows machine:

```bash
# Clone the repository
git clone https://github.com/Pawel-Sokolowski/ManagmentApp.git
cd ManagmentApp
git checkout copilot/fix-9bbe41f4-91cc-4516-b276-9a7c206625a9

# Install dependencies
npm install

# Build the Windows installer
npm run dist-win
```

The build should complete without the "can't load same language file twice" error.

## If the Build Still Fails

If you encounter any errors:

1. Check the full error log in GitHub Actions
2. Look for any new error messages
3. Compare with the expected output above
4. Open an issue on GitHub with:
   - The error message
   - The workflow run URL
   - Any additional context

## Documentation

For more details, see:
- `FIX_EXPLANATION.md` - Detailed explanation of the fix
- `NSIS_FIX_SUMMARY.md` - Complete fix history
- `installer-resources/README.md` - NSIS script documentation

---

**Note:** The Windows NSIS build can only be fully tested on Windows or via GitHub Actions. The React build (`npm run build`) works on all platforms and has been verified.
