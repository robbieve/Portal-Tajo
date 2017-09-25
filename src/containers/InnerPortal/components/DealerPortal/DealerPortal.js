import React from 'react';
import PropTypes from 'prop-types';
import { css } from 'aphrodite/no-important';
import ccLogo from 'assets/images/logos/cc/cc_logo.png';
import fusoLogo from 'assets/images/logos/cc/fuso_logo.png';
import AppBar from 'components/AppBar';
import makeInnerPortal from '../Main';
import RightElement from './AppBarRightElement';
import MainSidebar from '../MainSidebar';
import classes from './classes';

const Logo = ({ img, alt }) => (
  <div className={css(classes.logo)}>
    <img
      src={img}
      alt={alt}
      className={css(classes.logo__img)}
    />
  </div>
);
Logo.propTypes = {
  img: PropTypes.node.isRequired,
  alt: PropTypes.string,
};
Logo.defaultProps = {
  alt: '',
};

function renderTitle() {
  return (
    <div className={css(classes.titleElement)}>
      <div className={css(classes.logos)}>
        <Logo img={fusoLogo} alt="" />
        <Logo img={ccLogo} alt="cycle&carriage" />
      </div>
    </div>
  );
}

const DealerPortal = (props) => {
  return (
    <div style={{ height: '100%' }}>

      <AppBar
        title={renderTitle()}
        toggleSidebar={props.toggleSidebar}
        logout={props.logout}
        rightElement={<RightElement />}
      />

      <MainSidebar
        isOpened={props.isSidebarOpen}
        toggleSidebar={props.toggleSidebar}
      />

      {props.children}

    </div>
  );
};

DealerPortal.propTypes = {
  children: PropTypes.node.isRequired,
  toggleSidebar: PropTypes.func.isRequired,
  logout: PropTypes.func.isRequired,
  isSidebarOpen: PropTypes.bool.isRequired,
};

export default makeInnerPortal()(DealerPortal);
