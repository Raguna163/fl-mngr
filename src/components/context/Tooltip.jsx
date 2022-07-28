import React, { useState } from "react";
import './Tooltip.scss';

function Tooltip(props) {
    let timeout;
    const [active, setActive] = useState(false);

    function show() {
        timeout = setTimeout(() => setActive(true), 500);
    }

    function hide() {
        clearInterval(timeout);
        setActive(false);
    }

    return (
        <div
            className='Tooltip-Wrapper'
            onMouseEnter={show}
            onMouseLeave={hide}
            onClick={hide}
        >
            {active && (
              <div className={`Tooltip-${props.pos || "top"}`}>
                    {props.content}
                </div>
            )}
            {props.children}
        </div>
    );
};

export default Tooltip;
