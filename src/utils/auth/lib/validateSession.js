import {
  isTokenExpired,
  sessionHasJWT,
} from './tokenHelpers';

function validateSession(session) {
  const hasJWT = sessionHasJWT(session);

  // don't validate regular sessions
  if (hasJWT) {
    const tokenExpired = isTokenExpired(session.id_token);

    if (tokenExpired) {
      return Promise.reject('id_token expired');
    }
  }

  return Promise.resolve({
    session,
    hasJWT,
  });
}

export default validateSession;
