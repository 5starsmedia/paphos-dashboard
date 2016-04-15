export default
/*@ngInject*/
function ($scope, $interval, bServiceModel) {

  var loadData = () => {
    bServiceModel.query({} , data => {
      if ($scope.services) {
        _.each($scope.services, item => {
          var service = _.find(data, { _id: item._id });
          if (!service) {
            $scope.services = _.reject($scope.services, service => service._id == item._id);
            return;
          }
          data = _.reject(data, item => service._id == item._id);
          angular.copy(service, item);
        });
        _.each(data, item => {
          $scope.services.push(item);
        });
        return; 
      }
      $scope.services = data;
    });
  };

  var timer = $interval(loadData, 2000);
  $scope.$on('$destroy', () => {
    $interval.cancel(timer);
  });

  loadData();

  $scope.deleteItem = (item) => {
    $scope.loading = true;
    item.$delete(() => {
      $scope.services = _.reject($scope.services, service => service._id == item._id);
      $scope.loading = false;
    })
  }
}