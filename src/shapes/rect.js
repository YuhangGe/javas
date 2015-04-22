var _ = require('../util/util.js');
var BaseShape = require('../base/shape.js');
var Class = require('j-oo');
var JPoint = require('../base/struct/point.js');

var PI = Math.PI;
var PI2 = Math.PI * 2;
var halfPI = Math.PI * 0.5;

module.exports = Class(function RectShape(left, top, width, height, container, options) {
  this.base(container, JPoint.create(4), options);
  this.radius = options.radius ? options.radius : 0;
  this.width = width;
  this.height = height;
  this.setPosition(left, top);
}, {
  setPosition: function(left, top) {
    var ps = this.points;
    var w = this.width;
    var h = this.height;
    ps[0].x = left;
    ps[0].y = top;
    ps[1].x = left + w;
    ps[1].y = top;
    ps[2].x = left + w;
    ps[2].y = top + h;
    ps[3].x = left;
    ps[3].y = top + h;
  },
  _doRender: function(ctx) {
    var ps = this.points;
    ctx.beginPath();
    if (this.radius > 0) {
      /*
       * arc函数会自动在arc前lineTo或者moveTo，所以才不需要lineTo。
       */
      ctx.arc(ps[0].x + this.radius, ps[0].y + this.radius, this.radius, halfPI + PI, PI2);
      ctx.arc(ps[1].x - this.radius, ps[1].y + this.radius, this.radius, 0, halfPI);
      ctx.arc(ps[2].x - this.radius, ps[2].y - this.radius, this.radius, halfPI, PI);
      ctx.arc(ps[3].x + this.radius, ps[3].y - this.radius, this.radius, PI, PI + halfPI);
    } else {
      ctx.moveToPoint(ps[0]);
      ctx.lineToPoint(ps[1]);
      ctx.lineToPoint(ps[2]);
      ctx.lineToPoint(ps[3]);
    }
    ctx.closePath();

    if (this.strokeStyle) {
      ctx.stroke();
    }
    if (this.fillStyle) {
      ctx.fill();
    }
  }
}, BaseShape);


