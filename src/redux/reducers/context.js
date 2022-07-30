import {
    OPEN_CONTEXT,
    CLOSE_CONTEXT,
    COMMAND_CONTEXT,
    PANE_CONTEXT,
    UPDATE_PROGRESS
} from "../actions/types";

const INITIAL_STATE = {
    command: 'Search',
    sidebar: false,
    pane: 'left',
    target: '', // Full Path to current target
    type: '', // file / folder / pane
    contextOpen: false,
    pos: {
        x: 0,
        y: 0
    },
    progress: {
        task: null,
        complete: 0,
        total: 0
    }
}


export default (state = INITIAL_STATE, { payload, type }) => {
    switch (type) {
        case OPEN_CONTEXT:
            const { x, y, target } = payload;
            const pane = x > window.innerWidth / 2 ? "right" : "left";
            return { ...state, pos: { x, y }, contextOpen: true, type: payload.type, target, pane }
        case CLOSE_CONTEXT:
            return { ...state, contextOpen: false }
        case COMMAND_CONTEXT:
            return { ...state, command: payload }
        case PANE_CONTEXT:
            return { ...state, pane: payload }
        case UPDATE_PROGRESS:
            return { ...state, progress: payload }
        default:
            return state;
    }
}