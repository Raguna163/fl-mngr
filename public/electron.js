const { app, BrowserWindow, ipcMain, screen } = require('electron');
const path = require('path');
const url = require('url');
const isDev = require('electron-is-dev');
const { copy } = require('copy-paste');
const FileIPC = require('./ipcFile');
// require('electron-debug')()

let Window;

async function createWindow(x,y) {
    Window = new BrowserWindow({
        x,y,
        frame: false,
        width: 1200,
        height: 800,
        minWidth: 600,
        minHeight: 600,
        icon: path.join(__dirname, 'fl-icon.png'),
        webPreferences: {
            webSecurity: true,
            contextIsolation: true,
            worldSafeExecuteJavaScript: true,
            enableRemoteModule: false,
            preload: path.join(__dirname, (isDev ? "" : '/../build') + '/preload.js')
        }
    });
    Window.on('closed', () => Window = null);
    let fileURL = url.format({
            pathname: path.join(__dirname, '/../build/index.html'),
            protocol: 'file:',
            slashes: true
    });
    Window.loadURL(isDev ? "http://localhost:3000" : fileURL);

    // React Devtools
    // let reactDevToolsPath = "Google\\Chrome\\User Data\\Default\\Extensions\\fmkadmapgofadopljbjfkapdkoienihi\\4.8.2_0"
    // Window.webContents.session.loadExtension(path.join(process.env.LOCALAPPDATA, reactDevToolsPath));
}

app.whenReady().then(() => {
    let offset = 40;
    let displays = screen.getAllDisplays();
    let externalDisplay = displays.find(({bounds}) => bounds.x !== 0 || bounds.y !== 0);
    if (externalDisplay) createWindow(externalDisplay.bounds.x + offset, externalDisplay.bounds.y + offset);
    else createWindow(0,0);
});

app.on('window-all-closed', () => app.quit());

ipcMain.on('window:control', (e, type) => {
    switch (type) {
        case "compress":
            Window.setFullScreen(false);
            break;
        case "expand":
            Window.setFullScreen(true);
            break;
        default:
            Window[type]()
            break;
    }
});

ipcMain.on('copy:clipboard', (e, target) => copy(target));

ipcMain.on('open:file', FileIPC.openFile);
ipcMain.on('open:with', FileIPC.openWith);
ipcMain.on('open:explorer', FileIPC.openExplorer);

ipcMain.on('read:dir', FileIPC.readDir);
ipcMain.on('copy:items', FileIPC.copyItems);
ipcMain.on('move:items', FileIPC.moveItems);
ipcMain.on('rename:file', FileIPC.renameFile);
ipcMain.on('new:item', FileIPC.newItem);
ipcMain.on('delete:items', FileIPC.deleteItems);

ipcMain.on('preview:file', FileIPC.previewFile);
ipcMain.on('img:icon', FileIPC.imgIcon);