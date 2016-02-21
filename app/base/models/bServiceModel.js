export default
/*@ngInject*/
function bServiceModel($resource, BASE_API) {
  var resource = $resource(BASE_API + '/forms/:_id/:method', {
    '_id': '@_id'
  }, {
    'get': {method: 'GET'},
    'save': {method: 'PUT'},
    'create': {method: 'POST'},
    'update': {method: 'PATCH'}
  });

  return resource;
}
