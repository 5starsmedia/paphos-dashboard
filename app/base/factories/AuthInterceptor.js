export default
  /*@ngInject*/
  function AuthInterceptor($q, $injector) {
    return {
      'request': function (config) {
        return config;
      },
      'requestError': function (rejection) {
        return $q.reject(rejection);
      },
      'response': function (response) {
        return response;
      },
      'responseError': function (rejection) {
        if (rejection.status === 401) {
          let $state = $injector.get('$state');
          $state.go('signout');
        }
        return $q.reject(rejection);
      }
    };
  }