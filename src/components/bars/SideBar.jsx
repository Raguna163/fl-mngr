import React from 'react';
import './SideBar.scss';
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Preview from '../menu/Preview';
import Drives from "./list/Drives";
import Fave from "./list/Fave";

function SideBar({faves, drives, activeSide, show}) {
    let [ driveState, toggleDrives ] = React.useState(false);
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
                { faveState && <Fave faves={faves} activeSide={activeSide} starIcon={<FontAwesomeIcon icon='star'/>}/> }
                <h4 onClick={() => toggleDrives(!driveState)}>
                    <FontAwesomeIcon icon="hard-drive"/>
                    <span>Drives</span>
                    <FontAwesomeIcon icon={`chevron-${driveState ? 'up' : 'down'}`}/>
                </h4>
                { driveState && <Drives drives={drives} activeSide={activeSide} driveIcon={<FontAwesomeIcon icon='hard-drive'/>}/> }
            </div>
            <Preview location='side'/>
        </div>
    );
}

const mapStateToProps = ({ directory, selection, settings }) => {
    return { 
        faves: directory.favourites, 
        drives: directory.drives, 
        activeSide: selection.side,
        show: settings.sidebar
    };
};

export default connect(mapStateToProps)(SideBar)