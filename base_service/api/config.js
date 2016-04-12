'use strict';

var convict = require('convict'),
path = require('path'),
config = convict({
    env: {
        doc: 'The application environment.',
        format: ['production', 'development'],
        default: 'development',
        env: 'NODE_ENV',
        arg: 'env'
    },
    http: {
        port: {
          doc: 'HTTP port to bind.',
          format: 'port',
          default: 8080,
          env: 'HTTP_PORT'
        }
    },
    log: {
        stdout: {
            enabled: {
              doc: 'Log to stdout',
              format: Boolean,
              default: true
            },
            level: {
              doc: 'Stdout level',
              format: Number,
              default: 0
            }
        },
        file: {
            enabled: {
              doc: 'Log to file',
              format: Boolean,
              default: false
            }
        },
        syslog: {
            enabled: {
              doc: 'Log to syslog',
              format: Boolean,
              default: false
            },
            level: {
              doc: 'Syslog level',
              format: Number,
              default: 0
            }
        }
    }
});


var filePath = path.resolve(__dirname, 'conf', config.get('env') + '.json');
config.loadFile(filePath);
config.validate();

module.exports = config;
