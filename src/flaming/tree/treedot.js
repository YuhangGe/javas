var Class = require('j-oo');
var BaseShape = require('../../base/shape.js');
var JPoint = require('../../base/struct/point.js');
var CircleShape = require('../../shapes/circle.js');
var LineShape = require('../../shapes/line.js');

module.exports = Class(function TreeDot(point, container, options) {
  this.base(container, [point], options);
  this.circle = new CircleShape(point, options.radius, this, {
    fillStyle: options.fillStyle,
    cursor: 'pointer'
  });
  this.hLine = new LineShape(new JPoint(0, 0), new JPoint(0, 0), this, {
    strokeStyle: options.crossColor,
    lineWidth: options.crossLineWidth,
    lineCap: 'butt'
  });
  this.vLine = new LineShape(new JPoint(0, 0), new JPoint(0, 0), this, {
    strokeStyle: options.crossColor,
    lineWidth: options.crossLineWidth,
    lineCap: 'butt'
  });
  this._expand = options.expand;
  this.radius = options.radius;
}, {
  on: function(eventName, handler) {
    this.circle.on(eventName, handler);
  },
  expand: {
    get: function() {
      return this._expand;
    },
    set: function(val) {
      if (this._expand === val) {
        return;
      }
      this._expand = val;
      this.paint();
    }
  },
  setPosition: function(x, y) {
    var p = this.points[0];
    var r = this.radius;
    p.x = x;
    p.y = y;
    this.hLine.setPosition(x - r / 2, y, x + r / 2, y);
    this.vLine.setPosition(x, y - r / 2, x, y + r / 2);
  },
  render: function(ctx, ectx) {
    this.circle.render(ctx, ectx);
    this.hLine.render(ctx, ectx);
    if (!this._expand) {
      this.vLine.render(ctx, ectx);
    }
  }
}, BaseShape);