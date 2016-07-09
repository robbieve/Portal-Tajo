import { combineReducers } from 'redux-immutable';
import { fromJS, List } from 'immutable';
import { loaderActions, dataActions } from './actions';
import configuratorReducer, * as fromConfigReducer from './reducers/configuratorReducer';

const loaderInitialState = fromJS({
  isLoading: false,
});
const dataInitialState = new List();

function loaderReducer(state = loaderInitialState, action) {
  switch (action.type) {
    case loaderActions.REPORT_SCREEN_LOADER_SET: {
      return state.set('isLoading', action.nextState);
    }
    default:
      return state;
  }
}

function dataReducer(state = dataInitialState, action) {
  switch (action.type) {
    case dataActions.REPORT_DATA_SAVE: {
      return new List(action.reportData);
    }
    case dataActions.REPORT_DATA_REMOVE: {
      return new List();
    }
    default:
      return state;
  }
}

export default combineReducers({
  configurator: configuratorReducer,
  data: dataReducer,
  loader: loaderReducer,
});

export const getSavedReportData = (state) =>
  state.getIn(['reports', 'data']);
export const appHasStoredReport = (state) =>
  state.getIn(['reports', 'data']).size !== 0;
export const getReportLoadingState = (state) =>
  state.getIn(['reports', 'loader', 'isLoading']);

export const getAvailableFields = (state) =>
  fromConfigReducer.getAvailableFields(state);
export const getAvailableFieldIndex = (state, value) =>
  fromConfigReducer.getAvailableFieldIndex(state, value);
export const getSelectedFields = (state) =>
  fromConfigReducer.getSelectedFields(state);
export const getSelectedFieldIndex = (state, value) =>
  fromConfigReducer.getSelectedFieldIndex(state, value);
export const getReportFrequency = (state) =>
  fromConfigReducer.getReportFrequency(state);