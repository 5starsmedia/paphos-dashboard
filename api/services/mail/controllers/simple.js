'use strict';

exports.controller = function (app, sendOpts, model, next) {
  sendOpts.subject = model.subject;
  next(null, model);
};
