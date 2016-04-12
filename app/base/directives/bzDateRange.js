export default
/*@ngInject*/
function () {
  return {
    scope: {
      'model': '=bzDateRange'
    },
    link: function (scope, element, attributes, ngModel) {

      let ranges = {
        'Today': [moment(), moment()],
        'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
        'Last 7 Days': [moment().subtract(6, 'days'), moment()],
        'Last 30 Days': [moment().subtract(29, 'days'), moment()],
        'This Month': [moment().startOf('month'), moment().endOf('month')],
        'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
      };

      element.daterangepicker({
        "startDate": scope.model.startDate.format('MM/DD/YYYY'),
        "endDate": scope.model.endDate.format('MM/DD/YYYY'),
        ranges: ranges,
        opens: 'left',
        "drops": "up"
      }, function (start, end, label) {
        scope.$apply(() => {
          scope.model.startDate = start;
          scope.model.endDate = end;
        });
      });
    }
  };
}