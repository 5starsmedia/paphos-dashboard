export default
class ClientsListCtrl {
    /*@ngInject*/
    constructor($scope, $http) {


        $scope.getUsers = () => {
            $http.get(settings.apiEntryPoint + '/clients').then((res) => {
                $scope.clients = res.data;
            });
        };
        $scope.getUsers();

    }
}