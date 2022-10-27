import React from 'react';
import { useDispatch } from 'react-redux';
import ContextMenu from './context/ContextMenu';
import MenuBar from './menu/MenuBar';
import Pane from './pane/Pane';
import TitleBar from "./bars/TitleBar";
import StatusBar from "./bars/StatusBar";
import SideBar from './bars/SideBar';
import DragDrop from './context/DragDrop';

function App() {
  let dispatch = useDispatch();
  React.useEffect(() => {
    let activeSide = event => {
      let contextMenu = document.getElementById("context-menu")
      if (!event.composedPath().includes(contextMenu)) {
        let left = event.composedPath().includes(document.getElementById('pane-left'));
        let right = event.composedPath().includes(document.getElementById('pane-right'));
        let side = left ? 'left' : right ? 'right' : false;
        if (side) dispatch({ type: "SIDE_SELECTION", payload: side });
      }
    }
    document.addEventListener('mousedown', activeSide);
    document.addEventListener('contextmenu', activeSide);
    return function cleanup() {
      document.removeEventListener('mousedown', activeSide);
      document.removeEventListener('contextmenu', activeSide);
    }
  },[dispatch]);

  return (
    <div id="App">
      <TitleBar />
      <div id="body">
        <SideBar/>
        <div id="main">
          <MenuBar />
          <div id="Panes">
            <Pane side="left" />
            <Pane side="right" />
          </div>
        </div>
      </div>
      <DragDrop />
      <ContextMenu />
      <StatusBar />
    </div>
  );
}

export default App;
