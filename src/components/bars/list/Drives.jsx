import React from 'react';
import { connect } from 'react-redux';
import '../SideBar.scss';
import { fetchDrives } from "../../../redux/actions/ipcTx";
import { changeDir } from '../../../redux/actions';
import Progress from '../../context/Progress';

function Drives(props) {
    React.useEffect(props.fetchDrives,[props.fetchDrives]);
    function renderList(drives) {
        if (!drives) return <p>Loading...</p>
        else return drives.map((drive, idx) => {
            let styling = {
                width: drive._capacity,
                backgroundColor: parseInt(drive._capacity) > 80 ? "#b33d3d" : "#70e7a6",
            };
            return (
                <li
                    onClick={() =>
                        props.changeDir(drive._mounted + "\\", props.activeSide)
                    }
                    key={idx}
                >
                    {props.driveIcon}
                    <span>{drive._mounted}\</span>
                    <span>{drive._capacity}</span>
                    <Progress styling={styling}></Progress>
                </li>
            )
        });
    }
    return (
        <div id='drives'>
          <ul>{renderList(props.drives)}</ul>
        </div>
    );
}

export default connect(null, { fetchDrives, changeDir })(Drives)