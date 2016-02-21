export default
/*@ngInject*/
($stateProvider, $urlRouterProvider, $authProvider, $httpProvider) => {


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
            scope: ['email','photos','photo_big'],
            authorizationEndpoint: 'https://oauth.vk.com/authorize',
            popupOptions: { width: 656, height: 364 }
        });
    }

};