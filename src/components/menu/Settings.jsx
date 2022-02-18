import React from 'react';
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { toggleMultiPane, toggleSidebar, toggleThumbs } from '../../redux/actions';

function Settings(props) {
    return (
        <div className="settings">
            <h4>Settings</h4>
            <div>
                <FontAwesomeIcon icon="columns" onClick={props.toggleMultiPane} />
                <FontAwesomeIcon icon="file" onClick={props.toggleSidebar} />
                <FontAwesomeIcon icon="image" onClick={props.toggleThumbs} />
            </div>
        </div>
    );
}

export default connect(null, { toggleMultiPane, toggleSidebar, toggleThumbs })(Settings);