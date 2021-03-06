var _ = require('../util/util.js');
var BaseShape = require('../base/shape.js');
var Class = require('j-oo');
var JPoint = require('../base/struct/point.js');

module.exports = Class(function FreeBezierShape(points, options) {
  this.base(points, options);
}, {
  _doRender: function(ctx) {
    ctx.strokeFreeBezier(this.points);
  }
}, BaseShape);