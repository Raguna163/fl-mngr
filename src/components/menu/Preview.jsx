import React from 'react';
import './Preview.scss';
import { connect, useSelector } from 'react-redux';
import { preview } from '../../redux/actions/ipcRx';

function Preview({preview, location}) {
    const [full, setFull] = React.useState(false)
    const [ image, sidebar ] = useSelector(({selection, settings}) => [selection.image, settings.sidebar]);
    let whichPreview = sidebar ? 'side' : 'menu';
    if (whichPreview !== location || !image) return null;
    return (
        <div 
            id={`${full ? "full-" : ""}preview${sidebar ? "" : "-menu"}`} 
            onClick={() => { preview(null, null); setFull(false); }} 
            onContextMenu={() => setFull(!full)}
            className="segment"
        >
            <img src={`data:image/jpeg;base64,${image}`} alt="Preview" />
        </div>
    );
}

export default connect(null, { preview })(Preview);