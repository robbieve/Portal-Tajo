import React, { Component } from 'react';
import PropTypes from 'prop-types';
import stylePropTypes from 'react-style-proptype'; // eslint-disable-line import/no-extraneous-dependencies
import R from 'ramda';
import { css } from 'aphrodite/no-important';
import cs from 'classnames';
import {
  Paper,
  TextField,
} from 'material-ui';
import drvrStorage from 'utils/drvrStorage';
import {
  DRVR_PROFILE_LAST_KEY,
  isFeatureSupported,
} from 'configs';
import SimpleError from 'components/Error';
import Avatar from './Avatar';
import HelperLink from './HelperLink';
import LoginButton from './LoginButton';
import makeClasses from './classes';

const STYLES = {
  paper: {
    borderRadius: 10,
  },
  wrapper: {
    marginTop: 50,
  },
};

const DEFAULT_WIDTH = 400;
const getPicture = R.ifElse(R.isNil, R.always(null), R.ifElse(R.has('picture'), R.prop('picture'), R.always(null)));
const getEmail = R.ifElse(R.isNil, R.always(''), R.ifElse(R.has('email'), R.prop('email'), R.always('')));
const notNil = R.compose(R.not, R.isNil);
const notEmpty = R.compose(R.not, R.isEmpty);
const canRestorePassword = isFeatureSupported('restorePassword');
const classes = makeClasses({ wrapperWidth: DEFAULT_WIDTH });

class LoginForm extends Component {
  constructor(props) {
    super(props);

    this.emailRef = null;
    this.passRef = null;
    this.state = {
      password: '',
      email: '',
      isLoading: false,
      profile: null,
    };
  }

  async componentWillMount() {
    try {
      const prevProfile = await drvrStorage.load(DRVR_PROFILE_LAST_KEY);

      this.setState({
        profile: prevProfile,
        showProfile: notEmpty(prevProfile),
        email: getEmail(prevProfile),
      });
      this.focusOn(this.passRef);
    } catch (err) {
      if (err.name.toLowerCase() === 'notfounderror') {
        // do nothing if no previous profile has been found
        // except focusing on appropriate node
        this.focusOn(this.emailRef);
      }
    }
  }

  onSubmit = (e) => {
    e.preventDefault();

    this.changeLoadingState(true);

    this.props.route.auth.traditionalLogin(this.state.email, this.state.password)
      .then(() => ({}), () => {
        this.changeLoadingState(false);
      });
  }

  onType = (e) => {
    const { name, value } = e.target;
    const { errorType, resetError } = this.props;

    if (notEmpty(errorType)) resetError();

    this.setState({
      [name]: value,
    });
  }

  onGoogleLoginClick = () => {
    this.props.route.auth.authorize('google-oauth2');
  }

  changeLoadingState = (isLoading) => {
    this.setState({ isLoading });
  }

  hideProfile = () => {
    this.setState({
      showProfile: false,
      profile: null,
      email: '',
    });
    // now we can remove previous profile
    drvrStorage.remove(DRVR_PROFILE_LAST_KEY);
    this.focusOnEmail();
  }

  saveRef = propName => (node) => {
    if (node) {
      this[propName] = node;
    }
  }

  focusOn = (node) => {
    node.focus();
  }

  focusOnEmail() {
    this.emailRef.focus();
  }

  renderError() {
    const { errorType, errorStyles } = this.props;

    if (notNil(errorType)) {
      return (
        <div className={css(classes.error)}>
          <SimpleError
            type={this.props.errorType}
            color={errorStyles.color || '#fff'}
          />
        </div>
      );
    }

    return null;
  }

  renderAvatar() {
    const { profile, showProfile } = this.state;
    const picture = getPicture(profile);

    if (notNil(picture)) {
      return (
        <Avatar
          src={picture}
          show={showProfile}
        />
      );
    }

    return null;
  }

  render() {
    const showProfile = this.state.showProfile; // notNil(this.state.profile);
    const innClassName = cs(css(classes.inn), {
      [css(classes.inn_short)]: !showProfile,
    });
    const containerStyles = Object.assign({}, this.props.containerStyles, {
      marginTop: showProfile ? STYLES.wrapper.marginTop + this.props.containerStyles.marginTop : this.props.containerStyles.marginTop,
    });

    return (
      <div
        className={css(classes.loginFormWrapper)}
        style={containerStyles}
      >
        <Paper
          zDepth={2}
          style={STYLES.paper}
        >
          <form
            className={innClassName}
            onSubmit={this.onSubmit}
          >
            { this.renderAvatar() }
            <TextField
              fullWidth
              name="email"
              floatingLabelText="Email address"
              ref={this.saveRef('emailRef')}
              value={this.state.email}
              onChange={this.onType}
            />
            <TextField
              fullWidth
              name="password"
              ref={this.saveRef('passRef')}
              floatingLabelText="Password"
              type="password"
              onChange={this.onType}
            />
            <div className={css(classes.links)}>
              { showProfile && <HelperLink onClick={this.hideProfile} text="Not me" /> }
              { canRestorePassword && <HelperLink onClick={() => ({})} text="Forgot password?" /> }
            </div>
            <LoginButton
              onClick={this.onSubmit}
              isLoading={this.state.isLoading}
            />
          </form>
        </Paper>
        { this.renderError() }
      </div>
    );
  }
}

LoginForm.propTypes = {
  children: PropTypes.element,
  errorType: PropTypes.string,
  resetError: PropTypes.func.isRequired,
  route: PropTypes.shape({
    auth: PropTypes.shape({
      traditionalLogin: PropTypes.func.isRequired,
      authorize: PropTypes.func.isRequired,
    }).isRequired,
  }).isRequired,
  containerStyles: stylePropTypes,
  innerStyles: stylePropTypes,
  errorStyles: stylePropTypes,
};

LoginForm.defaultProps = {
  errorType: undefined,
  children: null,
  containerStyles: undefined,
  innerStyles: undefined,
  errorStyles: {},
};

LoginForm.defaultWidth = DEFAULT_WIDTH;

export default LoginForm;
