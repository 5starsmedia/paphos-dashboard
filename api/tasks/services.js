'use strict';
exports['services.checkAll'] = function(app, message, next) {

    app.models.services.find({}, function(err, records) {
        if(err) {
            app.log.error(err);
            return next(err);
        }

        if(records && records.length) {
            records.forEach(function(record) {
                app.services.tasks.publish('services.ping', {
                  moduleUrl: record.moduleUrl
                });
            });
        }

        next();

    });
}

exports['services.ping'] = function(app, message, next) {
    if(!message.body && !message.body.moduleUrl) {
        var errMsg = "Empty module Url: skip task.";
        app.log.error(err);
        return next(err);
    }

    var serviceUrl = message.body.moduleUrl;
    var log  = app.log;
    if(!serviceUrl) {
        var errMsg = "Provide module url please!";
        log.error(errMsg);
        return next(errMsg);
    }

    var request = require('supertest').agent(serviceUrl),
    timer = new Promise(function(resolve, reject) {
        wait(10, resolve, reject);
    }),
    pinger = new Promise(ping);

    Promise
    .race([pinger, timer])
    .then(function(status) {
        updateRecord(serviceUrl, true, next);
        log.info(status);
    })
    .catch(function(err) {
        updateRecord(serviceUrl, false, next);
        log.error(err);
    })


    function ping(next, reject) {
        log.info("Ping!");
        request
        .get('/api')
        .expect("Content-type", /json/)
        .expect(200)
        .end(function(err, res) {
            if(err) {
                return reject(err);
            }
            next("Pong!");
        });
    }

    function wait(checkTime, next, reject) {
        checkTime = checkTime || 10;
        var clock = setTimeout(function(){
            reject("Timeout in "+checkTime+" seconds is exceeded.");
        }, checkTime*1000);
        return clock;
    }

    function updateRecord(url, status, next) {
        app.models.services.findOne({moduleUrl: ''+url}, function(err, record) {
            if(err) {
                app.log.error(err);
                return next(err);
            }

            record.active = status;
            var item = new app.models.services(record);
            item.save(function(err) {
                if(err) {
                    app.log.error(err);
                    return next(err);
                }

                app.log.info("Service with moduleUrl: "+url+" active status: " + status);
                next();
            });
        });

    }


}
