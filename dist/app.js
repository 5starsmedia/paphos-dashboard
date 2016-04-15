(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

var _base = require('./base/base');

var _base2 = _interopRequireDefault(_base);

var _modules = require('./modules/modules.config');

var _modules2 = _interopRequireDefault(_modules);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var appName = 'app';

try {
    angular.module('views');
} catch (e) {
    angular.module('views', []);
}

window.config = _config2.default;

//if (window.settings) {
angular.module(appName, [_base2.default, 'views'].concat(_modules2.default));
/*} else {
    angular.module(appName, ['views', off]);
}*/

exports.default = appName;

},{"./base/base":6,"./config":21,"./modules/modules.config":52}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AnalyticsCtrl =
/*@ngInject*/
function AnalyticsCtrl($scope, $http, $timeout, ngAnalyticsService, SatellizerPopup, $auth) {
    _classCallCheck(this, AnalyticsCtrl);

    $scope.authenticate = function (provider) {
        $auth.authenticate(provider).then(function (data) {
            console.info(data);
        }).catch(function (res) {
            console.info(res.data);
        });
    };

    $scope.user = {};

    $scope.signUp = function (user) {
        console.info(user);
        $http.post(settings.apiEntryPoint + '/auth/signup', user).then(function (res) {
            console.info(res);
        });
    };

    var sites = [{ siteUrl: 'http://news.vn.ua/' }, { siteUrl: 'http://esvit.name/' }, { siteUrl: 'http://test.com/' }, { siteUrl: 'http://mistinfo.com/' }, { siteUrl: 'http://www.gabelstapler-zentrum.de/' }];

    var loadSites = function loadSites() {
        $scope.hasUnknown = false;
        $http.post('http://analytics.5stars.link/api/sites/find', _.pluck(sites, 'siteUrl')).then(function (res) {
            $scope.sites = res.data;

            $scope.hasUnknown = _.filter(res.data, { isUnknown: true }).length > 0;
        });
    };
    loadSites();

    $scope.signIn = function () {
        $http.get('http://analytics.5stars.link/api/auth/google').then(function (res) {
            var openPopup = SatellizerPopup.open(res.data.url, 'Google Auth', { width: 452, height: 633 }, window.location.origin).pollPopup();

            openPopup.then(function (token) {
                console.info('updae');
                loadSites();
            });
        });
    };

    $scope.updateSite = function (site) {
        $http.put('http://analytics.5stars.link/api/sites/' + site._id, site).then(function (res) {});
    };

    $scope.scanSite = function (site) {
        $http.post('http://analytics.5stars.link/api/sites/' + site._id + '/scan');
    };

    $scope.getPages = function (site) {

        $scope.selectedSite = null;
        $http.get('http://analytics.5stars.link/api/sites/' + site._id).then(function (res) {
            ngAnalyticsService.serviceAuthToken = res.data.tokens.access_token;
            ngAnalyticsService.authorize();

            $scope.charts = [{
                reportType: 'ga',
                query: {
                    metrics: 'ga:sessions',
                    dimensions: 'ga:date',
                    'start-date': '30daysAgo',
                    'end-date': 'yesterday',
                    ids: 'ga:' + site.analytics.profileId
                },
                chart: {
                    container: 'chart-container-1',
                    type: 'LINE',
                    options: {
                        width: '100%'
                    }
                }
            }, {
                reportType: 'ga',
                query: {
                    metrics: 'ga:sessions',
                    dimensions: 'ga:browser',
                    'start-date': '30daysAgo',
                    'end-date': 'yesterday',
                    ids: 'ga:' + site.analytics.profileId
                },
                chart: {
                    container: 'chart-container-2',
                    type: 'PIE',
                    options: {
                        width: '100%',
                        is3D: true,
                        title: 'Browser Usage'
                    }
                }
            }];
            $scope.extraChart = {
                reportType: 'ga',
                query: {
                    metrics: 'ga:sessions',
                    dimensions: 'ga:date',
                    'start-date': '30daysAgo',
                    'end-date': 'yesterday',
                    ids: 'ga:' + site.analytics.profileId
                },
                chart: {
                    container: 'chart-container-3',
                    type: 'LINE',
                    options: {
                        width: '100%'
                    }
                }
            };
            $scope.defaultIds = {
                ids: 'ga:' + site.analytics.profileId
            };
            $scope.queries = [{
                query: {
                    ids: 'ga:' + site.analytics.profileId,
                    metrics: 'ga:sessions',
                    dimensions: 'ga:city'
                }
            }];

            $timeout(function () {
                $scope.selectedSite = site;
            }, 1);
        });

        $http.get('http://analytics.5stars.link/api/pages?site._id=' + site._id).then(function (res) {
            $scope.pages = res.data;
        });
    };

    $scope.getQueries = function (page) {
        var keywords = {};
        $http.get('http://analytics.5stars.link/api/statistics?page._id=' + page._id + '&sort=clicks').then(function (res) {

            _.each(res.data, function (item) {
                keywords[item.query.keyword] = keywords[item.query.keyword] || {};
                keywords[item.query.keyword][item.date] = item.position;
            });
            $scope.queries = keywords;
            console.info(keywords);
        });
    };

    $scope.$on('$gaReportSuccess', function (e, report, element) {
        console.log(report, element);
    });

    $scope.sites = sites;
    console.info('AnalyticsCtrl');
};

exports.default = AnalyticsCtrl;

},{}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AuthSignInCtrl =
/*@ngInject*/
function AuthSignInCtrl($scope, $rootScope, $state, $auth) {
  _classCallCheck(this, AuthSignInCtrl);

  // загрузка данных, которые были сохранены при установле галочки "Запомнить меня"
  var localAuthData = angular.fromJson((localStorage || {}).authData || '{}');

  $scope.isLocked = !!localAuthData.email;
  $scope.user = {
    email: localAuthData.email || '',
    password: localAuthData.password || '',
    rememberMe: true
  };

  $scope.differentUser = function (provider) {
    (localStorage || {}).authData = '{}';
    $scope.isLocked = false;
    $scope.user = {
      email: '',
      password: '',
      rememberMe: true
    };
  };

  $scope.submitAuth = function (user) {
    $scope.error = null;

    // сохранение введеного логина и пароля в локалсторедж
    (localStorage || {}).authData = user.rememberMe ? angular.toJson(user) : '{}';

    $scope.loading = true;
    return $auth.login(user).then(function (res) {
      $rootScope.currentAuth = res.data;
      $scope.loading = false;
      $rootScope.$broadcast('authLoginSuccess');
      $state.go('dashboard.main');
    });
  };
};

exports.default = AuthSignInCtrl;

},{}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AuthSignOutCtrl =
/*@ngInject*/
function AuthSignOutCtrl($scope, $auth, $state) {
    _classCallCheck(this, AuthSignOutCtrl);

    $auth.logout();
    $state.go('signin');
};

