'use strict';

exports.controller = function (app, sendOpts, model, next) {
  sendOpts.subject = 'Заказ с сайта Season-de-Luxe';
  next(null, model);
};
