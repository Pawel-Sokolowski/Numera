# Fix for NSIS Build Errors - Complete History

## Latest Error (Current Fix)
### Problem: "macro named MUI_HEADER_TEXT not found"
The Windows installer build was failing with:
```
!insertmacro: macro named "MUI_HEADER_TEXT" not found!
!include: error in script: "installer-resources\installer.nsh" on line 26
```

### Root Cause
The custom NSIS script was using `!insertmacro MUI_HEADER_TEXT` in custom functions but did NOT include MUI2.nsh. While the previous fix removed MUI2.nsh to avoid "language file twice" errors, this was incorrect - the MUI macros are needed in custom functions.

### Solution
**Added back** `!include "MUI2.nsh"` to the custom script. NSIS header files use include guards, so including MUI2.nsh multiple times is safe:
- electron-builder's generated script includes MUI2.nsh
- Our custom script also includes MUI2.nsh
- NSIS's include guards prevent duplicate definitions
- MUI macros are now available in our custom functions

### Changes Made
**installer-resources/installer.nsh:**
- **Added:** `!include "MUI2.nsh"` (line 11, before LogicLib.nsh)

**installer-resources/README.md:**
- Updated to clarify that `!include "MUI2.nsh"` SHOULD be included
- Added troubleshooting section for "MUI_HEADER_TEXT not found" error

---

## Previous Error (Previously Fixed)
### Problem: "can't load same language file twice"
The Windows installer build was failing with:
```
Error: can't load same language file twice.
Error in macro MUI_LANGUAGEEX on macroline 13
Error in macro MUI_LANGUAGE on macroline 4
```

### Root Cause
The custom NSIS script was redefining elements that electron-builder's generated script already provides:
- Standard MUI pages (Welcome, Directory, InstFiles, Finish)
- Uninstaller pages (Confirm, InstFiles)
- Language definition (`!insertmacro MUI_LANGUAGE "English"`)

### Solution Applied (Still Valid)
Removed the following from custom script (these are correctly NOT included):
- `!insertmacro MUI_PAGE_WELCOME`
- `!insertmacro MUI_PAGE_DIRECTORY`
- `!insertmacro MUI_PAGE_INSTFILES`
- `!insertmacro MUI_PAGE_FINISH`
- `!insertmacro MUI_UNPAGE_CONFIRM`
- `!insertmacro MUI_UNPAGE_INSTFILES`
- `!insertmacro MUI_LANGUAGE "English"`

---

## What the Custom Script Should Contain

**DO Include:**
- `!include "MUI2.nsh"` - Needed for MUI macros in custom functions (safe due to include guards)
- `!include "LogicLib.nsh"` - Needed for ${If}, ${Else}, etc.
- Variable declarations (Var InstallationType, etc.)
- Custom page definitions (Page custom FunctionName)
- Custom functions (using MUI_HEADER_TEXT, nsDialogs, etc.)
- Custom install/uninstall macros

**DO NOT Include:**
- `Name`, `OutFile`, `InstallDir`, `RequestExecutionLevel` directives
- Standard MUI page macros (MUI_PAGE_WELCOME, etc.)
- Uninstaller page macros (MUI_UNPAGE_CONFIRM, etc.)
- Language definitions (MUI_LANGUAGE)
- Section "Install" or Section "Uninstall" (use macros instead)

---

## Why This Works
1. NSIS include files have include guards (similar to C/C++ `#pragma once`)
2. Including MUI2.nsh multiple times doesn't cause errors
3. Custom functions can use MUI macros like MUI_HEADER_TEXT
4. electron-builder's generated script provides the pages and language
5. Our custom script adds custom pages and functionality

---

## Verification
To test this fix:
1. Run `npm run build` (React build) ✅ Works
2. Run `npm run dist-win` on Windows or GitHub Actions (NSIS build) - should now succeed

## Key Takeaway
**When creating a custom NSIS script for electron-builder:**
- Include MUI2.nsh if you need MUI macros (safe due to include guards)
- Include LogicLib.nsh if you need conditional logic
- DO NOT define standard pages, languages, or installer directives
- Only add custom pages, variables, and installation logic
- Think of it as a "plugin" that extends electron-builder's generated script
