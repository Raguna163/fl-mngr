import React from 'react';
import cache from '../../../imageCache';
import { useSelector } from 'react-redux';

function ImageIcon({ target, side }) {
    const ID = btoa(target);
    const mounted = React.useRef(false);

    const zoomValues = [50, 100, 250, 400, 500]
    const zoom = useSelector(state => state.settings[side].zoom);

    React.useEffect(() => {
        let Image = document.getElementsByClassName(ID)[0];
        if (!mounted.current) {
            if (cache.allEntries().includes(ID)) {
                let entry = cache.getEntry(ID);
                Image.setAttribute('src', `data:image/jpeg;base64, ${entry}`);
            } else {
                // Image.setAttribute('src', );
                window.ipc.send('img:icon', { target, ID, side });
                Image.onload = () => {
                    let data = Image.getAttribute('src').split(',')[1];
                    if (data) cache.addEntry(ID, data);
                }
            }
            mounted.current = true;
        } else {
            let entry = cache.getEntry(ID);
            if (entry) Image.setAttribute('src', `data:image/jpeg;base64, ${entry}`);
            mounted.current = false;
        }
        return function cleanup() {
            Image.onload = null;
            Image.removeAttribute('src');
            // Image.remove();
        }
    },[target, ID, side]);

    let size = zoomValues[zoom];
    return (
        <div className="file-icon img-icon">
            <img className={ID} src="/loading.gif" alt="" style={{ height: `${size}px` }}/>
        </div>
    );
}

export default ImageIcon;