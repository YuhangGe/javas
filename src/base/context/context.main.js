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

  this.ctx.lineWidth = defaultOptions.lineWidth;
  this.ctx.lineCap = defaultOptions.lineCap;
  this.ctx.lineJoin = defaultOptions.lineJoin;
  this.ctx.strokeStyle = this._strokeStyle.value;
  this.ctx.fillStyle = this._fillStyle.value;

}, {
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
  }
});
