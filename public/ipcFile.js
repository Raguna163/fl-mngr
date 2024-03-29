const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');
const ffmpeg = require('fluent-ffmpeg');
const chokidar = require('chokidar');
const nodeDiskInfo = require('node-disk-info');
const mime = require('mime-types');

const settingsPath = path.join(process.env.APPDATA, 'fl-mngr', 'state.json');
let FSWatcher = { left: null, right: null };
const FSOptions = {
    ignored: / (^| [\\/\\])\../,
    ignoreInitial: true,
    awaitWriteFinish: true,
    followSymlinks: false,
    depth: 0
}

const handleError = err => console.log(err);

const sortFiles = (a, b) => {
    let RegEx = /^[0-9]+/g;
    let [aName, bName] = [a.name.toLowerCase(), b.name.toLowerCase()];
    let [aMatch, bMatch] = [aName.match(RegEx), bName.match(RegEx)];
    if (aMatch && bMatch) return aMatch - bMatch;
    if (aName > bName) return 1;
    if (aName < bName) return -1;
}

const fileOrDir = (files, func) => files.reduce((acc, nxt, idx) => nxt[func]() ? [...acc, files[idx]] : acc, []);

const separateFiles = filenames => [fileOrDir(filenames, 'isDirectory'), 
                                    fileOrDir(filenames, 'isFile')]

const getSavedState = async settingsPath => JSON.parse(await fs.readFile(settingsPath));

const setSavedState = state => fs.writeFile(settingsPath, JSON.stringify(state, null, 2));

async function saveSettings(e, newSettings) {
    const state = await getSavedState(settingsPath);
    state.settings = newSettings;
    setSavedState(state);
}

async function editFavourites(e, data) {
    const state = await getSavedState(settingsPath);
    const { favourites } = state.directory;
    const index = favourites.findIndex(entry => entry.path === data);

    state.directory.favourites = index === -1
        ? [...favourites, { name: path.basename(data), path: data }]
        : [...favourites.slice(0, index), ...favourites.slice(index + 1)];

    e.sender.send('update:fave', state.directory.favourites);
    setSavedState(state);
}

async function checkFFMPEG(e) {
    exec('where ffmpeg', async (err) =>{
        let data;
        if (err) data = false;
        else data = true;
        e.sender.send('ffmpeg', data);
        const state = await getSavedState(settingsPath);
        state.settings.ffmpeg = data;
        setSavedState(state);
    });
}

function getDrives(e) {
    nodeDiskInfo
        .getDiskInfo()
        .then(async disks => {
            e.sender.send('drives:read', disks);
            const state = await getSavedState(settingsPath);
            state.directory.drives = disks;
            setSavedState(state);
        })
        .catch(handleError);
}

async function readDir(event, { dir, side }) {
    if (FSWatcher[side]) FSWatcher[side].close();
    try {
        let filenames = await fs.readdir(dir, { withFileTypes: true });
        const fileStats = filenames.map(filename => fs.lstat(path.join(dir, filename.name)));
        let stats = await Promise.allSettled(fileStats);

        filenames.forEach((file, idx) => {
            const { status, value } = stats[idx];
            if (status !== 'rejected') file.size = value.size ?? 0
        });
        
        const [folders, files] = separateFiles(filenames.sort(sortFiles));
        event.sender.send('dir:read', { side, files, folders, dir });

        const state = await getSavedState(settingsPath);
        state.directory[side] = dir;
        setSavedState(state);
    } catch (err) {
        handleError(err);
    }

    const sendNew = (name, size, addTo) => event.sender.send('new', { name, size, addTo, side });
    const sendDel = (selection, removeFrom) => event.sender.send('delete', { selection, side, removeFrom });

    FSWatcher[side] = chokidar.watch(dir, FSOptions);
    FSWatcher[side]
        .on('error', handleError)
        .on('add', (update, stats) => sendNew(path.basename(update), stats.size, "files"))
        .on('addDir', update => sendNew(path.basename(update), null, "folders"))
        .on('unlink', update => sendDel(path.basename(update), "files"))
        .on('unlinkDir', update => sendDel(path.basename(update), "folders"))
}

function openFile(e, file) { exec(`"${file}"`) }
function openWith(e, file) { exec(`notepad "${file}"`) }
function openExplorer(e, target) { exec(`explorer "${path.normalize(target)}"`) }

function dragStart(e, files) {
    const icon = path.join(__dirname, 'drag.ico');
    if (Array.isArray(files)) {
        e.sender.startDrag({ files, icon });
    } else {
        e.sender.startDrag({ file: files, icon });
    }
}

