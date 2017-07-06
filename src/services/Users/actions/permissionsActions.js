import uuid from 'node-uuid';
import { api, getExtentionAuthorizationHeader } from 'utils/api';
import endpoints from 'configs/endpoints';

export const PERMISSIONS_FETCH_SUCCESS = 'services/usersManager/PERMISSIONS_FETCH_SUCCESS';
export const PERMISSION_CREATE = 'services/UsersManager/PERMISSION_CREATE';
export const PERMISSION_DELETE = 'services/UsersManager/PERMISSION_DELETE';

export const fetchPermissions = accessToken => (dispatch) => {
  const { url, method, apiVersion, extName } = endpoints.getPermissions;

  return api[method](url, {
    apiVersion,
    optionalHeaders: getExtentionAuthorizationHeader(extName, {
      authExtAccessToken: accessToken,
    }),
  })
    .then(res => res.json())
    .then(res => {
      const permsMap = {};
      const permsList = [];

      res.permissions.forEach(perm => {
        permsMap[perm._id] = perm;
        permsList.push(perm._id);
      });

      dispatch(_permissionsFetchSuccess(permsMap, permsList));
    });
};

const _permissionsFetchSuccess = (permsMap, permsList) => ({
  type: PERMISSIONS_FETCH_SUCCESS,
  permsMap,
  permsList,
});

export const createPermission = payload => {
  payload.id = uuid.v4();

  return ({
    type: PERMISSION_CREATE,
    permission: payload,
  });
};

export const deletePermission = index => ({
  type: PERMISSION_DELETE,
  index,
});
