var appName = 'module.dashboards.manager';

let module = angular.module(appName, [
]);

// controllers
import dmListCtrl from './controllers/dmListCtrl.js';
import dmEditServiceCtrl from './controllers/dmEditServiceCtrl.js';
module
  .controller('dmListCtrl', dmListCtrl)
  .controller('dmEditServiceCtrl', dmEditServiceCtrl)
;

// config
module.config(($stateProvider) => {

  $stateProvider
  // Forms
    .state('services', {
      parent: 'private',
      abstract: true,
      url: '/services',
      views: {
        'master-view': { templateUrl: 'views/services/master-page.html' }
      }
    })
    .state('services.main', {
      url: '',
      views: {
        'main-content': { controller: 'dmListCtrl', templateUrl: 'views/services/page-list.html' }
      }
    })

    .state('services.main.new', {
      url: '/new',
      onEnter: ($stateParams, $state, $uibModal) => {
        $uibModal.open({
          backdropClass: 'modal-backdrop',
          windowClass: 'modal-right',
          animation: true,
          templateUrl: 'views/services/modal-edit.html',
          resolve: {
            item: bServiceModel => new bServiceModel()
          },
          controller: 'dmEditServiceCtrl'
        }).result.finally(() => $state.go('^'));
      }
    })

    .state('services.main.edit', {
      url: '/:_id',
      onEnter: ($stateParams, $state, $uibModal) => {
        $uibModal.open({
          backdropClass: 'modal-backdrop',
          windowClass: 'modal-right',
          animation: true,
          templateUrl: 'views/services/modal-edit.html',
          resolve: {
            item: bServiceModel => bServiceModel.get({ _id: $stateParams._id }).$promise
          },
          controller: 'dmEditServiceCtrl'
        }).result.finally(() => $state.go('^'));
      }
    })

});

export default appName;