var Class = require('j-oo');
var BaseShape = require('../base/shape.js');
var TextShape = require('./simpletext.js');
var BezierShape = require('../shapes/bezier.js');
var JPoint = require('../base/struct/point.js');
var CircleShape = require('../shapes/circle.js');
var RectShape = require('../shapes/rect.js');
var TreeLayout = require('../math/treelayout.js');
var DOT_RADIUS = 8;
var ITEM_WIDTH = 170;
var ITEM_HEIGHT = 35;
var TRACE_WIDTH = 90;
var TRACE_HEIGHT = 90;
var TRACE_LINE_WIDTH = 8;
var PADDING = 20;

var AbstractTreeNode = Class(function AbstractTreeNode(x, y, width, height, container, options) {
  this.base(container, [new JPoint(x, y)], options);
  this.parent = null;
  this.width = width;
  this.height = height;
  this.children = [];
  this.isCollapsed = options.isCollapsed === true;
  /*
   * 下面的成员变量用于排版计算
   */
  this.__level_at = 0;
  this.__x = 0;
  this.__left_bound = 0;
  this.__right_bound = 0;
}, {
  addChild: function(shape) {
    this.children.push(shape);
  }
}, BaseShape);

var RootTreeNode  = Class(function RootTreeNode(x, y, container, options) {
  this.base(x, y, ITEM_WIDTH, ITEM_HEIGHT, container, options);
  this.text = new TextShape(0, 0, this, {
    baseline: 'middle',
    align: 'center',
    fillStyle: '#707070',
    fontSize: 13,
    fontFamily: 'Microsoft Yahei',
    text: options.text
  });
  this.rect = new RectShape(0, 0, ITEM_WIDTH, ITEM_HEIGHT, this, {
    radius: ITEM_HEIGHT / 2,
    fillStyle: '#b4e9fc'
  });

  this.dot = new CircleShape(0, 0, DOT_RADIUS, this, {
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
    //this._setTracePoints(x, y);
  },
  expand: {
    get: function() {
      return this._expand;
    },
    set: function(val) {
      this._expand = val;
    }
  },
  render: function(ctx) {
    if (this.state === 'wait') {
      return;
    }
    this._doRender(ctx);
    if (this._expand) {

    }
  },
  _doRender: function(ctx) {
    if (this._expand) {

    }
    this.rect.render(ctx);
    this.text.render(ctx);
    this.dot.render(ctx);
  }
}, AbstractTreeNode);

var TreeNode = Class(function TreeNode(x, y, parent, options) {
  this.base(x, y, parent, options);
  this.parent = parent;
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

module.exports = Class(function BasicTree(topX, topY, javasManager, treeData) {
  this.base(javasManager, [], {});

  var tree = this;

  this.root = new RootTreeNode(topX, topY, tree, {
    text: treeData.text
  });

  function build(node, parentShape) {
    var dc = node.children;
    var i;
    for (i = 0; i < dc.length; i++) {
      parentShape.addChild(new TreeNode(0, 0, parentShape, {
        text: dc[i].text
      }));
      build(dc[i], nc[i]);
    }
  }

  build(treeData, this.root);

  TreeLayout.layout(this.root);

}, {
  render: function(ctx) {
    this.root.render(ctx);
  }
}, BaseShape);