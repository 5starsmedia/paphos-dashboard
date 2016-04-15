var async = require('async'),
  _ = require('lodash');

exports.init = function (app) {

 // var access = require('../middleware/access.js'),
  var resourceRoute = require('./default.js');

  app.server.get('/api', function(req, res, next){
    res.json({ success: true });
  });

  app.server.use('/api/auth/dashboard', require('./dashboardAuth.js'));
  app.server.use('/api/auth', require('./auth.js'));
  app.server.use('/api/dashboards', require('./dashboards.js'));
  app.server.use('/api/order', require('./order.js'));
  app.server.use('/api/clients', require('./clients.js'));
  app.server.use('/api/notifications', require('./notifications.js'));
  app.server.use('/api/services', require('./services.js'));

  app.server.get('/api/:resource', resourceRoute);
  app.server.get('/api/:resource/:_id', resourceRoute);

  app.server.get('/', function(req, res, next){
    var app = req.app;
    req.app = req.app.server;
    var url = req.protocol + '://' + req.get('host');// + req.originalUrl;
    console.info(url)
    async.auto({
      'dashboard': function(next) {
        app.models.dashboards.findOne({ baseUrl: url }, next);
      }
    }, function(err, data) {
      if (err) { return next(err); }
      if (!data.dashboard) {
        return res.render('notfound', {});
      }

      var entryPointHost = app.config.get('url');
      var apiEntryPointHost = app.config.get('apiUrl');
      var varName = 'settings',
        settingsJs = {
          ioEntryPoint: entryPointHost + '/',
          apiEntryPoint: apiEntryPointHost,
          dashboard: data.dashboard
        };

      data.settings = 'var ' + varName + ' = ' + JSON.stringify(settingsJs);

      data.baseService = _.find(data.dashboard.services, { 'name': 'base' });

      res.render('index', data);
    });
  });

  app.server.delete('/api/:resource/:_id', resourceRoute);
/*
  app.server.post('/api/:resource', access(), resourceRoute);
  app.server.put('/api/:resource/:_id', access(), resourceRoute);
*/
};
