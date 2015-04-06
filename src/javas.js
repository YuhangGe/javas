var Manager = require('./base/manager.js');
var _ = require('./util/util.js');
var Config = require('./util/conf.js');

var Javas = {};
module.exports = Javas;

_.extend(Javas, {
  create: function (target, options) {
    if (_.isString(target)) {
      target = _.querySelector(target);
    }
    if (!target) {
      _.error('create function need a target.');
    }
    return new Manager(target, options);
  },
  config: function (conf) {
    _.merge(Config, conf);
  }
});