exports.default = AuthSignOutCtrl;

},{}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ClientsListCtrl =
/*@ngInject*/
function ClientsListCtrl($scope, $http) {
    _classCallCheck(this, ClientsListCtrl);

    $scope.getUsers = function () {
        $http.get(settings.apiEntryPoint + '/clients').then(function (res) {
            $scope.clients = res.data;
        });
    };
    $scope.getUsers();
};

exports.default = ClientsListCtrl;

},{}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _models = require('./models/models.js');

var _models2 = _interopRequireDefault(_models);

var _bzForm = require('./directives/bzForm.js');

var _bzForm2 = _interopRequireDefault(_bzForm);

var _bzFormControl = require('./directives/bzFormControl.js');

var _bzFormControl2 = _interopRequireDefault(_bzFormControl);

var _bzCurrentUser = require('./directives/bzCurrentUser.js');

var _bzCurrentUser2 = _interopRequireDefault(_bzCurrentUser);

var _bzDateRange = require('./directives/bzDateRange.js');

var _bzDateRange2 = _interopRequireDefault(_bzDateRange);

var _AnalyticsCtrl = require('./AnalyticsCtrl.js');

var _AnalyticsCtrl2 = _interopRequireDefault(_AnalyticsCtrl);

var _AuthSignInCtrl = require('./AuthSignInCtrl.js');

var _AuthSignInCtrl2 = _interopRequireDefault(_AuthSignInCtrl);

var _AuthSignOutCtrl = require('./AuthSignOutCtrl.js');

var _AuthSignOutCtrl2 = _interopRequireDefault(_AuthSignOutCtrl);

var _ClientsListCtrl = require('./ClientsListCtrl.js');

var _ClientsListCtrl2 = _interopRequireDefault(_ClientsListCtrl);

var _BaseNotifySvc = require('./services/BaseNotifySvc.js');

var _BaseNotifySvc2 = _interopRequireDefault(_BaseNotifySvc);

var _AuthInterceptor = require('./factories/AuthInterceptor.js');

var _AuthInterceptor2 = _interopRequireDefault(_AuthInterceptor);

var _auth = require('./config/auth.js');

var _auth2 = _interopRequireDefault(_auth);

var _locale = require('./config/locale.js');

var _locale2 = _interopRequireDefault(_locale);

var _routes = require('./config/routes.js');

var _routes2 = _interopRequireDefault(_routes);

var _locale3 = require('./init/locale.js');

var _locale4 = _interopRequireDefault(_locale3);

var _roles = require('./init/roles.js');

var _roles2 = _interopRequireDefault(_roles);

var _menu = require('./init/menu.js');

var _menu2 = _interopRequireDefault(_menu);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var appName = 'base';

var _module = angular.module(appName, ['ui.router', 'ngAnimate', 'ngMessages', 'ngCookies', 'ngAnalytics', 'permission', 'satellizer', 'ui.bootstrap', 'pascalprecht.translate', 'checklist-model', 'toaster', _models2.default]);

_module.directive('bzForm', _bzForm2.default).directive('bzFormControl', _bzFormControl2.default).directive('bzCurrentUser', _bzCurrentUser2.default).directive('bzDateRange', _bzDateRange2.default);

_module.controller('AuthSignInCtrl', _AuthSignInCtrl2.default).controller('AuthSignOutCtrl', _AuthSignOutCtrl2.default).controller('AnalyticsCtrl', _AnalyticsCtrl2.default).controller('ClientsListCtrl', _ClientsListCtrl2.default);

_module.service('BaseNotifySvc', _BaseNotifySvc2.default);

_module.factory('AuthInterceptor', _AuthInterceptor2.default);

// run


_module.config(_auth2.default).config(_locale2.default).config(_routes2.default).run(_locale4.default).run(_roles2.default).run(_menu2.default);

