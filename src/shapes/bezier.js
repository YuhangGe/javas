var _ = require('../util/util.js');
var BaseShape = require('../base/shape.js');
var Class = require('j-oo');
var JPoint = require('../base/point.js');

module.exports = Class(function BezierShape(points, options) {
  this.base(points, options);
  this._isThrough = options.type === 'through';
}, {
  _onRender: function(ctx) {

  }
}, BaseShape);