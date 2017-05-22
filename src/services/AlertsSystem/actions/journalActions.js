import moment from 'moment';
// import { api } from 'utils/api';
import uuid from 'node-uuid';
// import endpoints from 'configs/endpoints';
import { makePeriodForLast24Hours } from 'utils/dateTimeUtils';
import { getVehicleById } from 'services/FleetModel/reducer';
import fetchNotificationsForTimeRange from './helpers';
import { getAlertConditionById } from '../reducer';

// update once a minute
const ALERTS_HISTORY_FETCH_INTERVAL_MS = 1000 * 60;
let notificationsTimerId = null;

export const JOURNAL_ENTRIES_ADD = 'alertsSystem/JOURNAL_ENTRIES_ADD';

// const makeFakeNotifs = () => [{
//   ev: {
//     ts: new Date(),
//     vehicleId: '89058b4f-aecd-4f0b-97ea-36cec6dfc766',
//     conditionId: 'a5f4f295-97ab-41cc-8638-553abd705ac7',
//     conditionKind: 'temperature-alert',
//     meta: { name: 'postman tempAlert 1' },
//     pos: {
//       latlon: { lat: 16.8573055267334, lng: 96.0805892944336 },
//       speed: 0,
//       azimuth: 286,
//       accuracy: 1,
//     },
//     temp: 1.5,
//   },
//   type: 'vehicle-temperature-alert',
// }];

const listenForNotifications = (dispatch, initialStartDate) => {
  let startDate = initialStartDate;

  notificationsTimerId = window.setInterval(() => {
    const endDate = moment().toDate();
    const nextRange = { startDate, endDate };

    dispatch(fetchRecentNotifications(nextRange));

// update once a minute
const ALERTS_HISOTYR_FETCH_INTERVAL_MS = 1000 * 60;
let fetchProcId = null;

export const fetchAlertsHistory = () => _startFetching;

/**
 * Get all events for last 24 hours, or withing specified time range
 * @param {Object} - range
 */
export const fetchRecentNotifications = (range = makePeriodForLast24Hours()) => async (dispatch, getState) => {
  const state = getState();
  let result;

  try {
    result = await fetchNotificationsForTimeRange(range);
  } catch (e) {
    throw e;
  }


function _startFetching(dispatch, getState) {
  if (fetchProcId !== null) {
    return;
  }
  // do the first tick right away - so we are actual
  _fetchAlertsHistory(dispatch, getState);
  fetchProcId = window.setInterval(_fetchAlertsHistory(dispatch, getState), ALERTS_HISOTYR_FETCH_INTERVAL_MS);
}

function _fetchAlertsHistory(dispatch, getState) {
  if (jrnIsWaiting(getState())) {
    return;
  }
  dispatch({
    type: JR_SET_WAITING,
  });

  const state = getState();
  const backTimeLimit = moment().subtract(1, 'days').toDate().getTime();
  const fromTicks = Math.max(backTimeLimit, jrnGetLatestRecievedTS(state));
  const dateFrom = new Date(fromTicks);
  const dateTo = moment().toDate();
  const nextLatestMS = dateTo.getTime();
  let fromString = dateFrom.toISOString();
  fromString = `${fromString.slice(0, -1)}+0000`;
  let toString = dateTo.toISOString();
  toString = `${toString.slice(0, -1)}+0000`;

  const { url, method } = endpoints.getAlertsInTimeRange({
    from: fromString,
    to: toString,
  });

  api[method](url)
    .then(response => response.json())
    .then((alertEvents) => {
      const journalEntries = alertEvents.map(alertEntry =>
        createJournalEntry(alertEntry, state),
      );
      dispatch(jrnAddEntries(journalEntries, nextLatestMS));
    }, (e) => {
      console.error(e);
    });
}

function createJournalEntry(alertEvent, state) {
  const crossTime = alertEvent.ev.crossTime !== undefined ? alertEvent.ev.crossTime : 0;
  const eventDate = new Date(alertEvent.ev.ts !== undefined ? alertEvent.ev.ts : crossTime);
  const theVehicle = getVehicleById(state, alertEvent.ev.vehicleId);
  const condition = getAlertConditionById(state, alertEvent.ev.conditionId);

  return {
    eventTS: eventDate.getTime(),
    eventKind: alertEvent.ev.conditionKind,
    eventName: condition.name,
    ownerName: !theVehicle ? 'loading cars..' : theVehicle.getIn(['original', 'name']),
  };
}
