import React from 'react';
import { connect } from 'react-redux';
import { openFile, dragStart } from "../../../redux/actions/ipcTx";
import { 
    addSelection, 
    removeSelection, 
    clearSelection, 
    changeDir, 
    openContext,
    openDrag
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
	if (size > GB) return [parseFloat((size / GB).toPrecision(3)),"GB"]
	if (size > MB) return [parseFloat((size / MB).toPrecision(3)),"MB"]
	if (size > KB) return [parseFloat((size / KB).toPrecision(3)),"KB"]
	if (size > 0) return [size,"B"]
	return ''
}

function ListItem(props) {
    const { selection, item, side, target, highlight } = props;
    const itemSelected = selection.selected.includes(item) && side === selection.side;
    const border = highlight ? "1px dashed grey" : "none"

    const { zoom } = props[side];
    let [ fontSize, minWidth ] = zoomValues[zoom];
    if (item.length > 15 && zoom > 0) fontSize = zoomValues[zoom - 1];
    const size = formatSize(props.size);
    let timeout, type = props.isFolder ? "folder" : "file";

    function handleClick (e) {
        e.stopPropagation();
        props.onClick();

        if (timeout) timeout = clearTimeout(timeout);

        const func = props.isFolder 
                     ? () => props.changeDir(target + '\\', side) 
                     : () => props.openFile(target);

        if (e.ctrlKey) {
            if (itemSelected) props.removeSelection(item);
            else props.addSelection(item, side);
        } 
        else {
            if (itemSelected && selection.selected.length === 1) func();
            else if (selection.selected.length) props.clearSelection();
            else func();
        }
    }

    function handleContext(e) {
        e.stopPropagation();

        if (timeout) timeout = clearTimeout(timeout);

        if (!itemSelected) {
            props.clearSelection();
            props.addSelection(item, side);
        }
        props.openContext({ x: e.pageX, y: e.pageY, target, type });
    }

    function handleDrag(e) {
        let dragInfo = { x: e.pageX, y: e.pageY, target, type }; 
        timeout = setTimeout(() => { 
            props.openDrag(dragInfo);
        }, 300);
    }

    return (
        <>
            <li
                onClick={handleClick}
                onMouseDown={handleDrag}
                onContextMenu={handleContext}
                className={`${highlight ? 'highlighted-element ' : ''}list-item`}
                style={{ fontSize, minWidth, border }}
            >
                {props.fileIcon}
                <span className='item-name'>{item}</span>
                {!props.isFolder && size && (
                    <p>
                        <span>{size[0]}</span> <span>{size[1]}</span>
                    </p>
                )}
                {itemSelected && props.checkIcon}
            </li>
            <hr />
        </>
    );
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
    openContext,
    openDrag,
    dragStart
}

export default connect(mapStateToProps, mapDispatchToProps)(ListItem);