exports.default = appName;

},{"./AnalyticsCtrl.js":2,"./AuthSignInCtrl.js":3,"./AuthSignOutCtrl.js":4,"./ClientsListCtrl.js":5,"./config/auth.js":7,"./config/locale.js":8,"./config/routes.js":9,"./directives/bzCurrentUser.js":10,"./directives/bzDateRange.js":11,"./directives/bzForm.js":12,"./directives/bzFormControl.js":13,"./factories/AuthInterceptor.js":14,"./init/locale.js":15,"./init/menu.js":16,"./init/roles.js":17,"./models/models.js":19,"./services/BaseNotifySvc.js":20}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default =
/*@ngInject*/
function ($stateProvider, $urlRouterProvider, $authProvider, $httpProvider) {

    $httpProvider.interceptors.push('AuthInterceptor');

    $authProvider.loginUrl = settings.apiEntryPoint + '/auth/dashboard/login';

    var facebookSettings = _.find(settings.dashboard.authorizations, { provider: 'facebook' });
    if (facebookSettings) {
        $authProvider.facebook({
            clientId: facebookSettings.authKey,
            scope: ['email'],
            url: settings.apiEntryPoint + '/auth/facebook/callback'
        });
    }

    var vkSettings = _.find(settings.dashboard.authorizations, { provider: 'vk' });
    if (vkSettings) {
        $authProvider.oauth2({
            name: 'vk',
            url: settings.apiEntryPoint + '/auth/vk/callback',
            redirectUri: window.location.origin,
            clientId: vkSettings.authKey,
            requiredUrlParams: ['scope'],
            scope: ['email', 'photos', 'photo_big'],
            authorizationEndpoint: 'https://oauth.vk.com/authorize',
            popupOptions: { width: 656, height: 364 }
        });
    }
};

},{}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default =
/*@ngInject*/
function ($translateProvider) {
  /**
   * @todo change template path when add site config in system
   */
  $translateProvider.useStaticFilesLoader({
    prefix: 'locale/',
    suffix: '.json'
  }).fallbackLanguage('en').preferredLanguage('en').useSanitizeValueStrategy(null).useLocalStorage();
};

},{}],9:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default =
/*@ngInject*/
function ($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise(function ($injector) {
    var $state = $injector.get('$state');
    $state.go('dashboard.main');
  });

  $stateProvider
  // Login
  .state('signin', { // complete
    url: '/signin',
    views: {
      'dashboard': { controller: 'AuthSignInCtrl', templateUrl: 'views/auth/page-signin.html' }
    },
    data: {
      permissions: {
        only: ['anonymous'],
        redirectTo: 'dashboard.main'
      }
    }
  }).state('signout', {
    url: '/signout',
    views: {
      'dashboard': { controller: 'AuthSignOutCtrl', template: '' }
    }
  }).state('private', { // complete
    abstract: true,
    views: {
      'dashboard': { templateUrl: 'views/master-dashboard.html' }
    },
    data: {
      permissions: {
        except: ['anonymous'],
        redirectTo: 'signin'
      }
    }
  })
  // Dashboard
  .state('dashboard', {
    parent: 'private',
    abstract: true,
    views: {
      'master-view': { templateUrl: 'views/masters/dashboard.html' }
    }
  }).state('dashboard.main', {
    url: '/',
    views: {
      'main-content': { templateUrl: 'views/dashboard/content-dashboard.html' }
    }
  })

  // Clients
  .state('clients', {
    parent: 'private',
    abstract: true,
    url: '/clients',
    views: {
      'master-view': { templateUrl: 'views/masters/clients.html' }
    }
  }).state('clients.main', {
    url: '',
    views: {
      'main-content': { /*controller: 'ClientsListCtrl',*/templateUrl: 'views/clients/content-main.html' }
    }
  }).state('clients.groups', {
    url: '/groups',
    views: {
      'main-content': { templateUrl: 'views/clients/content-main.html' }
    }
  })

  // Sites
  .state('sites', {
    parent: 'private',
    abstract: true,
    url: '/sites',
    views: {
      'master-view': { templateUrl: 'views/masters/sites.html' }
    }
  }).state('sites.main', {
    url: '/',
    views: {
      'main-content': { templateUrl: 'views/sites/content-main.html' }
    }
  }).state('sites.domains', {
    url: '/groups',
    views: {
      'main-content': { templateUrl: 'views/sites/content-main.html' }
    }
  }).state('site', {
    abstract: true,
    url: '/sites/:id',
    views: {
      'master-view': { templateUrl: 'views/masters/site.html' }
    }
  }).state('site.edit', {
    url: '/edit',
    views: {
      'main-content': { templateUrl: 'views/sites/content-main.html' }
    }
  })

  // Analytics
  .state('service', {
    parent: 'private',
    abstract: true,
    url: '/service/:name',
    views: {
      'master-view': { templateUrl: 'views/masters/service.html' }
    }
  }).state('service.main', {
    url: '/',
    views: {
      'main-content': { controller: 'asStatisticCtrl', templateUrl: 'views/service/content-main.html' }
    }
  }).state('service.main.page', {
    url: ':pageId',
    controller: 'asStatisticPageCtrl',
    templateUrl: 'views/service/content-page.html',
    resolve: {
      page: /*@ngInject*/function page(aPageModel, $stateParams) {
        return aPageModel.get({ _id: $stateParams.pageId }).$promise;
      }
    }
  });
};

},{}],10:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default =
/*@ngInject*/
function ($rootScope, $auth, $http) {
  return {
    restrict: 'A',
    replace: false,
    scope: {
      'user': '=bzCurrentUser'
    },
    controller: /*@ngInject*/function controller($scope, BASE_API) {
      if ($rootScope.currentAuth) {
        var user = angular.copy($rootScope.currentAuth.account);
        user.dashboard = $rootScope.currentAuth.dashboard;
        $scope.user = user;
      } else {
        var payload = $auth.getPayload();
        $http.get(BASE_API + '/auth').success(function (data) {
          $rootScope.currentAuth = data;
          var user = angular.copy($rootScope.currentAuth.account);
          user.dashboard = $rootScope.currentAuth.dashboard;
          $scope.user = user;
        });
      }
    }
  };
};

},{}],11:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default =
/*@ngInject*/
function () {
  return {
    scope: {
      'model': '=bzDateRange'
    },
    link: function link(scope, element, attributes, ngModel) {

      var ranges = {
        'Today': [moment(), moment()],
        'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
        'Last 7 Days': [moment().subtract(6, 'days'), moment()],
        'Last 30 Days': [moment().subtract(29, 'days'), moment()],
        'This Month': [moment().startOf('month'), moment().endOf('month')],
        'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
      };

      element.daterangepicker({
        "startDate": scope.model.startDate.format('MM/DD/YYYY'),
        "endDate": scope.model.endDate.format('MM/DD/YYYY'),
        ranges: ranges,
        opens: 'left',
        "drops": "up"
      }, function (start, end, label) {
        scope.$apply(function () {
          scope.model.startDate = start;
          scope.model.endDate = end;
        });
      });
    }
  };
};

},{}],12:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
function getFieldInfo(model, path) {
  return path.length === 1 ? model[path[0]] : getFieldInfo(model[path[0]], path.slice(1));
}

exports.default =
/*@ngInject*/
function ($compile) {
  return {
    restrict: 'E',
    replace: false,
    transclude: true,
    scope: {
      'onLeaveWarning': '=',
      'modelState': '=',
      'model': '=',
      'summary': '@?',
      'bzFormName': '=?name',
      'submit': '&'
    },
    templateUrl: 'app/base/directives/bzForm.html',
    controller: function controller($scope) {
      $scope.formSubmit = function () {
        $scope.modelState = null;
        var promise = $scope.submit();
        promise.catch(function (res) {
          if (res.status == 422) {
            $scope.modelState = res.data;
          }
        });
      };

      this.splitField = function (field) {
        var res = {};
        var lastDot = field.lastIndexOf('.');
        if (lastDot !== -1) {
          res.fieldPrefix = field.substr(0, lastDot);
          res.fieldName = field.substr(lastDot + 1);
        } else {
          res.fieldPrefix = '';
          res.fieldName = field;
        }
        return res;
      };
      this.getFormState = function () {
        return $scope.bzFormName;
      };
      this.getModelState = function () {
        return $scope.modelState;
      };
      this.getModel = function (field) {
        if (field.length === 0) {
          return $scope.model;
        } else {
          var spl = field.split('.');

          return getFieldInfo($scope.model, spl.length > 0 ? spl : [field]);
        }
      };
      function routeChange(event, newUrl) {
        if (!$scope.onLeaveWarning) {
          return;
        }
        /*interactionSvc.confirmAlert('Confirmation', 'You have not saved changes will be lost, do you really want?',
         function () {
         onRouteChangeOff();
         newUrl = newUrl.substring(newUrl.replace('//', '').indexOf('/') + 2);
         $location.path(newUrl);
         });*/
        alert('Confirmation');
        event.preventDefault();
      }

      var onRouteChangeOff = $scope.$on('$locationChangeStart', routeChange);
    }
  };
};

},{}],13:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default =
/*@ngInject*/
function () {
  return {
    require: '^bzForm',
    restrict: 'E',
    replace: true,
    transclude: true,
    scope: {
      'help': '@',
      'field': '@',
      'label': '@'
    },
    templateUrl: 'app/base/directives/bzFormControl.html',
    link: function link(scope, element, attrs, bzForm) {
      scope.form = bzForm.getFormState();

      var getModelState = bzForm.getModelState;
      scope.fieldErrors = function (field) {
        return _.filter(getModelState().fieldErrors, { field: field });
      };
      scope.hasErrors = function (field) {
        var modelState = getModelState();
        return modelState && modelState.hasErrors && modelState.fieldErrors && modelState.fieldErrors.length > 0 && _.filter(modelState.fieldErrors, { field: field }).length > 0;
      };
    }
  };
};

},{}],14:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = AuthInterceptor;

