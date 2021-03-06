import React from 'react';
import { connect } from 'react-redux';
import { openFile } from "../../../redux/actions/ipcTx";
import { 
    addSelection, 
    removeSelection, 
    clearSelection, 
    changeDir, 
    openContext 
} from "../../../redux/actions";

const zoomValues = [
    ["xx-small", "10%"],
    ["small", "15%"],
    ["medium", "20%"],
    ["larger", "25%"],
    ["xx-large", "30%"]
]

const GB = 1073741824;
const MB = 1048576;
const KB = 1024;
const formatSize = size => {
	if (size > GB) return [parseFloat((size / GB).toFixed(2)),"GB"]
	if (size > MB) return [parseFloat((size / MB).toFixed(2)),"MB"]
	if (size > KB) return [parseFloat((size / KB).toFixed(2)),"KB"]
	if (size > 0) return [size,"B"]
	return ''
}

function ListItem(props) {
    const { selection, item, side, target, addSelection, isFiltered } = props;
    const itemSelected = selection.selected.includes(item) && side === selection.side;

    const { zoom } = props[side];
    const [ fontSize, minWidth ] = zoomValues[zoom];
    const size = formatSize(props.size);

    React.useEffect(() => {
        if (side === selection.side && !isFiltered) {
            let selectAll = e => {
                if (e.ctrlKey && e.key === "a" && !itemSelected) {
                    addSelection(item, side);
                }
            }
            document.addEventListener('keyup', selectAll);
            return function cleanup() {
                document.removeEventListener('keyup', selectAll)
            }
        }
    },[selection.side, item, side, addSelection, itemSelected, isFiltered]);

    function handleClick (e) {
        e.stopPropagation();
        const func = props.isFolder ? () => props.changeDir(target + '\\', side) : () => props.openFile(target);
        if (e.ctrlKey) {
            if (itemSelected) props.removeSelection(item);
            else props.addSelection(item, side);
        } else {
            if (itemSelected && selection.selected.length === 1) func();
            else if (selection.selected.length) props.clearSelection();
            else func();
        }
    }

    function handleContext(e) {
        e.stopPropagation();
        if (!itemSelected) {
            props.clearSelection();
            props.addSelection(item, side);
        }
        props.openContext({ x: e.pageX, y: e.pageY, target, type: props.isFolder ? "folder" : "file" });
    }

    return (
        <>
            <li onClick={handleClick} onContextMenu={handleContext} className="list-item" style={{ fontSize, minWidth }}>
                {props.fileIcon}
                <span className='item-name'>{item}</span>
                { !props.isFolder && size && <p><span>{size[0]}</span> <span>{size[1]}</span></p> }
                {itemSelected && props.checkIcon}
            </li>
            <hr/>
        </>
    )
}

const mapStateToProps = ({ selection, settings }) => {
    const { left, right } = settings;
    return { selection, left, right }
}

const mapDispatchToProps = { 
    addSelection, 
    removeSelection, 
    clearSelection, 
    changeDir, 
    openFile, 
    openContext 
}

export default connect(mapStateToProps, mapDispatchToProps)(ListItem);