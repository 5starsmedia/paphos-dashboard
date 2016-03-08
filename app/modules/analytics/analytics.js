import models from './models/models';
import settings from './settings/settings';
import statistic from './statistic/statistic';

var appName = 'module.analytics';

var module = angular.module(appName, [
  models,
  settings,
  statistic
]);

export default appName;