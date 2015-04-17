var Class = require('j-oo');
var BaseShape = require('../base/shape.js');
var TextShape = require('./simpletext.js');
var BezierShape = require('../shapes/bezier.js');
var JPoint = require('../base/point.js');
var CircleShape = require('../shapes/circle.js');
var RectShape = require('../shapes/rect.js');

var DOT_RADIUS = 8;
var ITEM_WIDTH = 170;
var ITEM_HEIGHT = 35;
var TRACE_WIDTH = 90;
var TRACE_HEIGHT = 90;
var TRACE_LINE_WIDTH = 8;
var PADDING = 20;

var RootTreeNode  = Class(function RootTreeNode(centerX, centerY, options) {
  this.base([new JPoint(0, 0)], options);

  this.text = new TextShape(0, 0, {
    baseline: 'middle',
    align: 'center',
    fillStyle: '#707070',
    fontSize: 13,
    fontFamily: 'Microsoft Yahei',
    text: options.text
  });
  this.rect = new RectShape(0, 0, ITEM_WIDTH, ITEM_HEIGHT, {
    radius: ITEM_HEIGHT / 2,
    fillStyle: '#b4e9fc'
  });

  this.dot = new CircleShape(0, 0, DOT_RADIUS, {
    fillStyle: '#00C8FE'
  });

  this.leftTrace = new BezierShape(JPoint.create(4), {
    parent: this,
    strokeStyle: '#f6f6f6',
    lineWidth: TRACE_LINE_WIDTH
  });
  this.rightTrace = new BezierShape(JPoint.create(4), {
    parent: this,
    strokeStyle: '#f6f6f6',
    lineWidth: TRACE_LINE_WIDTH
  });

  this.left = null;
  this.right = null;

  this._expand = false;

  /*
   * initialize
   */
  this.setPosition(centerX, centerY);
  this.expand = options.expand !== false;
}, {
  _setTracePoints: function(x, y) {
    var l_ps = this.leftTrace.points;
    var r_ps = this.rightTrace.points;

    r_ps[0].x = x;
    r_ps[0].y = y;
    r_ps[1].x = x + TRACE_WIDTH * 0.4;
    r_ps[1].y = y + TRACE_HEIGHT * 0.6;
    r_ps[2].x = x + TRACE_WIDTH * 0.8;
    r_ps[2].y = y + TRACE_HEIGHT * 0.4;
    r_ps[3].x = x + TRACE_WIDTH;
    r_ps[3].y = y + TRACE_HEIGHT;

    l_ps[0].x = x;
    l_ps[0].y = y;
    l_ps[1].x = x - TRACE_WIDTH * 0.4;
    l_ps[1].y = y + TRACE_HEIGHT * 0.6;
    l_ps[2].x = x - TRACE_WIDTH * 0.8;
    l_ps[2].y = y + TRACE_HEIGHT * 0.4;
    l_ps[3].x = x - TRACE_WIDTH;
    l_ps[3].y = y + TRACE_HEIGHT;

  },
  setPosition: function(x, y) {
    var ps = this.points;
    ps[0].x = x;
    ps[0].y = y;
    this.dot.setPosition(x, y);
    this.rect.setPosition(x - ITEM_WIDTH / 2, y - ITEM_HEIGHT * 1.5);
    this.text.setPosition(x, y - ITEM_HEIGHT);
    this._setTracePoints(x, y);
  },
  expand: {
    get: function() {
      return this._expand;
    },
    set: function(val) {
      this._expand = val;
      if (this.left) {
        this.left.state = val ? 'stable' : 'wait';
      }
      if (this.right) {
        this.right.state = val ? 'stable' : 'wait';
      }
    }
  },
  addLeft: function(left) {
    this.left = left;
  },
  addRight: function(right) {
    this.right = right;
  },
  render: function(ctx) {
    if (this.state === 'wait') {
      return;
    }
    this._doRender(ctx);
    if (this._expand && this.left) {
      this.left.render(ctx);
    }
    if (this._expand && this.right) {
      this.right.render(ctx);
    }
  },
  _doRender: function(ctx) {

    if (this._expand && this.left) {
      this.leftTrace.render(ctx);
    }
    if (this._expand && this.right) {
      this.rightTrace.render(ctx);
    }

    this.rect.render(ctx);
    this.text.render(ctx);
    this.dot.render(ctx);
  }
}, BaseShape);

var LeftTreeNode = Class(function LeftTreeNode(x, y, options) {
  this.base(x, y, options);

  this.rect.fillStyle = '#f3f5f7';
  this.rect.strokeStyle = '#efefef';

}, {
  setPosition: function(x, y) {
    var ps = this.points;
    ps[0].x = x;
    ps[0].y = y;
    this.dot.setPosition(x - ITEM_WIDTH + PADDING * 2, y);
    this.rect.setPosition(x - ITEM_WIDTH + PADDING, y - ITEM_HEIGHT / 2);
    this.text.setPosition(x - ITEM_WIDTH / 2 + PADDING, y);
    this._setTracePoints(x - ITEM_WIDTH + PADDING * 2, y);
  }
}, RootTreeNode);

var RightTreeNode = Class(function RightTreeNode(x, y, options) {
  this.base(x, y, options);
  this.rect.fillStyle = '#f3f5f7';
  this.rect.strokeStyle = '#efefef';
}, {
  setPosition: function(x, y) {
    var ps = this.points;
    ps[0].x = x;
    ps[0].y = y;
    this.dot.setPosition(x + ITEM_WIDTH - 2 * PADDING, y);
    this.rect.setPosition(x - PADDING, y - ITEM_HEIGHT / 2);
    this.text.setPosition(x + ITEM_WIDTH / 2 - PADDING, y);
    this._setTracePoints(x + ITEM_WIDTH - PADDING * 2, y);
  }
}, RootTreeNode);

module.exports = Class(function BasicTree(topX, topY, treeData) {
  this.base([], {});

  this.root = new RootTreeNode(topX, topY, {
    text: treeData.text
  });

  function walk(node, parentShape) {
    var shape, ps;
    if (node.left) {
      ps = parentShape.leftTrace.points;
      shape = new LeftTreeNode(ps[3].x, ps[3].y, {
        text: node.left.text,
        parent: parentShape,
        expand: node.left.expand
      });
      parentShape.addLeft(shape);
      walk(node.left, shape);
    }
    if (node.right) {
      ps = parentShape.rightTrace.points;
      shape = new RightTreeNode(ps[3].x, ps[3].y, {
        text: node.right.text,
        parent: parentShape,
        expand: node.right.expand
      });
      parentShape.addRight(shape);
      walk(node.right, shape);
    }
  }

  walk(treeData, this.root);

}, {
  render: function(ctx) {
    this.root.render(ctx);
  }
}, BaseShape);