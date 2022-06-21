import {
    TOGGLE_MULTIPANE,
    TOGGLE_SIDEBAR,
    TOGGLE_VIEW,
    TOGGLE_THUMBNAILS,
    CHANGE_ZOOM
} from "../actions/types";

const SAVED_STATE = window.initialState.settings;

export default (state = SAVED_STATE, { payload, type }) => {
    switch (type) {
        case TOGGLE_MULTIPANE:
            return { ...state, multiPane: !state.multiPane }
        case TOGGLE_SIDEBAR:
            return { ...state, sidebar: !state.sidebar }
        case TOGGLE_THUMBNAILS:
            return { ...state, thumbnails: !state.thumbnails }
        case TOGGLE_VIEW:
            let { side, type } = payload
            return { ...state, [side]: { ...state[side], [type]: !state[side][type] } }
        case CHANGE_ZOOM:
            let zoom = payload.type === "increase" ? state[payload.side].zoom + 1 : state[payload.side].zoom - 1;
            zoom = zoom > 4 ? 4 : zoom < 0 ? 0 : zoom;
            return { 
                ...state, 
                [payload.side]: { 
                    ...state[payload.side],
                    zoom
                }
            }
        default:
            return state;
    }
};  