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

function ListItem(props) {
    const { selection, item, side, target, addSelection } = props;
    const itemSelected = selection.selected.includes(item) && side === selection.side;

    const { zoom } = props[side];
    const [ fontSize, minWidth ] = zoomValues[zoom];

    React.useEffect(() => {
        if (side === selection.side) {
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
        
    },[selection.side, item, side, addSelection, itemSelected])

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
                <span>{item}</span>
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