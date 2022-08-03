import React from 'react';
import './List.scss';
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { addIcon } from '../../../icons';
import { selectAll, clearSelection, changeDir } from '../../../redux/actions';
import { copyItems, moveItems, deleteItems, openFile } from '../../../redux/actions/ipcTx';
import ListItem from './ListItem';
import ImageIcon from './ImageIcon';
import ContextActions from '../../context/ContextActions';
import keyBoardControls from '../../../keyboard';

function List(props) {
    const { side, activeSide, settings } = props;
    const { splitView, grid } = props.settings[side];
    let { dir, files, folders } = props[side];

    let itemCount = files.length + folders.length;
    let listOrGrid = `list${grid ? "-grid" : ""}`;

    let initialState = { section: folders.length > 0 ? "folder" : "file", idx: -1 };
    const [highlighted, setHighlighted] = React.useState(initialState);

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

    const keyBoardVars = { props, dir, side, files, folders, settings: { splitView, grid } };
    React.useEffect(() => {
        const handleKeydown = event => {
            const { key, keyCode } = event;
            let { props, dir, side } = keyBoardVars;
            if ((keyCode >= 37 && keyCode <= 40) || key === 'Tab') event.preventDefault();
            if (side === activeSide) {
                if (event.ctrlKey) {
                    if (key === "a") props.selectAll(side);
                    else if (key === "c") props.copyItems(dir + '\\.');
                    else if (key === "x") props.moveItems(dir + '\\.');
                    else if (key === "Delete") props.deleteItems(side);
                } else {
                    let keyBoardInfo = { event, keyBoardVars, highlighted, setHighlighted }
                    keyBoardControls(keyBoardInfo);
                }
            }
            else if (key === "Escape") props.clearSelection();
        };
        document.addEventListener("keydown", handleKeydown);
        return () => {
            document.removeEventListener("keydown", handleKeydown);
        };
    }, [activeSide, keyBoardVars, highlighted]);

    function renderList(items, isFolder) {
        const type = isFolder ? "folder" : "file";
        return items.map((item,idx) => {
            let itemName = item.name ?? item;
            let icon = addIcon(type, itemName);
            let isFileImage = icon === "file-image";
            let isVideoThhumbnail = settings.ffmpeg && icon === "file-video";
            let isHighlighted = highlighted.idx === idx && highlighted.section === type
            return (
                <ListItem
                    key={idx}
                    item={itemName}
                    size={item.size}
                    target={dir + itemName}
                    highlight={isHighlighted}
                    side={side}
                    isFolder={isFolder}
                    onClick={() => setHighlighted(initialState)}
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

const mapDispatchToProps = { selectAll, clearSelection, copyItems, moveItems, deleteItems, changeDir, openFile };

export default connect(mapStateToProps, mapDispatchToProps)(List);