import React from 'react';
import './Path.scss';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { connect } from 'react-redux';
import { changeDir, openContext } from "../../redux/actions";

function Path(props) {
    let pathTo = "";
    return (
        <div className="Path">{
            props.dir.split('\\').slice(0, -1).map((crumb, idx, arr) => {
                pathTo += `${crumb}\\`
                let target = pathTo;
                let handleContext = e => {
                    e.stopPropagation();
                    props.openContext({ x: e.pageX, y: e.pageY, target, type: "path" });
                }
                if (idx === arr.length - 1) {
                    return (
                        <p key={idx} className="active-crumb" onContextMenu={handleContext}>
                            <span>{ crumb }</span>
                        </p>
                    );
                }
                return (
                    <p 
                        key={idx} 
                        onClick={() => props.changeDir(target, props.side)}
                        onContextMenu={handleContext}
                    >
                        <span>{crumb}</span>
                        <FontAwesomeIcon className="crumb-icon" icon="chevron-right" />
                    </p>
                );
            })
        }</div>
    );
}

export default connect(null, { changeDir, openContext })(Path);