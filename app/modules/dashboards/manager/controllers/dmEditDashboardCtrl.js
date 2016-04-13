export default
class dmEditDashboardCtrl {
  /*@ngInject*/
  constructor($scope, $http, $q, bServiceModel) {

    var canceler = $q.defer();
    $scope.discoverUrl = (url) => {
      $scope.loadingDiscover = true;
      $scope.failderDiscover = false;
      $scope.successDiscover = false;
      canceler.resolve();
      canceler = $q.defer();

      $http.get(url + '/paphos-discover.json', { timeout: canceler.promise }).success(data => {
        $scope.item = new bServiceModel(data);

        $scope.loadingDiscover = false;
        $scope.successDiscover = true;
      }).catch(err => {
        $scope.loadingDiscover = false;
        $scope.failderDiscover = true;
      });
    };

    $scope.saveItem = item => {
      $scope.loading = true;

      item = angular.copy(item);
      return item.$subscribe(data => {
        console.info(data);

        $scope.loading = false;
      });
    };
  }
}