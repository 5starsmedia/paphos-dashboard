'use strict';

var router = require('express').Router(),
  async = require('async'),
  request = require('request');

router.post('/subscribe', function (req, res, next) {
  if (!req.body || !req.body.pingUrl) {
    var errorMsg = "Request is empty or not have pingUrl.";
    return next(errorMsg);
  }

  async.auto({
    checkRecordExist: function (next) {
      req.app.models.services.findOne({$or: [{pingUrl: req.body.pingUrl}, {name: req.body.name}]}, function (err, record) {
        if (err) {
          return next(err);
        }

        if (record) {
          return next('Service with pingUrl: "' + req.body.pingUrl + '" or name: "' + req.body.name + '" is already in DB.');
        }
        next();
      });
    },
    validate: ['checkRecordExist', function (next) {
      var validator = new req.app.models.services(req.body);

      validator.validate(next);
    }],
    record: ['validate', function (next) {
      var item = new req.app.models.services(req.body);
      item.save(function (err) {
        if (err) {
          return next(err);
        }

        next(null, item);
      });
    }],
    ping: ['record', function (next, data) {
      req.app.services.tasks.publish('services.ping', { _id: data.record._id }, next);
    }]
  }, function (err, data) {
    if (err) {
      return res.status(422).json({"summaryErrors": [{ msg: err }]});
    }

    res.json(data.record);
  });

});

module.exports = router;
