export default
/*@ngInject*/
() => {
    return {
        require: '^bzForm',
        restrict: 'E',
        replace: true,
        transclude: true,
        scope: {
            'help': '@',
            'field': '@',
            'label': '@'
        },
        templateUrl: 'app/base/directives/bzFormControl.html',
        link: (scope, element, attrs, bzForm) => {
            scope.form = bzForm.getFormState();

            var getModelState = bzForm.getModelState;
            scope.fieldErrors = function (field) {
                return _.filter(getModelState().fieldErrors, {field: field});
            };
            scope.hasErrors = function (field) {
                var modelState = getModelState();
                return modelState && modelState.hasErrors && modelState.fieldErrors && modelState.fieldErrors.length > 0 &&
                    _.filter(modelState.fieldErrors, {field: field}).length > 0;
            };
        }
    };
};