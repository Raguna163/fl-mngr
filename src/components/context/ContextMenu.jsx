import React from 'react';
import './ContextMenu.scss';
import { connect } from 'react-redux';
import { closeContext } from "../../redux/actions";
import ContextActions from './ContextActions.jsx';

function ContextMenu({closeContext, selected, type, open, pos}) {
    React.useEffect(() => {
        let close = e => setTimeout(() => closeContext(), e.path.includes(getContextMenu()) ? 100 : 0);
        // Test if context menu is out of bounds
        if (open) {
            setStyle(`top:${pos.y}`,`left:${pos.x}`,`z-index:-10`);
            testBounds(pos);
            document.addEventListener('click', close);
        } 
        return function cleanup() {
            document.removeEventListener('click', close);  
        } 
    }, [open, pos, closeContext]);
    
    return open && (
        <div id="context-menu" onClick={e => e.preventDefault()}>
            <ContextActions multi={selected.length > 1} type={type} />
            { selected.length > 0 && type === "pane" 
              && <ContextActions multi={selected.length > 1} type="folder" />}
        </div>
    );
}

function getContextMenu() {
    return document.getElementById("context-menu");
}

function setStyle() {
    getContextMenu().setAttribute("style", [...arguments].join("px;"));
}

function testBounds(pos) {
    const contextMenu = getContextMenu();
    let { x, y, height, width } = contextMenu.getBoundingClientRect();
    let { innerHeight, innerWidth } = window;
    let xoffset = x + width - innerWidth > 0 ? width : 0;
    let yoffset = y + height - innerHeight > 0 ? height : 0;
    setStyle(`top:${pos.y - yoffset}`, `left:${pos.x - xoffset}`, `z-index:10`);
}

const mapStateToProps = ({ context, selection }) => {
    const { contextOpen, pos, type } = context;
    const { selected } = selection;
    return { pos, open: contextOpen, type, selected }
}

export default connect(mapStateToProps, { closeContext })(ContextMenu)