'use strict';

var express = require('express'),
http = require('http'),
filedb = require('diskdb'),
config = require('./config'),
routes = require('./routes'),
cors = require('cors'),
async = require('async'),
paphos = require('paphos-core'),
bodyParser = require('body-parser'),
BaseService = require('./services/base.js');

var app = {
    log: paphos.log(config),
    config: config,
    db: null
};

app.services = {
    base: new BaseService(app)
};
exports.app = app;

exports.init = function(next) {
    console.info("inited");

    var startDate = Date.now();

    async.auto({
        'connection' : next => {

            try {
                app.db = filedb.connect(config.get("filedb.path.default"));
            } catch(err) {
                next(err);
            }

            next();
        },
        'dropDB' : ['connection', (next) => {

            next();
        }]
    },
    function(err) {
        if(err) {
            return next(err);
        }

        console.log("Config succesfully loaded with env: " + config.get('env') + " in "+ parseFloat(Date.now() - startDate) +" ms");
        next();
    });
};

exports.start = function(next) {

    console.info("starting server...");

    async.auto({
        db: function(next) {
            app.services.base.start(next);
        },
        server: function(next) {
            app.server = express();

            app.server.use(bodyParser.urlencoded({ extended: false }));
            app.server.use(bodyParser.json());

            app.httpServer = http.createServer(app.server);

            var corsOptionsDelegate = function(req, callback){
              var corsOptions = {};
              corsOptions.origin = true;
              corsOptions.credentials = true;
              corsOptions.exposedHeaders = ['x-total-count'];
              callback(null, corsOptions);
            };
            app.server.use(cors(corsOptionsDelegate));

            app.server.use(function (req, res, next) {
                req.app = app;
                next();
            });
            routes.init(app);

            var port = config.get('http.port');
            app.httpServer.listen(port, next);

            console.info('Listening on port: '+port);

        }
    }, next);
};
