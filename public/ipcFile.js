const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const trash = require('trash');
const sharp = require('sharp');
const chokidar = require('chokidar');

let FSWatcher = { left: null, right: null };
const FSOptions = {
    ignored: / (^| [\\/\\])\../,
    ignoreInitial: true,
    // awaitWriteFinish: true,
    followSymlinks: false,
    depth: 0
}

const fileOrDir = (files, func) => files.reduce((acc, nxt, idx) => nxt[func]() ? [...acc, files[idx].name] : acc, []);

const sortFiles = filenames => [fileOrDir(filenames, 'isDirectory'), fileOrDir(filenames, 'isFile')]

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

async function readDir(event, { dir, side }) {
    if (FSWatcher[side]) FSWatcher[side].close();
    try {
        let filenames = await fs.readdir(dir, { withFileTypes: true });
        const [folders, files] = sortFiles(filenames);
        event.sender.send('dir:read', { side, files, folders, dir });

        const stateFile = path.join(__dirname, "state.json");
        const state = JSON.parse(await fs.readFile(stateFile));
        state.directory[side] = dir;
        fs.writeFile(stateFile, JSON.stringify(state, null, 2))
    } catch (err) {
        console.log(err);
    }

    FSWatcher[side] = chokidar.watch(dir, FSOptions);
    const sendNew = (name, addTo) => event.sender.send('new', { name, addTo, side });
    const sendDel = (selection) => event.sender.send('delete', { selection, side });
    FSWatcher[side]
        .on('add', update => sendNew(path.basename(update), "files"))
        .on('addDir', update => sendNew(path.basename(update), "folders"))
        .on('unlink', update => sendDel(path.basename(update)))
        .on('unlinkDir', update => sendDel(path.basename(update)));
}

function openFile(e, file) { exec(`"${file}"`) }
function openWith(e, file) { exec(`notepad "${file}"`) }
function openExplorer(e, target) { exec(`explorer "${path.normalize(target)}"`) }

async function copyItems(e, data) { copyOrMove(e, data, false) }
async function moveItems(e, data) { copyOrMove(e, data, true) }

async function renameFile(e, { oldName, newName, dir }) {
    // let type = fs.statSync(path.join(dir, oldName)).isDirectory() ? 'folders' : 'files';
    fs.rename(path.join(dir, oldName), path.join(dir, newName));
    e.sender.send('delete', { selection: oldName, otherSide: false });
    // e.sender.send('new', { name: newName, addTo: type });
}
async function newItem(e, { target, name, command }) {
    // let type = command === "New File" ? 'files' : 'folders'
    // if (type === "files") fs.writeFileSync(path.join(target, name), "");
    if (command === "New File") fs.writeFile(path.join(target, name), "");
    else fs.mkdir(path.join(target, name));
    // e.sender.send('new', { name, addTo: type });
}

async function deleteItems(e, { selected, dir }) {
    selected.forEach(selection => {
        let target = path.join(dir, selection);
        trash(target);
        e.sender.send('delete', { selection, otherSide: false });
    })
}

async function previewFile(e, target) {
    sharp(target)
        .jpeg({ quality: 100, chromaSubsampling: '4:4:4' })
        .toBuffer()
        .then(data => e.sender.send('preview', data))
        .catch(err => console.log(err));
}

async function imgIcon(e, { target, ID, side }) {
    if (path.extname(target) === ".gif") {
        let { size } = await fs.stat(target);
        sharp(target, { animated: true, pages: -1 })
            .webp({ quality: Math.round(80 / (size / 1000000)) })
            .toBuffer()
            .then(data => e.sender.send('icon', { data, ID, side }))
            .catch(err => console.log(err));
    } else {
        sharp(target)
            .resize({ width: 200, kernel: sharp.kernel.mitchell })
            .jpeg({ quality: 90 })
            .toBuffer()
            .then(data => e.sender.send('icon', { data, ID, side }))
            .catch(err => { if (err.message !== "Input file is missing") console.log(err) });
    }
}

module.exports = {
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
    imgIcon
}