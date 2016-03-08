var appName = 'module.analytics.models';

var module = angular.module(appName, [
    'ngResource'
]);

var service = _.find(settings.dashboard.services, { name: 'paphos-analytics' });

module.constant('ANALYTICS_API', service.apiUrl);

// models
import aAuthModel from './aAuthModel.js';
import aVisitModel from './aVisitModel.js';
import aSiteModel from './aSiteModel.js';
import aPageModel from './aPageModel.js';

module
    .factory('aAuthModel', aAuthModel)
    .factory('aVisitModel', aVisitModel)
    .factory('aPageModel', aPageModel)
    .factory('aSiteModel', aSiteModel)
;

export default appName;