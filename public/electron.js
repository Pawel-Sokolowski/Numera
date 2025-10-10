const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const isDev = process.env.NODE_ENV === 'development';

// Keep a global reference of the window object and server process
let mainWindow;
let serverProcess;

function startBackendServer() {
  // Start the Express server as a child process
  const serverPath = path.join(__dirname, '../server/index.js');
  serverProcess = spawn('node', [serverPath], {
    stdio: ['pipe', 'pipe', 'pipe'],
    env: { ...process.env, NODE_ENV: 'production' }
  });

  serverProcess.stdout.on('data', (data) => {
    console.log(`Server: ${data}`);
  });

  serverProcess.stderr.on('data', (data) => {
    console.error(`Server Error: ${data}`);
  });

  serverProcess.on('close', (code) => {
    console.log(`Server process exited with code ${code}`);
  });

  return new Promise((resolve) => {
    // Wait a bit for the server to start
    setTimeout(resolve, 3000);
  });
}

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'assets/icon.png'), // Add icon when available
    titleBarStyle: 'default',
    show: false // Don't show until ready
  });

  // Load the app
  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    // Open DevTools in development
    mainWindow.webContents.openDevTools();
  } else {
    // In production, load from the local server
    mainWindow.loadURL('http://localhost:3001');
  }

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Emitted when the window is closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    require('electron').shell.openExternal(url);
    return { action: 'deny' };
  });
}

// This method will be called when Electron has finished initialization
app.whenReady().then(async () => {
  if (!isDev) {
    // Start backend server in production
    await startBackendServer();
  }
  createWindow();
});

// Quit when all windows are closed
app.on('window-all-closed', () => {
  // Kill server process when app is closing
  if (serverProcess) {
    serverProcess.kill();
  }
  
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC handlers for database operations
ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle('show-message-box', async (event, options) => {
  const result = await dialog.showMessageBox(mainWindow, options);
  return result;
});

ipcMain.handle('show-save-dialog', async (event, options) => {
  const result = await dialog.showSaveDialog(mainWindow, options);
  return result;
});

ipcMain.handle('show-open-dialog', async (event, options) => {
  const result = await dialog.showOpenDialog(mainWindow, options);
  return result;
});

// Handle database-related IPC calls
ipcMain.handle('db-query', async (event, query, params) => {
  try {
    // Forward to local API server
    const fetch = require('node-fetch');
    const response = await fetch('http://localhost:3001/api/db-query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, params })
    });
    return await response.json();
  } catch (error) {
    console.error('Database query error:', error);
    return { success: false, error: error.message };
  }
});

// Database setup wizard handlers
ipcMain.handle('db-setup-check', async () => {
  try {
    const DatabaseSetupWizard = require(path.join(__dirname, '../scripts/database-setup-wizard.js'));
    const wizard = new DatabaseSetupWizard();
    const result = await wizard.validateSetup();
    return result;
  } catch (error) {
    console.error('Database setup check error:', error);
    return { 
      valid: false, 
      requiresSetup: true, 
      message: error.message 
    };
  }
});

ipcMain.handle('db-setup-test-connection', async (event, config) => {
  try {
    const DatabaseSetupWizard = require(path.join(__dirname, '../scripts/database-setup-wizard.js'));
    const wizard = new DatabaseSetupWizard();
    const result = await wizard.checkDatabaseConnection(config);
    return result;
  } catch (error) {
    console.error('Connection test error:', error);
    return { success: false, message: error.message };
  }
});

ipcMain.handle('db-setup-run', async (event, config) => {
  try {
    const DatabaseSetupWizard = require(path.join(__dirname, '../scripts/database-setup-wizard.js'));
    const wizard = new DatabaseSetupWizard();
    const result = await wizard.runSetup(config);
    return result;
  } catch (error) {
    console.error('Database setup error:', error);
    return { 
      success: false, 
      steps: [{ name: 'Error', status: 'failed', message: error.message }]
    };
  }
});

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault();
    require('electron').shell.openExternal(navigationUrl);
  });
});