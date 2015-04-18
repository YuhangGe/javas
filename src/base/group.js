var _ = require('../util/util.js');
var ShapeList = require('./struct/list.js');
var BaseShape = require('./shape.js');

module.exports = GroupShape;


function GroupShape(options) {
  this.base(options);
  this.shapeList = new ShapeList();
}

GroupShape.prototype = {
  add: function(shape) {
    for(var i = 0; i < arguments.length; i++) {
      this.shapeList.push(arguments[i]);
    }
  },
  render: function(ctx) {

  }
};

_.inherit(GroupShape, BaseShape);