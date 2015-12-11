'use strict';

var router = require('express').Router(),
  moment = require('moment'),
  _ = require('lodash'),
  request = require('request'),
  querystring = require('querystring'),
  async = require('async');

var isEmailRegex = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;


router.post('/signup', function (req, res, next) {
  async.auto({
    /*deniedEmailDomains: function (next) {
      req.app.services.data.getResource('deniedEmailDomains', next);
    },*/
    validateData: [/*'deniedEmailDomains',*/ function (next, data) {
      data.deniedEmailDomains = ["my10minutemail.com", "trbvm.com", "kiois.com"];
      var errors = [];
      if (!req.body.username) {
        errors.push({field: 'username', msg: 'Email is required'});
      } else if (!isEmailRegex.test(req.body.username)) {
        errors.push({field: 'username', msg: 'Must be a valid email'});
      } else if (req.body.username.length > 50) {
        errors.push({field: 'username', msg: 'Maximum length is 50 characters'});
      } else {
        var atIndex = req.body.username.indexOf('@');
        if (atIndex !== -1 && data.deniedEmailDomains.indexOf(req.body.username.substr(atIndex + 1)) !== -1) {
          errors.push({field: 'username', msg: 'Domain name is restricted'});
        }
      }

      if (!req.body.password) {
        errors.push({field: 'password', msg: 'Password is required'});
      } else if (req.body.password.length < 6) {
        errors.push({field: 'password', msg: 'Password must be at least 6 characters length'});
      } else if (req.body.password.length > 50) {
        errors.push({field: 'password', msg: 'Maximum length is 50 characters'});
      }

      if (errors.length > 0) {
        res.status(422).json({
          hasErrors: true, fieldErrors: errors
        });
      } else {
        //req.body.dateOfBirth = new Date(req.body.birthYear, req.body.birthMonth, req.body.birthDay, 12);
        next();
      }
    }],
    validateEmailExists: ['validateData', function (next) {
      req.app.models.clients.findOne({username: req.body.username}, function (err, account) {
        if (err) {
          return next(err);
        }
        if (account) {
          //auth(req, res, account, next);
          res.status(422).json({
            hasErrors: true, fieldErrors: [
              {field: 'email', msg: 'email already registered'}
            ]
          });
        } else {
          next();
        }
      });
    }],
    cryptPassword: function (next) {
      req.app.services.accounts.cryptPassword(req.body.password, next);
    },
    activationToken: function (next) {
      req.app.services.accounts.generateTokenValue({ _id: req.body.username }, next);
    },
    'account': ['validateEmailExists', 'cryptPassword', 'activationToken', function (next, res) {
      var account = new req.app.models.clients();
      account.activationToken = res.activationToken;
      account.profile = {
        email: req.body.username
      };
      account.username = req.body.username;
      account.title = req.body.username.substr(0, req.body.username.indexOf('@'));
      account.password = res.cryptPassword;

      account.save(function (err, acc) {
        if (err) { return next(err); }

        req.app.services.tasks.publish('db.clients.insert', { _id: acc._id });

        next(null, acc);
      });
    }]
  }, function(err, data) {
    if (err) { return next(err); }

    var account = data.account;

    assignToken(req, account, function (err, token) {
      if (err) { return next(err); }

      loginResponse(req, res, token, account, next);
    });
  });
});

router.get('/activate/:activationToken', function (req, res, next) {
  async.auto({
    'account': function(next) {
      req.app.models.clients.findOne({activationToken: req.params.activationToken}, next);
    },
    'activate': ['account', function(next, res) {
      if (!res.account || res.account.activated) { return next(); }

      res.account.activated = Date.now();
      res.account.save(next);
    }]
  }, function(err, data) {
    if (err) { return next(err); }

    if (!data.activate) {
      return res.status(422).json({ success: false })
    }
    var account = data.account;
    req.app.log.info('Account ' + account.username + ' successfully activated');
    req.app.services.tasks.publish('db.clients.activate', { _id: account._id });

    assignToken(req, account, function (err, token) {
      if (err) { return next(err); }

      //loginResponse(req, res, token, account, next);
      res.redirect('http://season-de-luxe.5stars.link/');
    });
  });
});

