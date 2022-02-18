import React from 'react';
import './Title.scss';

function Title({side}) {
    return (
        <div className={`title title-${side}`}>
            <h1>F L - M N G R</h1>
            <h5>A E S T H E T I C - A S - F * * K</h5>
        </div>
    );
}

export default Title;