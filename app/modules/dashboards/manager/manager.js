var appName = 'module.dashboards.manager';

let module = angular.module(appName, [
]);

// controllers
import dmListCtrl from './controllers/dmListCtrl.js';
import dmEditDashboardCtrl from './controllers/dmEditDashboardCtrl.js';
module
  .controller('dmListCtrl', dmListCtrl)
  .controller('dmEditDashboardCtrl', dmEditDashboardCtrl)
;

// config
module.config(($stateProvider) => {

  $stateProvider
  // Forms
    .state('dashboards', {
      parent: 'private',
      abstract: true,
      url: '/dashboards',
      views: {
        'master-view': { templateUrl: 'views/masters/dashboards.html' }
      }
    })
    .state('dashboards.main', {
      url: '',
      views: {
        'main-content': { controller: 'dmListCtrl', templateUrl: 'views/dashboards/content-main.html' }
      }
    })

    .state('dashboards.main.new', {
      url: '/new',
      onEnter: ($stateParams, $state, $uibModal) => {
        $uibModal.open({
          backdropClass: 'modal-backdrop',
          windowClass: 'modal-right',
          animation: true,
          templateUrl: 'views/dashboards/modal-edit.html',
          resolve: {
            item: bServiceModel => new bServiceModel()
          },
          controller: 'dmEditDashboardCtrl'
        }).result.finally(() => $state.go('^'));
      }
    })

});

export default appName;