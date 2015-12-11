'use strict';

var router = require('express').Router(),
  moment = require('moment'),
  _ = require('lodash'),
  async = require('async');

function assignToken(req, account, cb) {
  req.app.services.accounts.assignToken(account, req.body.persist, cb);
}

function loginResponse(req, res, token, account, next) {
  req.app.services.dashboards.getDashboardForAccount(account, function (err, dashboard) {
    if (err) { return next(err); }
    var response = {
      token: token,
      account: {
        _id: account._id,
        title: account.title,
        username: account.username,
        coverFile: account.coverFile,
        imageUrl: account.imageUrl,
        roles: account.roles
      }
    };
    if (dashboard) {
      response.dashboard = dashboard;
    }

    res.status(200).json(response);
  });
}

function auth(req, res, account, next) {
  req.app.services.accounts.checkPassword(req.body.password, account, function(err, valid) {
    if (err) { return next(err); }

    if (valid) {
      assignToken(req, account, function (err, token) {
        if (err) { return next(err); }

        req.account = account;
        //req.log = req.log.child({account: _.pick(account, ['_id', 'username'])});
        //req.log.info('Token generated');

        //req.logRecord('login', 'Successfully login by username and password', req.app.log_level.info, account, function (err) {
        /*  if (err) {
            return next(err);
          }*/
          loginResponse(req, res, token, account, next);
        //});
      });
    } else {
      //req.logRecord('login', 'Incorrect email or password', 3, account, function (err) {
      //  if (err) { return next(err); }

        res.status(422).json({
          hasErrors: true, summaryErrors: [
            {msg: 'Incorrect email or password.'}
          ]
        });
      //});
    }
  });
}

router.post('/login', function (req, res, next) {
  req.body.username = req.body.username || req.body.email;
  if (!req.body.username) {
    res.status(422).json({
      hasErrors: true, fieldErrors: [
        {field: 'username', msg: 'username or email is required'}
      ]
    });
  }
  else if (!req.body.password) {
    res.status(422).json({
      hasErrors: true, fieldErrors: [
        {field: 'password', msg: 'password is required'}
      ]
    });
  } else {
    req.app.models.accounts.findOne({
      $or: [
        { username: req.body.username },
        { email: req.body.username }
      ]
    }, function (err, account) {
      if (err) {
        return next(err);
      }
      if (!account) {
        return res.status(422).json({
          hasErrors: true, summaryErrors: [
            {msg: 'Incorrect username/email or password'}
          ]
        });
      }
      if (account.removed) {
        return res.status(422).json({
          hasErrors: true, summaryErrors: [
            {msg: 'Account is locked'}
          ]
        });
      }
      if (!account.activated) {
        return res.status(422).json({
          hasErrors: true, summaryErrors: [
            {msg: 'Account is not activated, check your email'}
          ]
        });
      }
      auth(req, res, account, next);
    });
  }
});

module.exports = router;