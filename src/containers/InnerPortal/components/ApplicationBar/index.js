import React from 'react';
import pure from 'recompose/pure';
import { connect } from 'react-redux';
import { AppBar, FlatButton } from 'material-ui';
import { changeMainSidebarState } from 'containers/InnerPortal/actions';
import { logout } from '../../actions';

import styles from './styles.css';

class ApplicationBar extends React.Component {

  onLogoutClick = () => {
    this.props.logout();
  }

  render() {
    return (
      <AppBar
        title={this.props.title}
        iconElementRight={
          <FlatButton
            label="Logout"
            onClick={this.onLogoutClick}
          />
        }
        className={styles.bar}
        zDepth={0}
        onLeftIconButtonTouchTap={this.props.toggleSidebar}
      />
    );
  }
}

ApplicationBar.propTypes = {
  logout: React.PropTypes.func.isRequired,
  title: React.PropTypes.string.isRequired,
  toggleSidebar: React.PropTypes.func.isRequired,
};

const mapState = () => ({});
const mapDispatch = {
  logout,
  toggleSidebar: changeMainSidebarState,
};

const PureApplicationBar = pure(ApplicationBar);

export default connect(mapState, mapDispatch)(PureApplicationBar);
