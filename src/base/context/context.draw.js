var Class = require('j-oo');
var JContext = require('./context.main.js');
var defaultOptions = require('../option.js');
var _ = require('../../util/util.js');

Class.partial(JContext, {

  beginPath: function() {
    this._ctx.beginPath();
  },
  closePath: function() {
    this._ctx.closePath();
  },
  stroke: function(strokeStyle) {
    if (strokeStyle) {
      this._ctx.strokeStyle = strokeStyle;
    }
    this._ctx.stroke();
  },

  fill: function() {
    this._ctx.fill();
  },
  fillRect: function(x, y, width, height) {
    this._ctx.fillRect(x, y, width, height);
  },
  strokeRect: function(x, y, width, height) {
    this._ctx.strokeRect(x, y, width, height);
  },
  drawRect: function(x, y, width, height) {
    this._ctx.fillRect(x, y, width, height);
    this._ctx.strokeRect(x, y, width, height);
  },
  fillEllipse: function() {

  },
  strokeEllipse: function() {

  },
  drawEllipse: function() {

  },
  fillCircle: function() {

  },
  strokeCircle: function() {

  },
  drawCircle: function() {

  },
  lineTo: function(x, y) {
    this._ctx.moveTo(x, y);
  },
  lineToByPoints: function(p1, p2) {
    var ps = _.isArray(p1) ? p1 : arguments;
    for (var i = 0; i < ps.length; i++) {
      this._ctx.moveTo(ps[i].x, ps[i].y);
    }
  },
  drawLine: function(x1, y1, x2, y2) {
    this._ctx.beginPath();
    this._ctx.moveTo(x1, y1);
    this._ctx.lineTo(x2, y2);
    this._ctx.stroke();
    this._ctx.closePath();
  },
  /**
   * 过定点，以一定角度绘制一定长度的直线
   * @param x
   * @param y
   * @param angle
   * @param length
   */
  drawLineByAngle: function(x, y, angle, length) {

  },
  drawLineByPoints: function(p1, p2) {
    var ps = _.isArray(p1) ? p1 : arguments;
    _.assert(ps.length > 1);
    this._ctx.beginPath();
    this._ctx.moveTo(ps[0].x, ps[0].y);
    for (var i = 1; i < ps.length; i++) {
      this._ctx.lineTo(ps[i].x, ps[i].y);
    }
    this._ctx.stroke();
    this._ctx.closePath();
  },
  strokePie: function() {

  },
  fillPie: function() {

  },
  drawPie: function() {

  },
  drawBezier: function(p1, p2) {
    var points = _.isArray(p1) ? p1 : p2;
    var ctx = this._ctx;
    var len = points.length - 1;
    _.assert(len > 0);
    ctx.beginPath();
    var cx, cy, dx, dy;
    cx = points[0].x;
    cy = points[0].y;
    ctx.moveTo(cx, cy);
    for(var i = 0; i < len; i++) {
      dx = (points[i].x + points[i + 1].x) / 2;
      dy = (points[i].y + points[i + 1].y) / 2;
      ctx.quadraticCurveTo(cx, cy, dx, dy);
      cx = dx;
      cy = dy;
    }
    dx = points[len].x;
    dy = points[len].y;
    ctx.quadraticCurveTo(cx, cy, dx, dy);
    ctx.stroke();
    ctx.closePath();
  }
});