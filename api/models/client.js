'use strict';

var mongoose = require('mongoose');

var schema = new mongoose.Schema({
  // for identy
  title: {type: String, required: true},

  profile: {
    email: String,
    avatarUrl: String,
    vkUrl: String,
    facebookUrl: String,
    firstName: String,
    lastName: String,
    gender:  {type: String, default: 'unknown', enum: ['unknown', 'male', 'female']},
    dateOfBirth: Date
  },
  activated: Date,
  activationToken: String,

  // for login
  username: {type: String, required: true},
  password: {
    hash: String,
    salt: String
  },
  provider: {type: String, default: 'system', enum: ['system', 'facebook', 'vk', 'twitter', 'google']},
  external: { // if not system provider
    user: String,
    token: String,
    tokenSecret: String
  },
  tokens: [
    {
      value: {type: String, required: true},
      createDate: {type: Date, required: true, default: Date.now},
      persist: { type: Boolean },
      expireAt: {type: Date, required: true},
      userAgent: {type: String, required: true, default: 'none'},
      userHost: {type: String, required: true, default: 'none'},
      userSystem: {type: String, required: true, default: 'none'}
    }
  ],

  // system
  removed: Date,
  createDate: {type: Date, required: true, default: Date.now},
  modifyDate: Date

  /*
  randomField: {type: Number, required: true, default: Math.random},
  activityDate: Date,
  loginDate: Date,
  extUser: String,
  extToken: String,
  extTokenSecret: String,
  imageUrl: String,
  pwd: String,
  salt: String,
  activated: {type: Boolean, required: true, default: false},
  activationDate: Date,
  activationToken: String,
  passwordResetToken: String,
  passwordResetDate: Date,
  totalContributionPoints: {type: Number, required: true, default: 0},
  commentsCount: {type: Number, required: true, default: 0},
  likesCount: {type: Number, required: true, default: 0},
  viewsCount: {type: Number, required: true, default: 0},
  messagesCount: {type: Number, required: true, default: 0},
  newMessagesCount: {type: Number, required: true, default: 0},
  followersCount: {type: Number, required: true, default: 0},
  followingCount: {type: Number, required: true, default: 0},
  friendsCount: {type: Number, required: true, default: 0},
  friendRequestsCount: {type: Number, required: true, default: 0},
  popupNotificationsCount: {type: Number, required: true, default: 0},
  popupNotificationsVersion: {type: Number, required: true, default: 0},
  listNotificationsCount: {type: Number, required: true, default: 0},
  listNotificationsVersion: {type: Number, required: true, default: 0},

  profileStrength: {type: Number, required: true, default: 0},
  profile: {
    facebookUrl: String,
    vkUrl: String,
    dateOfBirth: Date,
    age: Number,
    gender:  {type: String, default: 'unknown', enum: ['unknown', 'male', 'female']},
    city: String,
    phone: String,
    firstName: String,
    middleName: String,
    lastName: String,
    about: String,
    interests: String,
    location: String
  },*/
}, {
  strict: true,
  safe: true,
  collection: 'clients'
});

schema.index({username: 1}, {unique: true});
schema.index({'tokens.value': 1});

module.exports = mongoose.model('Client', schema);
