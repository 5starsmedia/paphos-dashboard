export default
/*@ngInject*/
function bServiceModel($resource, BASE_API) {
  var resource = $resource(BASE_API + '/services/:_id/:method', {
    '_id': '@_id'
  }, {
    'get': {method: 'GET'},
    'save': {method: 'PUT'},
    'subscribe': { method: 'POST', params: { method: 'subscribe' } },
    'update': {method: 'PATCH'}
  });

  return resource;
}
