import { 
    READ_DIRECTORY, 
    UPDATE_DIRECTORY,
    ADD_TO_DIRECTORY,
    REMOVE_FROM_DIRECTORY,
    IMG_SELECTION
} from './types';

const switchSides = side => side === 'left' ? 'right' : 'left';

function Uint8ToBase64(u8Arr) {
    if (!u8Arr) return null;
    const CHUNK_SIZE = 0x8000; //arbitrary number
    let idx = 0, len = u8Arr.length, result = '', slice;
    while (idx < len) {
        slice = u8Arr.subarray(idx, Math.min(idx + CHUNK_SIZE, len));
        result += String.fromCharCode.apply(null, slice);
        idx += CHUNK_SIZE;
    }
    return btoa(result);
}

export const readDir = (e, data) => {
    return { type: READ_DIRECTORY, payload: data }
}

export const updateDir = (e, data) => {
    return { type: UPDATE_DIRECTORY, payload: data }
}

export const preview = (e, data) => {
    return { type: IMG_SELECTION, payload: Uint8ToBase64(data) }
}

export const addToDir = (e, data) => (dispatch, getState) => {
    let { pane } = getState().context;
    if (data.side) pane = data.side;
    dispatch({ type: ADD_TO_DIRECTORY, payload: { ...data, pane } })
}

export const removeFromDir = (e, data) => (dispatch, getState) => {
    let { pane, type } = getState().context;
    if (data.side) pane = data.side; 
    else if (data.otherSide) pane = switchSides(pane);
    dispatch({ type: REMOVE_FROM_DIRECTORY, payload: { data: data.selection, pane, type } });
}