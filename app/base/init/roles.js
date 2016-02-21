export default
/*@ngInject*/
(Permission, $auth) => {
    // Define anonymous role
    Permission.defineRole('anonymous', (stateParams) => {
        return !$auth.isAuthenticated();
    });
    // Dashboard Owner
    Permission.defineRole('dashboardOwner', (stateParams) => {
        console.info(stateParams, $auth.getPayload());
        return $auth.isAuthenticated();
    });
};