router.post('/vk/callback', function (req, res, next) {
  async.auto({
    'dashboard': function(next) {
      req.app.models.dashboards.findOne({}, next);
    },
    'config': ['dashboard', function(next, res) {
      next(null, _.find(res.dashboard.authorizations, { provider: 'vk' }));
    }],
    'accessToken': ['config', function(next, res) {
      if (!res.config) {
        return next({ no_vk_config: true });
      }
      var accessTokenUrl = 'https://oauth.vk.com/access_token';
      var params = {
        code: req.body.code,
        client_id: req.body.clientId,
        client_secret: res.config.authSecret,
        redirect_uri: req.body.redirectUri
      };

      request.get({ url: accessTokenUrl, qs: params, json: true }, function(err, response, accessToken) {
        if (err) { return next(err); }
        if (response.statusCode !== 200) {
          return next({ message: accessToken.error.message });
        }
        next(null, accessToken);
      });
    }],
    'profile': ['accessToken', function(next, res) {
      var graphApiUrl = 'https://api.vk.com/method/users.get',
        params = res.accessToken;

      params.fields = 'photo_200,sex,bdate,screen_name';
      request.get({ url: graphApiUrl, qs: params, json: true }, function(err, response, profile) {
        if (err) { return next(err); }

        next(null, profile.response[0]);
      });
    }],
    'client': ['profile', function(next, res) {
      req.app.models.clients.findOne({ provider: 'vk', 'external.user': res.profile.uid }, next);
    }],
    'account': ['client', function(next, res) {
      var isNewClient = !res.client,
        account = res.client || new req.app.models.clients({ provider: 'vk' }),
        profile = res.profile;

      if (isNewClient) {
        account.activated = Date.now();
        account.title = profile.first_name + ' ' + profile.last_name;
        account.username = 'vk-' + profile.uid;
        account.external = {
          user: profile.uid
        };
        var gender = 'unknown';
        if (profile.sex > 0) {
          gender = profile.sex == 2 ? 'male' : 'female';
        }
        account.profile = {
          //email: profile.email,
          gender: gender,
          vkUrl: 'https://vk.com/id' + profile.uid,
          firstName: profile.first_name,
          lastName: profile.last_name
        };
      }
      if (profile.photo_200) {
        account.profile.avatarUrl = profile.photo_200;
      }
      if (profile.bdate) {
        account.profile.dateOfBirth = moment.utc(profile.bdate, 'D.M.YYYY');
      }
      account.external.token = res.accessToken.access_token;
      account.save(function(err, acc) {
        if (err) { return next(err); }

        if (isNewClient) {
          req.app.log.info('Vk account "' + profile.uid + '" registered successfully');
          req.app.services.tasks.publish('db.clients.insert', { _id: acc._id });
        } else {
          req.app.log.info('Vk account "' + profile.uid + '" login successfully');
        }
        next(null, acc);
      });
    }]
  }, function(err, data) {
    if (err) { return next(err); }
    var account = data.account;

    assignToken(req, account, function (err, token) {
      if (err) { return next(err); }

      loginResponse(req, res, token, account, next);
    });
  });
});


