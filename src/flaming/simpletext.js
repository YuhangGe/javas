var Class = require('j-oo');
var BaseShape = require('../base/shape.js');
var JPoint = require('../base/point.js');

module.exports = Class(function BasicTextShape(centerX, centerY, parent, options) {
  this.base(JPoint.createArray(5), parent);
  this._text = text;
  this._font = '';
  this._fontSize = options.fontSize ? options.fontSize : 13;
  this._fontFamily = options.fontFamily ? options.fontFamily : 'Microsoft Yahei';

  this.width = options.width ? options.width : 0;
  this.height = options.height ? options.height : 0;

  this._getFont();

  this.setPosition(centerX, centerY);

}, {
  _getFont: function() {
    this._font = this._fontSize + 'px ' + this._fontFamily;
  },
  setPosition: function(centerX, centerY) {
    var ps = this.points;
    var hw = this.width / 2;
    var hh = this.height / 2;
    ps[4].x = centerX;
    ps[4].y = centerY;
    ps[0].x = centerX - hw;
    ps[0].y = centerY - hh;
    ps[1].x = centerX + hw;
    ps[1].y = centerY - hh;
    ps[2].x = centerX + hw;
    ps[2].y = centerY + hh;
    ps[3].x = centerX - hw;
    ps[3].y = centerY + hh;
  },
  text: {
    get: function() {
      return this._text;
    },
    set: function(text) {
      this._text = text;
    }
  },
  font: {
    get: function() {
      return this._font;
    }
  },
  fontSize: {

  },
  fontFamily: {

  },
  _doRender: function(ctx) {
    var ps = this.points;
    ctx.beginPath();
    ctx.moveTo(ps[0].x, ps[0].y);
    ctx.arc(ps[1].x, (ps[1].y + ps[2].y) / 2, this.height / 2, 0, Math.PI);
    ctx.arc(ps[0].x, (ps[0].y + ps[3].y) / 2, this.height / 2, Math.PI, Math.PI * 2);
    ctx.closePath();
    if (this.fillStyle) {
      ctx.fill();
    }
    if (this.strokeStyle) {
      ctx.stroke();
    }

  }

}, BaseShape);