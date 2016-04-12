'use strict';

var router = require('express').Router(),
async = require('async'),
request = require('request');

router.post('/', function (req, res, next) {


    request.post(
      {
          url: 'http://hostmachine:3002/api/subscription/subscribe',
          form: {clientUrl: req.headers.host, name: "testDashboard"}
      },
      function(err, response) {
          if(err) {
              req.app.log.error(err);
              //res.json({success: false, message:JSON.stringify(err)});
              return next(JSON.stringify(err));
          }
          console.log(response.body);

      });

    next();
});

router.post('/subscribe', function(req, res, next) {
    var log = req.app.log;

    if(!req.body || !req.body.moduleUrl) {

        console.log(req.body);
        var errorMsg = "Request is empty or not have moduleUrl.";
        log.error(errorMsg);
        return next(errorMsg);
    }

    var record;

    async.auto({
        findRecord: function(next) {
            req.app.models.services.findOne({moduleUrl: req.body.moduleUrl}, function(err, record) {
                if(err) {
                    req.app.log.error(err);
                    return next(err);
                }

                if(record) {
                    var errorMsg = "Service with moduleUrl: " + req.body.moduleUrl
                    + " is already in DB.";
                    log.error(errorMsg);
                    return next(errorMsg);
                }
                next(null, req.body);
            });
        },
        validate: ['findRecord', function(next, postData) {
            postData = postData.findRecord;
            var validator = new req.app.models.services(postData);

            validator.validate(function(err) {
                if(err) {
                    return next(err);
                }
                next(null, postData);
            });
        }],
        insertData: ['validate', function(next, result) {
            result = result.validate;

            // set active status
            result.active = true;
            var item = new req.app.models.services(result);
            item.save(function(err) {
                if(err) {
                    req.app.log.error(err);
                    return next(err);
                }

                next(null, "Service with moduleUrl: "+result.moduleUrl+" successfully added.");
            });


        }]
    },
    function(err) {
        if(err) {
            log.error(err);
            res.json({"result": 500, "message": err});
            return next(err);
        }

        res.json({"result": 200, "message": "Successfully added."});
        next();
    });

});

module.exports = router;
