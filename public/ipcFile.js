const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');
const ffmpeg = require('fluent-ffmpeg');
const nodeDiskInfo = require('node-disk-info');

const settingsPath = path.join(process.env.APPDATA, 'fl-mngr', 'state.json');
const videoFormats = ['3gp', 'avi', 'flv', 'mkv', 'mov', 'mp4', 'mpg', 'mpeg', 'wmv'];
let FSWatcher = { left: null, right: null };
const FSOptions = {
    ignored: / (^| [\\/\\])\../,
    ignoreInitial: true,
    awaitWriteFinish: true,
    followSymlinks: false,
    depth: 0
}

const sortFiles = (a, b) => {
    let RegEx = /^[0-9]+/g;
    let [aName, bName] = [a.name.toLowerCase(), b.name.toLowerCase()];
    let [aMatch, bMatch] = [aName.match(RegEx), bName.match(RegEx)];
    if (aMatch && bMatch) return aMatch - bMatch;
    if (aName > bName) return 1;
    if (aName < bName) return -1;
}

const fileOrDir = (files, func) => files.reduce((acc, nxt, idx) => nxt[func]() ? [...acc, files[idx]] : acc, []);

const separateFiles = filenames => [fileOrDir(filenames, 'isDirectory').sort(sortFiles), 
                                    fileOrDir(filenames, 'isFile').sort(sortFiles)]

const getSavedState = async settingsPath => JSON.parse(await fs.readFile(settingsPath));

const setSavedState = async state => fs.writeFile(settingsPath, JSON.stringify(state, null, 2));

async function saveSettings(e, newSettings) {
    const state = await getSavedState(settingsPath);
    state.settings = newSettings;
    await setSavedState(state);
}

async function editFavourites(e, data) {
    const state = await getSavedState(settingsPath);
    const { favourites } = state.directory;
    const index = favourites.findIndex(entry => entry.path === data);

    state.directory.favourites = index === -1
        ? [...favourites, { name: path.basename(data), path: data }]
        : [...favourites.slice(0, index), ...favourites.slice(index + 1)];

    e.sender.send('update:fave', state.directory.favourites);
    await setSavedState(state);
}

async function checkFFMPEG(e) {
    exec('where ffmpeg', async (err) =>{
        let data;
        if (err) data = false;
        else data = true;
        e.sender.send('ffmpeg', data);
        const state = await getSavedState(settingsPath);
        state.settings.ffmpeg = data;
        await setSavedState(state);
    });
}

async function getDrives(e) {
    nodeDiskInfo
        .getDiskInfo()
        .then(async disks => {
            e.sender.send('drives:read', disks);
            const state = await getSavedState(settingsPath);
            state.directory.drives = disks;
            await setSavedState(state);
        })
        .catch(err => console.log(err));
}

async function readDir(event, { dir, side }) {
    const chokidar = require('chokidar');
    if (FSWatcher[side]) FSWatcher[side].close();
    try {
        let filenames = await fs.readdir(dir, { withFileTypes: true });
        const fileStats = filenames.map(filename => fs.lstat(path.join(dir, filename.name)));
        let stats = await Promise.allSettled(fileStats);

        filenames.forEach((file, idx) => {
            const { status, value } = stats[idx];
            if (status !== 'rejected') file.size = value.size ?? 0
        });
        
        const [folders, files] = separateFiles(filenames);
        event.sender.send('dir:read', { side, files, folders, dir });

        const state = await getSavedState(settingsPath);
        state.directory[side] = dir;
        await setSavedState(state);
    } catch (err) {
        console.log(err);
    }

    const sendNew = (name, addTo) => event.sender.send('new', { name, addTo, side });
    const sendDel = (selection) => event.sender.send('delete', { selection, side });

    FSWatcher[side] = chokidar.watch(dir, FSOptions);
    FSWatcher[side]
        .on('add', update => sendNew(path.basename(update), "files"))
        .on('addDir', update => sendNew(path.basename(update), "folders"))
        .on('unlink', update => sendDel(path.basename(update)))
        .on('unlinkDir', update => sendDel(path.basename(update)));
}

function openFile(e, file) { exec(`"${file}"`) }
function openWith(e, file) { exec(`notepad "${file}"`) }
function openExplorer(e, target) { exec(`explorer "${path.normalize(target)}"`) }

async function copyOrMove(e, { selected, dir, target }, move) {
    let dirname = path.dirname(target);
    selected.forEach(selection => {
        let oldPath = path.join(dirname, selection);
        let newPath = path.join(dir, selection);
        try {
            if (move) fs.rename(oldPath, newPath);
            else fs.copyFile(oldPath, newPath);
        } catch (err) {
            console.log(err);
        }
    });
}

async function copyItems(e, data) { copyOrMove(e, data, false) }
async function moveItems(e, data) { copyOrMove(e, data, true) }

async function renameFile(e, { oldName, newName, dir }) {
    fs.rename(path.resolve(dir, oldName), path.resolve(dir, newName));
    e.sender.send('delete', { selection: oldName, otherSide: false });
}

async function newItem(e, { target, name, command }) {
    if (command === "New File") fs.writeFile(path.join(target, name), "");
    else fs.mkdir(path.join(target, name));
}

async function deleteItems(e, { selected, dir }) {
    const trash = require('trash');
    selected.forEach(selection => {
        let target = path.join(dir, selection);
        trash(target);
        e.sender.send('delete', { selection, otherSide: false });
    });
}

async function previewFile(e, target) {
    sharp(target)
        .resize({ width: 1920, kernel: sharp.kernel.mitchell, withoutEnlargement: true })
        .jpeg({ quality: 100, chromaSubsampling: '4:4:4' })
        .toBuffer()
        .then(data => e.sender.send('preview', data))
        .catch(err => console.log(err));
}

async function imgIcon(e, { target, ID, side }) {
    if (path.extname(target) === ".gif") {
        let { size } = await fs.stat(target);
        sharp(target, { animated: true, pages: -1 })
            .webp({ quality: size > 1000000 ? 30 : 50 })
            .toBuffer()
            .then(data => e.sender.send('icon', { data, ID, side }))
            .catch(err => console.log(err));
    } 
    else if (videoFormats.includes(path.extname(target))) {
        let outputFolder = path.join(process.env.APPDATA, 'fl-mngr', 'vidthumbs');
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
                .then(data => e.sender.send('icon', { data, ID, side }))
                .catch(err => console.log(err))
                .finally(() => { fs.unlink(output) });
          });
    }
    else {
        sharp(target)
            .resize({ width: 200, kernel: sharp.kernel.mitchell })
            .jpeg({ quality: 50 })
            .toBuffer()
            .then(data => e.sender.send('icon', { data, ID, side }))
            .catch(err => { if (err.message !== "Input file is missing") console.log(err) });
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
    copyItems,
    moveItems,
    renameFile,
    newItem, 
    deleteItems,
    previewFile,
    imgIcon,
}