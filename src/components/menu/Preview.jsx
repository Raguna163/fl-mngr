import React from 'react';
import './Preview.scss';
import { connect, useSelector } from 'react-redux';
import { preview } from '../../redux/actions/ipcRx';

function Preview({preview}) {
    const [full, setFull] = React.useState(false)
    const image = useSelector(state => state.selection.image);
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

export default connect(null, { preview })(Preview);