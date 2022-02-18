import React, { useState, useEffect } from 'react';
import './Command.scss'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { connect } from 'react-redux';
import { filterDir, commandContext, changeDir } from '../../redux/actions'
import { newItem, renameFile } from '../../redux/actions/ipcTx'


function Command(props) {
    const [value, setValue] = useState('');
    const { filterDir, command } = props;
    let folderMode = command.includes('>');
    let fileMode = command.includes('.');
    let pathMode = command.includes('/');
    let searchMode = command === "Search";

    useEffect(() => {
        if (searchMode) filterDir(value.toLowerCase(), "both");
    },[value, filterDir, searchMode]);

    useEffect(() => {
        if (fileMode || folderMode || pathMode) setValue(command);
        if (!searchMode) document.getElementById('command-input').focus();
    }, [command, folderMode, fileMode, pathMode, searchMode]);

    function handleSubmit(e) {
        e.preventDefault();
        
        if (fileMode || folderMode) {
            props.renameFile(command.substr(folderMode), value.substr(folderMode), props.pane);
        } 
        else if (pathMode) {
            let target = value.endsWith('/') ? value : value + '/';
            props.changeDir(target, props.pane);
        } 
        else if (!searchMode) {
            props.newItem(props.target, value, command);
        }
        document.getElementById('command-input').blur();
    }

    function handleBlur() {
        setTimeout(() => { 
            props.commandContext('Search');
            setValue('');
        }, 100);
    }

    function handleChange(e) {
        if (command.includes('>') && !e.target.value.length) setValue('>');
        else if (command.includes('>') && !e.target.value.startsWith('>')) setValue(">" + e.target.value);
        else setValue(e.target.value);
    }

    return (
        <form onSubmit={handleSubmit}>
            <input
                id="command-input"
                spellCheck={false}
                placeholder={command + "..."}
                value={value}
                onChange={handleChange}
                onBlur={handleBlur}
            />
            { value.length > 0 && <FontAwesomeIcon icon="times" /> }
        </form>
    );
}

const mapStateToProps = ({ context }) => {
    const { command, target, pane } = context;
    return { command, target, pane }
}

const mapDispatchToProps = { filterDir, newItem, commandContext, changeDir, renameFile }

export default connect(mapStateToProps, mapDispatchToProps)(Command);