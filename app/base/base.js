let appName = 'base';

import models from './models/models.js';

var module = angular.module(appName, [
  'ui.router',
  'ngAnimate',
  'ngMessages',
  'ngCookies',
  'ngAnalytics',
  'permission',
  'satellizer',
  'ui.bootstrap',
  'pascalprecht.translate',
  'toaster',
  models
]);

import bzForm from './directives/bzForm.js';
import bzFormControl from './directives/bzFormControl.js';
import bzCurrentUser from './directives/bzCurrentUser.js';
import bzDateRange from './directives/bzDateRange.js';

module
  .directive('bzForm', bzForm)
  .directive('bzFormControl', bzFormControl)
  .directive('bzCurrentUser', bzCurrentUser)
  .directive('bzDateRange', bzDateRange)
;


import AnalyticsCtrl from './AnalyticsCtrl.js';
import AuthSignInCtrl from './AuthSignInCtrl.js';
import AuthSignOutCtrl from './AuthSignOutCtrl.js';
import ClientsListCtrl from './ClientsListCtrl.js';

module
  .controller('AuthSignInCtrl', AuthSignInCtrl)
  .controller('AuthSignOutCtrl', AuthSignOutCtrl)
  .controller('AnalyticsCtrl', AnalyticsCtrl)
  .controller('ClientsListCtrl', ClientsListCtrl)
;

import BaseNotifySvc from './services/BaseNotifySvc.js';

module
  .service('BaseNotifySvc', BaseNotifySvc)
;

import AuthInterceptor from './factories/AuthInterceptor.js';

module
  .factory('AuthInterceptor', AuthInterceptor)
;

import authConfig from './config/auth.js';
import localeConfig from './config/locale.js';
import routesConfig from './config/routes.js';

// run
import localeInit from './init/locale.js';
import rolesInit from './init/roles.js';
import menuInit from './init/menu.js';

module
  .config(authConfig)
  .config(localeConfig)
  .config(routesConfig)

  .run(localeInit)
  .run(rolesInit)
  .run(menuInit)
;

export default appName;