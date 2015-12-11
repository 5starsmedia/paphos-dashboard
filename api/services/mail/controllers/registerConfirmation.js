'use strict';

exports.controller = function (app, sendOpts, model, next) {
  var tokenArr = [];
  for (var i = 0; i < model.activationToken.length; i += 1) {
    tokenArr.push(model.activationToken[i]);
  }
  model.brokenToken = tokenArr.join('&#8203;');
  model.activateLink = app.config.get('config.apiUrl') + '/auth/activate/' + model.activationToken;
  model.activateBrokenLink = app.config.get('config.apiUrl') + '/auth/activate/' + model.brokenToken;
  sendOpts.subject = 'Регистрация аккаунта';
  next(null, model);
};
