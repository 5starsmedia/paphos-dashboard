'use strict';

var router = require('express').Router(),
  moment = require('moment'),
  _ = require('lodash'),
  async = require('async');

router.post('/mail', function (req, res, next) {

  req.app.services.mail.sendTemplate('simple', req.body.email, req.body, function(err) {
    if (err) { return next(err); }

    res.json({ success: true });
  });

});


module.exports = router;