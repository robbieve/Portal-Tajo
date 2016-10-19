import { fromJS } from 'immutable';
import { combineReducers } from 'redux-immutable';
import reportsReducer, * as fromReportsReducer from './reportsReducer';
import eventsReducer, * as fromEventsReducer from './eventsReducer';
import {
  configuratorActions,
  loaderActions,
  reportActions,
} from '../actions';

const initialState = fromJS({
  isLoading: false,
  error: undefined,
});

function reducer(state = initialState, action) {
  switch (action.type) {
    case configuratorActions.CONFIGURATOR_ERROR_SET:
      return state.set('error', action.message);

    case loaderActions.REPORT_CONFIGURATOR_LOADER_SET:
      return state.set('isLoading', action.nextState);

    case reportActions.REPORT_BEFORE_GENERATING:
      return state.set('isLoading', true);

    case reportActions.REPORT_GENERATING_SUCCESS:
      return state.set('isLoading', false);

    case reportActions.REPORT_GENERATING_FAILURE:
      return state.withMutations(s => {
        s.set('isLoading', false)
         .set('error', action.message);
      });

    default:
      return state;
  }
}

export default combineReducers({
  eventTypes: eventsReducer,
  reportTypes: reportsReducer,
  common: reducer,
});

function getReportTypes(s) {
  return s.get('reportTypes');
}

function getEventTypes(s) {
  return s.get('eventTypes');
}

export const getAvailableReports = state =>
  fromReportsReducer.getAvailableReports(getReportTypes(state));

export const getAvailableReportIndex = (state, value) =>
  fromReportsReducer.getAvailableReportIndex(getReportTypes(state), value);

export const getSelectedReports = state =>
  fromReportsReducer.getSelectedReports(getReportTypes(state));

export const getSelectedReportIndex = (state, value) =>
  fromReportsReducer.getSelectedReportIndex(getReportTypes(state), value);

export const getAvailableEvents = state =>
  fromEventsReducer.getAvailableEvents(getEventTypes(state));

export const getAvailableEventIndex = (state, value) =>
  fromEventsReducer.getAvailableEventIndex(getEventTypes(state), value);

export const getSelectedEvents = state =>
  fromEventsReducer.getSelectedEvents(getEventTypes(state));

export const getSelectedEventIndex = (state, value) =>
  fromEventsReducer.getSelectedEventIndex(getEventTypes(state), value);

export const getIsTooManyVehiclesSelected = state =>
  fromEventsReducer.getIsTooManyVehiclesSelected(getEventTypes(state));

export const getIsForced = state =>
  fromEventsReducer.getIsForced(getEventTypes(state));

export const getErrorMessage = state =>
  state.getIn(['common', 'error']);

export const getLoadingState = state =>
  state.getIn(['common', 'isLoading']);
