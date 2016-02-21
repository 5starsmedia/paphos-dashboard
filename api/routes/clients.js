'use strict';

var router = require('express').Router(),
  moment = require('moment'),
  _ = require('lodash'),
  async = require('async');

router.post('/', function (req, res, next) {
  var userIds = _.pick(req.body, ['email', 'phone']),
    username = req.body.username || req.body.email || req.body.phone;

  userIds.username = username;

  async.auto({
    'client': function(next) {
      req.app.models.clients.findOne({
        $or: _.map(userIds, function (value, key) {
          var o = {};
          if (key != 'username') {
            key = 'profile.' + key;
          }
          o[key] = value;
          return o;
        })
      }, next);
    },
    'saveClient': ['client', function(next, data) {
      console.info(data.client)
      if (data.client) {
        return next();
      }
      var client = new req.app.models.clients({
        title: username,
        username: username,
        isAutoTitle: true,
        profile: {
          email: req.body.email,
          phone: req.body.phone
        },
        sourceType: req.body.sourceType,
        refs: req.body.refs
      });
      client.save(function(err, item) {
        if (err) { return next(err); }

        next(null, item);
      });
    }]
  }, function(err, data) {
    if (err) { return next(err); }
    res.json({});
  });
});


module.exports = router;