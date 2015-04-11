var _ = require('../util/util.js');
var Class = require('j-oo');
var defaultOptions = require('./option.js');
var JColor = require('./color.js');

function $isJColor(obj) {
  return obj instanceof JColor;
}

module.exports = Class(function JContext(jcanvas) {
  this.ctx = jcanvas.originCanvas.getContext('2d');
  this.canvas = jcanvas;

  this._strokeStyle = defaultOptions.strokeStyle;
  this._fillStyle = defaultOptions.fillStype;
  this._transformMatrix = defaultOptions.transformMatrix;

  this.ctx.lineWidth = defaultOptions.lineWidth;
  this.ctx.lineCap = defaultOptions.lineCap;
  this.ctx.lineJoin = defaultOptions.lineJoin;
  this.ctx.strokeStyle = this._strokeStyle.value;
  this.ctx.fillStyle = this._fillStyle.value;

}, {
  transformMatrix: {
    get: function() {
      return this._transformMatrix;
    },
    set: function() {

    }
  },
  setTransform: function(matrix) {
    this.transformMatrix = matrix;
  },
  transform: function(matrix) {

  },
  scale: function(scaleX, scaleY) {

  },
  translate: function(offsetX, offsetY) {

  },
  lineWidth: {
    get: function() {
      return this.ctx.lineWidth;
    },
    set: function(lineWidth) {
      this.ctx.lineWidth = lineWidth;
    }
  },
  lineCap: {
    get: function() {
      return this.ctx.lineCap;
    },
    set: function(lineCap) {
      this.ctx.lineCap = lineCap
    }
  },
  lineJoin: {
    get: function() {
      return this.ctx.lineJoin;
    },
    set: function(lineJoin) {
      this.ctx.lineJoin = lineJoin;
    }
  },
  strokeStyle: {
    get: function() {
      return this._strokeStyle;
    },
    set: function(style) {
      if (!$isJColor(style)) {
        _.assert(_.isString(style));
        style = new JColor(style);
      }
      this.ctx.strokeStyle = style.value;
      this._strokeStyle = style;
    }
  },
  fillStyle: {
    get: function() {
      return this._fillStyle;
    },
    set: function(style) {
      if (!$isJColor(style)) {
        _.assert(_.isString(style));
        style = new JColor(style);
      }
      this.ctx.fillStyle = style.value;
      this._fillStyle = style;
    }
  },
  beginPath: function() {
    this.ctx.beginPath();
  },
  closePath: function() {
    this.ctx.closePath();
  },
  stroke: function(strokeStyle) {
    if (strokeStyle) {
      this.ctx.strokeStyle = strokeStyle;
    }
    this.ctx.stroke();
  },
  save: function() {
    this.ctx.save();
  },
  restore: function() {
    this.ctx.restore();
  },
  fill: function() {
    this.ctx.fill();
  },
  fillRect: function(x, y, width, height) {
    this.ctx.fillRect(x, y, width, height);
  },
  strokeRect: function(x, y, width, height) {
    this.ctx.strokeRect(x, y, width, height);
  },
  drawRect: function(x, y, width, height) {
    this.fillRect(x, y, width, height);
    this.strokeRect(x, y, width, height);
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
    this.ctx.moveTo(x, y);
  },
  lineToByPoints: function(p1, p2) {
    var ps = _.isArray(p1) ? p1 : arguments;
    for (var i = 0; i < ps.length; i++) {
      this.ctx.moveTo(ps[i].x, ps[i].y);
    }
  },
  drawLine: function(x1, y1, x2, y2) {
    this.ctx.beginPath();
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);
    this.ctx.stroke();
    this.ctx.closePath();
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
    this.ctx.beginPath();
    this.ctx.moveTo(ps[0].x, ps[0].y);
    for (var i = 1; i < ps.length; i++) {
      this.ctx.lineTo(ps[i].x, ps[i].y);
    }
    this.ctx.stroke();
    this.ctx.closePath();
  },
  strokePie: function() {

  },
  fillPie: function() {

  },
  drawPie: function() {

  },
  drawBezier: function(p1, p2) {
    var points = _.isArray(p1) ? p1 : p2;
    var ctx = this.ctx;
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
