import storage from 'utils/localStorage';
import VERSIONS from 'configs/versions';

/**
 *
 * read local storage,
 * and return its content.
 *
 * Will return FALSE if schema of stored data
 * doesn't coincide with the version supported by
 * running codebase version.
 *
 * Legacy stuff:
 *  1. assume that session contant could be just a token string, Return string.
 *  2. Session is an array of sessions for other fleets.
 *     But actually it can be one session - one fleet.
 *     Return VALUES content;
 *
 **/

export const readSessionFromLocalStorage = localStorageKey =>
  storage.read(localStorageKey)
    .then(_checkVersion)
    .then(sessions => {
      if (sessions && typeof sessions === 'string') {
        return Promise.resolve({ sessionId: sessions });
      } else if (sessions) {
        if (sessions.length !== 0) {
          // assuming first value is correct
          // TODO -- deprecate multi-login functionality
          const session = sessions[0];
          return Promise.resolve(session);
        }
      }

      return Promise.reject();
    });

export const saveSession = (localStorageKey, session) =>
  storage.save(localStorageKey, session, VERSIONS.authentication.currentVersion);

export const cleanLocalStorage = localStorageKey => storage.clean(localStorageKey);

const _checkVersion = savedData => {
  const toReturn = savedData && Object.hasOwnProperty.call(savedData, 'values') ?
    savedData.values : savedData;

  if (VERSIONS.authentication.verify(savedData)) {
    return Promise.resolve(toReturn);
  }
  return Promise.reject({ message: 'wrong version' });
};