router.post('/facebook/callback', function (req, res, next) {
  async.auto({
    'dashboard': function(next) {
      req.app.models.dashboards.findOne({}, next);
    },
    'config': ['dashboard', function(next, res) {
      next(null, _.find(res.dashboard.authorizations, { provider: 'facebook' }));
    }],
    'accessToken': ['config', function(next, res) {
      if (!res.config) {
        return next({ no_facebook_config: true });
      }
      request('https://graph.facebook.com/oauth/access_token?client_id=' + req.body.clientId +
        '&redirect_uri=' + req.body.redirectUri +
        '&client_secret=' + res.config.authSecret + '&code=' + req.body.code, function(err, data, body) {
        if (err) { return next(err); }

        var data = querystring.parse(body);
        next(null, data.access_token);
      });
    }],
    'profile': ['accessToken', function(next, res) {
      request('https://graph.facebook.com/me?access_token=' + res.accessToken, function (err, data, b) {
        if (err) { return next(err); }

        next(null, JSON.parse(b));
      });
    }],
    'client': ['profile', function(next, res) {
      req.app.models.clients.findOne({ provider: 'facebook', 'external.user': res.profile.id }, next);
    }],
    'photo': ['profile', function (next, res) {
      request('https://graph.facebook.com/' + res.profile.id + '/picture?access_token=' + res.accessToken +
        '&redirect=false&width=200&height=200', function (err, data, b) {
        if (err) { return next(err); }
        next(null, JSON.parse(b));
      });
    }],
    'account': ['client', 'photo', function(next, res) {
      var isNewClient = !res.client,
        account = res.client || new req.app.models.clients({ provider: 'facebook' }),
        profile = res.profile;

      if (isNewClient) {
        account.activated = Date.now();
        account.title = profile.name;
        account.username = 'facebook-' + profile.id;
        account.external = {
          user: profile.id
        };
        account.profile = {
          email: profile.email,
          gender: profile.gender,
          facebookUrl: profile.link,
          firstName: profile.first_name,
          lastName: profile.last_name
        };
      }
      if (res.photo && res.photo.data && res.photo.data.url) {
        account.profile.avatarUrl = res.photo.data.url;
      }
      if (profile.birthday) {
        account.profile.dateOfBirth = moment.utc(profile.birthday, 'MM/DD/YYYY');
      }
      account.external.token = res.accessToken;
      account.save(function(err) {
        if (err) { return next(err); }

        if (isNewClient) {
          req.app.log.info('Facebook account "' + profile.id + '" registered successfully');
          req.app.services.tasks.publish('db.clients.insert', { _id: account._id });
        } else {
          req.app.log.info('Facebook account "' + profile.id + '" login successfully');
        }
        next(null, account);
      });
    }]
  }, function(err, data) {
    if (err) { return next(err); }
    var account = data.account;

    assignToken(req, account, function (err, token) {
      if (err) { return next(err); }

      loginResponse(req, res, token, account, next);
    });
  });
});

function assignToken(req, account, cb) {
  req.app.services.accounts.assignToken(account, req.body.persist, cb);
}

function loginResponse(req, res, token, account, next) {
  req.app.services.dashboards.getDashboardForAccount(account, function (err, dashboard) {
    if (err) { return next(err); }
    var response = {
      token: token,
      account: {
        _id: account._id,
        title: account.title,
        username: account.username,
        coverFile: account.coverFile,
        imageUrl: account.imageUrl,
        roles: account.roles
      }
    };
    if (dashboard) {
      response.dashboard = dashboard;
    }

    res.status(200).json(response);
  });
}

function auth(req, res, account, next) {
  req.app.services.accounts.checkPassword(req.body.password, account, function(err, valid) {
    if (err) { return next(err); }

    if (valid) {
      assignToken(req, account, function (err, token) {
        if (err) { return next(err); }

        req.account = account;
        //req.log = req.log.child({account: _.pick(account, ['_id', 'username'])});
        //req.log.info('Token generated');

        //req.logRecord('login', 'Successfully login by username and password', req.app.log_level.info, account, function (err) {
        /*  if (err) {
            return next(err);
          }*/
          loginResponse(req, res, token, account, next);
        //});
      });
    } else {
      //req.logRecord('login', 'Incorrect email or password', 3, account, function (err) {
      //  if (err) { return next(err); }

        res.status(422).json({
          hasErrors: true, summaryErrors: [
            {msg: 'Incorrect email or password.'}
          ]
        });
      //});
    }
  });
}

router.post('/login', function (req, res, next) {
  req.body.username = req.body.username || req.body.email;
  if (!req.body.username) {
    res.status(422).json({
      hasErrors: true, fieldErrors: [
        {field: 'username', msg: 'username or email is required'}
      ]
    });
  }
  else if (!req.body.password) {
    res.status(422).json({
      hasErrors: true, fieldErrors: [
        {field: 'password', msg: 'password is required'}
      ]
    });
  } else {
    req.app.models.clients.findOne({
      $or: [
        { username: req.body.username },
        { email: req.body.username }
      ]
    }, function (err, account) {
      if (err) {
        return next(err);
      }
      if (!account) {
        return res.status(422).json({
          hasErrors: true, summaryErrors: [
            {msg: 'Incorrect username/email or password'}
          ]
        });
      }
      if (account.removed) {
        return res.status(422).json({
          hasErrors: true, summaryErrors: [
            {msg: 'Account is locked'}
          ]
        });
      }
      if (!account.activated) {
        return res.status(422).json({
          hasErrors: true, summaryErrors: [
            {msg: 'Account is not activated, check your email'}
          ]
        });
      }
      auth(req, res, account, next);
    });
  }
});

module.exports = router;