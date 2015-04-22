var _ = require('../util/util.js');
var BaseShape = require('../base/shape.js');
var Class = require('j-oo');
var JPoint = require('../base/struct/point.js');

module.exports = Class(function CircleShape(centerX, centerY, radius, container, options) {
  this.base(container, [new JPoint(0, 0)], options);
  this.radius = radius;
  this.setPosition(centerX, centerY);
}, {
  setPosition: function(centerX, centerY) {
    var ps = this.points;
    ps[0].x = centerX;
    ps[0].y = centerY;
  },
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


