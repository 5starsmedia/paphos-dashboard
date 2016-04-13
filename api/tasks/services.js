'use strict';
var request = require('request'),
  async = require('async');

const PAPHOS_DASHBOARD_UA = 'paphos-dashboard/service-status';

exports['services.checkAll'] = function (app, message, next) {
  app.models.services.find({}, function (err, records) {
    if (err) { return next(err); }

    records.forEach(function (record) {
      app.services.tasks.publish('services.ping', { _id: record._id });
    });

    next();
  });
};

exports['services.ping'] = function (app, message, next) {
  if (!message.body || !message.body._id) { return next({ msg: 'Empty module Url: skip task.' }); }

  async.auto({
    'record': (next) => {
      app.models.services.findOne({ _id: message.body._id }, next);
    },
    'request': ['record', (next, data) => {
      var serviceUrl = data.record.moduleUrl;

      app.log.info("Check service:", serviceUrl);
      request({
        url: serviceUrl,
        headers: {
          'User-Agent': PAPHOS_DASHBOARD_UA
        },
        encoding: null,
        timeout: 10000
      }, next);
    }]
  }, (err, res) => {
    if (!res.record) { return next(err); }

    res.record.active = !err;
    res.record.save(function (err) {
      if (err) { return next(err); }

      app.log.info('Service with moduleUrl: ' + res.record.moduleUrl + ' active status: ' + res.record.active);
      next();
    });
  });

};