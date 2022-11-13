process.once('loaded', () => {
    const { contextBridge, ipcRenderer } = require("electron");
    const REI = require('redux-electron-ipc');
    // Expose protected methods that allow the renderer process to use
    // the ipcRenderer without exposing the entire object
    const ipcObject = {
        createIpc: REI.default,
        sendIpc: REI.send,
        send: (channel, data) => ipcRenderer.send(channel, data),
        receive: (channel, fn) => ipcRenderer.on(channel, fn),
        Uint8ToBase64: (u8Arr) => {
            if (!u8Arr) return null;
            const CHUNK_SIZE = 0x8000; //arbitrary number
            let idx = 0, len = u8Arr.length, result = '', slice;
            while (idx < len) {
                slice = u8Arr.subarray(idx, Math.min(idx + CHUNK_SIZE, len));
                result += String.fromCharCode.apply(null, slice);
                idx += CHUNK_SIZE;
            }
            return Buffer.from(result, 'binary').toString('base64');
        },
        icons: (e, { data, ID, side }) => {
            try {
                const img = ipcObject.Uint8ToBase64(data);
                document
                    .getElementById(`pane-${side}`)
                    .getElementsByClassName(ID)[0]
                    .setAttribute('src', `data:image/jpeg;base64, ${img}`);
            } catch (err) {
                console.log(err);
            }
        }
    }
    contextBridge.exposeInMainWorld("ipc", ipcObject);

    const { readFileSync, existsSync, writeFileSync, mkdirSync } = require("fs");
    const { join } = require("path");
    // Checks if saved state already exists, if not initialize one
    const settingsPath = join(process.env.APPDATA, 'fl-mngr', 'state.json');
    const thumbsPath = join(process.env.APPDATA, 'fl-mngr', 'thumbs');
    let initialState;
    if (!existsSync(settingsPath)) {
        initialState = initializeState();
        writeFileSync(settingsPath, JSON.stringify(initialState, null, 2));
        mkdirSync(thumbsPath);
    }
    let settingsFile = readFileSync(settingsPath);
    try {
        initialState = JSON.parse(settingsFile);
    } catch (err) {
        let errorLocation = err.message.split(' ');
        errorLocation = parseInt(errorLocation[errorLocation.length - 1]);
        settingsFile = settingsFile.toString().substring(0, errorLocation);
        initialState = JSON.parse(settingsFile);
        writeFileSync(settingsPath, JSON.stringify(initialState, null, 2));
    }
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