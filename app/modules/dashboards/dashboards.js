import manager from './manager/manager';

var appName = 'module.dashboards';

var module = angular.module(appName, [
  manager
]);

export default appName;