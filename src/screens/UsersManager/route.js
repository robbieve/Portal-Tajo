const createRoute = ({
  path,
  name,
  niceName,
}) => ({
  path,
  name,
  niceName,
  getComponent: (location, cb) => {
    require.ensure([], require => {
      cb(null, require('./index').default);
    }, 'usersManager');
  },
});

export default createRoute;