function copyOrMove(e, { selected, dir, target }, move) {
    let progressPayload = { type: 'new', task: move ? 'moving':'copying', total: selected.length };
    e.sender.send('progress', progressPayload);

    let options = { recursive: true, force: true }
    let dirname = path.dirname(target);
    selected.forEach(async selection => {
        let oldPath = path.join(dirname, selection);
        let newPath = path.join(dir, selection);
        try {
            if (move && dirname[0] === dir[0]) {
                fs.rename(oldPath, newPath);
            }
            else {
                let stat = await fs.stat(oldPath);
                if (stat.isDirectory()) {
                    fs.cp(oldPath, newPath, options)
                        .finally(() => { if (move) fs.rm(oldPath, options); });
                    
                }
                else {
                    fs.copyFile(oldPath, newPath)
                        .finally(() => { if (move) fs.unlink(oldPath); });
                    
                }
            }
        } catch (err) {
            handleError(err)
        } finally {
            e.sender.send('progress', { type: 'complete' });
        }
    });
}

function copyItems(e, data) { copyOrMove(e, data, false) }
function moveItems(e, data) { copyOrMove(e, data, true) }

function renameFile(e, { oldName, newName, dir }) {
    try {
        fs.rename(path.resolve(dir, oldName), path.resolve(dir, newName));
        e.sender.send('delete', { selection: oldName, otherSide: false });
    } catch (err) {
        handleError(err);
    }
}

function newItem(e, { target, name, command }) {
    try {
        if (command === "New File") fs.writeFile(path.join(target, name), "");
        else fs.mkdir(path.join(target, name));
    } catch (err) {
        handleError(err)
    }
}

function deleteItems(e, { selected, dir }) {
    const trash = require('trash');
    let progressPayload = { type: 'new', task: 'deleting', total: selected.length };
    e.sender.send('progress', progressPayload);
    selected.forEach(async selection => {
        let target = path.join(dir, selection);
        await trash(target).catch(async err => {
            handleError(err);
            console.log(err.message)
            if (err.message.startsWith('Command failed') && target[0] !== 'C') {
                fs.rm(target);
                let stat = await fs.stat(target);
                if (stat.isDirectory()) fs.rm(target, { recursive: true, force: true });
                else fs.unlink(target) 
                
            }
        });
        e.sender.send('progress', { type: 'complete' });
    });
}

async function previewFile(e, target) {
    let mimeType = mime.contentType(path.extname(target)).split('/')[0];
    console.log(mimeType)
    console.log(path.extname(target))
    if (mimeType === 'image') {
        sharp(target)
            .resize({ width: 1920, kernel: sharp.kernel.mitchell, withoutEnlargement: true })
            .jpeg({ quality: 100, chromaSubsampling: '4:4:4' })
            .toBuffer()
            .then(data => e.sender.send('preview', { type: 'image', data }))
            .catch(handleError);
    } else if (mimeType === 'text' || (mimeType === 'application' && path.extname(target) === '.js')) {
        let data = await fs.readFile(target, 'utf-8');
        e.sender.send('preview', { type: 'text', data })
    } else {
        e.sender.send('preview', { type: 'no-preview', data: null })
    }
}

async function imgIcon(e, { target, ID, side }) {
    let mimeType = mime.contentType(path.extname(target)).split('/')[0]; 
    const sendIcon = data => e.sender.send('icon', { data, ID, side });

    if (path.extname(target) === ".gif") {
        let { size } = await fs.stat(target);
        sharp(target, { animated: true, pages: -1 })
            .webp({ quality: size > 1000000 ? 30 : 50 })
            .toBuffer()
            .then(sendIcon)
            .catch(handleError);
    } 

    else if (mimeType === 'video') {
        let outputFolder = path.join(process.env.APPDATA, 'fl-mngr', 'thumbs');
        let outputFile = `temp-${path.basename(target)}.jpg`;
        let output = path.join(outputFolder, outputFile);
        ffmpeg(target)
          .screenshot({
            timestamps: [1],
            filename: outputFile,
            folder: outputFolder,
            size: '500x?'
          }).on('end', () => {
            sharp(output)
                .toBuffer()
                .then(sendIcon)
                .catch(handleError)
                .finally(() => { fs.unlink(output).catch(handleError) });
          });
    }

    else {
        sharp(target)
            .resize({ width: 200, kernel: sharp.kernel.mitchell })
            .jpeg({ quality: 50 })
            .toBuffer()
            .then(sendIcon)
            .catch(handleError);
    }
}

module.exports = {
    saveSettings,
    editFavourites,
    checkFFMPEG,
    getDrives,
    readDir,
    openFile,
    openWith,
    openExplorer,
    dragStart,
    copyItems,
    moveItems,
    renameFile,
    newItem, 
    deleteItems,
    previewFile,
    imgIcon,
}