import React from 'react';
import './StatusBar.scss';
import Tooltip from '../context/Tooltip';
import Progress from '../context/Progress';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { connect } from 'react-redux';
import { openGit } from '../../redux/actions/ipcTx';
import { updateProgress } from '../../redux/actions/ipcRx';

function StatusBar(props) {
    let itemsSelected = props.selected.length;

    let styling;
    const { progress } = props;
    if (progress.task) {
        styling = {
            width: (progress.complete / progress.total) * 60 + "%",
            backgroundColor: "#70e7a6"
        };
        if (progress.complete === progress.total) {
            setTimeout(() => {
                props.updateProgress(null, { type: 'done' });   
            }, 3000);
        }
    }

    const progressText = () => (
        <p className='progress-text'>
            <span>{progress.complete}</span>/
            <span>{progress.total}</span>
            <span>{progress.task}</span>
        </p>
    )
    
    return (
        <footer className='status-bar'>
            { progress.task ? <Progress styling={styling}>{progressText()}</Progress> : <div></div> }
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
            <div></div>
        </footer>
    );
}

const mapStateToProps = ({context, selection}) => {
    return { progress: context.progress, selected: selection.selected }
};

export default connect(mapStateToProps, { openGit, updateProgress })(StatusBar);