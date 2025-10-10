# 🤖 Building Executables with GitHub Actions

**Don't have Windows? Don't want to install Node.js? No problem!**

GitHub Actions can build your Windows executable automatically in the cloud, even if you're on Mac or Linux!

---

## 🌟 What is GitHub Actions?

GitHub Actions is a free CI/CD service that runs builds on GitHub's servers. You can use it to:
- Build Windows executables from Mac or Linux
- Automatically build on every commit or tag
- Build manually whenever you want

**Best part?** It's completely free for public repositories!

---

## 🚀 Quick Start - Build Your Executable Now!

### Method 1: Manual Build (Easiest)

1. **Go to your GitHub repository:**
   - Visit: `https://github.com/YOUR-USERNAME/ManagmentApp`

2. **Navigate to Actions:**
   - Click the **"Actions"** tab at the top

3. **Find the workflow:**
   - Look for **"Build Windows Executable"** in the left sidebar
   - Click on it

4. **Run the workflow:**
   - Click **"Run workflow"** button (blue button on the right)
   - Select branch: `main`
   - Click the green **"Run workflow"** button

5. **Wait for build to complete:**
   - The build takes about 5-10 minutes
   - You'll see a yellow dot (building) or green checkmark (done)
   - Refresh the page to see updates

6. **Download your executable:**
   - Click on the completed workflow run
   - Scroll down to **"Artifacts"** section
   - Click **"Office-Management-System-Installer"** to download
   - Extract the ZIP file
   - Inside you'll find your `.exe` files!

---

### Method 2: Create a Release (Automatic Build)

This method creates a release and builds for Windows, Linux, and macOS.

1. **Create a new tag:**
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

2. **Or use GitHub UI:**
   - Go to repository
   - Click **"Releases"** on right sidebar
   - Click **"Draft a new release"**
   - Click **"Choose a tag"**
   - Type `v1.0.0` and click **"Create new tag"**
   - Fill in release title: `Office Management System v1.0.0`
   - Click **"Publish release"**

3. **GitHub Actions will automatically:**
   - Build Windows, Linux, and macOS executables
   - Upload them to the release
   - Create download links

4. **Download from release:**
   - Go to **"Releases"** section
   - Your executables will be attached to the release

---

## 📋 Detailed Instructions

### Prerequisites

- GitHub account (free)
- Your code pushed to GitHub
- GitHub Actions enabled (enabled by default)

### Setting Up (One-time Setup)

If you cloned this repository, GitHub Actions should already be configured. If not:

1. **Create workflow file:**
   - File is already at: `.github/workflows/build-windows.yml`

2. **Verify Actions are enabled:**
   - Go to repository **Settings**
   - Click **Actions** → **General**
   - Ensure **"Allow all actions and reusable workflows"** is selected

3. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Add GitHub Actions workflow"
   git push
   ```

---

## 🎯 Build Options

### Available Workflows

1. **Build Windows Executable** (`build-windows.yml`)
   - Builds Windows installer and portable version
   - Runs manually or on workflow_dispatch
   - Stores artifacts for 30 days

2. **Build and Release Installers** (`release.yml`)
   - Builds for all platforms (Windows, Linux, macOS)
   - Creates a GitHub release
   - Runs on version tags (`v*.*.*`)

### Choosing Your Build Method

**Use "Build Windows Executable" if:**
- ✅ You just want a Windows executable
- ✅ You want to test before releasing
- ✅ You're not ready for a release

**Use "Build and Release" if:**
- ✅ You want to create a release
- ✅ You want builds for all platforms
- ✅ You're ready to share with users

---

## 📥 Downloading Your Executable

### From Workflow Artifacts

1. Go to **Actions** tab
2. Click on your completed workflow run
3. Scroll to **"Artifacts"** section at bottom
4. Click artifact name to download (downloads as ZIP)
5. Extract ZIP file to get your `.exe` files

**Artifacts include:**
- `Office Management System Setup-1.0.0.exe` - Full installer
- `Office Management System-1.0.0-portable.exe` - Portable version

### From GitHub Releases

1. Go to **Releases** section (right sidebar)
2. Click on release version
3. Scroll to **"Assets"** section
4. Click on `.exe` file to download

---

## 🔧 Customizing the Build

### Edit Workflow File

The workflow is configured in `.github/workflows/build-windows.yml`. You can edit it to:

**Change Node.js version:**
```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '20'  # Change this number
```

**Add more build steps:**
```yaml
- name: Custom step
  run: echo "Your custom command here"
