import React from "react";
import { connect } from "react-redux";
import "../SideBar.scss";
import { changeDir, openContext } from "../../../redux/actions";

function Fave(props) {
    function renderList(faves) {
        return faves.map((fave, idx) => (
            <li
                onClick={() => props.changeDir(fave.path, props.activeSide)}
                onContextMenu={e => props.openContext({ x: e.pageX, y: e.pageY, target: fave.path, type: "fave", })}
                key={idx}
            >
                {props.starIcon}
                <span>{fave.name}</span>
            </li>
        ));
    }
    return (
        <div id='faves'>
            <ul>{renderList(props.faves)}</ul>
        </div>
    );
}

export default connect(null, { changeDir, openContext })(Fave);
