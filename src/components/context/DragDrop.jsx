import React from 'react';
import './ContextMenu.scss';
import { connect } from 'react-redux';
import { closeDrag } from "../../redux/actions";
import { addIcon } from '../../icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { copyItems, moveItems, dragStart } from '../../redux/actions/ipcTx';
import { addSelection } from '../../redux/actions';

function DragDrop(props) {
    const { open, target, type, selected } = props;
    let item, itemName;

    if (selected.length > 1) {
        item = selected.length + " items";
    } else {
        item = target.split("\\");
        item = item[item.length - 1];
        itemName = item;
    }

    React.useEffect(() => {
        let move = e => {
            let { innerHeight, innerWidth } = window;
            let [ x, y ] = [ e.clientX, e.clientY ]
            let margin = 10;
            let upperBounds = innerWidth - margin < x || innerHeight - margin < y;
            let lowerBounds = x < margin || y < margin;
            if (upperBounds || lowerBounds) {
                props.dragStart(props.selected.length > 1 ? props.selected : target);
                props.closeDrag();
            } else {
                setStyle(`top:${ y }`,`left:${ x }`,`z-index:20`);
            }
        }
        let drop = e => {
            let dropLocation = document.elementsFromPoint(e.pageX, e.pageY);
            let dropStack = [];
            for (const elem of dropLocation) {
                dropStack.push(elem.id ? elem.id : elem.className);
            }
            let flag;
            if (dropStack.includes('pane-left')) {
                if (props.side !== 'left') {
                    if (itemName) props.addSelection(itemName, 'right');
                    flag = true;
                }
            } else if (dropStack.includes("pane-right")) {
                if (props.side !== 'right') {
                    if (itemName) props.addSelection(itemName, 'left');
                    flag = true;
                }
            }
            if (flag) {
                if (e.ctrlKey) props.copyItems(target);
                else props.moveItems(target);
            }
            setTimeout(props.closeDrag, 200);
        }
        // Test if drag & drop menu is out of bounds
        if (open) {
            testBounds(props.dragPos);
            document.addEventListener('mouseup', drop);
            document.addEventListener('mousemove', move);
        } 
        return function cleanup() {
            document.removeEventListener('mouseup', drop);  
            document.removeEventListener('mousemove', move);
        } 
    }, [props, target, open, itemName]);
    
    let icon = addIcon(type, itemName ?? 'file.file');

    return open && (
        <div style={{ padding: '20px' }} id="drag-drop">
            <FontAwesomeIcon style={{ marginRight: '10px' }} className='drag-icon' icon={icon}/>
            <span>{item}</span>
        </div>
    );
}

function setStyle() {
    document.getElementById('drag-drop').setAttribute("style", [...arguments].join("px;"));
}

function testBounds(pos) {
    const dragDrop = document.getElementById('drag-drop')
    let { x, y, height, width } = dragDrop.getBoundingClientRect();
    let { innerHeight, innerWidth } = window;
    let xoffset = x + width - innerWidth > 0 ? width : 0;
    let yoffset = y + height - innerHeight > 0 ? height : 0;
    setStyle(`top:${pos.y - yoffset}`, `left:${pos.x - xoffset}`, `z-index:10`);
}

const mapStateToProps = ({ context, selection }) => {
    const { dragOpen, dragPos, target, type } = context;
    const { selected, side } = selection;
    return { dragPos, open: dragOpen, selected, target, type, side }
}

const mapDispatchToProps = { closeDrag, moveItems, copyItems, addSelection, dragStart };

export default connect(mapStateToProps, mapDispatchToProps)(DragDrop)