import {
    READ_DIRECTORY,
    GET_DRIVES,
    UPDATE_FAVOURITES,
    CHANGE_DIRECTORY,
    FILTER_DIRECTORY,
    ADD_TO_DIRECTORY,
    REMOVE_FROM_DIRECTORY, 
    HISTORY_BACK,
    HISTORY_FORWARD
} from "../actions/types";

let SAVED_STATE = window.initialState.directory;

const INITIAL_STATE = {
    drives: SAVED_STATE.drives,
    favourites: SAVED_STATE.favourites,
    left: {
        dir: SAVED_STATE.left,
        files: [],
        folders: [],
        filter: null,
        history: {
            entries: [SAVED_STATE.left],
            index: 1
        }
    },
    right: {
        dir: SAVED_STATE.right,
        files: [],
        folders: [],
        filter: null,
        history: {
            entries: [SAVED_STATE.right],
            index: 1
        }
    },
    filter: null,
    multiPane: true
}

export default (state = INITIAL_STATE, { payload, type }) => {
    switch (type) {
        case READ_DIRECTORY:
            let { files, folders, dir } = payload;
            return { 
                ...state, 
                [payload.side]: {
                    ...state[payload.side],
                    files, folders, dir
                }
            }
        case GET_DRIVES:
            return { ...state, drives: [...payload] }
        case UPDATE_FAVOURITES:
            return { ...state, favourites: [...payload] }
        case CHANGE_DIRECTORY:
            let { history } = state[payload.side]
            return { 
                ...state, 
                [payload.side]: { 
                    ...state[payload.side], 
                    dir: payload.target, 
                    history: { 
                        entries: [...history.entries.slice(0,history.index), payload.target],
                        index: history.index + 1
                    }
                } 
            }
        case FILTER_DIRECTORY:
            const { filter } = payload;
            if (payload.type === "both") return { ...state, filter }
            else return { 
                ...state, 
                [payload.type]: { 
                    ...state[payload.type], 
                    filter 
                } 
            }
        case ADD_TO_DIRECTORY:
            const { addTo, name, size } = payload;
            return { 
                ...state, 
                [payload.pane]: { 
                    ...state[payload.pane], 
                    [addTo]: [...state[payload.pane][addTo], { name, size }] 
                } 
            }
        case REMOVE_FROM_DIRECTORY:
            let filterList = elem => elem.name !== payload.selection;
            let newList = state[payload.side][payload.removeFrom].filter(filterList);
            return { 
                ...state, 
                [payload.side]: {
                    ...state[payload.side],
                    [payload.removeFrom]: [...newList]
                }
            }
        case HISTORY_BACK:
            let side_hb = state[payload];
            return {
                ...state,
                [payload]: {
                    ...side_hb,
                    dir: side_hb.history.entries[side_hb.history.index - 2],
                    history: {
                        entries: side_hb.history.entries,
                        index: side_hb.history.index - 1
                    }
                }
            }
        case HISTORY_FORWARD:
            let side_f = state[payload];
            return {
                ...state,
                [payload]: {
                    ...side_f,
                    dir: side_f.history.entries[side_f.history.index],
                    history: {
                        entries: side_f.history.entries,
                        index: side_f.history.index + 1
                    }
                }
            }
        default:
            return state;
    }
};  