/*@ngInject*/
function AuthInterceptor($q, $injector) {
  return {
    'request': function request(config) {
      return config;
    },
    'requestError': function requestError(rejection) {
      return $q.reject(rejection);
    },
    'response': function response(_response) {
      return _response;
    },
    'responseError': function responseError(rejection) {
      if (rejection.status === 401) {
        var $state = $injector.get('$state');
        $state.go('signout');
      }
      return $q.reject(rejection);
    }
  };
}

},{}],15:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default =
/*@ngInject*/
function ($rootScope, $translate) {
    $rootScope.languages = [{ code: 'en', title: 'English' }, { code: 'uk', title: 'Українська' }, { code: 'ru', title: 'Русский' }];
    $rootScope.currentLanguage = $translate.use();
    $rootScope.$on('$translateChangeSuccess', function (e, dest) {
        $rootScope.currentLanguage = dest.language;
    });
    $rootScope.changeLanguage = function (key) {
        $translate.use(key);
    };
};

},{}],16:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default =
/*@ngInject*/
function ($rootScope) {

  $rootScope.mainMenu = _.filter(settings.dashboard.services, function (item) {
    return item.name != 'base';
  });
};

},{}],17:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default =
/*@ngInject*/
function (Permission, $auth) {
    // Define anonymous role
    Permission.defineRole('anonymous', function (stateParams) {
        return !$auth.isAuthenticated();
    });
    // Dashboard Owner
    Permission.defineRole('dashboardOwner', function (stateParams) {
        console.info(stateParams, $auth.getPayload());
        return $auth.isAuthenticated();
    });
};

},{}],18:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = bServiceModel;

/*@ngInject*/
function bServiceModel($resource, BASE_API) {
  var resource = $resource(BASE_API + '/services/:_id/:method', {
    '_id': '@_id'
  }, {
    'get': { method: 'GET' },
    'save': { method: 'PUT' },
    'subscribe': { method: 'POST', params: { method: 'subscribe' } },
    'update': { method: 'PATCH' }
  });

  return resource;
}

},{}],19:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _bServiceModel = require('./bServiceModel.js');

var _bServiceModel2 = _interopRequireDefault(_bServiceModel);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var appName = 'base.models';

var _module = angular.module(appName, ['ngResource']);

var service = _.find(settings.dashboard.services, { name: 'base' });

_module.constant('BASE_API', service.apiUrl);

// models


_module.factory('bServiceModel', _bServiceModel2.default);

exports.default = appName;

},{"./bServiceModel.js":18}],20:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var BaseNotifySvc =
/*@ngInject*/
function BaseNotifySvc(toaster) {
  _classCallCheck(this, BaseNotifySvc);

  this.popSuccess = function () {
    toaster.pop('success', "title", "text");
  };
};

exports.default = BaseNotifySvc;

},{}],21:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = {};

},{}],22:[function(require,module,exports){
'use strict';

var _app = require('./app');

var _app2 = _interopRequireDefault(_app);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

angular.element(document).ready(function () {
  /*let modules = _.pluck(settings.dashboard.services, 'moduleUrl');
   LazyLoad.js(modules, function () {
   console.info('all files have been loaded');
   });*/

  angular.bootstrap(document, [_app2.default]);
});

},{"./app":1}],23:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _models = require('./models/models');

var _models2 = _interopRequireDefault(_models);

var _dashboard = require('./dashboard/dashboard');

var _dashboard2 = _interopRequireDefault(_dashboard);

var _projects = require('./projects/projects');

var _projects2 = _interopRequireDefault(_projects);

var _settings = require('./settings/settings');

var _settings2 = _interopRequireDefault(_settings);

var _statistic = require('./statistic/statistic');

var _statistic2 = _interopRequireDefault(_statistic);

var _experiments = require('./experiments/experiments');

var _experiments2 = _interopRequireDefault(_experiments);

var _routes = require('./routes');

var _routes2 = _interopRequireDefault(_routes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var appName = 'module.analytics';

var _module = angular.module(appName, [_models2.default, _dashboard2.default, _projects2.default, _settings2.default, _experiments2.default, _statistic2.default]);

_module.config(_routes2.default);

exports.default = appName;

},{"./dashboard/dashboard":26,"./experiments/experiments":31,"./models/models":38,"./projects/projects":40,"./routes":41,"./settings/settings":44,"./statistic/statistic":47}],24:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default =
/*@ngInject*/
function ($scope, item) {};

},{}],25:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default =
/*@ngInject*/
function ($scope, item) {

  $scope.item = item;

  $scope.saveItem = function (item) {
    var savedItem = angular.copy(item);

    var saveFunc = savedItem._id ? savedItem.$save : savedItem.$create;

    $scope.loading = true;
    return saveFunc.call(item, function (res) {
      $scope.$close();
    }, function () {
      $scope.loading = false;
    });
  };
};

},{}],26:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _adDashboardCtrl = require('./controllers/adDashboardCtrl.js');

var _adDashboardCtrl2 = _interopRequireDefault(_adDashboardCtrl);

var _adEditProjectModelCtrl = require('./controllers/adEditProjectModelCtrl.js');

var _adEditProjectModelCtrl2 = _interopRequireDefault(_adEditProjectModelCtrl);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var appName = 'module.analytics.dashboard';

var _module = angular.module(appName, []);

// controllers


_module.controller('adDashboardCtrl', _adDashboardCtrl2.default).controller('adEditProjectModelCtrl', _adEditProjectModelCtrl2.default);

// config
_module.config(function ($stateProvider) {});

