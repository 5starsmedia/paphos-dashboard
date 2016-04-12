'use strict';

var router = require('express').Router(),
async = require('async');

router.post('/subscribe', (req, resp, next) => {
    async.auto({
        call: next => {
            req.app.services.base.Call(req.body, next);
        }
    },
    function(err) {
        if(err) {
            response(req, resp, err, 500, next);
            return next(err);
        }
        response(req, resp, "Your request was successfull. Wait for response please.", 200, next);
    });
});

router.get('/ping', (req, resp, next) => {
    async.auto({
        call: next => {
            if(!req.query || !req.query.clientUrl) return next("You must provide clientUrl param!");
            req.app.services.base.Ping(req.query.clientUrl, next);
        }
    }, function(err, result) {
        if(err) {
            response(req, resp, err, 500, next);
            return next(err);
        }
        response(req, resp, result.call, 200, next);
    });
});

function response(req, resp, message, code, next) {
    var responseRes = {
        message: message,
        code: code
    };

    resp.status(code).json(responseRes);
}

module.exports = router;
