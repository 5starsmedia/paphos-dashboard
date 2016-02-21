var cp = require('child_process');


var scripts = [
  './api/app.js',
  'C:/Users/esvit/PhpstormProjects/paphos-forms/api/app.js'
];

for (var i = 0; i < scripts.length; i++) {
  var child = cp.fork(scripts[i]);
}