exports.default = appName;

},{"./controllers/adDashboardCtrl.js":24,"./controllers/adEditProjectModelCtrl.js":25}],27:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default =
/*@ngInject*/
function ($scope, item) {

  $scope.trackingParameters = {
    query: 'Запрос',
    frequence: 'Частотность',
    yandexPosition: 'Позиция в Яндексе',
    googlePosition: 'Позиция в Google',
    yandexTraffic: 'Трафик по Яндекс',
    googleTraffic: 'Трафик по Google',
    traffic: 'Общий трафик'
  };
  $scope.trackingParametersKeys = _.keys($scope.trackingParameters);

  $scope.item = item;

  $scope.saveItem = function (item) {
    var savedItem = angular.copy(item);

    var saveFunc = savedItem._id ? savedItem.$save : savedItem.$create;

    $scope.loading = true;
    return saveFunc.call(item, function (res) {
      $scope.$close();
    }, function () {
      $scope.loading = false;
    });
  };
};

},{}],28:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default =
/*@ngInject*/
function ($scope, item, experiment, aSiteModel) {

  $scope.experiment = experiment;
  $scope.item = item;
  console.info(experiment);
  aSiteModel.query({ page: 1, perPage: 100 }, function (data) {
    $scope.projects = data;
  });

  $scope.saveItem = function (item) {
    var savedItem = angular.copy(item);

    var saveFunc = savedItem._id ? savedItem.$save : savedItem.$create;

    $scope.loading = true;
    return saveFunc.call(item, function (res) {
      $scope.$close();
    }, function () {
      $scope.loading = false;
    });
  };
};

},{}],29:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default =
/*@ngInject*/
function ($scope, item, aExperimentUrlModel) {

  $scope.item = item;

  aExperimentUrlModel.query({ page: 1, perPage: 100 }, function (data) {
    $scope.urls = data;
  });

  $scope.saveItem = function (item) {
    var savedItem = angular.copy(item);

    var saveFunc = savedItem._id ? savedItem.$save : savedItem.$create;

    $scope.loading = true;
    return saveFunc.call(item, function (res) {
      $scope.$close();
    }, function () {
      $scope.loading = false;
    });
  };
};

},{}],30:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default =
/*@ngInject*/
function ($scope, aExperimentModel) {

  var loadExperiments = function loadExperiments() {
    aExperimentModel.query({ page: 1, perPage: 100 }, function (res) {
      $scope.experiments = res;
    });
  };
  loadExperiments();
};

},{}],31:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _aeExperimentsListCtrl = require('./controllers/aeExperimentsListCtrl.js');

var _aeExperimentsListCtrl2 = _interopRequireDefault(_aeExperimentsListCtrl);

var _aeExperimentCtrl = require('./controllers/aeExperimentCtrl.js');

var _aeExperimentCtrl2 = _interopRequireDefault(_aeExperimentCtrl);

var _aeEditExperimentModelCtrl = require('./controllers/aeEditExperimentModelCtrl.js');

var _aeEditExperimentModelCtrl2 = _interopRequireDefault(_aeEditExperimentModelCtrl);

var _aeEditExperimentUrlCtrl = require('./controllers/aeEditExperimentUrlCtrl.js');

var _aeEditExperimentUrlCtrl2 = _interopRequireDefault(_aeEditExperimentUrlCtrl);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var appName = 'module.analytics.experiments';

var _module = angular.module(appName, []);

// controllers


_module.controller('aeExperimentsListCtrl', _aeExperimentsListCtrl2.default).controller('aeExperimentCtrl', _aeExperimentCtrl2.default).controller('aeEditExperimentModelCtrl', _aeEditExperimentModelCtrl2.default).controller('aeEditExperimentUrlCtrl', _aeEditExperimentUrlCtrl2.default);

// config
_module.config(function ($stateProvider) {});

exports.default = appName;

},{"./controllers/aeEditExperimentModelCtrl.js":27,"./controllers/aeEditExperimentUrlCtrl.js":28,"./controllers/aeExperimentCtrl.js":29,"./controllers/aeExperimentsListCtrl.js":30}],32:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = aAuthModel;

/*@ngInject*/
function aAuthModel($resource, ANALYTICS_API, SatellizerPopup, $window) {
  var resource = $resource(ANALYTICS_API + '/auth/:_id/:method', {
    '_id': '@_id'
  }, {
    'get': { method: 'GET' },
    'save': { method: 'PUT' },
    'create': { method: 'POST' },
    'update': { method: 'PATCH' },

    'authGoogle': { method: 'GET', params: { method: 'google' } }
  });

  resource.signIn = function (callback) {
    callback = callback || angular.noop;

    resource.authGoogle(function (res) {
      var openPopup = SatellizerPopup.open(res.url, 'Google Auth', { width: 452, height: 633 }, $window.location.origin).pollPopup();

      openPopup.then(function (token) {
        callback(token);
      });
    });
  };

  return resource;
}

},{}],33:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = aExperimentModel;

/*@ngInject*/
function aExperimentModel($resource, ANALYTICS_API) {
  var resource = $resource(ANALYTICS_API + '/experiments/:_id/:method', {
    '_id': '@_id'
  }, {
    'get': { method: 'GET' },
    'save': { method: 'PUT' },
    'create': { method: 'POST' },
    'update': { method: 'PATCH' }
  });

  return resource;
}

},{}],34:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = aExperimentUrlModel;

/*@ngInject*/
function aExperimentUrlModel($resource, ANALYTICS_API) {
  var resource = $resource(ANALYTICS_API + '/experimentUrls/:_id/:method', {
    '_id': '@_id'
  }, {
    'get': { method: 'GET' },
    'save': { method: 'PUT' },
    'create': { method: 'POST' },
    'update': { method: 'PATCH' }
  });

  return resource;
}

},{}],35:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = aPageModel;

/*@ngInject*/
function aPageModel($resource, ANALYTICS_API) {
  var resource = $resource(ANALYTICS_API + '/pages/:_id/:method', {
    '_id': '@_id'
  }, {
    'get': { method: 'GET' },
    'save': { method: 'PUT' },
    'create': { method: 'POST' },
    'update': { method: 'PATCH' }
  });

  return resource;
}

},{}],36:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = aSiteModel;

/*@ngInject*/
function aSiteModel($resource, ANALYTICS_API) {
  var resource = $resource(ANALYTICS_API + '/sites/:_id/:method', {
    '_id': '@_id'
  }, {
    'get': { method: 'GET' },
    'save': { method: 'PUT' },
    'create': { method: 'POST' },
    'update': { method: 'PATCH' },

    'updateSite': { method: 'PUT' },
    'scanSite': { method: 'POST', params: { method: 'scan' } },

    'find': { method: 'POST', params: { method: 'find' }, isArray: true }
  });

  return resource;
}

},{}],37:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = aVisitModel;

/*@ngInject*/
function aVisitModel($resource, ANALYTICS_API) {
  var resource = $resource(ANALYTICS_API + '/visits/:_id/:method', {
    '_id': '@_id'
  }, {
    'get': { method: 'GET' },
    'save': { method: 'PUT' },
    'create': { method: 'POST' },
    'update': { method: 'PATCH' },

    'getGrownUp': { method: 'GET', params: { method: 'grown-up' }, isArray: true },
    'getDropIn': { method: 'GET', params: { method: 'drop-in' }, isArray: true }
  });

  return resource;
}

},{}],38:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _aAuthModel = require('./aAuthModel.js');

var _aAuthModel2 = _interopRequireDefault(_aAuthModel);

var _aSiteModel = require('./aSiteModel.js');

var _aSiteModel2 = _interopRequireDefault(_aSiteModel);

var _aPageModel = require('./aPageModel.js');

var _aPageModel2 = _interopRequireDefault(_aPageModel);

var _aVisitModel = require('./aVisitModel.js');

var _aVisitModel2 = _interopRequireDefault(_aVisitModel);

