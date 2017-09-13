import React from 'react';
import { Router } from 'react-router';
import { ROOT_ROUTE } from 'configs';
import mainMenu from 'configs/mainMenu';
import rootScreen from 'screens/Root/route';
import operationalScreen from 'screens/Operational/route';
import reportsScreen from 'screens/ReportsScreen/route';
import promoScreen from 'screens/PromoTrackingScreen/route';
import installerScreen from 'screens/InstallerScreen/route';
import vehiclesManagerScreen from 'screens/VehiclesManagerScreen/route';
import usersManagerScreen from 'screens/UsersManager/route';
import devicesManagerScreen from 'screens/DevicesManager/route';
import loginScreen from 'screens/LoginScreen/route';
// import loginCallbackScreen from 'screens/LoginCallback/route';
import dashboardScreen from 'screens/Dashboard/route';
import profileScreen from 'screens/Profile/route';
import alertsEditorScreen from 'screens/AlertsEditor/route';
import alertLogsScreen from 'screens/AlertsLog/route';
import notFoundScreen from 'screens/NotFound/route';
import {
  errorHandler,
  loadModule,
} from '../utils/routerHelpers';

export default function createRoutes(dispatch, history, injectReducer) {
  const operationalRoute = operationalScreen({
    ...mainMenu.escape.operational,
  });

  const reportsRoute = reportsScreen({
    ...mainMenu.escape.reports,
    injectReducer,
    errorHandler,
    loadModule,
  });

  const promoRoute = promoScreen({
    ...mainMenu.escape.promos,
    injectReducer,
    errorHandler,
    loadModule,
  });

  const installerRoute = installerScreen({
    ...mainMenu.escape.installer,
    injectReducer,
    errorHandler,
    loadModule,
  });

  const vehiclesEditorRoute = vehiclesManagerScreen({
    ...mainMenu.escape.vehicles,
    injectReducer,
    errorHandler,
    loadModule,
  });

  const usersManagerRoute = usersManagerScreen(mainMenu.escape.users);

  const devicesManagerRoute = devicesManagerScreen({
    ...mainMenu.escape.devices,
    injectReducer,
    errorHandler,
    loadModule,
  });

  const alertsEditorRoute = alertsEditorScreen({
    ...mainMenu.escape.alerts,
    injectReducer,
    errorHandler,
    loadModule,
  });

  const alertsLogsRoute = alertLogsScreen(mainMenu.escape.alertsLogs);

  const loginRoute = loginScreen({
    path: 'login',
  });

  const mwaLoginRoute = loginScreen({
    path: 'mwa',
  });

  const profileRoute = profileScreen(mainMenu.common.profile);

  const dashboardRoute = dashboardScreen(mainMenu.escape.dashboard);

  const notFoundRoute = notFoundScreen({
    path: 'not-found',
  });

  const rootRoute = rootScreen({
    dispatch,
    path: ROOT_ROUTE,
    mainMenu: mainMenu.escape,
  });

  rootRoute.indexRoute = {
    component: dashboardRoute.component,
    name: dashboardRoute.name,
    protected: dashboardRoute.protected,
  };

  // order of menu depends of pushing order
  rootRoute.childRoutes.push(
    loginRoute,
    mwaLoginRoute,
    dashboardRoute,
    operationalRoute,
    installerRoute,
    promoRoute,
    reportsRoute,
    vehiclesEditorRoute,
    usersManagerRoute,
    devicesManagerRoute,
    profileRoute,
    alertsEditorRoute,
    notFoundRoute,
    alertsLogsRoute,
  );

  return (
    <Router
      history={history}
      routes={rootRoute}
      onError={errorHandler}
    />
  );
}
