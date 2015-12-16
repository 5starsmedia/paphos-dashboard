'use strict';

var router = require('express').Router(),
  moment = require('moment'),
  _ = require('lodash'),
  async = require('async');

router.post('/', function (req, res, next) {

  console.info(req.body)

});


module.exports = router;