var _aExperimentModel = require('./aExperimentModel.js');

var _aExperimentModel2 = _interopRequireDefault(_aExperimentModel);

var _aExperimentUrlModel = require('./aExperimentUrlModel.js');

var _aExperimentUrlModel2 = _interopRequireDefault(_aExperimentUrlModel);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var appName = 'module.analytics.models';

var _module = angular.module(appName, ['ngResource']);

var service = _.find(settings.dashboard.services, { name: 'paphos-analytics' });

_module.constant('ANALYTICS_API', service.apiUrl);

// models


_module.factory('aAuthModel', _aAuthModel2.default).factory('aPageModel', _aPageModel2.default).factory('aSiteModel', _aSiteModel2.default).factory('aVisitModel', _aVisitModel2.default).factory('aExperimentModel', _aExperimentModel2.default).factory('aExperimentUrlModel', _aExperimentUrlModel2.default);

exports.default = appName;

},{"./aAuthModel.js":32,"./aExperimentModel.js":33,"./aExperimentUrlModel.js":34,"./aPageModel.js":35,"./aSiteModel.js":36,"./aVisitModel.js":37}],39:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default =
/*@ngInject*/
function ($scope, item) {

  $scope.item = item;
};

},{}],40:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _apProjectViewCtrl = require('./controllers/apProjectViewCtrl.js');

var _apProjectViewCtrl2 = _interopRequireDefault(_apProjectViewCtrl);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var appName = 'module.analytics.projects';

var _module = angular.module(appName, []);

// controllers


_module.controller('apProjectViewCtrl', _apProjectViewCtrl2.default);

// config
_module.config(function ($stateProvider) {});

exports.default = appName;

},{"./controllers/apProjectViewCtrl.js":39}],41:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default =
/*@ngInject*/
function ($stateProvider, $urlRouterProvider) {

  console.info('asd');
  $stateProvider.state('analytics', {
    parent: 'private',
    abstract: true,
    url: '/analytics',
    views: {
      'master-view': { templateUrl: 'views/masters/service.html' }
    }
  }).state('experiments', {
    url: '/experiments',
    parent: 'analytics',
    views: {
      'main-content': { controller: 'aeExperimentsListCtrl', templateUrl: 'views/analytics/experiments/page-list.html' }
    }
  }).state('analytics.dashboard', {
    url: '',
    views: {
      'main-content': { controller: 'adDashboardCtrl', templateUrl: 'views/analytics/dashboard/page-dashboard.html' }
    }
  }).state('analytics.dashboard.new-project', {
    url: '/new-project',
    onEnter: function onEnter($stateParams, $state, $uibModal) {
      $uibModal.open({
        backdropClass: 'modal-backdrop',
        windowClass: 'modal-right',
        animation: true,
        templateUrl: 'views/analytics/dashboard/modal-project.html',
        resolve: {
          item: function item(aSiteModel) {
            return new aSiteModel();
          }
        },
        controller: 'adEditProjectModelCtrl'
      }).result.finally(function () {
        return $state.go('^');
      });
    }
  }).state('analytics.project', {
    url: '/:projectId',
    abstract: true,
    views: {
      'main-content': { controller: 'apProjectViewCtrl', templateUrl: 'views/analytics/projects/page-project.html' }
    },
    resolve: {
      item: function item(aSiteModel, $stateParams) {
        return aSiteModel.get({ _id: $stateParams.projectId });
      }
    }
  }).state('analytics.project.info', {
    url: '',
    templateUrl: 'views/analytics/projects/page-info.html'
  }).state('analytics.project.pages', {
    url: '/pages',
    templateUrl: 'views/analytics/projects/page-pages.html'
  }).state('analytics.project.positions', {
    url: '/positions',
    templateUrl: 'views/analytics/projects/page-positions.html'
  }).state('experiments.new-experiment', {
    url: '/new-experiment',
    onEnter: function onEnter($stateParams, $state, $uibModal) {
      $uibModal.open({
        backdropClass: 'modal-backdrop',
        windowClass: 'modal-right',
        animation: true,
        templateUrl: 'views/analytics/experiments/modal-experiment.html',
        resolve: {
          item: function item(aExperimentModel) {
            return new aExperimentModel({
              variableParameterName: 'title',
              trackingParameterName: 'query',
              trackingTime: 'month'
            });
          }
        },
        controller: 'aeEditExperimentModelCtrl'
      }).result.finally(function () {
        return $state.go('^');
      });
    }
  }).state('experiment', {
    url: '/experiments/:experimentId',
    parent: 'analytics',
    views: {
      'main-content': { controller: 'aeExperimentCtrl', templateUrl: 'views/analytics/experiments/page-experiment.html' }
    },
    resolve: {
      item: function item(aExperimentModel, $stateParams) {
        return aExperimentModel.get({ _id: $stateParams.experimentId });
      }
    }
  }).state('experiment.new-url', {
    url: '/new-url',
    onEnter: function onEnter($stateParams, $state, $uibModal) {
      $uibModal.open({
        backdropClass: 'modal-backdrop',
        windowClass: 'modal-right',
        animation: true,
        templateUrl: 'views/analytics/experiments/modal-experimentUrl.html',
        resolve: {
          experiment: function experiment(aExperimentModel) {
            return aExperimentModel.get({ _id: $stateParams.experimentId });
          },
          item: function item(aExperimentUrlModel) {
            return new aExperimentUrlModel({
              experimentId: $stateParams.experimentId,
              period: {
                startDate: moment(),
                endDate: moment().add(7, 'day')
              }
            });
          }
        },
        controller: 'aeEditExperimentUrlCtrl'
      }).result.finally(function () {
        return $state.go('^');
      });
    }
  });
};

},{}],42:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var asMainMenuCtrl =
/*@ngInject*/
function asMainMenuCtrl($scope, aSiteModel) {
  _classCallCheck(this, asMainMenuCtrl);

  $scope.current = {
    site: null,
    date: {
      startDate: moment().subtract(6, 'day'),
      endDate: moment()
    }
  };

  var sites = [{ siteUrl: 'http://v-androide.com/' }, { siteUrl: 'http://vseowode.ru/' }];

  var loadSites = function loadSites() {
    $scope.hasUnknown = false;
    aSiteModel.find(_.pluck(sites, 'siteUrl'), function (res) {
      $scope.sites = res;

      $scope.hasUnknown = _.filter(res, { isUnknown: true }).length > 0;
    });
  };
  loadSites();
};

