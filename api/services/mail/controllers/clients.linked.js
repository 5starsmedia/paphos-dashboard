'use strict';

exports.controller = function (app, sendOpts, model, next) {
  sendOpts.subject = 'Ваш аккаунт успешно объеденен';
  next(null, model);
};