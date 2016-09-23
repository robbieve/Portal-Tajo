const NAME = 'map';

const createRoute = ({
  path,
  name = NAME,
  niceName = NAME,
}) => ({
  path,
  name,
  niceName,
  getComponent: (location, cb) => {
    require.ensure([], require => {
      cb(null, require('./index').default);
    }, 'map');
  },
  childRoutes: [],
  protected: true,
});

module.exports = createRoute;
