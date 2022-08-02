import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react'
import { connect } from 'react-redux';
import { commandContext } from '../../redux/actions'
import Menu, { argumentReducer } from './menu';
import { 
    deleteItems, 
    copyItems, 
    moveItems, 
    openWith, 
    copyPath, 
    previewFile, 
    openExplorer,
    editFavourites
} from "../../redux/actions/ipcTx";

const zoomValues = [ "x-small", "small", "medium", "larger", "xx-large"]

function ContextActions(props) {
    return Object.values(Menu[props.type]).map((item,idx) => {
        let { icon, title, func } = item;
        if (props.multi ? props.multi !== func.endsWith('s') : false) return null;
        if (!props.multiPane && (title === "Copy" || title === "Move")) return null;
        let arg = argumentReducer(item, props);

        let alreadyFave = props.faves.some(fave => fave.path === arg);
        if (title === "Add Fave" && alreadyFave) title = title.replace("Add", "Delete");
        return (
            <p 
                key={idx} 
                className="context-actions" 
                onClick={() => props[func](arg)}
                style={{ fontSize: zoomValues[props.zoom] }}
            >
                <FontAwesomeIcon className="icon" icon={icon} />
                {title}
            </p>
        );
    });
}

const mapStateToProps = ({ context, settings, directory }) => {
    const { pane, target } = context;
    const { zoom } = settings[pane];
    return { pane, target, zoom, multiPane: settings.multiPane, faves: directory.favourites }
}

const mapDispatchToProps = { 
    commandContext, 
    deleteItems, 
    copyItems, 
    moveItems, 
    openWith, 
    copyPath, 
    previewFile,
    openExplorer,
    editFavourites
}

export default connect(mapStateToProps, mapDispatchToProps)(ContextActions);