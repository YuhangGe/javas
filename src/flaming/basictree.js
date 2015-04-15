var Class = require('j-oo');
var BaseShape = require('../base/shape.js');
var TextShape = require('./simpletext.js');
var FreeBezierShape = require('../shapes/freebezier.js');
var JPoint = require('../base/point.js');
var CircleShape = require('../shapes/circle.js');

var RootTreeNode  = Class(function RootTreeNode(centerX, centerY, options) {
  this.base([new JPoint(0, 0)], options);

  this.text = new TextShape(0, 0, {
    width: 100,
    height: 30,
    text: options.text,
    fillStyle: '#F3F5F7'
  });
  this.dot = new CircleShape(centerX, centerY, 20, {
    fillStyle: '#00C8FE'
  });

  this.leftTrace = new FreeBezierShape(JPoint.createArray(4), {
    parent: this,
    strokeStyle: '#f6f6f6'
  });
  this.rightTrace = new FreeBezierShape(JPoint.createArray(4), {
    parent: this,
    strokeStyle: '#f6f6f6'
  });

  this.leftNode = null;
  this.rightNode = null;

  this._expand = false;

  this.setPosition(centerX, centerY);

}, {
  setPosition: function(centerX, centerY) {
    var ps = this.points;
    var cx = this.centerX;
    var cy = this.centerY;
    var l_ps = this.leftTrace.points;
    var r_ps = this.rightTrace.points;
    var TRACE_X = 100;
    var TRACE_Y = 80;

    ps[0].x = centerX;
    ps[0].y = centerY;

    r_ps[0].x = centerX;
    r_ps[0].y = centerY;
    r_ps[2].x = centerX + TRACE_X;
    r_ps[2].y = centerY + TRACE_Y;
    r_ps[1].x = centerX + TRACE_X * 0.5;
    r_ps[1].y = centerY + TRACE_Y * 0.5;



  },
  expand: {
    get: function() {
      return this._expand;
    },
    set: function(val) {
      this._expand = val;
      this.leftNode.state = val ? 'stable' : 'wait';
      this.rightNode.state = val ? 'stable' : 'wait';
    }
  },
  onRender: function(ctx) {
    if (this.state === 'wait') {
      return;
    }
    this._onRender(ctx);
    if (this.leftNode) {
      this.leftNode.onRender(ctx);
    }
    if (this.rightNode) {
      this.rightNode.onRender(ctx);
    }
  },
  _doRender: function(ctx) {

    //draw traces
    this.leftTrace.render(ctx);
    //draw children

    //draw text

    //draw dot
  }
}, BaseShape);

var TreeNode = Class(function TreeNode() {

}, {

}, RootTreeNode);

module.exports = Class(function BasicTree(topX, topY, treeData) {
  this.rootNode = new RootTreeNode(topX, topY, {
    text: treeData.title
  });

  function walk(node, parentShape) {
    var shape;
    if (node.leftNode) {
      shape = new TreeNode({
        text: node.leftNode.title,
        parent: parentShape
      });
      parentShape.addLeftChild(shape);
      walk(node.leftNode, shape);
    }
    if (node.rightNode) {
      shape = new TreeNode({
        text: node.rightNode.title,
        parent: parentShape
      });
      parentShape.addRightChild(shape);
      walk(node.rightNode, shape);
    }
  }

  walk(treeData, this.rootNode);

}, {
  render: function(ctx) {
    this.root.render(ctx);
  }
}, BaseShape);