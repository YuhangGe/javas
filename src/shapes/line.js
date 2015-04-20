var _ = require('../util/util.js');
var BaseShape = require('../base/shape.js');
var Class = require('j-oo');
var JPoint = require('../base/struct/point.js');

module.exports = Class(function LineShape(x1, y1, x2, y2, javasManager, options) {
  this.base(javasManager, [new JPoint(x1, y1), new JPoint(x2, y2)], options);
}, {
  _doRender: function(ctx) {
    var ps = this.points;
    ctx.strokeLine(ps[0].x, ps[0].y, ps[1].x, ps[1].y);
  }
}, BaseShape);


