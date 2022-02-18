import React from 'react';
import './Preview.scss';
import { connect } from 'react-redux';
import { preview } from '../../redux/actions/ipcRx';
import { useState } from 'react';

function Preview({image, preview}) {
    const [full, setFull] = useState(false)
    if (!image) return null;
    return (
        <div 
            id={`${full ? "full-" : ""}preview`} 
            onClick={() => { preview(null, null); setFull(false); }} 
            onContextMenu={() => setFull(!full)}>
            <img src={`data:image/jpeg;base64,${image}`} alt="Preview" />
        </div>
    );
}

const mapStateToProps = ({ selection }) => {
    return { image: selection.image }
}

export default connect(mapStateToProps, { preview })(Preview);