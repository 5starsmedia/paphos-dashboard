'use strict';

var async = require('async'),
  fs = require('fs'),
  path = require('path'),
  _ = require('lodash'),
  account = require('../../models/account.js'),
  services = {};

exports.getInfo = function () {
  return ['0.0.1'];
};

function createAccounts(app, cb) {
  fs.readFile(path.join(__dirname, 'json', 'accounts.json'), function (err, text) {
    if (err) { return cb(err); }

    async.each(JSON.parse(text), function (account, next) {
      app.services.accounts.createAccount(account, next);
    }, cb);
  });
}

function createServices(app, cb) {
  fs.readFile(path.join(__dirname, 'json', 'services.json'), function (err, text) {
    if (err) { return cb(err); }

    async.each(JSON.parse(text), function (service, next) {
      var model = new app.models.services(service);
      model.save(function(err, item) {
        if (err) { return cb(err); }

        services[item.name] = item;
        cb();
      });
    }, cb);
  });
}

function createDashboards(app, cb) {
  app.models.accounts.findOne({ 'username': 'root' }, function(err, account) {
    if (err) { return cb(err); }

    fs.readFile(path.join(__dirname, 'json', 'dashboards.json'), function (err, text) {
      if (err) { return cb(err); }

      async.each(JSON.parse(text), function (dashboard, next) {
        dashboard.ownerAccount = account;
        dashboard.services = _.map(dashboard.services, function(name) {
          return services[name];
        });
        dashboard.baseUrl = app.config.get('url');
        console.info(dashboard.baseUrl)
        app.services.dashboards.createDashboard(dashboard, function(err, item) {
          account.dashboard = item;
          account.save(next);
        });
      }, cb);
    });
  });
}

exports.migrate = function (app, cb) {
  async.auto({
    accounts: _.partial(createAccounts, app),
    services: ['accounts', _.partial(createServices, app)],
    dashboards: ['services', _.partial(createDashboards, app)]
  }, cb);
};