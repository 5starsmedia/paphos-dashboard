import appName from './app';

angular.element(document).ready(() => {
  /*let modules = _.pluck(settings.dashboard.services, 'moduleUrl');
   LazyLoad.js(modules, function () {
   console.info('all files have been loaded');
   });*/

  angular.bootstrap(document, [appName]);
});