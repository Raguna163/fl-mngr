
process.once('loaded', () => {
    const { contextBridge, ipcRenderer } = require("electron");
    const { readFileSync, existsSync, writeFileSync } = require("fs");
    const { join } = require("path");
    const REI = require('redux-electron-ipc');
    // Expose protected methods that allow the renderer process to use
    // the ipcRenderer without exposing the entire object
    contextBridge.exposeInMainWorld(
        "ipc", {
            createIpc: REI.default,
            sendIpc: REI.send,
            send: (channel, data) => ipcRenderer.send(channel, data),
            receive: (channel, fn) => ipcRenderer.on(channel, fn),
            icons: (e, { data, ID, side }) => {
                const CHUNK_SIZE = 0x8000; //arbitrary number
                let idx = 0, len = data.length, result = '', slice;
                while (idx < len) {
                    slice = data.subarray(idx, Math.min(idx + CHUNK_SIZE, len));
                    result += String.fromCharCode.apply(null, slice);
                    idx += CHUNK_SIZE;
                }
                const img = btoa(result);
                document
                    .getElementById(`pane-${side}`)
                    .getElementsByClassName(ID)[0]
                    .setAttribute('src', `data:image/jpeg;base64, ${img}`);
            }
    }
    );
    const settingsPath = join(process.env.APPDATA, 'fl-mngr', 'state.json');
    let initialState;
    if (!existsSync(settingsPath)) {
        const { HOMEDRIVE, HOMEPATH } = process.env;
        let homePath = join(HOMEDRIVE, HOMEPATH) + "\\"; 
        initialState = {
            directory: {
                left: homePath,
                right: homePath
            },
            settings: {
                multiPane: true,
                sidebar: false,
                thumbnails: true,
                left: {
                    splitView: false,
                    grid: true,
                    zoom: 1
                },
                right: {
                    splitView: true,
                    grid: false,
                    zoom: 1
                }
            }
        }
        writeFileSync(settingsPath, JSON.stringify(initialState, null, 2))
    }
    initialState = JSON.parse(readFileSync(settingsPath));
    contextBridge.exposeInMainWorld("initialState", initialState);
});