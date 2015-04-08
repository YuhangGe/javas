var _ = require('../util/util.js');
var defaultOptions = require('./option.js');

module.exports = BaseShape;


function BaseShape(options) {
  this.id = _.uid();
  this.state = 'ready';
  this.options = options;
  this.strokeColor = options.strokeColor;
  this.fillColor = options.fillColor;
}

BaseShape.prototype = {
  render: function(ctx) {

  }
};