export default
/*@ngInject*/
function ($scope, $state, item, $http, $q, bServiceModel) {

  $scope.item = item;

  $scope.successDiscover = !!item._id; // already discover if edit

  var canceler = $q.defer();
  $scope.discoverUrl = (url) => {
    $scope.loadingDiscover = true;
    $scope.failderDiscover = false;
    $scope.successDiscover = false;
    canceler.resolve();
    canceler = $q.defer();

    $http.get(url + '/paphos-discover.json', {timeout: canceler.promise}).success(data => {
      $scope.item = new bServiceModel(data);
      $scope.item.url = url;

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

    if (item._id) {
      return item.$save(data => {
        console.info(data);

        $scope.loading = false;
      });
    }

    return item.$subscribe(data => {
      console.info(data);

      $scope.loading = false;
    });
  };

  $scope.deleteItem = (item) => {
    $scope.loading = true;
    item.$delete(() => {
      $scope.$close();
    })
  }
}