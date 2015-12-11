'use strict';

exports.controller = function (app, sendOpts, model, next) {
  sendOpts.subject = 'Добро пожаловать на Season-De-Luxe';
  next(null, model);
};
