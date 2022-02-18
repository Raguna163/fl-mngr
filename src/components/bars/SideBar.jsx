import React from 'react';
import './SideBar.scss';
import { useSelector } from 'react-redux';

function SideBar() {
    let show = useSelector(({settings}) => settings.sidebar);
    return show && (
        <div id="sidebar" className="segment">
            <h3>LOCATIONS</h3>
        </div>
    )
}

export default SideBar