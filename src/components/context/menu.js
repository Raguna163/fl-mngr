export function argumentReducer(item, props) {
    switch (item.arg) {
        case "pane":
            return props.pane;
        case "title":
            return item.title;
        case "target":
            return props.target;
        case "file":
        case "folder":
            let target = props.target.split("/");
            return item.arg === "folder" ? ">" : "" + target[target.length - 1]
        default:
            return item.arg;
    }
}

export default {
    pane: {
        newFile: {
            icon: "plus-square",
            title: "New File",
            func: "commandContext",
            arg: "title"
        },
        newFolder: {
            icon: "folder-plus",
            title: "New Folder",
            func: "commandContext",
            arg: "title"
        },
        openExplorer: {
            icon: 'folder',
            title: 'Open In Explorer',
            func: 'openExplorer',
            arg: 'target'
        },
        addFavourite: {
            icon: 'star',
            title: 'Add Fave',
            func: 'editFavourites',
            arg: 'target'
        }
    },
    file: {
        deleteItem: {
            icon: "trash",
            title: "Delete",
            func: "deleteItems",
            arg: "pane"
        },
        openWith: {
            icon: "external-link-alt",
            title: "Open With",
            func: "openWith",
            arg: "target"
        },
        copyItems: {
            icon: "copy",
            title: "Copy",
            func: "copyItems",
            arg: "target"
        },
        moveItems: {
            icon: "file-import",
            title: "Move",
            func: "moveItems",
            arg: "target"
        },
        renameFile: {
            icon: "edit",
            title: "Rename",
            func: "commandContext",
            arg: "file"
        },
        previewFile: {
            icon: "eye",
            title: "Preview",
            func: "previewFile",
            arg: "target"
        }
    },
    folder: {
        deleteItem: {
            icon: "trash",
            title: "Delete",
            func: "deleteItems",
            arg: "pane"
        },
        copyItems: {
            icon: "copy",
            title: "Copy",
            func: "copyItems",
            arg: "target"
        },
        moveItems: {
            icon: "file-import",
            title: "Move",
            func: "moveItems",
            arg: "target"
        },
        renameFile: {
            icon: "edit",
            title: "Rename",
            func: "commandContext",
            arg: "folder"
        }
    },
    path: {
        copyPath: {
            icon: "clipboard",
            title: "Copy Path",
            func: "copyPath",
            arg: "target"
        },
        editPath: {
            icon: "edit",
            title: "Edit Path",
            func: "commandContext",
            arg: "target"
        }
    },
    input: {
        pasteText: {
            icon: "clipboard",
            title: "Paste",
            func: "pasteText",
            arg: "target"
        }
    }
}