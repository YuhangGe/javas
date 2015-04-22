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
var TRACE_LINE_WIDTH = 8;
var PADDING = 6;

var AbstractTreeNode = Class(function AbstractTreeNode(x, y, width, height, container, options) {
  this.base(container, [new JPoint(x, y)], options);
  this.parent = null;
  this.width = width;
  this.height = height;
  this.children = [];
  this.traces = [];
  this.isCollapsed = options.isCollapsed === true;
  /*
   * 下面的成员变量用于排版计算
   */
  this.__w = width;
  this.__x = 0;
  this.__left_bound = null;
  this.__right_bound = null;
}, {
  _afterLayout: function(x, y) {

  },
  _afterChildrenLayout: function(x, y) {

  },
  _appendChild: function(child) {
    this.children.push(child);
    this.traces.push(new BezierShape(this, JPoint.create(4), {
      strokeStyle: '#f3f5f7',
      lineWidth: TRACE_LINE_WIDTH
    }));
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

  this.traces = [];

  this._expand = true;
}, {
  _afterLayout: function(x, y) {
    var ps = this.points;
    ps[0].x = x;
    ps[0].y = y;
    this.dot.setPosition(x, y);
    this.rect.setPosition(x - ITEM_WIDTH / 2, y - ITEM_HEIGHT * 1.5);
    this.text.setPosition(x, y - ITEM_HEIGHT);
  },
  _afterChildrenLayout: function(mx, my) {
    var dx;
    var traces = this.traces;
    var dp = this.dot.points[0];
    var px = dp.x;
    var py = dp.y;
    this.children.forEach(function(child, idx) {
      var trace = traces[idx];
      var ps = trace.points;
      var cp = child.points[0];
      if (child.__x >= 0) {
        dx = cp.x - ITEM_WIDTH / 2 + PADDING + DOT_RADIUS;
      } else {
        dx = cp.x + ITEM_WIDTH / 2 - PADDING - DOT_RADIUS;
      }
      ps[0].x = px;
      ps[0].y = py;
      ps[3].x = dx;
      ps[3].y = cp.y;
      ps[1].x = px + (dx - px ) / 4;
      ps[1].y = cp.y - (cp.y - py) / 3;
      ps[2].x = dx - (dx - px) / 4;
      ps[2].y = py + (cp.y - py) / 3;
    });
  },
  expand: {
    get: function() {
      return this._expand;
    },
    set: function(val) {
      this._expand = val;
    }
  },
  render: function(ctx, ectx) {
    if (this.state === 'wait') {
      return;
    }
    this._doRender(ctx);
    if (this._expand) {
      this.children.forEach(function(node) {
        node.render(ctx, ectx);
      });
    }
  },
  _doRender: function(ctx) {
    if (this.children.length > 0 && this._expand) {
        this.traces.forEach(function(trace) {
          trace.render(ctx);
        });
    }
    this.rect.render(ctx);
    this.text.render(ctx);
    if (this.children.length > 0) {
      this.dot.render(ctx);
    }
  }
}, AbstractTreeNode);

var TreeNode = Class(function TreeNode(x, y, parent, options) {
  this.base(x, y, parent, options);
  this.parent = parent;
  this.rect.fillStyle = '#f3f5f7';
  this.rect.strokeStyle = '#efefef';
}, {
  _afterLayout: function(x, y) {
    var ps = this.points;
    ps[0].x = x;
    ps[0].y = y;
    this.dot.setPosition(x - ITEM_WIDTH / 2 + PADDING + DOT_RADIUS, y);
    this.rect.setPosition(x - ITEM_WIDTH / 2, y - ITEM_HEIGHT / 2);
    this.text.setPosition(x, y);
  },
  _afterChildrenLayout: function() {
    var traces = this.traces;
    var dp = this.dot.points[0];
    var px = dp.x;
    var py = dp.y;

    this.children.forEach(function(child, idx) {
      var trace = traces[idx];
      var ps = trace.points;
      var cd = child.dot.points[0];
      var cx = cd.x;
      var cy = cd.y;
      ps[0].x = px;
      ps[0].y = py;
      ps[3].x = cx;
      ps[3].y = cy;
      ps[1].x = px + (cx - px ) / 4;
      ps[1].y = cy - (cy - py) / 3;
      ps[2].x = cx - (cx - px) / 4;
      ps[2].y = py + (cy - py) / 3;
    });
  }
}, RootTreeNode);

module.exports = Class(function BasicTree(topX, topY, javasManager, treeData) {
  this.base(javasManager, [], {});

  var tree = this;

  this.root = new RootTreeNode(0, 0, tree, {
    text: treeData.text
  });

  function build(node, parentShape) {
    var dc = node.children;
    var nc = parentShape.children;
    var i;
    for (i = 0; i < dc.length; i++) {
      parentShape._appendChild(new TreeNode(0, 0, parentShape, {
        text: dc[i].text
      }));
      build(dc[i], nc[i]);
    }
  }

  build(treeData, this.root);

  TreeLayout.layout(this.root, {
    topX: topX,
    topY: topY,
    minMargin: 30
  });

}, {
  render: function(ctx) {
    this.root.render(ctx);
  }
}, BaseShape);