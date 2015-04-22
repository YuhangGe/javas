var Class = require('j-oo');
var JContext = require('./context.main.js');
var defaultOptions = require('../option.js');

Class.partial(JContext, function() {
  this._transformMatrix = defaultOptions.transformMatrix;
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
    this._ctx.scale(scaleX, scaleY);
  },
  translate: function(offsetX, offsetY) {
    this._ctx.translate(offsetX * this.unitX, offsetY * this.unitY);
  }
})