var Class = require('j-oo');
var JContext = require('./context.main.js');
var _ = require('../../util/util.js');
var halfPI = Math.PI / 2;
var PI2 = Math.PI * 2;
var PI = Math.PI;

Class.partial(JContext, {
  moveTo: function(x, y) {
    this._ctx.moveTo(x * this.unitX, y * this.unitY);
  },
  moveToPoint: function(p) {
    this.moveTo(p.x, p.y);
  },
  arcTo: function(x0, y0, x1, y1, radius) {
    var ux = this.unitX;
    var uy = this.unitY;
    this._ctx.arcTo(x0 * ux, y0 * uy, x1 * ux, y1 * uy, radius);
  },
  arc: function(x, y, radius, startAngle, endAngle, counterclockwise) {
    this._ctx.arc(x * this.unitX, y * this.unitY, radius, startAngle - halfPI, endAngle - halfPI, counterclockwise);
  },
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
    var ux = this.unitX;
    var uy = this.unitY;
    this._ctx.fillRect(x * this.unitX, y * uy, width * ux, height * uy);
  },
  strokeRect: function(x, y, width, height) {
    var ux = this.unitX;
    var uy = this.unitY;
    this._ctx.strokeRect(x * this.unitX, y * uy, width * ux, height * uy);
  },
  drawRect: function(x, y, width, height) {
    var ux = this.unitX;
    var uy = this.unitY;
    this._ctx.fillRect(x * ux, y * uy, width * ux, height * uy);
    this._ctx.strokeRect(x * ux, y * uy, width * ux, height * uy);
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
  fillText: function(text, x, y, maxWidth) {
    //fillText函数如果maxWidth = undefined，不能正确绘制。
    if (maxWidth) {
      this._ctx.fillText(text, x, y, maxWidth);
    } else {
      this._ctx.fillText(text, x, y);
    }
  },
  drawCircle: function(centerX, centerY, radius) {
    this._ctx.beginPath();
    this._ctx.arc(centerX, centerY, radius, 0, PI2);
    this._ctx.closePath();
  },
  lineTo: function(x, y) {
    this._ctx.lineTo(x * this.unitX, y * this.unitY);
  },
  lineToPoint: function(p) {
    this.lineTo(p.x, p.y);
  },
  lineToByPoints: function(points) {
    var ux = this.unitX;
    var uy = this.unitY;
    this._ctx.moveTo(points[0].x * ux, points[0].y * uy);
    for (var i = 1; i < points.length; i++) {
      this._ctx.lineTo(points[i].x * ux, points[i].y * uy);
    }
  },
  strokeLine: function(x1, y1, x2, y2) {
    var ux = this.unitX;
    var uy = this.unitY;
    this._ctx.beginPath();
    this._ctx.moveTo(x1 * ux, y1 * uy);
    this._ctx.lineTo(x2 * ux, y2 * uy);
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
    var ux = this.unitX;
    var uy = this.unitY;
    var ps = _.isArray(p1) ? p1 : arguments;
    _.assert(ps.length > 1);
    this._ctx.beginPath();
    this._ctx.moveTo(ps[0].x * ux, ps[0].y * uy);
    for (var i = 1; i < ps.length; i++) {
      this._ctx.lineTo(ps[i].x * ux, ps[i].y * uy);
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
  /**
   * 绘制穿过这些点的贝塞尔曲线。
   * points是要穿过的点，而不是控制点。
   */
  strokeFreeBezier: function(points) {
    var ctx = this._ctx;
    var len = points.length - 1;
    var ux = this.unitX;
    var uy = this.unitY;
    _.assert(len > 0);
    ctx.beginPath();
    var cx, cy, dx, dy;
    cx = points[0].x;
    cy = points[0].y;
    ctx.moveTo(cx * ux, cy * uy);
    for(var i = 0; i < len; i++) {
      dx = (points[i].x + points[i + 1].x) / 2;
      dy = (points[i].y + points[i + 1].y) / 2;
      ctx.quadraticCurveTo(cx * ux, cy * uy, dx * ux, dy * uy);
      //ctx.lineTo(points[i+1].x, points[i+1].y);
      cx = dx;
      cy = dy;
    }
    dx = points[len].x;
    dy = points[len].y;
    ctx.quadraticCurveTo(cx * ux, cy * uy, dx * ux, dy * uy);
    ctx.stroke();
    ctx.closePath();
  },
  bezierCurveTo: function(cp1x, cp1y, cp2x, cp2y, x, y) {
    var ux = this.unitX;
    var uy = this.unitY;
    this._ctx.bezierCurveTo(cp1x * ux, cp1y * uy, cp2x * ux, cp2y * uy, x * ux, y * uy);
  },
  bezierCurveToPoint: function(cp1, cp2, dest) {
    this.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, dest.x, dest.y);
  }
});