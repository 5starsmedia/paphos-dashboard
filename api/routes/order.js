'use strict';

var router = require('express').Router(),
  moment = require('moment'),
  _ = require('lodash'),
  async = require('async');

router.post('/', function (req, res, next) {

  req.app.services.mail.sendTemplate('order', 'esvit666@gmail.com', req.body);

  res.send();
});


module.exports = router;