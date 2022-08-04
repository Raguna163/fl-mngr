import React from 'react';
import './ContextMenu.scss';
import { connect } from 'react-redux';
import { closeDrag } from "../../redux/actions";
import { addIcon } from '../../icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { copyItems, moveItems } from '../../redux/actions/ipcTx';
import { addSelection } from '../../redux/actions';

function DragDrop(props) {
    const { open, dragPos, target, type, side } = props;
    const { closeDrag, moveItems, copyItems, addSelection } = props;
    let item, itemName;

    item = target.split("\\");
    item = item[item.length - 1];
    itemName = item;

    React.useEffect(() => {
        let move = e => {
            setStyle(`top:${e.pageY}`,`left:${e.pageX}`,`z-index:20`);
        }
        let drop = e => {
            let dropLocation = document.elementsFromPoint(e.pageX, e.pageY);
            let dropStack = [];
            for (const elem of dropLocation) {
                dropStack.push(elem.id ? elem.id : elem.className);
            }
            let flag;
            if (dropStack.includes('pane-left')) {
                if (side !== 'left') {
                    addSelection(itemName, 'right');
                    flag = true;
                }
            } else if (dropStack.includes("pane-right")) {
                if (side !== 'right') {
                    addSelection(itemName, 'left');
                    flag = true;
                }
            }
            if (flag) {
                if (e.ctrlKey) copyItems(target);
                else moveItems(target);
            }
            setTimeout(closeDrag, 200);
        }
        // Test if context menu is out of bounds
        if (open) {
            testBounds(dragPos);
            document.addEventListener('mouseup', drop);
            document.addEventListener('mousemove', move);
        } 
        return function cleanup() {
            document.removeEventListener('mouseup', drop);  
            document.removeEventListener('mousemove', move);
        } 
    }, [side, target, open, dragPos, closeDrag, moveItems, copyItems, itemName, addSelection]);
    
    let icon = addIcon(type, !itemName ? 'file.file' : itemName);

    return open && (
        <div style={{ padding: '10px' }} id="drag-drop">
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

const mapDispatchToProps = { closeDrag, moveItems, copyItems, addSelection };

export default connect(mapStateToProps, mapDispatchToProps)(DragDrop)