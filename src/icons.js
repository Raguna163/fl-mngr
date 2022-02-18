import { 
    faChalkboard,
    faCheck, 
    faChevronLeft, 
    faChevronRight, 
    faClipboard, 
    faColumns, 
    faCompress, 
    faCopy, 
    faEdit, 
    faExpand, 
    faExternalLinkAlt, 
    faEye, 
    faFile, 
    faFileAlt, 
    faFileArchive, 
    faFileAudio, 
    faFileCode, 
    faFileImage, 
    faFileImport, 
    faFileVideo, 
    faFolder, 
    faFolderPlus, 
    faHeart, 
    faImage, 
    faList, 
    faPager, 
    faPlusSquare, 
    faSearchMinus, 
    faSearchPlus, 
    faTable, 
    faTimes, 
    faTrash, 
    faWindowClose,
    faWindowMaximize,
    faWindowMinimize,
    faWindowRestore,
} from "@fortawesome/free-solid-svg-icons";

import ImageCache from './imageCache';
export const cache = ImageCache;

export default [
    faChalkboard,
    faCheck, 
    faChevronLeft,
    faChevronRight, 
    faClipboard,
    faColumns,
    faCompress,
    faCopy,
    faEdit,
    faEye,
    faExpand,
    faExternalLinkAlt,
    faFile, 
    faFileAlt,
    faFileArchive,
    faFileAudio,
    faFileCode,
    faFileImage,
    faFileImport,
    faFileVideo,
    faFolder, 
    faFolderPlus, 
    faHeart,
    faImage,
    faList,
    faPager,
    faPlusSquare, 
    faSearchMinus,
    faSearchPlus,
    faTable,
    faTimes, 
    faTrash,
    faWindowClose,
    faWindowMaximize,
    faWindowMinimize,
    faWindowRestore,
];


export function addIcon(type, item) {
    if (type === "folder") return type;
    const ext = item.split('.')[item.split('.').length - 1];
    switch (ext) {
        case 'mp3':
        case 'wav':
            return "file-audio";
        case 'txt':
        case 'log':
            return "file-alt";
        case 'js':
            return "file-code"
        case 'jpg':
        case 'png':
        case 'gif':
        case 'jpeg':
            return "file-image"
        case 'mov':
        case 'mp4':
        case 'mpeg':
        case 'mpg':
            return "file-video"
        default:
            return "file";
    }
}