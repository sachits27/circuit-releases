/**
 * CIRCUIT Preload Script
 *
 * This is the secure bridge between the Electron main process (Node.js)
 * and the renderer (your HTML/JS app). It exposes only the specific
 * functions the renderer needs — nothing more.
 *
 * contextBridge means the renderer can call window.circuit.savePDF()
 * but has zero access to Node.js, the filesystem, or the API key.
 */

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('circuit', {

  // ── PDF: native Save dialog ──────────────────────────────────────────────
  // base64Data: jsPDF output('datauristring') stripped of the data: prefix
  // Returns { success, filePath } or { success: false, reason }
  savePDF: (base64Data, defaultName) =>
    ipcRenderer.invoke('save-pdf', { base64Data, defaultName }),

  // ── Claude API ───────────────────────────────────────────────────────────
  // prompt: the user message
  // systemPrompt: optional custom system prompt
  // Returns { success, text } or { error }
  claudeQuery: (prompt, systemPrompt) =>
    ipcRenderer.invoke('claude-query', { prompt, systemPrompt }),

  // ── Settings ─────────────────────────────────────────────────────────────
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),

  // ── Projects (real files in ~/Documents/CIRCUIT Projects/) ───────────────
  saveProject: (name, data) => ipcRenderer.invoke('save-project', { name, data }),
  loadProject: (name) => ipcRenderer.invoke('load-project', { name }),
  listProjects: () => ipcRenderer.invoke('list-projects'),
  openProjectFolder: () => ipcRenderer.invoke('open-project-folder'),
  openClaudeLog: () => ipcRenderer.invoke('open-claude-log'),

  // ── Auto-updater ─────────────────────────────────────────────────────────
  installUpdate: () => ipcRenderer.send('install-update'),
  onUpdateAvailable: (cb) => ipcRenderer.on('update-available', (_, info) => cb(info)),
  onUpdateDownloaded: (cb) => ipcRenderer.on('update-downloaded', (_, info) => cb(info)),

  // ── Platform info ────────────────────────────────────────────────────────
  platform: process.platform   // 'darwin' | 'win32' | 'linux'
});
