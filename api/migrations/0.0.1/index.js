'use strict';

var async = require('async'),
  fs = require('fs'),
  path = require('path'),
  _ = require('lodash'),
  account = require('../../models/account.js');

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

function createDashboards(app, cb) {
  app.models.accounts.findOne({ 'username': 'root' }, function(err, account) {
    if (err) { return cb(err); }

    fs.readFile(path.join(__dirname, 'json', 'dashboards.json'), function (err, text) {
      if (err) { return cb(err); }

      async.each(JSON.parse(text), function (dashboard, next) {
        dashboard.ownerAccount = account;
        app.services.dashboards.createDashboard(dashboard, next);
      }, cb);
    });
  });
}

exports.migrate = function (app, cb) {
  async.auto({
    accounts: _.partial(createAccounts, app),
    dashboards: ['accounts', _.partial(createDashboards, app)]
  }, cb);
};