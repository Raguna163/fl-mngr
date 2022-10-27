import React from 'react';
import './Pane.scss';
import { connect } from 'react-redux';
import { openContext, clearSelection, addSelection, openDrag } from '../../redux/actions';
import { fetchDir, copyItems, moveItems } from '../../redux/actions/ipcTx';
import Path from './Path';
import List from './list/List';
import Controls from './Controls';

function Pane(props) {
    const { fetchDir, side, active, multiPane } = props;
    const { dir } = props[side];

    let className = `pane${active === side ? "-active" : ""} segment`;
    let style = { maxWidth: multiPane ? '75%' : "100%" };

    React.useEffect(() => {
        fetchDir({dir, side});
    }, [dir, fetchDir, side]);

    React.useEffect(() => {
        const getTarget = e => {
            let filter = ({id}) => id === `list-${side}` || id === `path-${side}`;
            let target = e.path.filter(filter)[0]?.id;
            
            if (target === `list-${side}`) {
                let { files } = e.dataTransfer;
                if (files.length !== 0) return files[0].path;
                else return props[props.side].dir;
            } 
            else if (target === `path-${side}`) {
                let crumb = e.path.filter(elem => elem.className === 'crumb')[0];
                if (crumb) return crumb.dataset.pathto;
                else return null;       
            }
            else return null;
        }
        let throttle = null;
        const handleDrag = e => {
            e.preventDefault();
            if (!throttle) {
                let target = getTarget(e);
                if (target) {
                    props.openDrag({ x: e.pageX, y: e.pageY + 40, target, type: 'folder' });
                }
                throttle = setTimeout(() => throttle = false, 50);
            }
            
        }
        const handleDrop = e => {
            e.preventDefault();

            for (const file of e.dataTransfer.files) {
                let itemName = file.path.substring(file.path.lastIndexOf('\\') + 1);
                props.addSelection(itemName, side);
            }

            let dir = getTarget(e);
            if (dir) {
                if (e.ctrlKey) props.moveItems({ dir, side });
                else props.copyItems({ dir, side });
            }
        };

        let dropZone = document.getElementById(`pane-${props.side}`);
        if (dropZone) {
            dropZone.ondragover = e => e.preventDefault();
            dropZone.ondragover = handleDrag
            dropZone.addEventListener("drop", handleDrop);
            return () => {
                dropZone.removeEventListener("drop", handleDrop);
            };
        }
    },[props, side]);

    function handleContext (e) {
        props.openContext({ x: e.pageX, y: e.pageY, target: dir, type: "pane" });
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

const mapDispatchToProps = { fetchDir, openContext, addSelection, clearSelection, copyItems, moveItems, openDrag }

export default connect(mapStateToProps, mapDispatchToProps)(Pane);