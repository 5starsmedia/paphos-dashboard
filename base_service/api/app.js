'use strict';

var server = require('./server');

server.init(function(err) {
    if(err) {
        console.info(err);
        process.exit(1);
        return;
    }

    server.start();
});
