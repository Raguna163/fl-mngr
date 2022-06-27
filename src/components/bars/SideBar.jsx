import React from 'react';
import './SideBar.scss';
import { useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Preview from '../menu/Preview';
import Drives from "./list/Drives";

function SideBar() {
    let show = useSelector(({settings}) => settings.sidebar);
    let [ driveState, toggleDrives ] = React.useState(true);
    let [ faveState, toggleSave ] = React.useState(true);
    return show && (
        <div id='side'>
            <div id="sidebar" className="segment">
                <h4>Sidebar</h4>
                <h4 onClick={() => toggleSave(!faveState)}>
                    <FontAwesomeIcon icon="star"/>
                    <span>Fave</span>
                    <FontAwesomeIcon icon={`chevron-${faveState ? 'up' : 'down'}`}/>
                </h4>
                { faveState && <p></p> }
                <h4 onClick={() => toggleDrives(!driveState)}>
                    <FontAwesomeIcon icon="hard-drive"/>
                    <span>Drives</span>
                    <FontAwesomeIcon icon={`chevron-${driveState ? 'up' : 'down'}`}/>
                </h4>
                { driveState && <Drives/> }
            </div>
            <Preview location='side'/>
        </div>
    );
}

export default SideBar