export default function keyBoardControls(data) {
  let { event, keyBoardVars, highlighted, setHighlighted } = data;
  const { props, side, dir, folders, files, settings } = keyBoardVars;
  const { idx, section } = highlighted;
  let [folderCount, fileCount] = [folders.length - 1 , files.length - 1]


  // HELPER FUNCTIONS
  function testGrid(direction) {
    let name = findElement(direction, side);
    let result = findIndexOf(files, folders, elem => elem.name === name);
    if (result) setHighlighted(result);
  }

  function testLimits(direction) {
    if (direction === "increase") {
      if (idx >= folderCount && section === "folder") {
        if (settings.splitView) setHighlighted({ section, idx: 0 });
        else {
          setHighlighted({ section: fileCount > 0 ? "file" : "folder", idx: 0 });
        }
      }
      else if (idx >= fileCount && section === "file") {
        if (settings.splitView) setHighlighted({ section, idx: 0 });
        else {
          setHighlighted({ section: folderCount > 0 ? "folder" : "file", idx: 0 });
        }
      }
      else setHighlighted({ section, idx: idx + 1 });
    } 
    
    else if (direction === 'decrease') {
      if (idx <= 0 && section === "folder") {
        if (settings.splitView) {
          setHighlighted({ section, idx: section === 'file' ? fileCount : folderCount });
        } else {
          setHighlighted({
            section: fileCount > 0 ? "file" : "folder",
            idx: fileCount > 0 ? fileCount : folderCount
          });
        }
      }
      else if (idx <= 0 && section === "file") {
        if (settings.splitView) {
          setHighlighted({ section, idx: section === 'file' ? fileCount : folderCount });
        } else {
          setHighlighted({
            section: folderCount > 0 ? "folder" : "file",
            idx: folderCount > 0 ? folderCount : fileCount
          });
        }
      }
      else setHighlighted({ section, idx: idx - 1 })
    }
    else {
      if (folderCount) setHighlighted({ section: 'folder', idx: 0 });
      else setHighlighted({ section: 'file', idx: 0 });
    }
  }

  if (event.key === "Enter") {
    if (idx >= 0) {
      if (section === 'folder') {
        props.changeDir(dir + folders[idx].name + "\\", side);
        setHighlighted({ section: 'folder', idx: -1 });
      }
      else props.openFile(dir + files[idx].name);
    }
  } 
  else if (event.key === "Backspace") {
    props.changeDir(dir.split("\\").slice(0, -2).join("\\") + '\\', side);
    setHighlighted({ section: "folder", idx: -1 });
  }

  // ARROW KEY FUNCTIONALITY
  else if (event.key === "ArrowDown") {
    if (settings.grid) {
      if (idx < 0) testLimits('initialize');
      else testGrid('down');
    } 
    else testLimits("increase");
  } 
  
  else if (event.key === "ArrowUp") {
    if (settings.grid) {
      if (idx < 0) testLimits('initialize');
      else testGrid('up');
    } 
    else testLimits("decrease");
  } 
  
  else if (event.key === "ArrowRight") {
    if (settings.splitView && !settings.grid) {
      setHighlighted({ 
        section: section === 'folder' ? 'file' : 'folder', 
        idx: idx <= fileCount ? idx : fileCount 
      });
    } 
    else if (settings.grid) testLimits('increase');
  } 
  
  else if (event.key === "ArrowLeft") {
    if (settings.splitView && !settings.grid) {
      setHighlighted({ 
        section: section === 'folder' ? 'file' : 'folder', 
        idx: idx <= folderCount ? idx : folderCount 
      });
    } else if (settings.grid) testLimits('decrease');
  }

  // HIGHLIGHT BY TYPING
  else {
    const key = event.key.toLowerCase();
    const isLetter = key >= "a" && key <= "z";
    const isNumber = key >= "0" && key <= "9";
    if (key.length === 1 && (isLetter || isNumber)) {
      const find = elem => elem.name[0].toLowerCase() === key;
      let result = findIndexOf(files, folders, find);
      if (result) setHighlighted(result);
    }
  }
  scrollToElement(side, settings, section);
}

function scrollToElement(side, settings, section) {
  let elem = document.querySelector(".highlighted-element");
  if (elem) {
    let listElem;
    if (settings.splitView) {
      listElem = document.getElementById(`pane-${side}`)
      listElem = listElem.querySelectorAll('ul')[section === 'folder' ? 0 : 1];
    } else {
      listElem = document.getElementById(`pane-${side}`).querySelector('ul');
    }
    let elemY = elem.getBoundingClientRect().top;
    let listElemY = listElem.getBoundingClientRect().top;
    let y;

    if (elemY < 0) {
      y = elemY + listElem.scrollTop - listElemY - 20;
    } else {
      y = elemY - listElemY - 20;
    }

    if ((y > listElem.clientHeight + listElemY)) {
      listElem.scrollTo({ top: y, behavior: "smooth" });
    }
  }
}

function findElement(direction, side) {
  direction = direction === "down" ? 1 : -1;
  let elem = document
    .getElementById(`pane-${side}`)
    .querySelector('.highlighted-element')
    .getBoundingClientRect();

  let elemCenter = {
    x: elem.left + (elem.width / 2),
    y: elem.top + (elem.height / 2)
  }

  let [x, y] = [elemCenter.x, elemCenter.y + (elem.height * direction)];
  let [targetElem, targetClass] = testPoint(x, y);

  if (targetClass !== 'list-item') {
    [targetElem, targetClass] = testPoint(x - (elem.width / 3), y + (elem.height * direction));
  }

  let name;
  if (targetClass === 'list-item') {
    name = targetElem.querySelector('span').innerHTML;
  } else {
    name = null;
  }
  return name;
}

function testPoint(x, y) {
  let targetElem = document.elementsFromPoint(x, y);
  for (const elem of targetElem) {
    if (elem.className === 'list-item') {
      targetElem = elem;
      break;
    }
  }
  return [targetElem, targetElem.className];
}

function findIndexOf(files, folders, func) {
  let indexOfFolders = folders.findIndex(func);
  let indexOfFiles = files.findIndex(func);

  if (indexOfFolders !== -1) {
    return { section: "folder", idx: indexOfFolders };
  } else if (indexOfFiles !== -1) {
    return { section: "file", idx: indexOfFiles };
  } else {
    return null;
  }
}