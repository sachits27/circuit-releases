/**
 * CIRCUIT by Circle Pro Audio
 * Electron Main Process
 *
 * Handles: window management, native file dialogs,
 * Claude API calls (key stays secure here, never in renderer),
 * auto-updates, and persistent settings.
 */

const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');
const fs = require('fs');

// ─── Persistent settings (API key, preferences) ───────────────────────────
// electron-store saves to ~/Library/Application Support/CIRCUIT/config.json
let store;

// ─── Window ────────────────────────────────────────────────────────────────
let mainWindow;

function createWindow() {
  const bounds = store.get('windowBounds');

  mainWindow = new BrowserWindow({
    width: bounds.width,
    height: bounds.height,
    minWidth: 900,
    minHeight: 600,
    titleBarStyle: 'hiddenInset',   // macOS: traffic lights inset into app
    backgroundColor: '#111111',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,       // security: renderer can't access Node directly
      nodeIntegration: false
    },
    show: false                     // don't flash blank window on launch
  });

  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));

  // Show once ready to avoid white flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    // Check for updates silently 3 seconds after launch
    setTimeout(() => autoUpdater.checkForUpdatesAndNotify(), 3000);
  });

  // Save window size on resize
  mainWindow.on('resize', () => {
    store.set('windowBounds', mainWindow.getBounds());
  });

  // Open DevTools in development
  if (process.argv.includes('--dev')) {
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  }
}

app.whenReady().then(async () => {
  const Store = (await import('electron-store')).default;
  store = new Store({
    defaults: {
      anthropicApiKey: '',
      windowBounds: { width: 1280, height: 800 },
      theme: 'light'
    }
  });
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// ─── IPC: PDF Save ─────────────────────────────────────────────────────────
// Renderer sends the raw PDF bytes, we show a native Save dialog.
// This is why the PDF download works perfectly in the desktop app — 
// we have full filesystem access here.
ipcMain.handle('save-pdf', async (event, { base64Data, defaultName }) => {
  const { filePath, canceled } = await dialog.showSaveDialog(mainWindow, {
    title: 'Save Rack PDF',
    defaultPath: path.join(app.getPath('documents'), defaultName),
    filters: [{ name: 'PDF Document', extensions: ['pdf'] }]
  });

  if (canceled || !filePath) return { success: false, reason: 'cancelled' };

  try {
    const buffer = Buffer.from(base64Data, 'base64');
    fs.writeFileSync(filePath, buffer);
    // Open the saved file in the system PDF viewer
    shell.openPath(filePath);
    return { success: true, filePath };
  } catch (err) {
    return { success: false, reason: err.message };
  }
});

// ─── IPC: Claude API ───────────────────────────────────────────────────────
// The API key lives in main — the renderer never sees it.
// This is the secure pattern for Electron apps.
ipcMain.handle('claude-query', async (event, { prompt, systemPrompt }) => {
  const apiKey = store.get('anthropicApiKey');
  if (!apiKey) {
    return { error: 'No API key set. Go to Settings → Add your Anthropic API key.' };
  }

  try {
    const Anthropic = require('@anthropic-ai/sdk');
    const client = new Anthropic.default({ apiKey });

    const message = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 1024,
      system: systemPrompt || 'You are CIRCUIT\'s equipment assistant for Circle Pro Audio. Return responses as valid JSON only, no markdown.',
      messages: [{ role: 'user', content: prompt }]
    });

    return { success: true, text: message.content[0].text };
  } catch (err) {
    return { error: err.message };
  }
});

// ─── IPC: Settings ─────────────────────────────────────────────────────────
ipcMain.handle('get-settings', () => {
  return {
    anthropicApiKey: store.get('anthropicApiKey') ? '••••••••••••' : '',
    hasApiKey: !!store.get('anthropicApiKey'),
    theme: store.get('theme')
  };
});

ipcMain.handle('save-settings', (event, { anthropicApiKey, theme }) => {
  if (anthropicApiKey && !anthropicApiKey.startsWith('•')) {
    store.set('anthropicApiKey', anthropicApiKey);
  }
  if (theme) store.set('theme', theme);
  return { success: true };
});

// ─── IPC: Projects (file-based) ────────────────────────────────────────────
// Projects save as .circuit JSON files — much better than browser localStorage.
const projectsDir = () => path.join(app.getPath('documents'), 'CIRCUIT Projects');

ipcMain.handle('save-project', async (event, { name, data }) => {
  const dir = projectsDir();
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const filePath = path.join(dir, `${name}.circuit`);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  return { success: true, filePath };
});

ipcMain.handle('load-project', async (event, { name }) => {
  const filePath = path.join(projectsDir(), `${name}.circuit`);
  if (!fs.existsSync(filePath)) return { error: 'Project not found' };
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  return { success: true, data };
});

ipcMain.handle('list-projects', async () => {
  const dir = projectsDir();
  if (!fs.existsSync(dir)) return { projects: [] };
  const files = fs.readdirSync(dir)
    .filter(f => f.endsWith('.circuit'))
    .map(f => f.replace('.circuit', ''));
  return { projects: files };
});

ipcMain.handle('open-project-folder', async () => {
  const dir = projectsDir();
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  shell.openPath(dir);
  return { success: true };
});

// ─── Auto-updater events ───────────────────────────────────────────────────
autoUpdater.on('update-available', (info) => {
  mainWindow?.webContents.send('update-available', info);
});

autoUpdater.on('update-downloaded', (info) => {
  mainWindow?.webContents.send('update-downloaded', info);
});

ipcMain.handle('install-update', () => {
  autoUpdater.quitAndInstall();
});
