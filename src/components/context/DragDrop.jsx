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
    let item, multi = false;

    if (selected.length > 1) {
        item = selected.length + " items";
        multi = true;
    } else {
        let idx = target.lastIndexOf("\\");
        item = target.substring(idx + 1);
        if (item.length === 0 && open && target) {
            let split = target.split('\\');
            item = split[split.length - 2];
        }
    }

    React.useEffect(() => {
        let move = e => {
            let { innerHeight, innerWidth } = window;
            let [ x, y ] = [ e.clientX, e.clientY ];
            let margin = 10;
            let upperBounds = innerWidth - margin < x || innerHeight - margin < y;
            let lowerBounds = x < margin || y < margin;
            if (upperBounds || lowerBounds) {
                props.dragStart(props.selected.length > 1 ? props.selected : props.target);
                props.closeDrag();
            } else {
                setStyle(`top:${ y }`,`left:${ x }`,`z-index:20`);
            }
        }
        let drop = e => {
            let dropLocation = document.elementsFromPoint(e.pageX, e.pageY);
            let dropStack = dropLocation.map(elem => elem.id ? elem.id : elem.className);
            let flag;
            for (const side of ['left', 'right']) {
                if (dropStack.includes(`pane-${side}`)) {
                    if (!multi || props.selected.length === 0) {
                        props.addSelection(item, side);
                    }
                    flag = true;
                }
            }
            if (flag) {
                if (e.ctrlKey) props.copyItems(props.target);
                else props.moveItems(props.target);
            }
            setTimeout(props.closeDrag, 200);
        }
        // Test if drag & drop menu is out of bounds
        if (open) {
            testBounds(props.dragPos);
            document.addEventListener('mouseup', drop);
            document.addEventListener('mousemove', move);
        } 
        return () => {
            document.removeEventListener('mouseup', drop);  
            document.removeEventListener('mousemove', move);
        } 
    }, [props, open, item, multi]);
    
    let icon = addIcon(type, item);

    return open && (
        <div style={{ padding: '20px' }} id="drag-drop">
            <FontAwesomeIcon style={{ marginRight: '10px' }} className='drag-icon' icon={icon}/>
            <span>{item}</span>
        </div>
    );
}

function setStyle() {
    let dragDrop = document.getElementById("drag-drop");
    dragDrop.setAttribute("style", [...arguments].join("px;"));
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