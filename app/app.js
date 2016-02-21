import config from './config';
import baseApp from './base/base';
import modules from './modules/modules.config';

let appName = 'app';

try {
    angular.module('views');
} catch (e) {
    angular.module('views', []);
}

window.config = config;

//if (window.settings) {
    angular.module(appName, [baseApp, 'views'].concat(modules));
/*} else {
    angular.module(appName, ['views', off]);
}*/

export default appName;