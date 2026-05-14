# CIRCUIT by Circle Pro Audio
## Complete Installation Guide (Mac & Windows)

---

## What you need first (one-time setup)

### 1. Install Node.js
Node.js is the engine that runs the build tools.

**Mac:**
- Go to https://nodejs.org
- Download the "LTS" version (big green button)
- Open the downloaded .pkg file and click through the installer
- When done, open **Terminal** (press Cmd+Space, type "Terminal", press Enter)
- Type: `node --version`  and press Enter
- You should see something like `v20.11.0` ✓

**Windows:**
- Go to https://nodejs.org
- Download the "LTS" version
- Run the installer (keep all defaults, make sure "Add to PATH" is checked)
- When done, open **Command Prompt** (press Win+R, type "cmd", press Enter)
- Type: `node --version` and press Enter
- You should see something like `v20.11.0` ✓

---

### 2. Get the CIRCUIT project folder

Put the CIRCUIT folder (the one containing package.json, main.js etc.) somewhere on your computer, for example:

- Mac: `/Users/yourname/Projects/CIRCUIT`
- Windows: `C:\Users\yourname\Projects\CIRCUIT`

---

## Building the app (step by step)

### Step 1 — Open Terminal / Command Prompt in the project folder

**Mac:**
- Open Terminal
- Type: `cd ` (with a space after cd)
- Drag the CIRCUIT folder into the Terminal window — it will type the path for you
- Press Enter

**Windows:**
- Open File Explorer
- Navigate into the CIRCUIT folder
- Click the address bar at the top, type `cmd`, press Enter
- A Command Prompt opens already inside the folder ✓

---

### Step 2 — Install dependencies

Type this and press Enter:
```
npm install
```

This downloads everything CIRCUIT needs (Electron, jsPDF, the Anthropic SDK, etc.).
It will take 1–3 minutes. You'll see a lot of text — that's normal.
When it stops and you see the `$` or `>` prompt again, it's done. ✓

---

### Step 3 — Test it first (run without installing)

Before building the installer, let's make sure it works:
```
npm start
```

CIRCUIT should open as a desktop window.
- Try dragging equipment into the rack
- Try clicking "⬇ Export PDF" — a real Save dialog should appear ✓
- Press Cmd+Q (Mac) or close the window to quit

---

### Step 4a — Build for Mac (.dmg)

```
npm run build:mac
```

This takes 2–5 minutes. When done, look in the `dist/` folder inside your project.
You'll find a file called something like:
```
CIRCUIT-1.0.0.dmg
```

**To install:**
- Double-click the .dmg file
- Drag CIRCUIT into your Applications folder
- Eject the disk image
- Open CIRCUIT from your Applications folder or Launchpad ✓

> **If Mac says "unidentified developer":**
> Right-click the app → Open → Open (you only need to do this once).
> This happens because the app isn't signed with an Apple Developer certificate yet.
> For a paid Apple Developer account ($99/year), we can remove this message permanently.

---

### Step 4b — Build for Windows (.exe installer)

```
npm run build:win
```

When done, look in the `dist/` folder. You'll find:
```
CIRCUIT Setup 1.0.0.exe
```

**To install:**
- Double-click the .exe
- Click through the installer (you can choose the install location)
- CIRCUIT appears in your Start Menu ✓

> **If Windows shows "Windows protected your PC":**
> Click "More info" → "Run anyway".
> This happens without a code signing certificate. Can be solved later.

---

### Step 5 — Add your Anthropic API key (for Claude features)

Once CIRCUIT is installed:
1. Open CIRCUIT
2. Click **⚙ Settings** in the top bar
3. Paste your Anthropic API key (get it from console.anthropic.com)
4. Click Save

Now the AI bar at the bottom of the sidebar is active. Try typing:
```
Add the Shure AD4D dual receiver
```
Claude will look it up and add it to your library instantly — no reinstall needed.

---

## Setting up auto-updates (optional, but recommended)

So Circle Pro Audio can push updates to all installed copies:

1. Create a free account at https://github.com
2. Create a new repository called `circuit-releases` (make it public)
3. In `package.json`, change `"owner": "circleproaudio"` to your GitHub username
4. When you build a new version, create a GitHub Release and upload the .dmg / .exe files
5. Electron will check for updates silently every time the app opens

---

## Project files location

When you save a rack project inside CIRCUIT, it goes to:
- **Mac:** `~/Documents/CIRCUIT Projects/ProjectName.circuit`
- **Windows:** `C:\Users\YourName\Documents\CIRCUIT Projects\ProjectName.circuit`

These are plain JSON files. You can email them, put them on Dropbox, back them up — anything.

---

## Building both Mac and Windows at once

```
npm run build:all
```

> Note: Building a .dmg requires a Mac. Building a .exe requires Windows.
> To build both from one machine, you'd need a CI service like GitHub Actions (we can set this up later).

---

## Quick reference

| Command | What it does |
|---|---|
| `npm install` | Download all dependencies (run once) |
| `npm start` | Run CIRCUIT without installing |
| `npm run build:mac` | Build the .dmg installer for Mac |
| `npm run build:win` | Build the .exe installer for Windows |
| `npm run build:all` | Build both at once |

---

## Common problems

**"electron: command not found"**
→ Run `npm install` again

**The app opens but shows a blank screen**
→ Run `npm start -- --dev` to see error messages

**PDF Save dialog doesn't appear**
→ Make sure you have equipment in the rack before clicking Export PDF

**Claude AI bar says "Set your API key"**
→ Click ⚙ Settings and paste your key from console.anthropic.com

---

*CIRCUIT by Circle Pro Audio — built with Electron + Claude API*
