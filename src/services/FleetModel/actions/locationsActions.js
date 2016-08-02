import api from 'utils/api';
import {
  getFleetName,
  getAuthenticationSession,
} from 'containers/App/reducer';

export const FLEET_MODEL_LOCATIONS_SET = 'portal/services/FLEET_MODEL_LOCATIONS_SET';

export const fetchLocations = (fleet = undefined) => (dispatch, getState) =>
  _fetchLocations(dispatch, getState, fleet);

/**
 * fleet is optional
 **/
function _fetchLocations(dispatch, getState, fleetName = undefined) {
  const fleet = fleetName || getFleetName(getState());
  const url = `${fleet}/location`;
  const sessionId = getAuthenticationSession(getState());
  const optionalHeaders = {
    ['DRVR-SESSION']: sessionId,
  };

  return api(url, { optionalHeaders })
    .then(toJson)
    .then(locations => {
      dispatch(_locationsSet(locations));
    });
}

/**
 * PUT new updated details to the server
 **/

function toJson(response) {
  return response.json();
}
//

const _locationsSet = (locations) => ({
  type: FLEET_MODEL_LOCATIONS_SET,
  locations,
});