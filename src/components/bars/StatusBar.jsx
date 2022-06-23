import React from 'react';
import './StatusBar.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useSelector } from 'react-redux';

function StatusBar() {
    let selection = useSelector(state => state.selection);
    let itemsSelected = selection.selected.length;
    return (
        <footer className="status-bar">
        <div><span>A E S T H E T I C</span></div>
        <div>{ 
            itemsSelected > 0 
            ? <span>{itemsSelected} Selected</span> 
            : <span>Made With <FontAwesomeIcon icon="heart"/></span> 
        }</div>
        <div><span>A S - F U C K</span></div>
        </footer>
    );
}
    
export default StatusBar;