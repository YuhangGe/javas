var Class = require('j-oo');
var BaseShape = require('../../base/shape.js');
var _ = require('../../util/util.js');
var JPoint = require('../../base/struct/point.js');
var CircleShape = require('../../shapes/circle.js');

module.exports = Class(function NetNode(centerPoint, container, options) {
  this.base(container, [centerPoint], options);
  this.circle = new CircleShape(centerPoint, options.radius, this, {
    fillStyle: options.fillStyle,
    cursor: 'pointer'
  });
  this.radius = options.radius;
  this.tag = options.tag;
  this.inNodes = [];
  this.outNodes = [];

  this.__index = 0;
  this.__weight = 0;
}, {
  on: function(eventName, eventHandler) {
    this.circle.on(eventName, eventHandler);
    return this;
  },
  render: function(ctx, ectx) {
    this.circle.render(ctx, ectx);
  }
}, BaseShape);