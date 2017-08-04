import R from 'ramda';

let permissions = [];
let roles = [];

const isString = R.compose(R.equals('string'), R.toLower, R.type);
const hasInArray = (what, where) => R.compose(R.not, R.equals(-1), R.indexOf(what))(where);
const checkPermission = (permission = '') => hasInArray(permission, permissions);
const checkRole = (role = '') => hasInArray(role, roles);

/**
 * Answers to question if user has given permission
 * @param {ArrayOfStrings} permissionsAsked - list of asked permissions
 * @return {Object} - each pair {permissionsAsked[i]: Boolean}
 */
export function authorizeWithPermissions(permissionsAsked = []) {
  if (isString(permissionsAsked)) {
    return {
      [permissionsAsked]: checkPermission(permissionsAsked),
    };
  }

  const result = {};

  permissionsAsked.forEach((p) => {
    result[p] = checkPermission(p);
  });

  return result;
}

/**
 * Check if user has asked role
 * @param {String} roleAsked
 * @returns {Boolean}
 */
export function authorizeWithRole(roleAsked = '') {
  return checkRole(roleAsked);
}

export function setAuthorization(profile = {}) {
  permissions = R.prop('permissions', profile);
  roles = R.prop('roles', profile);
}
