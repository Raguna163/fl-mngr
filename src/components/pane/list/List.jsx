import React from 'react';
import './List.scss';
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { addIcon } from '../../../icons';
import { selectAll, clearSelection } from '../../../redux/actions';
import { copyItems, moveItems, deleteItems } from '../../../redux/actions/ipcTx';
import ListItem from './ListItem';
import ImageIcon from './ImageIcon';
import ContextActions from '../../context/ContextActions';

function List(props) {
    const { side, activeSide } = props;
    const { selectAll, clearSelection, copyItems, moveItems, deleteItems } = props;
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

    React.useEffect(() => {
        const handleKeypress = event => {
            if (event.ctrlKey && side === activeSide) {
                if (event.key === "a") selectAll(side);
                else if (event.key === "c") copyItems(dir + '\\.');
                else if (event.key === "x") moveItems(dir + '\\.');
            } 
            else if (event.key === "Delete" && side === activeSide) deleteItems(side);
            else if (event.key === "Escape") clearSelection();
        };
        document.addEventListener("keyup", handleKeypress);
        return () => {
            document.removeEventListener("keyup", handleKeypress);
        };
    }, [dir, side, activeSide, selectAll, clearSelection, copyItems, moveItems, deleteItems]);

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

const mapStateToProps = ({ directory, settings, selection }) => {
    const { left, right, filter } = directory;
    return { left, right, filter, settings, activeSide: selection.side };
}

const mapDispatchToProps = { selectAll, clearSelection, copyItems, moveItems, deleteItems };

export default connect(mapStateToProps, mapDispatchToProps)(List);