```

**Change retention period:**
```yaml
- name: Upload Windows Installer
  uses: actions/upload-artifact@v4
  with:
    retention-days: 30  # Change to 1-90 days
```

### Build Configuration

The build configuration is in `package.json` under the `build` section:

```json
{
  "build": {
    "appId": "com.office.management.system",
    "productName": "Office Management System",
    "win": {
      "target": ["nsis", "portable"]
    }
  }
}
```

Edit this to customize:
- App ID
- Product name
- Build targets
- Icons and resources

---

## ⚠️ Troubleshooting

### Build Fails

**Error: "npm ci failed"**
- **Solution:** Your `package-lock.json` might be out of date
- Run `npm install` locally and commit the updated file

**Error: "electron-builder failed"**
- **Solution:** Check the full error log
- Common issues:
  - Missing dependencies in package.json
  - Invalid build configuration
  - File path issues

**Error: "Artifact upload failed"**
- **Solution:** Check artifact size (max 2GB per artifact)
- Make sure files exist in `dist-electron/` folder

### Workflow Doesn't Appear

**If you don't see the workflow:**
1. Check file is in `.github/workflows/` folder
2. File must be valid YAML
3. Push to GitHub to activate
4. Go to Actions tab and refresh

### Can't Download Artifacts

**Artifacts not showing:**
- Wait for build to complete (green checkmark)
- You must be logged into GitHub
- Artifacts expire after retention period (default 30 days)

**Download is a ZIP file:**
- This is normal
- Extract the ZIP to get your `.exe` files

---

## 💰 GitHub Actions Limits

### Free Tier (Public Repositories)

- ✅ **Unlimited** builds per month
- ✅ **2000 minutes/month** for private repos
- ✅ Up to **20 concurrent jobs**
- ✅ Artifacts stored for **up to 90 days**

### Build Time

Typical build times:
- **Windows:** 5-8 minutes
- **Linux:** 4-6 minutes
- **macOS:** 8-12 minutes

---

## 🎓 Advanced Usage

### Scheduled Builds

Build every night at midnight:

```yaml
on:
  schedule:
    - cron: '0 0 * * *'  # Daily at midnight UTC
```

### Build on Every Commit

```yaml
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
```

### Matrix Builds

Build multiple versions:

```yaml
strategy:
  matrix:
    node-version: [18, 20]
    os: [windows-latest, ubuntu-latest, macos-latest]
```

### Using Secrets

For code signing or API keys:

1. Go to repository **Settings** → **Secrets**
2. Click **"New repository secret"**
3. Add your secret
4. Use in workflow:

```yaml
env:
  MY_SECRET: ${{ secrets.MY_SECRET }}
```

---

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Electron Builder Documentation](https://www.electron.build/)
- [GitHub Actions Marketplace](https://github.com/marketplace?type=actions)

---

## 🆘 Getting Help

If you have issues:

1. Check the workflow logs:
   - Go to Actions tab
   - Click failed run
   - Click failed job
   - Review error messages

2. Common solutions:
   - Re-run the workflow (sometimes random failures happen)
   - Update dependencies: `npm update`
   - Clear npm cache: `npm cache clean --force`

3. Ask for help:
   - Open an issue on GitHub
   - Include:
     - Workflow run URL
     - Error messages
     - Your changes (if any)

---

## 🎉 Success!

Once your build completes:

1. ✅ Download the artifact
2. ✅ Extract the ZIP file
3. ✅ You have your Windows executable!
4. ✅ Share with others or create a release

**No Windows PC required! No local build needed!**

---

**Last Updated:** 2024
**Version:** 1.0.0
