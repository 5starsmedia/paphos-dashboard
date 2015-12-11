var logger = require('paphos-core').log,
  _ = require('lodash'),
  pwd = require('pwd'),
  moment = require('moment'),
  async = require('async');

function DashboardsService(app) {
  var log = this.log = logger().child({module: 'DashboardsService'});
  this.app = app;
};

DashboardsService.prototype.init = function (next) {
  next();
};
DashboardsService.prototype.start = function (next) {
  next();
};

DashboardsService.prototype.createDashboard = function (dashboard, cb) {
  var self = this;
  async.auto({
    dashboard: [function (next, res) {
      self.log.debug('Creating dashboard for "' + dashboard.name + '"');
      var model = new self.app.models.dashboards(dashboard);
      model.save(function (err, acc) {
        if (err) {
          return next(err);
        }

        next();
        //self.app.services.tasks.publish('db.accounts.insert', { _id: acc._id }, next);
      });
    }]
  }, cb);
};

DashboardsService.prototype.getDashboardForAccount = function (account, cb) {
  var self = this;
  async.auto({
    dashboard: [function (next, res) {
      self.app.models.dashboards.findOne({'ownerAccount._id': account._id}, next)
    }]
  }, function (err, res) {
    if (err) {
      return cb(err);
    }

    cb(null, res.dashboard);
  });
};

module.exports = DashboardsService;