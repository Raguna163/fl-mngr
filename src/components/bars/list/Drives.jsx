import React from 'react';
import { connect } from 'react-redux';
import '../SideBar.scss';
import { fetchDrives } from "../../../redux/actions/ipcTx";
import { changeDir } from '../../../redux/actions';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

function Drives(props) {
    React.useEffect(props.fetchDrives,[props.fetchDrives]);
    function renderList(drives) {
        if (!drives) return <p>Loading...</p>
        else return drives.map((drive, idx) => (
            <li
                onClick={() =>
                    props.changeDir(drive._mounted + "\\", props.activeSide)
                }
                key={idx}
            >
                <FontAwesomeIcon icon='hard-drive' />
                <span>{drive._mounted}\</span>
                <span>{drive._capacity}</span>
                <div className='progress'>
                    <span
                        style={{
                            width: drive._capacity,
                            backgroundColor:
                                parseInt(drive._capacity) > 80
                                    ? "#b33d3d"
                                    : "#70e7a6",
                        }}
                    ></span>
                    <span></span>
                </div>
            </li>
        ));
    }
    return (
        <div id='drives'>
          <ul>{renderList(props.drives)}</ul>
        </div>
    );
}

const mapStateToProps = ({directory, selection}) => {
  return { drives: directory.drives, activeSide: selection.side }
}

export default connect(mapStateToProps, { fetchDrives, changeDir })(Drives)