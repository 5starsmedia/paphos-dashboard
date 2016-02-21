export default
/*@ngInject*/
($rootScope, $auth, $http) => {
    return {
        restrict: 'A',
        replace: false,
        scope: {
            'user': '=bzCurrentUser'
        },
        controller: /*@ngInject*/ function ($scope, BASE_API) {
          if ($rootScope.currentAuth) {
            var user = angular.copy($rootScope.currentAuth.account);
            user.dashboard = $rootScope.currentAuth.dashboard;
            $scope.user = user;
          } else {
            var payload = $auth.getPayload();
            $http.get(BASE_API + '/auth').success(function(data) {
              $rootScope.currentAuth = data;
              var user = angular.copy($rootScope.currentAuth.account);
              user.dashboard = $rootScope.currentAuth.dashboard;
              $scope.user = user;
            })
          }
        }
    };
};