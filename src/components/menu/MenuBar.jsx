import React from 'react';
import './MenuBar.scss';
import Command from './Command';
// import Title from './Title';
import Preview from './Preview';
import Settings from './Settings'

function MenuBar() {
    return (
        <header className="menu-bar segment">
            <Settings />
            {/* <Title side="left"/> */}
            <Command />
            {/* <Title side="right"/> */}
            <Preview side="left"/>
        </header>
    );
}

export default MenuBar;