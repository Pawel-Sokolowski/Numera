# 🚀 Quick Start Guide - For Non-Technical Users

**Want to get the Office Management System running? Follow these simple steps!**

---

## 🎯 What You Need

1. A Windows computer (Windows 10 or 11)
2. About 10 minutes of time
3. Internet connection

---

## 📝 Simple Steps

### Step 1: Install Node.js

Node.js is required to build the application.

1. Go to: **https://nodejs.org/**
2. Click the big green button that says **"Download Node.js (LTS)"**
3. Run the downloaded installer
4. Click "Next" through all the steps (keep default settings)
5. Click "Finish" when done

**How to check it worked:**
- Press `Windows Key + R`
- Type `cmd` and press Enter
- Type `node --version` and press Enter
- You should see something like `v20.10.0`

---

### Step 2: Download This Project

**Easy Way (No Git Required):**

1. Go to: **https://github.com/Pawel-Sokolowski/ManagmentApp**
2. Click the green **"Code"** button
3. Click **"Download ZIP"**
4. Find the downloaded ZIP file (usually in your Downloads folder)
5. Right-click the ZIP file and select **"Extract All..."**
6. Extract to your Desktop for easy access

**You should now have a folder called** `ManagmentApp-main` **on your Desktop**

---

### Step 3: Open Command Prompt

1. Press `Windows Key + R` on your keyboard
2. Type `cmd` and press Enter
3. A black window will open (this is Command Prompt)

---

### Step 4: Navigate to the Project Folder

In the Command Prompt window, type these commands (press Enter after each):

```bash
cd Desktop\ManagmentApp-main
```

If you extracted to a different location, replace `Desktop\ManagmentApp-main` with your actual path.

---

### Step 5: Install Required Files

In Command Prompt, type:

```bash
npm install
```

Then press Enter and wait. This will:
- Download all required files
- Take about 2-5 minutes
- Show lots of text scrolling by (this is normal!)

**Wait until you see:** `added 706 packages` or similar

---

### Step 6: Build the Application

Now type:

```bash
npm run dist-win
```

Then press Enter and wait. This will:
- Build your executable file
- Take about 3-5 minutes
- Show progress messages

**What's happening:**
- Building the application...
- Packaging with Electron...
- Creating installer...

---

### Step 7: Find Your Executable

**Success! Your executable is ready!**

Find your files here:
```
Desktop\ManagmentApp-main\dist-electron\
```

Look for:
- **Office-Management-System-Setup-1.0.0.exe** ← This is your installer!

---

## ✅ You're Done!

You now have an executable file you can:
- Run on any Windows computer
- Share with others
- Install like any other Windows application

---

## 🎉 How to Install and Run

1. **Double-click** the `.exe` file
2. If Windows asks "Do you want to allow this app...", click **Yes**
3. Follow the installation wizard
4. Choose installation type (Desktop or Server)
5. Wait for installation to complete
6. Launch the application!

---

## 🐛 Something Not Working?

### "npm is not recognized"
➡️ Node.js is not installed correctly. Go back to Step 1.

### "Cannot find module"
➡️ The installation didn't complete. Try these commands:
```bash
rmdir /s /q node_modules
npm install
```

### "Access denied" or "Permission denied"
➡️ Run Command Prompt as Administrator:
1. Press Windows Key
2. Type `cmd`
3. Right-click "Command Prompt"
4. Select "Run as administrator"
5. Try the commands again

### Build takes forever or freezes
➡️ This can happen. Just wait 5-10 minutes. It will complete.

### Antivirus blocks the .exe file
➡️ This is normal for unsigned executables. Add an exception in your antivirus.

---

## 💡 Tips

**Tip 1:** Keep the Command Prompt window open while building

**Tip 2:** Don't touch or close any windows that pop up during the build

**Tip 3:** Make sure you have a stable internet connection for Step 5

**Tip 4:** If something fails, close Command Prompt and start over from Step 3

---

## 📁 What Do All These Files Mean?

After building, you'll have these folders:

- **`dist-electron/`** - Your executable files are here! ⭐
- **`build/`** - Compiled web files (you can ignore this)
- **`node_modules/`** - Dependencies (can delete after building to save space)

---

## 🔄 Want to Rebuild?

If you make changes and want to rebuild:

```bash
cd Desktop\ManagmentApp-main
npm run dist-win
```

That's it!

---

## 🆘 Still Need Help?

1. Read the detailed **BUILD_GUIDE.md** in this folder
2. Check **INSTALLATION_GUIDE.md** for installation help
3. Ask for help on GitHub Issues

---

## 🌟 Sharing Your Executable

Want to share your executable with others?

1. Upload to Google Drive / Dropbox
2. Or create a GitHub Release:
   - Go to your GitHub repository
   - Click "Releases"
   - Click "Create a new release"
   - Upload your `.exe` file
   - Publish!

---

**You did it! 🎊**

You've successfully built a Windows executable for the Office Management System!

