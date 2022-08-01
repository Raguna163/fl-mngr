import React, { useEffect } from 'react';
import './Pane.scss';
import { connect } from 'react-redux';
import { openContext, clearSelection, sideSelection } from '../../redux/actions';
import { fetchDir } from '../../redux/actions/ipcTx';
import Path from './Path';
import List from './list/List';
import Controls from './Controls';

function Pane(props) {
    const { fetchDir, side, active, multiPane, sideSelection } = props;
    const { dir } = props[side];

    let className = `pane${active === side ? "-active" : ""} segment`;
    let style = { maxWidth: multiPane ? '75%' : "100%" };

    useEffect(() => {
        fetchDir({dir, side});
    }, [dir, fetchDir, side]);

    useEffect(() => {
        const handleKeypress = event => {
            // event.preventDefault();
            if (event.key === "Tab" && side === active) sideSelection(side === 'left' ? 'right' : 'left');
        };
        document.addEventListener("keydown", handleKeypress);
        return () => {
            document.removeEventListener("keydown", handleKeypress);
        };
    }, [active, side, dir, sideSelection])

    const handleContext = e => {
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

const mapDispatchToProps = { fetchDir, openContext, clearSelection, sideSelection }

export default connect(mapStateToProps, mapDispatchToProps)(Pane);