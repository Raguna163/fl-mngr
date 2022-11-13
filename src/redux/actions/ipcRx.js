import { 
    READ_DIRECTORY, 
    GET_DRIVES,
    UPDATE_FAVOURITES,
    UPDATE_DIRECTORY,
    ADD_TO_DIRECTORY,
    REMOVE_FROM_DIRECTORY,
    FFMPEG_INSTALLED,
    UPDATE_PROGRESS,
    FILE_PREVIEW
} from './types';

export const readDir = (e, data) => {
    return { type: READ_DIRECTORY, payload: data }
}

export const getDrives = (e, data) => {
    return { type: GET_DRIVES, payload: data }
}

export const updateFavourites = (e, data) => {
    return { type: UPDATE_FAVOURITES , payload: data }
}

export const updateDir = (e, data) => {
    return { type: UPDATE_DIRECTORY, payload: data }
}

export const preview = (e, data) => {
    return { type: FILE_PREVIEW, payload: data }
}

export const addToDir = (e, data) => (dispatch, getState) => {
    let { pane } = getState().context;
    pane = data.side ?? pane;
    dispatch({ type: ADD_TO_DIRECTORY, payload: { ...data, pane } })
}

export const removeFromDir = (e, data) => dispatch => {
    let { selection, side, removeFrom } = data;
    dispatch({ type: REMOVE_FROM_DIRECTORY, payload: { selection, side, removeFrom } });
}

export const checkFFMPEG = (e, data) => {
    return { type: FFMPEG_INSTALLED, payload: data }
}

export const updateProgress = (e, data) => (dispatch, getState) => {
    let { progress } = getState().context;
    let { type, task, total } = data;
    if (type === 'new') {
        progress = { task, total, complete: 0 }
    } else if (type === 'complete') {
        progress.complete += 1;
    } else {
        progress.task = null;
    }
    dispatch({ type: UPDATE_PROGRESS, payload: progress })
}