exports.default = asMainMenuCtrl;

},{}],43:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var asSettingsCtrl =
/*@ngInject*/
function asSettingsCtrl($scope, $http, $timeout, ngAnalyticsService, SatellizerPopup, $auth, aSiteModel, aAuthModel) {
  _classCallCheck(this, asSettingsCtrl);

  $scope.authenticate = function (provider) {
    $auth.authenticate(provider).then(function (data) {
      console.info(data);
    }).catch(function (res) {
      console.info(res.data);
    });
  };

  $scope.user = {};

  $scope.signIn = function () {
    aAuthModel.signIn();
  };

  $scope.updateSite = function (site) {
    aSiteModel.updateSite({ _id: site._id }, site, function (res) {});
  };

  $scope.scanSite = function (site) {
    aSiteModel.scanSite({ _id: site._id }, function (res) {});
  };

  $scope.getPages = function (site) {

    $scope.selectedSite = null;
    aSiteModel.get({ _id: site._id }, function (res) {
      ngAnalyticsService.serviceAuthToken = res.tokens.access_token;
      ngAnalyticsService.authorize();

      $scope.charts = [{
        reportType: 'ga',
        query: {
          metrics: 'ga:sessions',
          dimensions: 'ga:date',
          'start-date': '30daysAgo',
          'end-date': 'yesterday',
          ids: 'ga:' + site.analytics.profileId
        },
        chart: {
          container: 'chart-container-1',
          type: 'LINE',
          options: {
            width: '100%'
          }
        }
      }, {
        reportType: 'ga',
        query: {
          metrics: 'ga:sessions',
          dimensions: 'ga:browser',
          'start-date': '30daysAgo',
          'end-date': 'yesterday',
          ids: 'ga:' + site.analytics.profileId
        },
        chart: {
          container: 'chart-container-2',
          type: 'PIE',
          options: {
            width: '100%',
            is3D: true,
            title: 'Browser Usage'
          }
        }
      }];
      $scope.extraChart = {
        reportType: 'ga',
        query: {
          metrics: 'ga:sessions',
          dimensions: 'ga:date',
          'start-date': '30daysAgo',
          'end-date': 'yesterday',
          ids: 'ga:' + site.analytics.profileId
        },
        chart: {
          container: 'chart-container-3',
          type: 'LINE',
          options: {
            width: '100%'
          }
        }
      };
      $scope.defaultIds = {
        ids: 'ga:' + site.analytics.profileId
      };
      $scope.queries = [{
        query: {
          ids: 'ga:' + site.analytics.profileId,
          metrics: 'ga:sessions',
          dimensions: 'ga:city'
        }
      }];

      $timeout(function () {
        $scope.selectedSite = site;
      }, 1);
    });

    $http.get('http://analytics.5stars.link/api/pages?site._id=' + site._id).then(function (res) {
      $scope.pages = res.data;
    });
  };

  $scope.getQueries = function (page) {
    var keywords = {};
    $http.get('http://analytics.5stars.link/api/statistics?page._id=' + page._id + '&sort=clicks').then(function (res) {

      _.each(res.data, function (item) {
        keywords[item.query.keyword] = keywords[item.query.keyword] || {};
        keywords[item.query.keyword][item.date] = item.position;
      });
      $scope.queries = keywords;
      console.info(keywords);
    });
  };

  $scope.$on('$gaReportSuccess', function (e, report, element) {
    console.log(report, element);
  });
};

exports.default = asSettingsCtrl;

},{}],44:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asSettingsCtrl = require('./controllers/asSettingsCtrl.js');

var _asSettingsCtrl2 = _interopRequireDefault(_asSettingsCtrl);

var _asMainMenuCtrl = require('./controllers/asMainMenuCtrl.js');

var _asMainMenuCtrl2 = _interopRequireDefault(_asMainMenuCtrl);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var appName = 'module.analytics.settings';

var _module = angular.module(appName, []);

// controllers


_module.controller('asMainMenuCtrl', _asMainMenuCtrl2.default).controller('asSettingsCtrl', _asSettingsCtrl2.default);

// config
_module.config(function ($stateProvider) {});

exports.default = appName;

},{"./controllers/asMainMenuCtrl.js":42,"./controllers/asSettingsCtrl.js":43}],45:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var asStatisticCtrl =
/*@ngInject*/
function asStatisticCtrl($scope, aVisitModel, aSiteModel, ngAnalyticsService, $timeout) {
  _classCallCheck(this, asStatisticCtrl);

  $scope.current = {
    site: null,
    date: {
      startDate: moment().subtract(6, 'day'),
      endDate: moment()
    }
  };

  var sites = [{ siteUrl: 'http://v-androide.com/' }, { siteUrl: 'http://vseowode.ru/' }];

  var loadSites = function loadSites() {
    $scope.hasUnknown = false;
    aSiteModel.find(_.pluck(sites, 'siteUrl'), function (res) {
      $scope.sites = res;

      $scope.hasUnknown = _.filter(res, { isUnknown: true }).length > 0;
    });
  };
  loadSites();

  var updateCharts = function updateCharts() {
    $scope.isReady = false;
    if (!$scope.current.site) {
      return;
    }

    var start = $scope.current.date.startDate.format('YYYY-MM-DD'),
        end = $scope.current.date.endDate.format('YYYY-MM-DD');

    aVisitModel.getGrownUp({ date_from: start, date_to: end, 'site._id': $scope.current.site._id }, function (data) {
      $scope.grownUp = data;
    });
    aVisitModel.getDropIn({ date_from: start, date_to: end, 'site._id': $scope.current.site._id }, function (data) {
      $scope.dropIn = data;
    });

    var profileId = 'ga:' + $scope.current.site.analytics.profileId;
    $scope.profileId = profileId;

    $scope.defaultIds = {
      ids: profileId
    };

    $scope.extraChart = {
      reportType: 'ga',
      query: {
        metrics: 'ga:sessions,ga:users',
        dimensions: 'ga:date',
        'start-date': $scope.current.date.startDate.format('YYYY-MM-DD'),
        'end-date': $scope.current.date.endDate.format('YYYY-MM-DD'),
        ids: profileId
      },
      chart: {
        container: 'chart-container-3',
        type: 'LINE',
        options: {
          width: '100%'
        }
      }
    };

    $timeout(function () {
      $scope.isReady = true;
    }, 10);
  };

  $scope.$watch('current.site._id', function (siteId) {
    if (!siteId) {
      return;
    }
    var tokens = $scope.current.site.tokens;
    if (tokens.access_token) {
      ngAnalyticsService.serviceAuthToken = tokens.access_token;
      ngAnalyticsService.authorize();
    }

    updateCharts();
  });

  $scope.$watch(function () {
    return $scope.current.site && ngAnalyticsService.isReady;
  }, function (isReady) {
    $scope.isReady = isReady;
  });

  $scope.$watch('current.date', function (date) {
    updateCharts();
  }, true);
};

