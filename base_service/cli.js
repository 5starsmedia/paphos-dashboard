'use strict';

var program = require('commander'),
server = require('./api/server'),
config = require('./api/config'),
serviceUrl = "127.0.0.1:" + config.get('http.port'),
async = require('async'),
request = require('supertest').agent(serviceUrl);

var log = server.app.log;
program
    .version('0.1')
    .description('Basic service command line utility');

function ping() {
    async.auto({
        ping: pingService
    },
    function(err) {
        if(err) {
            log.error(err);
            return;
        }
    });
}

function pingService(next) {
    log.info("Ping!");

    var timeout = wait(3, next);

    request
    .get('/api')
    .expect("Content-type", /json/)
    .expect(200)
    .end(function(err, res) {
        clearTimeout(timeout);
        if(err) {
            log.error(err);
            return next(err);
        }
        log.info("Pong!");
        next();
    });
}

var wait = function(checkTime, next) {
    checkTime = checkTime || 10;
    var clock = setTimeout(function(){
        throw "Timeout";
        return next("Timeout in "+checkTime+" seconds is exceeded.");
    }, checkTime*1000);
    return clock;
}

program
    .command('ping')
    .description('Checks if current service is active')
    .action(ping);


program.parse(process.argv);

if(!program.args.length) program.help();
