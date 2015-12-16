var logger = require('paphos-core').log,
  _ = require('lodash'),
  pwd = require('pwd'),
  moment = require('moment'),
  jwt = require('jsonwebtoken'),
  async = require('async');

function AccountsService(app) {
  var log = this.log = logger().child({module: 'AccountsService'});
  this.app = app;
};

AccountsService.prototype.init = function (next) {
  next();
};

AccountsService.prototype.start = function (next) {
  next();
};

AccountsService.prototype.cryptPassword = function(password, next) {
  pwd.hash(password, function (err, salt, hash) {
    if (err) { return next(err); }

    return next(null, { hash: hash, salt: salt });
  });
};

AccountsService.prototype.checkPassword = function(password, account, next) {
  pwd.hash(password, account.password.salt, function (err, hash) {
    if (err) { return next(err); }

    return next(null, account.password.hash == hash);
  });
};

AccountsService.prototype.createAccount = function(account, cb) {
  var self = this;
  async.auto({
    password: function (next) {
      self.cryptPassword(account.password, next);
    },
    account: ['password', function (next, res) {
      account.password = res.password;
      account.profile = account.profile || {};
      if (account.profile.dateOfBirth) {
        account.profile.dateOfBirth = moment.utc(account.profile.dateOfBirth, 'DD.MM.YYYY');
      }
      account.activated = moment().toDate();

      if (process.env.NODE_ENV === 'test') {
        account.tokens = [
          {value: 'testToken-' + account.username, persist: true, expireAt: Date.now() + 10 * 60000}
        ];
      }
      self.log.debug('Creating account for "' + account.username + '"');
      var model = new self.app.models.accounts(account);
      model.save(function (err, acc) {
        if (err) { return next(err); }

        next();
        //self.app.services.tasks.publish('db.accounts.insert', { _id: acc._id }, next);
      });
    }]
  }, cb);
};

AccountsService.prototype.generateTokenValue = function(account, cb) {
  var tokenSecret = this.app.config.get('auth.tokenSecret'),
    params = account ? { id: account._id } : {};

  var token = jwt.sign(params, tokenSecret, {
    expiresIn: this.app.config.get('auth.persistTokenDuration')
  });

  cb(null, token);
};

AccountsService.prototype.assignToken = function(account, persist, cb) {
  var self = this;
  async.auto({
    'token': function(next) {
      self.generateTokenValue(account, next);
    },
    'saveToAccount': ['token', function(next, res) {
      var expireAt = Date.now();
      expireAt += persist ? self.app.config.get('auth.persistTokenDuration') : self.app.config.get('auth.tokenDuration');

      account.loginDate = Date.now();
      account.tokens.push({
        value: res.token,
        persist: persist,
        expireAt: expireAt
      });
      account.save(next);
    }]
  }, function(err, res) {
    if (err) { return cb(err); }

    cb(null, res.token);
  });
};

AccountsService.prototype.mergeAccountInfo = function(account, info, cb) {
  // set title
  if ((!account.title || account.isAutoTitle) && info.title) {
    account.title = info.title;
    account.isAutoTitle = false;
  }

  //save external
  if (info.external && info.external.length) {
    var external = info.external[0];

    account.external = account.external || [];
    account.external = _.reject(account.external, { provider: external.provider });
    account.external.push(external);
  }

  if (!account.profile.gender || account.profile.gender == 'unknown' && info.profile.gender) {
    account.profile.gender = info.profile.gender;
  }
  var accountUpdateFields = _.difference(_.keys(info), ['title', 'profile', 'external'] /* <- not updated fields */);
  _.each(accountUpdateFields, function(fieldName) {
    account[fieldName] = account[fieldName] || info[fieldName];
  });

  var profileUpdateFields = _.difference(_.keys(info.profile), ['gender'] /* <- not updated fields */);
  _.each(profileUpdateFields, function(fieldName) {
    account.profile[fieldName] = account.profile[fieldName] || info.profile[fieldName];
  });
  return account;
};

module.exports = AccountsService;