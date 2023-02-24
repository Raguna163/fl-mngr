import React from 'react';
import './Preview.scss';
import { connect, useSelector } from 'react-redux';
import { preview } from '../../redux/actions/ipcRx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Tooltip from '../context/Tooltip';

function Preview({preview, location}) {
    const [full, setFull] = React.useState(false)
    const [ previewInfo, sidebar ] = useSelector(({selection, settings}) => [selection.preview, settings.sidebar]);
    let whichPreview = sidebar ? 'side' : 'menu';
    if (whichPreview !== location || !previewInfo.type) return null;

    function renderPreview() {
        const { type, data } = previewInfo
        switch (type) {
            case 'image':
                return ( <img src={`data:image/jpeg;base64,${data}`} alt='Preview' />);
            case 'text':
                return ( <div id="preview-text"><pre>{ data }</pre></div> );
            case 'no-preview':
                return ( <div id="preview-text"><p>Not Supported</p></div> );
            default:
                return null;
        }
    }

    return (
        <div
            id={`${full ? "full-" : ""}preview${sidebar ? "" : "-menu"}`}
            className='segment'
        >
            <div id='preview-icons'>
                <p>Preview</p>
                <Tooltip content={full ? "Shrink" : "Fullscreen"}>
                    <FontAwesomeIcon
                        className='control'
                        icon={full ? "compress" : "expand"}
                        onClick={() => setFull(!full)}
                    />
                </Tooltip>
                <Tooltip content="Close">
                    <FontAwesomeIcon
                        className='control'
                        icon='close'
                        onClick={() => { preview(null, null); setFull(false); }}
                    />
                </Tooltip>
            </div>
            {renderPreview()}
        </div>
    );
}

export default connect(null, { preview })(Preview);