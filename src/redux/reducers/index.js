import { combineReducers, createStore, applyMiddleware } from "redux";
import thunk from 'redux-thunk';
import directoryReducer from './directory';
import contextReducer from './context';
import selectionReducer from './selection';
import settingsReducer from './settings';
import { readDir, updateDir, addToDir, removeFromDir, preview, getDrives, updateFavourites } from '../actions/ipcRx';

const reducers = combineReducers({
    directory: directoryReducer,
    context: contextReducer,
    selection: selectionReducer,
    settings: settingsReducer
});

const IPC = window.ipc.createIpc({
    'dir:read': readDir,
    'drives:read': getDrives,
    'update:fave': updateFavourites,
    'file:renamed': updateDir,
    'new': addToDir,
    'delete': removeFromDir,
    'preview': preview
});

export default createStore(reducers, applyMiddleware(thunk, IPC));