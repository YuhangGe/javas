var _ = require('../util/util.js');
var BaseShape = require('../base/shape.js');
var Class = require('j-oo');
var JPoint = require('../base/point.js');

module.exports = Class(function CircleShape(centerX, centerY, radius, options) {
  options.points = [new JPoint(centerX, centerY)];
  this.radius = radius;
  this.base(options);
}, {
  _doRender: function(ctx) {
    var ps = this.points;
    ctx.drawCircle(ps[0].x, ps[0].y, this.radius);
    if (this.strokeStyle) {
      ctx.stroke();
    }
    if (this.fillStyle) {
      ctx.fill();
    }
  }
}, BaseShape);


