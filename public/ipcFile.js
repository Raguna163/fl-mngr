const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');
const ffmpeg = require('fluent-ffmpeg');
const chokidar = require('chokidar');
const nodeDiskInfo = require('node-disk-info');

const settingsPath = path.join(process.env.APPDATA, 'fl-mngr', 'state.json');
const videoFormats = ['.3gp','.avi','.flv','.mkv','.mov','.mp4','.mpg','.mpeg','.wmv'];
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

const separateFiles = filenames => [fileOrDir(filenames, 'isDirectory').sort(sortFiles), 
                                    fileOrDir(filenames, 'isFile').sort(sortFiles)]

const getSavedState = async settingsPath => JSON.parse(await fs.readFile(settingsPath));

const setSavedState = async state => fs.writeFile(settingsPath, JSON.stringify(state, null, 2));

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

async function getDrives(e) {
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
        
        const [folders, files] = separateFiles(filenames);
        event.sender.send('dir:read', { side, files, folders, dir });

        const state = await getSavedState(settingsPath);
        state.directory[side] = dir;
        setSavedState(state);
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
        .on('unlinkDir', update => sendDel(path.basename(update)))
}

function openFile(e, file) { exec(`"${file}"`) }
function openWith(e, file) { exec(`notepad "${file}"`) }
function openExplorer(e, target) { exec(`explorer "${path.normalize(target)}"`) }

async function copyOrMove(e, { selected, dir, target }, move) {
    const incrementProgress = () => e.sender.send('progress', { type: 'complete' });
    let progressPayload = { type: 'new', task: move ? 'moving':'copying', total: selected.length };
    e.sender.send('progress', progressPayload);
    
    let dirname = path.dirname(target);
    selected.forEach(async selection => {
        let oldPath = path.join(dirname, selection);
        let newPath = path.join(dir, selection);
        try {
            if (move) await fs.rename(oldPath, newPath);
            else {
                let stat = await fs.stat(oldPath);
                if (stat.isDirectory()) {
                    fs.cp(oldPath, newPath, { recursive: true });
                }
                else await fs.copyFile(oldPath, newPath);
            }
        } catch (err) {
            console.log(err);
        } finally {
            incrementProgress();
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
    let progressPayload = { type: 'new', task: 'deleting', total: selected.length };
    e.sender.send('progress', progressPayload);
    selected.forEach(async selection => {
        let target = path.join(dir, selection);
        await trash(target);
        e.sender.send('delete', { selection, otherSide: false });
        e.sender.send('progress', { type: 'complete' });
    });
}

async function previewFile(e, target) {
    sharp(target)
        .resize({ width: 1920, kernel: sharp.kernel.mitchell, withoutEnlargement: true })
        .jpeg({ quality: 100, chromaSubsampling: '4:4:4' })
        .toBuffer()
        .then(data => e.sender.send('preview', data))
        .catch(handleError);
}

async function imgIcon(e, { target, ID, side }) {
    const sendIcon = data => e.sender.send('icon', { data, ID, side });

    if (path.extname(target) === ".gif") {
        let { size } = await fs.stat(target);
        sharp(target, { animated: true, pages: -1 })
            .webp({ quality: size > 1000000 ? 30 : 50 })
            .toBuffer()
            .then(sendIcon)
            .catch(handleError);
    } 

    else if (videoFormats.includes(path.extname(target))) {
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
    copyItems,
    moveItems,
    renameFile,
    newItem, 
    deleteItems,
    previewFile,
    imgIcon,
}