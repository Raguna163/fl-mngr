import React from 'react';
import './List.scss';
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { addIcon } from '../../../icons';
import ListItem from './ListItem';
import ImageIcon from './ImageIcon';
import ContextActions from '../../context/ContextActions';

function List(props) {
    const { side } = props;
    const { splitView, grid } = props.settings[side];
    let { dir, files, folders } = props[side];

    function filterResults(items, filter) {
        return items.filter(item => {
            let itemName = item.name ?? item;
            return itemName.toLowerCase().includes(filter);
        });
    }

    if (props.filter) {
        files = filterResults(files, props.filter);
        folders = filterResults(folders, props.filter);
    }
    else if (props[side].filter) {
        files = filterResults(files, props[side].filter);
        folders = filterResults(folders, props[side].filter);
    }

    let itemCount = files.length + folders.length;
    let listOrGrid = `list${grid ? "-grid" : ""}`

    function renderList(items, isFolder) {
        const type = isFolder ? "folder" : "file";
        return items.map((item,idx) => {
            let itemName = item.name ?? item;
            let icon = addIcon(type, itemName);
            let { settings } = props;
            let isFileImage = icon === "file-image";
            let isVideoThhumbnail = settings.ffmpeg && icon === "file-video";
            return (
                <ListItem
                    key={idx}
                    item={itemName}
                    size={item.size}
                    target={dir + itemName}
                    side={side}
                    isFolder={isFolder}
                    isFiltered={!!(props.filter || props[side].filter)}
                    checkIcon={
                        <FontAwesomeIcon className='check-icon' icon='check' />
                    }
                    fileIcon={
                        settings.thumbnails && ( isFileImage || isVideoThhumbnail )
                        ? <ImageIcon target={dir + itemName} side={side} />
                        : <FontAwesomeIcon
                                className={`${type}-icon`}
                                icon={icon}
                          />
                    }
                />
            );
        });
    }

    if (itemCount === 0) {
        let isFiltered = props.filter + props[side].filter
        if (isFiltered) return (
            <ul className="list-empty">
                <span>No search results for "{isFiltered}"</span>
            </ul> 
        )
        return (
            <ul className="list-empty">
                <span>The folder</span>
                <span className="empty-folder">
                     <FontAwesomeIcon className="icon" icon="folder"/> 
                     {dir.split('\\')[dir.split('\\').length - 2]}
                </span>
                <span>is empty</span>
                <ContextActions type="pane" />
            </ul> 
        );
    }

    if (splitView) {
        return (
            <div className="split-list">
                { folders.length !== 0 && <ul className={listOrGrid}> {renderList(folders, true)} </ul> }
                { (folders.length > 0 && files.length > 0) && <div className="list-divider"></div> }
                { files.length !== 0 && <ul className={listOrGrid}> {renderList(files, false)} </ul> }
            </div>
        );
    }

    return (
        <ul className={listOrGrid}>
            {renderList(folders, true)}
            {renderList(files, false)}
        </ul>
    );
}

const mapStateToProps = ({ directory, settings }) => {
    const { left, right, filter } = directory;
    return { left, right, filter, settings };
}

export default connect(mapStateToProps)(List);