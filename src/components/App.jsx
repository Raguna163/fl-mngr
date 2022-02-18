import React from 'react';
import { useDispatch } from 'react-redux';
import ContextMenu from './context/ContextMenu';
import MenuBar from './menu/MenuBar';
import Pane from './pane/Pane';
import TitleBar from "./bars/TitleBar";
import StatusBar from "./bars/StatusBar";
import SideBar from './bars/SideBar';

function App() {
  let dispatch = useDispatch();
  React.useEffect(() => {
    let activeSide = event => {
      let contextMenu = document.getElementById("context-menu")
      if (!event.path.includes(contextMenu)) {
        let side = event.path.includes(document.getElementById('pane-left')) ? 'left' : 'right';
        dispatch({ type: "SIDE_SELECTION", payload: side });
      }
    }
    document.addEventListener('click', activeSide);
    return function cleanup() {
      document.removeEventListener('click', activeSide);
    }
  },[dispatch]);

  return (
    <div id="App">
      <TitleBar />
      <div id="body">
        <SideBar/>
        {/* <div className="pane-divider"></div> */}
        <div id="main">
          <MenuBar />
          <div id="Panes">
            <Pane side="left" />
            {/* <div className="pane-divider"></div> */}
            <Pane side="right" />
          </div>
        </div>
      </div>
      <ContextMenu />
      <StatusBar />
    </div>
  );
}

export default App;
