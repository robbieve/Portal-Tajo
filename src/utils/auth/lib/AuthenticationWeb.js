import auth0 from 'auth0-js';
import getClientConfig from './variables';
import verifyToken from './tokenHelpers';
import {
  login,
  logout,
} from './apiCalls';
import {
  cleanupProfile,
  getIdToken,
  getAccessToken,
  getSessionId,
  extractTokens,
  isLegacyProfile,
} from './profileUtils';
import * as socialHelpers from './socialAuthHelpers';

/**
 * @description
 *
 * 0. should be able to tell if user is already authenticated
 *  - we can do it by verifying expiration date of token (if provided)
 * 1. should provide the way to authorize user with email/password combination and social auth providers (fb, google)
 *  - fetch additional info for different login methods. Ie. after email/password we must get profile.
 * 2. should provide the way to unauthorize user
 * 3. should be reusable for both mobile and web apps
 */

class AuthenticationWeb {
  constructor({
    auth0SupportLevel,
    onProd,
    onAuthSuccess,
    onAuthFailure,
    onLogoutSuccess,
  }) {
    const AUTH_CONFIG = getClientConfig(onProd);

    this.auth0 = new auth0.WebAuth({
      domain: AUTH_CONFIG.domain,
      clientID: AUTH_CONFIG.clientId,
      redirectUri: AUTH_CONFIG.callbackUrl,
      audience: `https://${AUTH_CONFIG.domain}/userinfo`,
      responseType: 'token id_token',
      scope: 'openid profile email',
    });

    this.idToken = null;
    this.accessToken = null;
    this.sessionId = null;
    this.auth0SupportLevel = auth0SupportLevel;
    this.onProd = onProd;
    this.onAuthFailure = onAuthFailure;
    this.onAuthSuccess = onAuthSuccess;
    this.onLogoutSuccess = onLogoutSuccess;
    this.storageKey = 'drvr:auth';
  }

  async initialAuthentication(profile) {
    const isAuthenticating = await socialHelpers.isAuthenticating(this.storageKey);
    // if app rendered on a callback from social provider
    if (isAuthenticating) return;

    const token = isLegacyProfile(profile) ? getSessionId(profile) : getIdToken(profile);

    if (this.isAuthenticated(token)) {
      this._authenticate(extractTokens(profile));
      this.onAuthSuccess({
        profile,
        overwrite: false,
      });
    } else {
      this._unauthenticate();
      this.onAuthFailure();
    }
  }

  /**
   * Authenticate user with traditional username/password approach
   * @param {String} username - email, username or something else
   * @param {String} password
   * @param {Function} cb - callback which has (err, profile) signature
   */
  traditionalLogin = (username, password) => {
    return login(username, password)
      .then((loginResult) => {
        this._authenticate(extractTokens(loginResult));
        let cleanedProfile;
        // fetch user info only if auth0 fully supported by backend
        // ie. sent accessToken in login result
        if (this.auth0SupportLevel === 'full') {
          this._getUserInfo(loginResult, (error, profile) => {
            if (error) this.onAuthFailure();
            else cleanedProfile = profile;
          });
        } else cleanedProfile = cleanupProfile(loginResult, this.onProd);

        this.onAuthSuccess({
          profile: cleanedProfile,
          overwrite: true,
        });
      }, (err) => {
        this.onAuthFailure();
        throw new Error(err);
      });
  }

  authorize = (provider) => {
    socialHelpers.setIsAuthenticating(this.storageKey);

    this.auth0.authorize({ connection: provider });
  }

  handleAuthentication = () => {
    this.auth0.parseHash((err, authResult) => {
      if (authResult && authResult.accessToken && authResult.idToken) {
        this._authenticate(extractTokens(authResult));

        this._getUserInfo(authResult, (error, profile) => {
          if (error) this.onAuthFailure();
          else this.onAuthSuccess({ profile, overwrite: true });
        });
      } else if (err) {
        this._unauthenticate();
        this.onAuthFailure();

        console.warn(err);
      }
      socialHelpers.cleanIsAuthenticating(this.storageKey);
    });
  }

  logout = () => {
    logout(this.accessToken)
      .then(() => {
        this._unauthenticate();
        this.onLogoutSuccess();
      });
  }

  _getUserInfo = (authResult = {}, cb) => {
    this.auth0.client.userInfo(getAccessToken(authResult), (err, user) => {
      // format profile to convenient structure
      const cleaned = cleanupProfile({
        ...user,
        idToken: getIdToken(authResult),
      }, this.onProd);

      cb(err, cleaned);
    });
  }

  _authenticate = ({ accessToken = null, idToken = null, sessionId = null }) => {
    this.accessToken = accessToken;
    this.idToken = idToken;
    this.sessionId = sessionId;
  }

  _unauthenticate = () => {
    this.accessToken = null;
    this.idToken = null;
    this.sessionId = null;
  }

  /**
   * verifies if app has legitimate token or sessionId
   * @param {String} token - optional string to verify
   * @returns {Boolean} result of verification
   */
  isAuthenticated = (token = undefined) => {
    const tokenToVerify = token || this.idToken || this.sessionId;

    return verifyToken(tokenToVerify);
  }
}

export default AuthenticationWeb;
