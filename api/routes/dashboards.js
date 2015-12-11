'use strict';

var router = require('express').Router(),
  moment = require('moment'),
  _ = require('lodash'),
  async = require('async');

router.get('/settings', function (req, res, next) {
  async.auto({
    'dashboard': function(next) {
      req.app.models.dashboards.findOne({}, next);
    }
  }, function(err, data) {
    if (err) { return next(err); }
    res.header('Content-Type', 'application/javascript');

    var entryPointHost = req.app.config.get('url');
    var apiEntryPointHost = req.app.config.get('apiUrl');

    var varName = req.query.name || 'settings',
      settingsJs = {
        ioEntryPoint: entryPointHost + '/',
        apiEntryPoint: apiEntryPointHost,
        dashboard: data.dashboard
      };

    res.end(varName + ' = ' + JSON.stringify(settingsJs));
  });
});


module.exports = router;