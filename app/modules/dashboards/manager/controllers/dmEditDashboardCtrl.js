export default
class dmEditDashboardCtrl {
  /*@ngInject*/
  constructor($scope, $http, $q) {

    var canceler = $q.defer();
    $scope.discoverUrl = (url) => {
      $scope.loadingDiscover = true;
      $scope.failderDiscover = false;
      canceler.resolve();
      canceler = $q.defer();

      $http.get(url + '/discover', { timeout: canceler.promise }).success(data => {
        console.info(data);
        $scope.loadingDiscover = false;
        $scope.successDiscover = true;
      }).catch(err => {
        $scope.loadingDiscover = false;
        $scope.failderDiscover = true;
      });
    };

  }
}