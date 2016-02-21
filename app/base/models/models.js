var appName = 'base.models';

var module = angular.module(appName, [
    'ngResource'
]);

var service = _.find(settings.dashboard.services, { name: 'base' });

module.constant('BASE_API', service.apiUrl);

// models
import bServiceModel from './bServiceModel.js';

module
    .factory('bServiceModel', bServiceModel)
;

export default appName;