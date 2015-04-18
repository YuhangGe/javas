var _ = require('../../util/util.js');
var Class = require('j-oo');
var defaultOptions = require('../option.js');
var JColor = require('../../color/color.js');

function $isJColor(obj) {
  return obj instanceof JColor;
}

module.exports = Class(function JContext(jcanvas) {
  this.canvas = jcanvas;

  this._ctx = jcanvas._originCanvas.getContext('2d');
  this._strokeStyle = defaultOptions.strokeStyle;
  this._fillStyle = defaultOptions.fillStyle;

  this._ctx.lineWidth = defaultOptions.lineWidth;
  this._ctx.lineCap = defaultOptions.lineCap;
  this._ctx.lineJoin = defaultOptions.lineJoin;
  this._ctx.strokeStyle = this._strokeStyle.value;
  this._ctx.fillStyle = this._fillStyle.value;

  this.unitX = 1;
  this.unitY = 1;

}, {
  font: {
    get: function() {
      return this._ctx.font;
    },
    set: function(val) {
      this._ctx.font = val;
    }
  },
  textBaseline: {
    get: function() {
      return this._ctx.textBaseline;
    },
    set: function(val) {
      this._ctx.textBaseline = val;
    }
  },
  textAlign: {
    get: function() {
      return this._ctx.textAlign;
    },
    set: function(val) {
      this._ctx.textAlign = val;
    }
  },
  lineWidth: {
    get: function() {
      return this._ctx.lineWidth;
    },
    set: function(lineWidth) {
      this._ctx.lineWidth = lineWidth;
    }
  },
  lineCap: {
    get: function() {
      return this._ctx.lineCap;
    },
    set: function(lineCap) {
      this._ctx.lineCap = lineCap
    }
  },
  lineJoin: {
    get: function() {
      return this._ctx.lineJoin;
    },
    set: function(lineJoin) {
      this._ctx.lineJoin = lineJoin;
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
      this._ctx.strokeStyle = style.value;
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
      this._ctx.fillStyle = style.value;
      this._fillStyle = style;
    }
  },
  globalAlpha: {
    get: function() {
      return this._ctx.globalAlpha;
    },
    set: function(alpha) {
      this._ctx.globalAlpha = alpha;
    }
  },
  globalCompositeOperation: {
    get: function() {
      return this._ctx.globalCompositeOperation;
    },
    set: function(operation) {
      this._ctx.globalCompositeOperation = operation;
    }
  },
  clear: function() {
    this.clearRect(0, 0, this.canvas.width, this.canvas.height);
  },
  clearRect: function(x, y, width, height) {
    this._ctx.clearRect(x, y, width, height);
  },
  save: function() {
    /*
     * todo 还需要保存 _strokeStyle 等这些自己处理的属性。 !important
     */
    this._ctx.save();
  },
  restore: function() {
    this._ctx.restore();
  },
  getImageData: function(x, y, w, h) {
    return this._ctx.getImageData(x, y, w, h);
  }
});
