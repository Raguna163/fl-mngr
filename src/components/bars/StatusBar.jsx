import React from 'react';
import './StatusBar.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useSelector } from 'react-redux';

function StatusBar() {
    let selection = useSelector(state => state.selection);
    let itemsSelected = selection.selected.length;
    return (
        <footer className="status-bar">
        <div>{ 
            itemsSelected > 0 
            ? <span>{itemsSelected} Selected</span> 
            : <span>Made With <FontAwesomeIcon icon="heart"/></span> 
        }</div>
        </footer>
    );
}
    
export default StatusBar;