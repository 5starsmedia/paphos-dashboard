var cp = require('child_process');


var scripts = [
  './api/app.js',
  '../paphos-analytics/api/app.js',
//  '../paphos-forms/api/app.js'
];

for (var i = 0; i < scripts.length; i++) {
  var child = cp.fork(scripts[i]);
}