exports.default = asStatisticCtrl;

},{}],46:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var asStatisticPageCtrl =
/*@ngInject*/
function asStatisticPageCtrl($scope, page, $timeout) {
  _classCallCheck(this, asStatisticPageCtrl);

  console.info(page);

  var updateCharts = function updateCharts() {
    $scope.isReady = false;
    if (!$scope.current.site) {
      return;
    }

    $scope.extraChart = {
      reportType: 'ga',
      query: {
        metrics: 'ga:sessions,ga:users',
        dimensions: 'ga:date',
        'start-date': $scope.current.date.startDate.format('YYYY-MM-DD'),
        'end-date': $scope.current.date.endDate.format('YYYY-MM-DD'),
        ids: $scope.profileId,
        filters: 'ga:pagePath==' + page.url
      },
      chart: {
        container: 'chart-container-3',
        type: 'LINE',
        options: {
          width: '100%'
        }
      }
    };
    $timeout(function () {
      $scope.isReady = true;
    }, 10);
  };

  $scope.$watch('current.date', function (date) {
    updateCharts();
  }, true);
};

exports.default = asStatisticPageCtrl;

},{}],47:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asStatisticCtrl = require('./controllers/asStatisticCtrl.js');

var _asStatisticCtrl2 = _interopRequireDefault(_asStatisticCtrl);

var _asStatisticPageCtrl = require('./controllers/asStatisticPageCtrl.js');

var _asStatisticPageCtrl2 = _interopRequireDefault(_asStatisticPageCtrl);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var appName = 'module.analytics.statistic';

var _module = angular.module(appName, []);

// controllers


_module.controller('asStatisticCtrl', _asStatisticCtrl2.default).controller('asStatisticPageCtrl', _asStatisticPageCtrl2.default);

// config
_module.config(function ($stateProvider) {});

exports.default = appName;

},{"./controllers/asStatisticCtrl.js":45,"./controllers/asStatisticPageCtrl.js":46}],48:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _manager = require('./manager/manager');

var _manager2 = _interopRequireDefault(_manager);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var appName = 'module.dashboards';

var _module = angular.module(appName, [_manager2.default]);

exports.default = appName;

},{"./manager/manager":51}],49:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default =
/*@ngInject*/
function ($scope, $state, item, $http, $q, bServiceModel) {

  $scope.item = item;

  $scope.successDiscover = !!item._id; // already discover if edit

  var canceler = $q.defer();
  $scope.discoverUrl = function (url) {
    $scope.loadingDiscover = true;
    $scope.failderDiscover = false;
    $scope.successDiscover = false;
    canceler.resolve();
    canceler = $q.defer();

    $http.get(url + '/paphos-discover.json', { timeout: canceler.promise }).success(function (data) {
      $scope.item = new bServiceModel(data);
      $scope.item.url = url;

      $scope.loadingDiscover = false;
      $scope.successDiscover = true;
    }).catch(function (err) {
      $scope.loadingDiscover = false;
      $scope.failderDiscover = true;
    });
  };

  $scope.saveItem = function (item) {
    $scope.loading = true;

    item = angular.copy(item);

    if (item._id) {
      return item.$save(function (data) {
        console.info(data);

        $scope.loading = false;
      });
    }

    return item.$subscribe(function (data) {
      console.info(data);

      $scope.loading = false;
    });
  };

  $scope.deleteItem = function (item) {
    $scope.loading = true;
    item.$delete(function () {
      $scope.$close();
    });
  };
};

},{}],50:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default =
/*@ngInject*/
function ($scope, $interval, bServiceModel) {

  var loadData = function loadData() {
    bServiceModel.query({}, function (data) {
      if ($scope.services) {
        _.each($scope.services, function (item) {
          var service = _.find(data, { _id: item._id });
          if (!service) {
            $scope.services = _.reject($scope.services, function (service) {
              return service._id == item._id;
            });
            return;
          }
          data = _.reject(data, function (item) {
            return service._id == item._id;
          });
          angular.copy(service, item);
        });
        _.each(data, function (item) {
          $scope.services.push(item);
        });
        return;
      }
      $scope.services = data;
    });
  };

  var timer = $interval(loadData, 2000);
  $scope.$on('$destroy', function () {
    $interval.cancel(timer);
  });

  loadData();

  $scope.deleteItem = function (item) {
    $scope.loading = true;
    item.$delete(function () {
      $scope.services = _.reject($scope.services, function (service) {
        return service._id == item._id;
      });
      $scope.loading = false;
    });
  };
};

},{}],51:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _dmListCtrl = require('./controllers/dmListCtrl.js');

var _dmListCtrl2 = _interopRequireDefault(_dmListCtrl);

var _dmEditServiceCtrl = require('./controllers/dmEditServiceCtrl.js');

var _dmEditServiceCtrl2 = _interopRequireDefault(_dmEditServiceCtrl);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var appName = 'module.dashboards.manager';

var _module = angular.module(appName, []);

// controllers

_module.controller('dmListCtrl', _dmListCtrl2.default).controller('dmEditServiceCtrl', _dmEditServiceCtrl2.default);

// config
_module.config(function ($stateProvider) {

  $stateProvider
  // Forms
  .state('services', {
    parent: 'private',
    abstract: true,
    url: '/services',
    views: {
      'master-view': { templateUrl: 'views/services/master-page.html' }
    }
  }).state('services.main', {
    url: '',
    views: {
      'main-content': { controller: 'dmListCtrl', templateUrl: 'views/services/page-list.html' }
    }
  }).state('services.main.new', {
    url: '/new',
    onEnter: function onEnter($stateParams, $state, $uibModal) {
      $uibModal.open({
        backdropClass: 'modal-backdrop',
        windowClass: 'modal-right',
        animation: true,
        templateUrl: 'views/services/modal-edit.html',
        resolve: {
          item: function item(bServiceModel) {
            return new bServiceModel();
          }
        },
        controller: 'dmEditServiceCtrl'
      }).result.finally(function () {
        return $state.go('^');
      });
    }
  }).state('services.main.edit', {
    url: '/:_id',
    onEnter: function onEnter($stateParams, $state, $uibModal) {
      $uibModal.open({
        backdropClass: 'modal-backdrop',
        windowClass: 'modal-right',
        animation: true,
        templateUrl: 'views/services/modal-edit.html',
        resolve: {
          item: function item(bServiceModel) {
            return bServiceModel.get({ _id: $stateParams._id }).$promise;
          }
        },
        controller: 'dmEditServiceCtrl'
      }).result.finally(function () {
        return $state.go('^');
      });
    }
  });
});

exports.default = appName;

},{"./controllers/dmEditServiceCtrl.js":49,"./controllers/dmListCtrl.js":50}],52:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _dashboards = require('./dashboards/dashboards');

var _dashboards2 = _interopRequireDefault(_dashboards);

var _analytics = require('./analytics/analytics');

var _analytics2 = _interopRequireDefault(_analytics);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = [_dashboards2.default, _analytics2.default];

},{"./analytics/analytics":23,"./dashboards/dashboards":48}]},{},[22])


//# sourceMappingURL=app.js.map
