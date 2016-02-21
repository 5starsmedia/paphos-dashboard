'use strict';

var mongoose = require('mongoose');

var schema = new mongoose.Schema({
  // for identy
  title: {type: String, required: true},

  profile: {
    email: {type: String},
    gender:  {type: String, default: 'unknown', enum: ['unknown', 'male', 'female']},
    dateOfBirth: {type: Date}
  },
  dashboard: {
    _id: mongoose.Schema.Types.ObjectId,
    name: String
  },

  activated: {type: Date},

  // for login
  username: {type: String, required: true},
  password: {
    hash: {type: String},
    salt: {type: String}
  },
  accountType: {type: String, default: 'system', enum: ['system', 'facebook', 'twitter', 'google']},
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
  removed: {type: Date},
  createDate: {type: Date, required: true, default: Date.now},
  modifyDate: {type: Date}

  /*
  randomField: {type: Number, required: true, default: Math.random},
  activityDate: {type: Date},
  loginDate: {type: Date},
  extUser: String,
  extToken: String,
  extTokenSecret: String,
  imageUrl: String,
  pwd: {type: String},
  salt: {type: String},
  activated: {type: Boolean, required: true, default: false},
  activationDate: Date,
  activationToken: {type: String},
  passwordResetToken: {type: String},
  passwordResetDate: {type: Date},
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
    facebookUrl: {type: String},
    vkUrl: {type: String},
    dateOfBirth: {type: Date},
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
  collection: 'accounts'
});

schema.index({username: 1}, {unique: true});
schema.index({'tokens.value': 1});

module.exports = mongoose.model('Account', schema);
