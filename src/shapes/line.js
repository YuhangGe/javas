var _ = require('../util/util.js');
var BaseShape = require('../base/shape.js');
var Class = require('j-oo');
var JPoint = require('../base/struct/point.js');

module.exports = Class(function LineShape(x1, y1, x2, y2, container, options) {
  this.base(container, [new JPoint(x1, y1), new JPoint(x2, y2)], options);
  this.lineCap = options.lineCap ? options.lineCap : 'round';
}, {
  setPosition: function(x1, y1, x2, y2) {
    var ps = this.points;
    ps[0].x = x1;
    ps[0].y = y1;
    ps[1].x = x2;
    ps[1].y = y2;
  },
  _doRender: function(ctx) {
    var ps = this.points;
    ctx.lineCap = this.lineCap;
    ctx.strokeLine(ps[0].x, ps[0].y, ps[1].x, ps[1].y);
  }
}, BaseShape);


