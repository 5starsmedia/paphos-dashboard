function getFieldInfo(model, path) {
    return path.length === 1 ? model[path[0]] : getFieldInfo(model[path[0]], path.slice(1));
}

export default
/*@ngInject*/
($compile) => {
    return {
        restrict: 'E',
        replace: false,
        transclude: true,
        scope: {
            'onLeaveWarning': '=',
            'modelState': '=',
            'model': '=',
            'submit': '&'
        },
        templateUrl: 'app/base/directives/bzForm.html',
        controller: function ($scope) {
            $scope.formSubmit = () => {
                var promise = $scope.submit();
                promise.catch(res => {
                    console.info(res.status)
                    if (res.status == 422) {
                        $scope.modelState = res.data;
                    }
                });
            };

            this.splitField = function (field) {
                var res = {};
                var lastDot = field.lastIndexOf('.');
                if (lastDot !== -1) {
                    res.fieldPrefix = field.substr(0, lastDot);
                    res.fieldName = field.substr(lastDot + 1);
                } else {
                    res.fieldPrefix = '';
                    res.fieldName = field;
                }
                return res;
            };
            this.getFormState = function () {
                return $scope.bzFormName;
            };
            this.getModelState = function () {
                return $scope.modelState;
            };
            this.getModel = function (field) {
                if (field.length === 0) {
                    return $scope.model;
                } else {
                    var spl = field.split('.');

                    return getFieldInfo($scope.model, spl.length > 0 ? spl : [field]);
                }
            };
            function routeChange(event, newUrl) {
                if (!$scope.onLeaveWarning) {
                    return;
                }
                /*interactionSvc.confirmAlert('Confirmation', 'You have not saved changes will be lost, do you really want?',
                    function () {
                        onRouteChangeOff();
                        newUrl = newUrl.substring(newUrl.replace('//', '').indexOf('/') + 2);
                        $location.path(newUrl);
                    });*/
                alert('Confirmation');
                event.preventDefault();
            }

            var onRouteChangeOff = $scope.$on('$locationChangeStart', routeChange);

        }
    };
};