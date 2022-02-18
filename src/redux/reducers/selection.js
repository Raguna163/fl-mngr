import {
    ADD_SELECTION,
    CLEAR_SELECTION,
    REMOVE_SELECTION,
    SIDE_SELECTION,
    IMG_SELECTION
} from "../actions/types";

const INITIAL_STATE = {
    multiSelect: false,
    side: 'left',
    selected: [],
    preview: {
        image: null,
        text: null
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
        case IMG_SELECTION:
            return { ...state, image: payload }
        default:
            return state;
    }
};  