var _ = require('../util/util.js');
var Class = require('j-oo');
var baseOptions = require('./option.js');


module.exports = Class(function BaseShape() {
  this.id = _.uid();
  this.state = 'stable'; // waiting, animating, stable

  this.strokeStyle = baseOptions.strokeStyle;
  this.fillStyle = baseOptions.fillStyle;
  this.lineWidth = baseOptions.lineWidth;
  this.lineCap = baseOptions.lineCap;
  this.lineJoin = baseOptions.lineJoin;
  this.opacity = baseOptions.opacity;
}, {
  color: {
    get: function() {
      return this.fillStyle;
    },
    set: function(color) {
      this.strokeStyle = color;
      this.fillStyle = color;
    }
  },
  _doRender: function(ctx) {
    _.warn('abstract method');
  },
  onRender: function(ctx) {
    ctx.fillStyle = this.fillStyle;
    ctx.strokeStyle = this.strokeStyle;
    ctx.lineWidth = this.lineWidth;
    ctx.lineCap = this.lineCap;
    ctx.lineJoin = this.lineJoin;
    ctx.globalAlpha = this.opacity;
    this._doRender(ctx);
  }
});