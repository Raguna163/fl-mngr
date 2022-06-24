import React from 'react';
import './Controls.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { connect } from 'react-redux';
import { filterDir, changeViews, changeHistory, changeZoom } from "../../redux/actions";

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
        let result = [...folders, ...files].find(item => item.toLowerCase().includes(e.target.value.toLowerCase()));
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
                    spellCheck="false"
                    style={{ color: colour }}
                    placeholder="Filter..."
                    value={value}
                    onChange={handleChange}
                    onBlur={handleBlur}
                />
            </form>
            <div className={className.replace('controls','buttons')} onClick={props.saveSettings}>
                <div>
                    <FontAwesomeIcon
                        className="control-active"
                        icon={grid ? "list" : "table"} 
                        onClick={() => props.changeViews(side, "grid")}
                    />
                    <FontAwesomeIcon
                        className="control-active"
                        icon={splitView ? "chalkboard" : "columns"} 
                        onClick={() => props.changeViews(side, "splitView")}
                    />
                </div>
                <div>
                    <FontAwesomeIcon
                        icon="search-plus"
                        className={zoomInDisabled ? "control-inactive" : "control-active"}
                        color={zoomInDisabled ? "#000" : "#FFF"}
                        onClick={() => props.changeZoom(side, "increase")}
                    />
                    <FontAwesomeIcon 
                        icon="search-minus"
                        className={zoomOutDisabled ? "control-inactive" : "control-active"}
                        color={zoomOutDisabled ? "#000" : "#FFF"}
                        onClick={() => props.changeZoom(side, "decrease")}
                    />
                </div>
                <div>
                    <FontAwesomeIcon
                        icon="chevron-left"
                        className={backDisabled ? "control-inactive" : "control-active"}
                        color={backDisabled ? "#000" : "#FFF"}
                        onClick={() => { if (!backDisabled) props.changeHistory(side, "back") }}
                        />
                    <FontAwesomeIcon 
                        icon="chevron-right"
                        className={forwardDisabled ? "control-inactive" : "control-active"}
                        color={forwardDisabled ? "#000" : "#FFF"}
                        onClick={() => { if (!forwardDisabled) props.changeHistory(side, "forward") }}
                    />
                </div>
            </div>
        </div>
    );
}

const mapStateToProps = ({directory, selection, settings}) => {
    const { left, right } = directory;
    return { left, right, pane: selection.side, settings }
}

export default connect(mapStateToProps, { filterDir, changeViews, changeHistory, changeZoom })(Controls);