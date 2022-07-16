import React from 'react';
import './StatusBar.scss';
import Tooltip from '../context/Tooltip';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { connect, useSelector } from 'react-redux';
import { openGit } from '../../redux/actions/ipcTx';

function StatusBar(props) {
    let selection = useSelector(state => state.selection);
    let itemsSelected = selection.selected.length;
    return (
        <footer className='status-bar'>
            <div>
                {itemsSelected > 0 
                ? ( <span>{itemsSelected} Selected</span> ) 
                : (
                    <Tooltip content="Open Github">
                        <span id='git' onClick={props.openGit}>
                            Made With <FontAwesomeIcon icon='heart' />
                        </span>
                    </Tooltip>
                )}
            </div>
        </footer>
    );
}

export default connect(null, { openGit })(StatusBar);