'use strict';

var async = require('async'),
  _ = require('lodash'),
  mongoose = require('mongoose');

function getFilter(req, next) {
  var params = req.query;
  delete params.sort;

  var filter = {
    $and: [_.mapValues(params, function (val) {
      if (_.isArray(val)) {
        return {$in: val};
      } else if (val === 'null') {
        return null;
      } else {
        return val;
      }
    })]
  };
  filter.$and.push({removed: {$exists: false}});
  var search = req.query['search'];
  if (search && req.resource && req.resource.options && req.resource.options.searchFields) {
    filter.$and.push({
      $or: _.map(req.resource.options.searchFields, function (field) {
        var o = {};
        o[field] = {$regex: search, $options: 'i'};
        return o;
      })
    });
  }
  return filter;
}

function getDataOptions(req) {
  var opts = {};

  if (req.query['perPage']) {
    opts.skip = req.query['page'] ? (req.query['page'] - 1) * req.query['perPage'] : 0;
    opts.limit = req.query['perPage'];
  }

  // Parse request sorting parameters
  var sort = req.query['sort'];
  if (sort) {
    var sortArr = _.without(_.isArray(sort) ? sort : sort.replace(/ /g, '').split(','), '');
    if (sortArr.length > 0) {
      opts.sort = {};
      _.each(sortArr, function (field) {
        var direction = 1;
        if (field.indexOf('-') === 0) {
          direction = -1;
          field = field.substring(1);
        }
        opts.sort[field] = direction;
      });
    }
  }
  return opts;
}

function processGet(model, req, res, next) {
  if (req.params._id) {
    req.query._id = req.params._id;
  }

  var filter = getFilter(req),
    options = getDataOptions(req);

  if (req.params._id || req.query.alias) {

    model.findOne(filter, function (err, data) {
      if (err) {
        if (err.name === 'CastError') {
          return next(req.app.errors.NotFoundError('Resource "' + req.params.resource + ' ' + parameter + '" not found.'));
        } else {
          return next(err);
        }
      }
      if (data) {
        if (model.schema.paths.viewsCount) {
          model.update(parameter, {$inc: {viewsCount: 1}}, function (err) {
            if (err) {
              return req.log.error(err);
            }
          });
        }
        return res.json(data);
      } else {
        return next(req.app.errors.NotFoundError('Resource "' + req.params.resource + ' ' + parameter + '" not found.'));
      }
    });
  } else {
    async.auto({
      count: function (next, result) {
        if (req.query.flags && req.query.flags.indexOf('no-total-count') !== -1) {
          return next(null, -1);
        }
        model.count(filter, next);
      },
      items: function (next, result) {
        model.find(filter, {}, options, next);
      }
    }, function (err, data) {
      if (err) {
        return next(err);
      }

      if (data.count !== -1) {
        res.set('x-total-count', data.count);
      }
      return res.json(data.items);
    });
  }
}

function processDelete(model, req, res, next) {

  async.auto({
    'record': function (next) {
      model.findById(req.params._id, next);
    },
    'delete': ['record', function (next, data) {
      if (!data.record) {
        return next(req.app.errors.NotFoundError('Resource "' + req.params.resource + ' ' + req.params._id + '" not found.'));
      }

      if (model.schema.paths.removed) {
        return data.record.update({'removed': Date.now()}, next);
      }
      data.record.remove(next)
    }],
    'notice': ['delete', function (next) {
      req.app.services.tasks.publish('db.' + req.params.resource + '.delete', {_id: req.params._id}, next);
    }]
  }, function (err, data) {
    if (err) {
      return next(err);
    }
    res.status(204).end();
  });
}

module.exports = function processRequest(req, res, next) {
  var resourceName = req.params.resource,
    model = req.app.models[resourceName];
  if (!model) {
    return next(req.app.errors.NotFoundError('Resource "' + resourceName + '" not found.'));
  }

  var method = req.method.toLowerCase();
  switch (method) {
    case 'get':
      processGet(model, req, res, next);
      break;
    case 'delete':
      processDelete(model, req, res, next);
      break;
    default:
      next();
  }
};
