import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isDev = process.env.NODE_ENV === 'development';

class ElectronApp {
  constructor() {
    this.mainWindow = null
    this.initializeApp()
  }

  initializeApp() {
    // Handle app ready
    app.whenReady().then(() => {
      this.createMainWindow()
      
      app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
          this.createMainWindow()
        }
      })
    })

    // Handle app window closed
    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit()
      }
    })

    // Handle IPC messages
    this.setupIpcHandlers()
  }

  createMainWindow() {
    // Create the browser window
    this.mainWindow = new BrowserWindow({
      width: 400,
      height: 700,
      minWidth: 350,
      minHeight: 500,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        enableRemoteModule: false,
        preload: path.join(__dirname, 'preload.js')
      },
      titleBarStyle: 'default',
      show: false,
      icon: path.join(__dirname, 'public/icon.png')
    })

    // Load the app
    if (isDev) {
      this.mainWindow.loadURL('http://localhost:5173')
      // Open DevTools in development
      this.mainWindow.webContents.openDevTools()
    } else {
      this.mainWindow.loadFile(path.join(__dirname, 'dist/index.html'))
    }

    // Show window when ready
    this.mainWindow.once('ready-to-show', () => {
      this.mainWindow.show()
      
      // Focus on the window
      if (isDev) {
        this.mainWindow.focus()
      }
    })

    // Handle window closed
    this.mainWindow.on('closed', () => {
      this.mainWindow = null
    })
  }

  setupIpcHandlers() {
    // Handle requests from renderer process
    ipcMain.handle('app-version', () => {
      return app.getVersion()
    })

    ipcMain.handle('app-name', () => {
      return app.getName()
    })

    // Handle window controls
    ipcMain.handle('window-minimize', () => {
      if (this.mainWindow) {
        this.mainWindow.minimize()
      }
    })

    ipcMain.handle('window-maximize', () => {
      if (this.mainWindow) {
        if (this.mainWindow.isMaximized()) {
          this.mainWindow.unmaximize()
        } else {
          this.mainWindow.maximize()
        }
      }
    })

    ipcMain.handle('window-close', () => {
      if (this.mainWindow) {
        this.mainWindow.close()
      }
    })
  }
}

// Initialize the app
new ElectronApp()

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault()
    console.log('Blocked new window to: ', navigationUrl)
  })
})
