import React from "react";
import './Progress.scss';

function Progress(props) {
    return (
        <div className='progress'>
            <span
                style={props.styling}
            ></span>
            <span></span>
            { props.children }
        </div>
    );
};

export default Progress;
