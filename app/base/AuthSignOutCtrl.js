export default
class AuthSignOutCtrl {
    /*@ngInject*/
    constructor($scope, $auth, $state) {
        $auth.logout();
        $state.go('signin');
    }
}