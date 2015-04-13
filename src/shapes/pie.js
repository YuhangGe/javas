var _ = require('../util/util.js');
var BaseShape = require('../base/shape.js');
var Class = require('j-oo');

module.exports = Class(function PieShape(centerX, centerY, startAngle, endAngle, outerRadius, innerRadius) {
  this.base();
  this._centerX = centerX;
  this._centerY = centerY;
  this._startAngle = startAngle;
  this._endAngle = endAngle;
  this._aniAngle = endAngle;
  this._outerRadius = outerRadius;
  this._innerRadius = innerRadius ? innerRadius : 0;
  this.x0 = 0;
  this.y0 = 0;
  this.ix0 = 0;
  this.iy0 = 0;

  this._calcPoint();
}, {
  _calcPoint: function() {
    var sinS = Math.sin(this._startAngle);
    var cosS = Math.cos(this._startAngle);
    var cx = this._centerX;
    var cy = this._centerY;
    var or = this._outerRadius;
    var ir = this._innerRadius;
    this.x0 = cx + sinS * or;
    this.y0 = cy - cosS * or;
    this.ix0 = cx + sinS * ir;
    this.iy0 = cy - cosS * ir;
  },
  centerX: {
    get: function() {
      return this._centerX;
    },
    set: function(val) {
      this._centerX = val;
      this._calcPoint();
    }
  },
  centerY: {
    get: function() {
      return this._centerY;
    },
    set: function(val) {
      this._centerY = val;
      this._calcPoint();
    }
  },
  startAngle: {
    get: function() {
      return this._startAngle;
    },
    set: function(val) {
      this._startAngle = val;
      this._calcPoint();
    }
  },
  endAngle: {
    get: function() {
      return this._endAngle;
    },
    set: function(val) {
      this._endAngle = val;
      this._calcPoint();
    }
  },
  outerRadius: {
    get: function() {
      return this._outerRadius;
    },
    set: function(val) {
      this._outerRadius = val;
      this._calcPoint();
    }
  },
  innerRadius: {
    get: function() {
      return this._innerRadius;
    },
    set: function(val) {
      this._innerRadius = val;
      this._calcPoint();
    }
  },
  aniAngle: {
    get: function() {
      return this._aniAngle;
    },
    set: function(angle) {
      this._aniAngle = angle;
      this._calcPoint();
    }
  },
  _doRender: function(ctx) {
    ctx.beginPath();
    ctx.moveTo(this.ix0, this.iy0);
    ctx.lineTo(this.x0, this.y0);
    ctx.arc(this._centerX, this._centerY, this._outerRadius, this._startAngle, this._aniAngle);
    if (this._innerRadius > 0) {
      ctx.arc(this._centerX, this._centerY, this._innerRadius, this._aniAngle, this._startAngle, true);
    }
    ctx.closePath();
    ctx.fill();
  }
}, BaseShape);


