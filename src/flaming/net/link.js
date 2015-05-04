var Class = require('j-oo');
var BaseShape = require('../../base/shape.js');
var _ = require('../../util/util.js');
var JPoint = require('../../base/struct/point.js');
var LineShape = require('../../shapes/line.js');

module.exports = Class(function NetLink(fromNode, toNode, container, options) {
  var fp = fromNode.points[0];
  var tp = toNode.points[0];
  this.base(container, [fp, tp], options);
  this.line = new LineShape(fp, tp, this, options);
  this.fromNode = fromNode;
  this.toNode = toNode;
}, {
  render: function(ctx, ectx) {
    this.line.render(ctx, ectx);
  }
}, BaseShape);