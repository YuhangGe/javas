var Class = require('j-oo');
var BaseShape = require('../../base/shape.js');
var TextShape = require('./../simpletext.js');
var BezierShape = require('../../shapes/bezier.js');
var JPoint = require('../../base/struct/point.js');
var TreeDotShape = require('./treedot.js');
var RectShape = require('../../shapes/rect.js');
var TreeLayout = require('../../math/treelayout.js');
var DOT_RADIUS = 8;
var ITEM_WIDTH = 170;
var ITEM_HEIGHT = 35;
var TRACE_LINE_WIDTH = 8;
var PADDING = 6;
var _ = require('../../util/util.js');

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

  this.dot = new TreeDotShape(this, {
    radius: DOT_RADIUS,
    fillStyle: '#00C8FE',
    crossColor: '#ffffff',
    crossLineWidth: 2,
    expand: options.expand !== false
  });

  var me = this;
  this.dot.on('mousedown', function(event) {
    me.expand = !me._expand;
  });

  this.traces = [];

  this._expand = options.expand !== false;
}, {
  _layout: function() {
    this.container._layout();
  },
  _afterLayout: function(x, y) {
    var ps = this.points;
    ps[0].x = x;
    ps[0].y = y;
    this.dot.setPosition(x, y);
    this.rect.setPosition(x - ITEM_WIDTH / 2, y - ITEM_HEIGHT * 1.5);
    this.text.setPosition(x, y - ITEM_HEIGHT);
  },
  _afterChildrenLayout: function() {
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
      if (this._expand === val) {
        return;
      }
      this._expand = val;
      this.dot.expand = val;
      var p = this.dot.points[0];
      var pre_x = p.x;
      this._layout();
      if (p.x - pre_x !== 0) {
        this.container._adjustX(pre_x - p.x);
      }
    }
  },
  render: function(ctx, ectx) {
    if (this.state === 'wait') {
      return;
    }
    if (this.children.length > 0 && this._expand) {
      this.traces.forEach(function(trace) {
        trace.render(ctx, ectx);
      });
    }
    this.rect.render(ctx, ectx);
    this.text.render(ctx, ectx);
    if (this.children.length > 0) {
      this.dot.render(ctx, ectx);
    }
    if (this._expand) {
      this.children.forEach(function(node) {
        node.render(ctx, ectx);
      });
    }
  },
  _adjustX: function(dx) {
    this.container._adjustX(dx);
  }
}, AbstractTreeNode);

var TreeNode = Class(function TreeNode(x, y, parent, options) {
  this.base(x, y, parent, options);
  this.parent = parent;
  this.rect.fillStyle = '#f3f5f7';
  this.rect.strokeStyle = '#efefef';
}, {
  _layout: function(x, y) {
    /*
     * 非root节点，向上递归到root节点重新排版。
     */
    this.parent._layout(x, y);
  },
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
  this.base(javasManager, [new JPoint(topX, topY)], {});

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
        text: dc[i].text,
        expand: dc[i].expand !== false
      }));
      build(dc[i], nc[i]);
    }
  }

  build(treeData, this.root);

  this._layout();
}, {
  _adjustX: function(dx) {
    this.container.adjust(dx, 0);
  },
  _moveTo: function(x, y) {
    this.points[0].x = x;
    this.points[0].y = y;
    TreeLayout.move(this.root, x, y);
    this.paint();
  },
  _layout: function() {
    TreeLayout.layout(this.root, {
      topX: this.points[0].x,
      topY: this.points[0].y,
      minMargin: 30
    });
  },
  render: function(ctx, ectx) {
    this.root.render(ctx, ectx);
  }
}, BaseShape);