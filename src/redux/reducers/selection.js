import {
    ADD_SELECTION,
    CLEAR_SELECTION,
    REMOVE_SELECTION,
    SIDE_SELECTION,
    FILE_PREVIEW,
    SELECT_ALL
} from "../actions/types";

const INITIAL_STATE = {
    multiSelect: false,
    side: 'left',
    selected: [],
    preview: {
        type: null,
        data: null,
    }
}

export default (state = INITIAL_STATE, { payload, type }) => {
    switch (type) {
        case ADD_SELECTION:
            const { selection, side } = payload;
            // If the selection is on the other side, add it
            // Otherwise, clear it and start a new selection array
            let selected = side === state.side ? [...state.selected, selection] : [selection];
            return { ...state, selected, side }
        case SELECT_ALL:
            return { ...state, selected: payload.items, side: payload.side }
        case REMOVE_SELECTION:
            return { 
                ...state, 
                selected: state.selected.filter(item => item !== payload), 
                multiSelect: !![...state.selected].length 
            }
        case CLEAR_SELECTION:
            return { ...state, selected: payload, multiSelect: false}
        case SIDE_SELECTION:
            return { ...state, side: payload }
        case FILE_PREVIEW:
            if (!payload) return { ...state, preview: { type: null, data: null } }
            let { data } = payload
            if (payload.type === 'image') data = window.ipc.Uint8ToBase64(data);
            return { ...state, preview: { type: payload.type, data } }
        default:
            return state;
    }
};  