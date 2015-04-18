var Class = require('j-oo');
var BaseShape = require('../base/shape.js');
var TextShape = require('./simpletext.js');
var BezierShape = require('../shapes/bezier.js');
var JPoint = require('../base/struct/point.js');
var CircleShape = require('../shapes/circle.js');
var RectShape = require('../shapes/rect.js');

var DOT_RADIUS = 8;
var ITEM_WIDTH = 170;
var ITEM_HEIGHT = 35;
var TRACE_WIDTH = 90;
var TRACE_HEIGHT = 90;
var TRACE_LINE_WIDTH = 8;
var PADDING = 20;

var AbstractTreeNode = Class(function AbstractTreeNode(x, y, options) {
  _.assert(options.parent);
  this.base([new JPoint(x, y), options]);
  this.width = options.width ? options.width : 0;
  this.height = options.height ? options.height : 0;
  this.children = options.children ? options.children : [];
  this.isCollapsed = options.isCollapsed === true;

  /*
   * 下面的成员变量用于排版计算
   */
  this.__level_at = 0;
  this.__x = 0;
  this.__level_left = null;
  this.__level_right = null;
}, {

}, BaseShape);

var RootTreeNode  = Class(function RootTreeNode(x, y, options) {
  this.base(x, y, options);

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

  //this.leftTrace = new BezierShape(JPoint.create(4), {
  //  parent: this,
  //  strokeStyle: '#f6f6f6',
  //  lineWidth: TRACE_LINE_WIDTH
  //});
  //this.rightTrace = new BezierShape(JPoint.create(4), {
  //  parent: this,
  //  strokeStyle: '#f6f6f6',
  //  lineWidth: TRACE_LINE_WIDTH
  //});

  this.traces = [];

  this._expand = false;

  /*
   * initialize
   */
  this.setPosition(centerX, centerY);
}, {
  _setTracePoints: function(x, y) {

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
}, AbstractTreeNode);

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