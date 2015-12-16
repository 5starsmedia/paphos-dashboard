'use strict';

var async = require('async'),
  _ = require('lodash'),
  moment = require('moment');

exports['db.clients.insert'] = function (app, msg, cb) {
  async.auto({
    'account': function(next) {
      app.models.clients.findById(msg.body._id, next);
    },
    'confirmation': ['account', function(next, res) {
      if (!res.account.activationToken) {
        return next();
      }
      app.services.mail.sendTemplate('registerConfirmation', res.account.profile.email, {
        userName: res.account.title,
        activationToken: res.account.activationToken
      });
    }]
  }, function(err, data) {
    cb(err);
  });
};

exports['db.clients.linked'] = function (app, msg, cb) {
  async.auto({
    'account': function(next) {
      app.models.clients.findById(msg.body._id, next);
    },
    'confirmation': ['account', function(next, res) {
      if (!res.account.activationToken) {
        return next();
      }
      app.services.mail.sendTemplate('clients.linked', res.account.profile.email, {
        userName: res.account.title
      });
    }]
  }, function(err, data) {
    cb(err);
  });
};

exports['db.clients.activate'] = function (app, msg, cb) {
  async.auto({
    'account': function(next) {
      app.models.clients.findById(msg.body._id, next);
    },
    'confirmation': ['account', function(next, res) {
      if (!res.account.activationToken) {
        return next();
      }
      app.services.mail.sendTemplate('activated', res.account.profile.email, {
        userName: res.account.title
      });
    }]
  }, function(err, data) {
    cb(err);
  });
};