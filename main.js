const { app, BrowserWindow, Menu, dialog, ipcMain } = require('electron');
const path = require('path');
const isDev = true;

let mainWindow;

// Menu Template
const template = [
    {
        label: 'File',
        submenu: [
            {
                label: 'Open Folder',
                accelerator: 'Ctrl+Shift+O',
                click: async () => {
                    const { filePaths } = await dialog.showOpenDialog(
                        { properties: ['openDirectory'] }
                    )
                    const location = filePaths[0];
                    mainWindow.webContents.send('openFolder', location, true)
                }
            },
            {
                label: 'Open File',
                accelerator: 'Ctrl+O',
                click: async () => {
                    const { filePaths } = await dialog.showOpenDialog(
                        { properties: ['openFile'] }
                    );
                    const location = filePaths[0];
                    mainWindow.webContents.send('file', location)
                }
            },
            { type: 'separator' },
            {
                label: 'Sidebar',
                accelerator: 'Ctrl+Shift+B',
                click: () => {
                    mainWindow.webContents.send('sidebar')
                }
            },
        ]
    },
    { role: 'editMenu' },
    { role: 'windowMenu' },
]


function createWindow() {
    // Create new BrowserWindow
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        minWidth: 800,
        minHeight: 600,
        title: 'Text Editor',
        icon: 'icon.png',
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            devTools: isDev
        }
    })

    // Load file
    mainWindow.loadFile(path.join(__dirname, 'index.html'))

    if (isDev) {
        template.push({ role: 'viewMenu' })
    }

    // Create custom Menu
    const menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)
}

ipcMain.on('reload', () => {
    mainWindow.webContents.reload();
})

ipcMain.on('setWindowTitle', (event, title) => {
    mainWindow.setTitle(title)
})

// Create window
app.whenReady().then(() => {
    createWindow();
}).catch(err => console.log(err))
