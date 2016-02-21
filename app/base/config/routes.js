export default
/*@ngInject*/
($stateProvider, $urlRouterProvider) => {
    $urlRouterProvider.otherwise( function($injector) {
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
        })
        .state('signout', {
            url: '/signout',
            views: {
                'dashboard': { controller: 'AuthSignOutCtrl', template: '' }
            }
        })
        .state('private', { // complete
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
                'master-view': { templateUrl: 'views/masters/dashboard.html' },
            }
        })
        .state('dashboard.main', {
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
        })
        .state('clients.main', {
            url: '',
            views: {
                'main-content': { /*controller: 'ClientsListCtrl',*/ templateUrl: 'views/clients/content-main.html' }
            }
        })
        .state('clients.groups', {
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
        })
        .state('sites.main', {
            url: '/',
            views: {
                'main-content': { templateUrl: 'views/sites/content-main.html' }
            }
        })
        .state('sites.domains', {
            url: '/groups',
            views: {
                'main-content': { templateUrl: 'views/sites/content-main.html' }
            }
        })
        .state('site', {
            abstract: true,
            url: '/sites/:id',
            views: {
                'master-view': { templateUrl: 'views/masters/site.html' }
            }
        })
        .state('site.edit', {
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
        })
        .state('service.main', {
            url: '/',
            views: {
                'main-content': { controller: 'AnalyticsCtrl', templateUrl: 'views/service/content-main.html' }
            }
        })
    ;
};