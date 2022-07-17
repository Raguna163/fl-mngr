//Icons in alphabetical order
import { 
    faChalkboard,
    faCheck, 
    faChevronDown, 
    faChevronLeft, 
    faChevronRight, 
    faChevronUp, 
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
    faHardDrive,
    faHeart, 
    faImage, 
    faList, 
    faPager, 
    faPlusSquare,
    faRightFromBracket,
    faRightToBracket,
    faSearchMinus, 
    faSearchPlus,
    faSlash,
    faStar,
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
    faChevronDown, 
    faChevronLeft,
    faChevronRight, 
    faChevronUp, 
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
    faHardDrive,
    faHeart,
    faImage,
    faList,
    faPager,
    faPlusSquare, 
    faRightFromBracket,
    faRightToBracket,
    faSearchMinus,
    faSearchPlus,
    faSlash,
    faStar,
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
    let basename = item.split('.');
    const ext = basename[basename.length - 1].toLowerCase();
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