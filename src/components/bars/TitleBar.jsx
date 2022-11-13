import React from 'react';
import './TitleBar.scss';
import Tooltip from '../context/Tooltip';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
const { send } = window.ipc;

function TitleBar() {
    const [maximized, toggleMax] = React.useState(false);
    const [fullscreen, toggleFullscreen] = React.useState(false);
    let isMax = maximized ? "restore" : "maximize";
    let isFullscreen = fullscreen ? "compress" : "expand";
    let debounce = React.useRef(null);

    React.useEffect(() => {
        const handleResize = e => {
            clearTimeout(debounce.current);
            debounce.current = setTimeout(() => {
                const { outerWidth, innerHeight, screen } = e.currentTarget.window;
                if (outerWidth >= screen.availWidth) {
                    if (innerHeight >= screen.availHeight) toggleMax(true);
                    else toggleMax(false)
                    if (innerHeight >= screen.height) toggleFullscreen(true);
                    else toggleFullscreen(false)
                } else {
                    toggleMax(false);
                    toggleFullscreen(false);
                }
            }, 200);
        }
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize)
    }, [debounce]);

    function windowControl(type) {
        send('window:control', type);
        if (type === "restore" || type === "maximize") toggleMax(!maximized);
        else if (type !== "close") toggleFullscreen(!fullscreen);
    }

    return (
        <div className='title-bar'>
            <span>
                <FontAwesomeIcon icon='folder' />
            </span>
            <span className='title-bar-title'>F L - M N G R</span>
            <div className='title-bar-controls'>
                <Tooltip content="Minimize" pos='bottom'>
                    <FontAwesomeIcon
                        icon='window-minimize'
                        onClick={() => windowControl("minimize")}
                    />
                </Tooltip>
                <Tooltip content="Maximize" pos='bottom'>
                    <FontAwesomeIcon
                        icon={`window-${isMax}`}
                        onClick={() => windowControl(isMax)}
                    />
                </Tooltip>
                <Tooltip content="Fullscreen" pos='bottom'>
                    <FontAwesomeIcon
                        icon={isFullscreen}
                        onClick={() => windowControl(isFullscreen)}
                    />
                </Tooltip>
                <Tooltip content="Close" pos='bottom'>
                    <FontAwesomeIcon
                        icon='window-close'
                        onClick={() => windowControl("close")}
                    />
                </Tooltip>
            </div>
        </div>
    );
}

export default TitleBar