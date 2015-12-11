'use strict';

var async = require('async'),
  _ = require('lodash'),
  moment = require('moment');

exports['db.accounts.insert'] = function (app, msg, cb) {
  app.log.info('db.accounts.insert', msg);
  cb();
};