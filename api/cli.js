'use strict';

var program = require('commander');
var deasync = require('deasync');
var server = require('./server');
var observatory = require('observatory');

program
  .version('0.0.1')
  .description('Paphos command line utility')
;

var addTask = deasync(function (taskName, next) {
  var log = server.app.log;
  server.init(function (err) {
    if (err) {
      return console.log(err.toString());
    }

    log.info('Connecting to tasks stomp...');
    server.app.services.tasks.start(function () {
      log.info('Connection to tasks stomp ready');

      log.info('Publish task', taskName, 'to queue');
      server.app.services.tasks.publish(taskName, {}, function () {
        log.info('Disconnecting from tasks stomp...');
        server.app.services.tasks.stop(function () {

          log.info('Disconnected from tasks stomp');
          server.stop(next);
        });
      });
    });
  });
});

var addDashboard = deasync(function (url, next) {
  var log = server.app.log;
  server.init(function (err) {
    if (err) {
      return console.log(err.toString());
    }
    var task = observatory.add('Creating dashboard...')
      .details('Url: ' + url);

    server.app.models.services.find({ removed: { $exists: false } }, function(err, services) {
      if (err) {
        return console.log(err.toString());
      }

      server.app.services.dashboards.createDashboard({
        name: url,
        baseUrl: url,
        services: services
      }, function () {
        task.done('Done!');
        server.stop(next);
      });
    });
  });
});

program
  .command('push-task <taskname>')
  .description('Push specified task to task queue')
  .action(function (taskName, opts) {
    addTask(taskName);
  });

program
  .command('add-dashboard <url>')
  .description('Add dashboard')
  .action(function (url, opts) {
    addDashboard(url);
  });

program
  .command('*')
  .action(function (commandName) {
    console.log('Invalid command', commandName);
  });

program.parse(process.argv);

if (!program.args.length) {
  program.help();
}

