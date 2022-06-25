import React from 'react';
import '../pane/Controls.scss'
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { toggleMultiPane, toggleSidebar, toggleThumbs } from '../../redux/actions';
import { saveSettings } from '../../redux/actions/ipcTx';
import { useDispatch, useSelector } from 'react-redux';

function Settings(props) {
    const States = [{ icon: "right-from-bracket", rotate: 0 },
                    { icon: "right-to-bracket", rotate: 180 }]
    let dispatch = useDispatch();
    let settings = useSelector(state => state.settings);
    let [ sidebarState, setSidebarState ] = React.useState(settings.sidebar ? 1 : 0)
    function toggleSidebar () {
        dispatch({ type: "TOGGLE_SIDEBAR" }); 
        setSidebarState(1 - sidebarState);
    }
    return (
        <div className="settings">
            <div className='pane-buttons' onClick={props.saveSettings}>
                <FontAwesomeIcon className='control-active' 
                    onClick={toggleSidebar}
                    icon={States[sidebarState].icon}
                    rotation={States[sidebarState].rotate}
                />
                <FontAwesomeIcon className='control-active' icon="columns" onClick={props.toggleMultiPane} />
                <span 
                    className="fa-layers fa-fw control-active" 
                    onClick={props.toggleThumbs}
                    style={{ margin: "auto 3px", padding: "10px 5px" }}
                >
                    <FontAwesomeIcon icon="image"/>
                    {!settings.thumbnails && <FontAwesomeIcon icon="slash" color='red'/>}
                </span>
            </div>
        </div>
    );
}

export default connect(null, { toggleMultiPane, toggleSidebar, toggleThumbs, saveSettings })(Settings);