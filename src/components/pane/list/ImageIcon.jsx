import React from 'react';
import cache from '../../../imageCache';
import { useSelector } from 'react-redux';

function ImageIcon({ target, side }) {
    const ID = btoa(target);
    const mounted = React.useRef(false);

    const zoomValues = [50, 75, 125, 200, 300]
    const zoom = useSelector(state => state.settings[side].zoom);

    React.useEffect(() => {
        let Image = document.getElementsByClassName(ID)[0];
        if (!mounted.current) {
            if (cache.allEntries().includes(ID)) {
                let entry = cache.getEntry(ID);
                Image.setAttribute('src', `data:image/jpeg;base64, ${entry}`);
            } else {
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
        }
    },[target, ID, side]);

    let size = zoomValues[zoom];
    return (
        <div className="file-icon img-icon">
            <img className={ID} src="/loading.gif" alt="" style={{ width: `${size}px` }}/>
        </div>
    );
}

export default ImageIcon;