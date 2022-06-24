const { app, BrowserWindow, ipcMain, screen, shell } = require('electron');

let Window;

async function createWindow(x,y) {
    const path = require('path');
    Window = new BrowserWindow({
        x,y,
        show: false,
        frame: false,
        width: 1200,
        height: 800,
        minWidth: 600,
        minHeight: 600,
        icon: path.join(__dirname, 'icon.png'),
        webPreferences: {
            webSecurity: true,
            contextIsolation: true,
            worldSafeExecuteJavaScript: true,
            enableRemoteModule: false,
            preload: path.join(__dirname, '/preload.js')
        }
    });
    Window.on('closed', () => Window = null);
    Window.once('ready-to-show', Window.show);
    if (require('electron-is-dev')) {
        Window.loadURL("http://localhost:3000");
        // React Devtools
        let extFolder = "fmkadmapgofadopljbjfkapdkoienihi";
        let extVersion = "4.24.7_0"
        let reactDevToolsPath = `Google\\Chrome\\User Data\\Default\\Extensions\\${extFolder}\\${extVersion}`
        Window.webContents.session.loadExtension(path.join(process.env.LOCALAPPDATA, reactDevToolsPath));
    } else {
        Window.loadURL(require('url').format({
            pathname: path.join(__dirname, '/../build/index.html'),
            protocol: 'file:',
            slashes: true
        }));
    }
}

app.whenReady().then(async () => {
    let offset = 40;
    let displays = screen.getAllDisplays();
    let externalDisplay = displays.find(({bounds}) => bounds.x !== 0 || bounds.y !== 0);
    if (externalDisplay) createWindow(externalDisplay.bounds.x + offset, externalDisplay.bounds.y + offset);
    else createWindow(0,0);
    ipcEventHandlers();
});

app.on('window-all-closed', () => app.quit());

async function ipcEventHandlers () {
    const FileIPC = require('./ipcFile');
    const { copy } = require('copy-paste');
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
    ipcMain.on('open:git', () => { shell.openExternal("https://github.com/Raguna163/fl-mngr") });
    
    ipcMain.on('save:settings', FileIPC.saveSettings);
    ipcMain.on('read:dir', FileIPC.readDir);
    ipcMain.on('copy:items', FileIPC.copyItems);
    ipcMain.on('move:items', FileIPC.moveItems);
    ipcMain.on('rename:file', FileIPC.renameFile);
    ipcMain.on('new:item', FileIPC.newItem);
    ipcMain.on('delete:items', FileIPC.deleteItems);

    ipcMain.on('preview:file', FileIPC.previewFile);
    ipcMain.on('img:icon', FileIPC.imgIcon);
}