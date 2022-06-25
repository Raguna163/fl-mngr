import React from 'react';
import './SideBar.scss';
import { useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

function SideBar() {
    let show = useSelector(({settings}) => settings.sidebar);
    return show && (
        <div id="sidebar" className="segment">
            <h4>Sidebar</h4>
            <h4>
                <FontAwesomeIcon icon="star"/>
                <span>Favourites</span>
                <FontAwesomeIcon icon="chevron-down"/>
            </h4>
            <h4>
                <FontAwesomeIcon icon="hard-drive"/>
                <span>Drives</span>
                <FontAwesomeIcon icon="chevron-down"/>
            </h4>
        </div>
    )
}

export default SideBar