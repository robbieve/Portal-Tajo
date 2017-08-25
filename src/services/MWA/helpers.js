import R from 'ramda';
import { api } from 'utils/api';
import { onStage, onDev } from 'configs';
import endpoints from 'configs/endpoints';
import { makePeriodForLast24Hours } from 'utils/dateTimeUtils';
import teams from './teams';

const padZero = inNumber => inNumber < 10 ? `0${inNumber}` : inNumber;
const makeMWADate = inDate =>
  `${inDate.getFullYear()}${padZero(inDate.getMonth() + 1)}${padZero(inDate.getDate())}`;

const dates = ({ fromDate, toDate } = {}) => {
  if (R.isNil(fromDate) || R.isNil(toDate)) {
    const defPeriod = makePeriodForLast24Hours();

    return defPeriod;
  }

  return { fromDate, toDate };
};

const chooseTeam = () => {
  if (onDev) {
    return teams.dev;
  } else if (onStage) {
    return teams.stage;
  }

  return teams.prod;
};

/**
 * make call to mwa endpoint.
 * @param {Object} period
 * @param {Date} period.fromDate - default 24 hours ago
 * @param {Date} period.toDate - default is now
 *
 * @returns {Promise} jobs
 */
export default (period = {}) => {
  const { fromDate, toDate } = dates(period);

  // dates like this '20170325',
  const { url, method, apiVersion } = endpoints.getMWAJobs({
    from: makeMWADate(fromDate),
    to: makeMWADate(toDate),
  });

  return api[method](url, { apiVersion })
    .then(response => response.json());
};

/**
 * Find vehicle assigned to team
 * @param {String|Number} teamId - id of the team
 * @return {String|Null} id of the vehicle assigned to team or null if assignment doesn't exist
 */
export const mapTeamToCar = (teamId) => {
  const team = chooseTeam();

  if (!(teamId in team)) {
    return null;
  }

  return team[teamId];
};

export function mwaGetJobsForVehicle(vehicleId, jobs) {
  return jobs.filter(aJob => (mapTeamToCar(aJob.TEAM_ID) === vehicleId));
}
