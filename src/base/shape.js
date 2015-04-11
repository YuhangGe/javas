var _ = require('../util/util.js');
var Class = require('j-oo');

module.exports = Class(function BaseShape(options) {
  this.id = _.uid();
  this.state = 'ready';
  this.options = options;
  this.strokeStyle = options.strokeColor;
  this.fillStyle = options.fillColor;
  this.lineWidth = options.lineWidth;
}, {
  render: function(ctx) {

  }
});