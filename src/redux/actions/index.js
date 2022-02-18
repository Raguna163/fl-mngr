import { 
    CHANGE_DIRECTORY, 
    FILTER_DIRECTORY,
    HISTORY_FORWARD,
    HISTORY_BACK,
    OPEN_CONTEXT,
    CLOSE_CONTEXT,
    COMMAND_CONTEXT,
    ADD_SELECTION,
    CLEAR_SELECTION,
    SIDE_SELECTION,
    REMOVE_SELECTION, 
    TOGGLE_MULTIPANE,
    TOGGLE_SIDEBAR,
    TOGGLE_VIEW, 
    TOGGLE_THUMBNAILS,
    CHANGE_ZOOM
} from './types';

// DIRECTORY
// ACTIONS

export const changeDir = (target, side) => {
    return { type: CHANGE_DIRECTORY, payload: { target, side } }
}

export const filterDir = (filter, type) => {
    return { type: FILTER_DIRECTORY, payload: { filter, type } }
}

export const changeHistory = (side, direction) => {
    if (direction === "back") {
        return { type: HISTORY_BACK, payload: side }
    } else {
        return { type: HISTORY_FORWARD, payload: side }
    }
}

// CONTEXT
// ACTIONS

export const openContext = coordinates => {
    return { type: OPEN_CONTEXT, payload: coordinates }
}

export const closeContext = () => {
    return { type: CLOSE_CONTEXT, payload: null }
}

export const commandContext = command => {
    return { type: COMMAND_CONTEXT, payload: command }
}

// SELECTION 
// ACTIONS

export const addSelection = (selection, side) => {
    return { type: ADD_SELECTION, payload: { selection, side } }
}

export const removeSelection = selection => {
    return { type: REMOVE_SELECTION, payload: selection }
}

export const clearSelection = () => {
    return { type: CLEAR_SELECTION, payload: [] }
}

export const sideSelection = side => {
    return { type: SIDE_SELECTION, payload: side }
}

// SETTINGS
// ACTIONS

export const toggleMultiPane = () => {
    return { type: TOGGLE_MULTIPANE, payload: null }
}

export const toggleSidebar = () => {
    return { type: TOGGLE_SIDEBAR, payload: null }
}

export const toggleThumbs = () => {
    return { type: TOGGLE_THUMBNAILS, payload: null }
}

export const changeViews = (side, type) => {
    return { type: TOGGLE_VIEW, payload: { side, type } }
}

export const changeZoom = (side, type) => {
    return { type: CHANGE_ZOOM, payload: { side, type } }
}