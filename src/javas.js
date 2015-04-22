var Manager = require('./base/manager/manager.js');
var _ = require('./util/util.js');
var Config = require('./util/conf.js');


var Javas = {
  util: _,
  Line: require('./shapes/line.js'),
  Circle: require('./shapes/circle.js'),
  Rect: require('./shapes/rect.js'),
  Pie: require('./shapes/pie.js'),
  FreeLine: require('./shapes/freeline.js'),
  Ellipse: require('./shapes/ellipse.js'),
  Bezier: require('./shapes/bezier.js'),
  FreeBezier: require('./shapes/freebezier.js'),
  FlamingTree: require('./flaming/tree/basictree.js')
};
module.exports = Javas;

if (typeof window !== 'undefined') {
  /*
   * export Javas to global access
   */
  window.Javas = Javas;
}

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