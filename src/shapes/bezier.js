var _ = require('../util/util.js');
var BaseShape = require('../base/shape.js');
var Class = require('j-oo');

module.exports = Class(function BezierShape(points, options) {
  this.base(points, options);
}, {
  _doRender: function(ctx) {
    var ps = this.points;
    ctx.beginPath();
    ctx.moveToPoint(ps[0]);
    ctx.bezierCurveToPoint(ps[1], ps[2], ps[3]);
    ctx.stroke();
    ctx.closePath();
  }
}, BaseShape);