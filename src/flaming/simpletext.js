var Class = require('j-oo');
var BaseShape = require('../base/shape.js');
var JPoint = require('../base/struct/point.js');

module.exports = Class(function BasicTextShape(centerPoint, container, options) {
  this.base(container, [centerPoint], options);
  this._text = options.text ? options.text : '';
  this._font = '';
  this._fontSize = options.fontSize ? options.fontSize : 13;
  this._fontFamily = options.fontFamily ? options.fontFamily : 'Arial';
  this._align = options.align ? options.align : 'left';
  this._baseline = options.baseline ? options.baseline : 'baseline';

  this._getFont();

}, {
  _getFont: function() {
    this._font = this._fontSize + 'px ' + this._fontFamily;
  },
  setPosition: function(x, y) {
    var ps = this.points;
    ps[0].x = x;
    ps[0].y = y;
  },
  text: {
    get: function() {
      return this._text;
    },
    set: function(text) {
      this._text = text;
      this.paint();
    }
  },
  font: {
    get: function() {
      return this._font;
    }
  },
  fontSize: {
    get: function() {

    },
    set: function() {

    }
  },
  fontFamily: {
    get: function() {

    },
    set: function() {

    }
  },
  _doRender: function(ctx) {
    var x = this.points[0].x;
    var y = this.points[0].y;
    ctx.textAlign = this._align;
    ctx.textBaseline = this._baseline;
    ctx.font = this._font;
    if (this._fillStyle) {
      ctx.fillStyle = this._fillStyle;
      ctx.fillText(this._text, x, y);
    }
    if (this._strokeStyle) {
      ctx.strokeStyle = this._strokeStyle;
      ctx.strokeText(this._text, x, y);
    }
  }

}, BaseShape);