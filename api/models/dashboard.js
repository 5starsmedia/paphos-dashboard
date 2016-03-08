'use strict';

var mongoose = require('mongoose');

var schema = new mongoose.Schema({
  name: {type: String, required: true},
  baseUrl: {type: String, required: true},

  // user, owner of dashboard
  ownerAccount: {
    _id: mongoose.Schema.Types.ObjectId,
    title: String
  },

  // connected users
  accounts: [
    {
      _id: mongoose.Schema.Types.ObjectId,
      title: String
    }
  ],

  services: [{
    _id: mongoose.Schema.Types.ObjectId,
    title: String,
    name: String,
    moduleUrl: String,
    apiUrl: String
  }],

  authorizations: [
    {
      provider: String,
      authKey: String,
      authSecret: String
    }
  ],

  removed: {type: Date},
  createDate: {type: Date, required: true, default: Date.now}
}, {
  strict: true,
  safe: true,
  collection: 'dashboards'
});

schema.index({baseUrl: 1}, {unique: true});

module.exports = mongoose.model('Dashboard', schema);
