process.once('loaded', () => {
    const { contextBridge, ipcRenderer } = require("electron");
    const { readFileSync, existsSync, writeFileSync } = require("fs");
    const { join } = require("path");
    const REI = require('redux-electron-ipc');
    // Expose protected methods that allow the renderer process to use
    // the ipcRenderer without exposing the entire object
    const ipcObject = {
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
    contextBridge.exposeInMainWorld( "ipc", ipcObject);

    // Checks if saved state already exists, if not initialize one
    const settingsPath = join(process.env.APPDATA, 'fl-mngr', 'state.json');
    let initialState;
    if (!existsSync(settingsPath)) {
        initialState = initializeState();
        writeFileSync(settingsPath, JSON.stringify(initialState, null, 2))
    }
    initialState = JSON.parse(readFileSync(settingsPath));
    contextBridge.exposeInMainWorld("initialState", initialState);
});

function initializeState() {
    const { join } = require("path");
    const { HOMEDRIVE, HOMEPATH } = process.env;
    let homePath = join(HOMEDRIVE, HOMEPATH) + "\\";
    return {
        directory: {
            left: homePath,
            right: homePath,
            favourites: [],
            drives: false
        },
        settings: {
            multiPane: true,
            sidebar: false,
            thumbnails: true,
            ffmpeg: false,
            left: {
                splitView: true,
                grid: false,
                zoom: 1
            },
            right: {
                splitView: false,
                grid: true,
                zoom: 1
            }
        }
    }
}