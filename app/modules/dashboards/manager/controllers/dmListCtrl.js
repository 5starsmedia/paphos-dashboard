export default
/*@ngInject*/
function ($scope, $interval, bServiceModel) {

  var loadData = () => {
    bServiceModel.query({} , data => {
      if ($scope.services) {
        _.each(data, item => {
          var service = _.find($scope.services, { _id: item._id });
          if (!service) {
            $scope.services.push(item);
            return;
          }
          angular.copy(item, service);
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
}