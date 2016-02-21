export default
class AuthSignInCtrl {
  /*@ngInject*/
  constructor($scope, $rootScope, $state, $auth) {
    // загрузка данных, которые были сохранены при установле галочки "Запомнить меня"
    var localAuthData = angular.fromJson((localStorage || {}).authData || '{}');

    $scope.isLocked = !!localAuthData.email;
    $scope.user = {
      email: localAuthData.email || '',
      password: localAuthData.password || '',
      rememberMe: true
    };

    $scope.differentUser = function (provider) {
      (localStorage || {}).authData = '{}';
      $scope.isLocked = false;
      $scope.user = {
        email: '',
        password: '',
        rememberMe: true
      };
    };

    $scope.submitAuth = function (user) {
      $scope.error = null;

      // сохранение введеного логина и пароля в локалсторедж
      (localStorage || {}).authData = user.rememberMe ? angular.toJson(user) : '{}';

      $scope.loading = true;
      return $auth.login(user).then(function (res) {
        $rootScope.currentAuth = res.data;
        $scope.loading = false;
        $rootScope.$broadcast('authLoginSuccess');
        $state.go('dashboard.main');
      });
    }
  }
}