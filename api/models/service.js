'use strict';

var mongoose = require('mongoose');

var schema = new mongoose.Schema({
  // for identy
  title: {type: String, required: true},
  name: {type: String, required: true},

  moduleUrl: String,
  apiUrl: String,
  active: Boolean,
  lastDiscovered: {type: Date},

  // system
  removed: {type: Date},
  createDate: {type: Date, required: true, default: Date.now},
  modifyDate: {type: Date}
}, {
  strict: true,
  safe: true,
  collection: 'services'
});

schema.index({name: 1}, {unique: true});

module.exports = mongoose.model('Service', schema);
