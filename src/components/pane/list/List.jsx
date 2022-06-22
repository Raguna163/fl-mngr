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
    const { dir } = props[side];
    const { splitView, grid } = props.settings[side];
    let { files, folders } = props[side];

    function filterResults(items, filter) {
        return items.filter(item => item.toLowerCase().includes(filter));
    }

    if (props.filter) {
        files = filterResults(files, props.filter);
        folders = filterResults(folders, props.filter);
    }

    if (props[side].filter) {
        files = filterResults(files, props[side].filter);
        folders = filterResults(folders, props[side].filter);
    }

    function renderList(items, isFolder) {
        const type = isFolder ? "folder" : "file";
        return items.map((item,idx) => (
                <ListItem 
                    key={idx}
                    item={item} 
                    target={dir + item}
                    side={side}
                    isFolder={isFolder}
                    fileIcon={
                        props.settings.thumbnails && addIcon(type,item) === "file-image"
                        ? <ImageIcon target={dir + item} side={side}/>
                        : <FontAwesomeIcon className={`${type}-icon`} icon={addIcon(type, item)} />
                    }
                    checkIcon={<FontAwesomeIcon className="check-icon" icon="check" />}
                />
            )
        );
    }
    if (folders.length + files.length === 0) {
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
    if (splitView && folders.length + files.length) {
        return (
            <div className="split-list">
                <ul className={`list${grid ? "-grid" : ""}`}>
                    {renderList(folders, true)}
                </ul>
                <div className="list-divider"></div>
                <ul className={`list${grid ? "-grid" : ""}`}>
                    {renderList(files, false)}
                </ul>
            </div>
        );
    }
    return (
        <ul className={`list${grid ? "-grid" : ""}`}>
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