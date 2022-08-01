import React from 'react';
import './Controls.scss';
import Tooltip from '../context/Tooltip';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { connect } from 'react-redux';
import { filterDir, changeViews, changeHistory, changeZoom } from "../../redux/actions";
import { saveSettings } from '../../redux/actions/ipcTx';

function Controls(props) {
    const { side, filterDir, pane } = props;
    const { history } = props[side];
    const { splitView, grid, zoom } = props.settings[side];

    const [ value, setValue ] = React.useState('');
    const [ colour, setColour ] = React.useState('white');

    let debounce = React.useRef();
    let lastMatch = React.useRef("");
    let className = `pane-controls-${side}`
    let forwardDisabled = history.entries.length === history.index;
    let backDisabled = history.index === 1;
    let zoomInDisabled = zoom === 4;
    let zoomOutDisabled = zoom === 0;

    React.useEffect(() => {
        clearTimeout(debounce.current);
        debounce.current = setTimeout(() => { filterDir(value, side) }, 150);
    },[filterDir, value, side, debounce]);

    React.useEffect(() => {
        const keypressFn = e => {
            if (e.ctrlKey && e.key === "f" && side === pane) {
                document.querySelector(`.${className} input`).focus();
            } 
        }
        document.addEventListener('keyup', keypressFn)
        return function cleanup() {
            document.removeEventListener('keyup', keypressFn)
        }
    }, [className, side, pane]);

    function handleChange(e) {
        const { folders, files } = props[side]
        let result = [...folders, ...files].find(item => item.name.toLowerCase().includes(e.target.value.toLowerCase()));
        if (result) {
            setColour("white");
            lastMatch.current = e.target.value;
        }
        else setColour("#f05858");
        if (value.length > e.target.value.length) {
            setValue(lastMatch.current);
            setColour("white");
        } else {
            setValue(e.target.value);
        }
    }

    function handleBlur() { setTimeout(() => setValue(''), 100) }

    return (
        <div className={className}>
            <form onSubmit={e => e.preventDefault()}>
                <input
                    name='filter'
                    spellCheck='false'
                    style={{ color: colour }}
                    placeholder='Filter...'
                    value={value}
                    onChange={handleChange}
                    onBlur={handleBlur}
                />
            </form>
            <div
                className={className.replace("controls", "buttons")}
                onClick={props.saveSettings}
            >
                <div>
                    <Tooltip content={grid ? "List" : "Grid"}>
                        <FontAwesomeIcon
                            className='control-active'
                            icon={grid ? "list" : "table"}
                            onClick={() => props.changeViews(side, "grid")}
                        />
                    </Tooltip>
                    <Tooltip content='Split View'>
                        <FontAwesomeIcon
                            className='control-active'
                            icon={splitView ? "chalkboard" : "columns"}
                            onClick={() => props.changeViews(side, "splitView")}
                        />
                    </Tooltip>
                </div>
                <div>
                    <Tooltip content='Zoom In'>
                        <FontAwesomeIcon
                            icon='search-plus'
                            className={
                                zoomInDisabled
                                    ? "control-inactive"
                                    : "control-active"
                            }
                            color={zoomInDisabled ? "#000" : "#FFF"}
                            onClick={() => props.changeZoom(side, "increase")}
                        />
                    </Tooltip>
                    <Tooltip content='Zoom Out'>
                        <FontAwesomeIcon
                            icon='search-minus'
                            className={
                                zoomOutDisabled
                                    ? "control-inactive"
                                    : "control-active"
                            }
                            color={zoomOutDisabled ? "#000" : "#FFF"}
                            onClick={() => props.changeZoom(side, "decrease")}
                        />
                    </Tooltip>
                </div>
                <div>
                    <Tooltip content='Back'>
                        <FontAwesomeIcon
                            icon='chevron-left'
                            className={
                                backDisabled
                                    ? "control-inactive"
                                    : "control-active"
                            }
                            color={backDisabled ? "#000" : "#FFF"}
                            onClick={() => {
                                if (!backDisabled)
                                    props.changeHistory(side, "back");
                            }}
                        />
                    </Tooltip>
                    <Tooltip content='Forward'>
                        <FontAwesomeIcon
                            icon='chevron-right'
                            className={
                                forwardDisabled
                                    ? "control-inactive"
                                    : "control-active"
                            }
                            color={forwardDisabled ? "#000" : "#FFF"}
                            onClick={() => {
                                if (!forwardDisabled)
                                    props.changeHistory(side, "forward");
                            }}
                        />
                    </Tooltip>
                </div>
            </div>
        </div>
    );
}

const mapStateToProps = ({directory, selection, settings}) => {
    const { left, right } = directory;
    return { left, right, pane: selection.side, settings }
}

const mapDispatchToProps = { filterDir, changeViews, changeHistory, changeZoom, saveSettings }

export default connect(mapStateToProps, mapDispatchToProps)(Controls);