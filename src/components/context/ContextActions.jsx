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
    openExplorer 
} from "../../redux/actions/ipcTx";

function ContextActions(props) {
    // React.useEffect(() => {},[props.multi]);
    return Object.values(Menu[props.type]).map((item,idx) => {
        let { icon, title, func } = item;
        if (props.multi ? props.multi !== func.endsWith('s') : false) return null;
        if (!props.multiPane && (title === "Copy" || title === "Move")) return null;
        let arg = argumentReducer(item, props);
        return (
            <p className="context-actions" key={idx} onClick={() => props[func](arg)}>
                <FontAwesomeIcon className="icon" icon={icon} />
                {title}
            </p>
        );
    });
}

const mapStateToProps = ({ context, settings }) => {
    const { pane, target } = context;
    return { pane, target, multiPane: settings.multiPane }
}

const mapDispatchToProps = { 
    commandContext, 
    deleteItems, 
    copyItems, 
    moveItems, 
    openWith, 
    copyPath, 
    previewFile,  
    openExplorer
}

export default connect(mapStateToProps, mapDispatchToProps)(ContextActions);