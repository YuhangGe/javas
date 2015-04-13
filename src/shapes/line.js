var _ = require('../util/util.js');
var BaseShape = require('../base/shape.js');
var Class = require('j-oo');

module.exports = Class(function LineShape(x1, y1, x2, y2) {
  this.base();
  this.x1 = x1;
  this.y1 = y1;
  this.x2 = x2;
  this.y2 = y2;
}, {
  _doRender: function(ctx) {
    ctx.drawLine(this.x1, this.y1, this.x2, this.y2);
  }
}, BaseShape);


