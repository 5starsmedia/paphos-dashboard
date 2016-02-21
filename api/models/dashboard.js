'use strict';

var mongoose = require('mongoose');

var schema = new mongoose.Schema({
  name: {type: String, required: true},
  baseUrl: {type: String, required: true},

  // user, owner of dashboard
  ownerAccount: {
    _id: mongoose.Schema.Types.ObjectId,
    title: {type: String, required: true}
  },

  // connected users
  accounts: [
    {
      _id: mongoose.Schema.Types.ObjectId,
      title: {type: String, required: true},
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

schema.index({title: 1}, {unique: true});

module.exports = mongoose.model('Dashboard', schema);
