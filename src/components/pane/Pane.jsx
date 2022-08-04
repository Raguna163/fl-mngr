import React, { useEffect } from 'react';
import './Pane.scss';
import { connect } from 'react-redux';
import { openContext, clearSelection } from '../../redux/actions';
import { fetchDir } from '../../redux/actions/ipcTx';
import Path from './Path';
import List from './list/List';
import Controls from './Controls';

function Pane(props) {
    const { fetchDir, side, active, multiPane } = props;
    const { dir } = props[side];

    let className = `pane${active === side ? "-active" : ""} segment`;
    let style = { maxWidth: multiPane ? '75%' : "100%" };

    useEffect(() => {
        fetchDir({dir, side});
    }, [dir, fetchDir, side]);

    function handleContext (e) {
        props.openContext({ x: e.pageX, y: e.pageY, target: dir, type: "pane" });
        props.sideSelection(side);
    }
    
    if (!multiPane && side === 'right') return null;
    return (
        <div
            id={`pane-${side}`}
            style={style}
            className={className}
            onClick={() => { if (!!props.selected.length) props.clearSelection() }}
            onContextMenu={handleContext} 
        >
            <Path dir={dir} side={side} />
            <List dir={dir} side={side} />
            <Controls side={side}/>
        </div>
    )
}

const mapStateToProps = ({ directory, selection, settings }) => {
    const { left, right } = directory;
    const { selected, side } = selection;
    return { 
        left, right, selected, 
        multiPane: settings.multiPane,
        grid: settings[side].grid,
        active: side
    }
}

export default connect(mapStateToProps, { fetchDir, openContext, clearSelection })(Pane);