import { 
    CLEAR_SELECTION,
    PANE_CONTEXT
} from './types';
import { batch } from "react-redux";

const switchSides = side => side === 'left' ? 'right' : 'left';
const { sendIpc } = window.ipc;

function combineDispatch(dispatch, ...args) {
    batch(() => {
        args.forEach(item => dispatch(item));
        dispatch({ type: CLEAR_SELECTION, payload: [] });
    });
}

export const dragStart = target => (dispatch, getState) => {
    if (Array.isArray(target)) {
        const { selection, directory } = getState();
        let { dir } = directory[selection.side]
        target = target.map(elem => dir + elem);
    }
    dispatch(sendIpc('drag:start', target));
}

export const fetchDir = data => dispatch => {
    combineDispatch(dispatch, sendIpc('read:dir', data));
}

export const fetchDrives = () => dispatch => {
    dispatch(sendIpc('read:drives'));
}

export const saveSettings = () => (dispatch, getState) => {
    const { settings } = getState();
    dispatch(sendIpc('save:settings', settings));
}

export const copyPath = target => dispatch => {
    dispatch(sendIpc('copy:clipboard', target));
}

export const openFile = file => dispatch => {
    combineDispatch(dispatch,sendIpc('open:file', file));
}

export const openWith = file => dispatch => {
    combineDispatch(dispatch,sendIpc('open:with', file));
}

export const openExplorer = target => dispatch => {
    combineDispatch(dispatch, sendIpc('open:explorer', target));
}

export const openGit = () => dispatch => {
    dispatch(sendIpc('open:git'));
}

export const newItem = (target, name, command) => dispatch => {
    combineDispatch(dispatch,sendIpc('new:item', { target, name, command }));
}

export const deleteItems = pane => (dispatch, getState) => {
    const { selected } = getState().selection;
    const { dir } = getState().directory[pane];
    combineDispatch(dispatch, sendIpc('delete:items', { selected, dir }));
}

export const copyItems = target => (dispatch, getState) => copyOrMove('copy:items', dispatch, getState, target);
export const moveItems = target => (dispatch, getState) => copyOrMove('move:items', dispatch, getState, target);

export const renameFile = (oldName, newName, side) => (dispatch, getState) => {
    const { dir } = getState().directory[side];
    combineDispatch(dispatch, sendIpc('rename:file', { oldName, newName, dir }));
}

export const previewFile = target => dispatch => {
    dispatch(sendIpc('preview:file', target));
}

export const imageIcon = target => dispatch => {
    dispatch(sendIpc('img:icon', target));
}

export const editFavourites = data => dispatch => {
    dispatch(sendIpc('edit:fave', data));
}

function copyOrMove(type, dispatch, getState, target) {
    const { selected, side } = getState().selection;
    const { pane } = getState().context;
    const { dir } = getState().directory[switchSides(side)];
    combineDispatch(dispatch, 
        { type: PANE_CONTEXT, payload: switchSides(pane) }, 
        sendIpc(type, { selected, dir, target })
    );
}