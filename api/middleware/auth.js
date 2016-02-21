'use strict';
var config = require('../config.js'),
  moment = require('moment'),
  async = require('async'),
  jwt = require('jsonwebtoken'),
  _ = require('lodash');

function authAsAccount(account, dashboard, req, res, next) {
  req.auth = {
    account: account,
    dashboard: dashboard
    //role: role,
    //permissions: _.pluck(role.permissions, 'name')
  };
  next();
}

function authAsGuest(req, res, next) {
  req.auth = {
    isGuest: true,
    roles: []
  };
  next();
}

module.exports = function () {
  return function (req, res, next) {
    req.auth = req.auth || {};

    if (!req.headers.authorization || req.headers.authorization.length == 0) {
      authAsGuest(req, res, next);
      return;
    }

    var token = req.headers.authorization.split(' ')[1];
    if (!token || !token.length) {
      return authAsGuest(req, res, next);
    }

    var payload = jwt.decode(token, config.get('auth.tokenSecret'));
    if (!payload || payload.exp <= moment().unix()) {
      return authAsGuest(req, res, next);
    }

    async.auto({
      'account': function(next) {
        req.app.models.accounts.findOne({ '_id': payload.id, removed: { $exists: false } }, next);
      },
      'dashboard': ['account', function(next, data) {
        if (!data.account) {
          return next();
        }
        req.app.models.dashboards.findOne({ '_id': data.account.dashboard._id, removed: { $exists: false } }, next);
      }]
    }, function(err, data) {
      if (err) { req.log.error(err); }

      if (!data.account || !data.dashboard) {
        return authAsGuest(req, res, next);
      }
      authAsAccount(data.account.toObject(), data.dashboard.toObject(), req, res, next);

      if (!data.account.activityDate || Date.now() - data.account.activityDate.getTime() > 30000) {
        //req.log.debug('Updating activity date ', account.username);

        req.app.models.accounts.update({ '_id': data.account._id }, { $set: { activityDate: Date.now() } }, function (err) {
          if (err) { req.log.error(err); }
        });
      }
    });
  };
};
