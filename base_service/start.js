'use strict';

var cp = require('child_process'),
scriptToLoad = ["./api/app.js"];

scriptToLoad.forEach(cp.fork);
