import React from 'react';
import { connect } from 'react-redux';
import '../SideBar.scss';
import { changeDir } from '../../../redux/actions';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

function Fave(props) {
  React.useEffect(() => {}, [props.faves])
    function renderList(faves) {
        return faves.map((fave,idx) => (
              <li 
                onClick={() => props.changeDir(fave.path, props.activeSide)}
                key={idx}
              >
                <FontAwesomeIcon icon='star'/>
                <span>{fave.name}</span>
              </li>
            )
        );
    }
    return (
        <div id='faves'>
          <ul>{renderList(props.faves)}</ul>
        </div>
    );
}

const mapStateToProps = ({directory, selection}) => {
  return { faves: directory.favourites, activeSide: selection.side }
}

export default connect(mapStateToProps, { changeDir })(Fave)