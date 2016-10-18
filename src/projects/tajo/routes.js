import React from 'react';
import { getHooks } from 'utils/hooks';
import { Router, browserHistory } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';
import { ROOT_ROUTE } from 'configs';
import {
  errorHandler,
  loadModule,
  selectLocationState,
} from 'utils/routerHelpers';

const MAIN_MENU = [{
  niceName: 'dashboard',
  path: 'dashboard',
  order: 0,
}, {
  niceName: 'installer',
  path: 'installer',
  order: 1,
}, {
  niceName: 'Promo Subscribtions',
  path: 'promos',
  order: 2,
}, {
  niceName: 'Reports',
  path: 'reports',
  order: 3,
}, {
  niceName: 'Vehicles Editor',
  path: 'vehicles',
  order: 4,
}, {
  niceName: 'Users Manager',
  path: 'users',
  order: 5,
}, {
  niceName: 'Devices Manager',
  path: 'devices',
  order: 6,
}];

export default function createRoutes(store) {
  const { injectReducer } = getHooks(store);

  const history = syncHistoryWithStore(browserHistory, store, {
    selectLocationState: selectLocationState(),
  });

  const reportsRoute = require('screens/ReportsScreen/route')({
    path: 'reports',
    injectReducer,
    errorHandler,
    loadModule,
  });

  const promoRoute = require('screens/PromoTrackingScreen/route')({
    path: 'promos',
    injectReducer,
    errorHandler,
    loadModule,
  });

  const installerRoute = require('screens/InstallerScreen/route')({
    path: 'installer',
    injectReducer,
    errorHandler,
    loadModule,
  });

  const vehiclesEditorRoute = require('screens/VehiclesManagerScreen/route')({
    path: 'vehicles',
    injectReducer,
    errorHandler,
    loadModule,
  });

  const usersManagerRoute = require('screens/UsersManager/route')({
    path: 'users',
    injectReducer,
    errorHandler,
    loadModule,
  });

  const devicesManagerRoute = require('screens/DevicesManager/route')({
    path: 'devices',
    injectReducer,
    errorHandler,
    loadModule,
  });

  const loginRoute = require('screens/LoginScreen/route')({
    path: 'login',
  });

  const dashboardRoute = require('screens/DashboardScreen/route')({
    path: 'dashboard',
  });

  const rootRoute = require('screens/Root/route')({
    path: ROOT_ROUTE,
    dispatch: store.dispatch,
    mainMenu: MAIN_MENU,
  });

  rootRoute.indexRoute = {
    component: dashboardRoute.component,
    name: dashboardRoute.name,
    protected: dashboardRoute.protected,
  };

  rootRoute.childRoutes.push(
    loginRoute,
    dashboardRoute,
    installerRoute,
    promoRoute,
    reportsRoute,
    vehiclesEditorRoute,
    usersManagerRoute,
    devicesManagerRoute,
  );

  return (
    <Router
      history={history}
      routes={rootRoute}
    />
  );
}
