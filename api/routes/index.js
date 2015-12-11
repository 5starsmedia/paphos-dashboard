exports.init = function (app) {

 // var access = require('../middleware/access.js'),
  var resourceRoute = require('./default.js');

  app.server.get('/api', function(req, res, next){
    res.json({ success: true });
  });

  app.server.use('/api/auth/dashboard', require('./dashboardAuth.js'));
  app.server.use('/api/auth', require('./auth.js'));
  app.server.use('/api/dashboards', require('./dashboards.js'));


  app.server.get('/api/:resource', resourceRoute);
  app.server.get('/api/:resource/:_id', resourceRoute);

/*
  app.server.post('/api/:resource', access(), resourceRoute);
  app.server.put('/api/:resource/:_id', access(), resourceRoute);
  app.server.delete('/api/:resource/:_id', access(), resourceRoute);
*/
};