var appName = 'module.analytics.settings';

let module = angular.module(appName, [
]);

// controllers
import asSettingsCtrl from './controllers/asSettingsCtrl.js';

module
  .controller('asSettingsCtrl', asSettingsCtrl)
;

// config
module.config(($stateProvider) => {

});

export default appName;