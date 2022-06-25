import React from 'react';
import './MenuBar.scss';
import Command from './Command';
import Settings from './Settings';
import Preview from '../menu/Preview';

function MenuBar() {
    return (
        <header className="menu-bar segment">
            <Settings/>
            <Command />
            <Preview location='menu'/>
        </header>
    );
}

export default MenuBar;