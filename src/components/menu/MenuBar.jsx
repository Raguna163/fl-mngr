import React from 'react';
import './MenuBar.scss';
import Command from './Command';
import Preview from './Preview';
import Settings from './Settings';

function MenuBar() {
    return (
        <header className="menu-bar segment">
            <Settings/>
            <Command />
            <Preview side="left"/>
        </header>
    );
}

export default MenuBar;