export default
/*@ngInject*/
function ($scope, $interval, bServiceModel) {

  var loadData = () => {
    bServiceModel.query({} , data => {
      $scope.services = data;
    });
  };

  var timer = $interval(loadData, 2000);
  $scope.$on('$destroy', () => {
    $interval.cancel(timer);
  });

  loadData();
}