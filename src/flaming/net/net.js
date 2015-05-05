var Class = require('j-oo');
var BaseShape = require('../../base/shape.js');
var _ = require('../../util/util.js');
var JPoint = require('../../base/struct/point.js');
var NetNodeShape = require('./node.js');
var NetLinkShape = require('./link.js');
var ForceLayout = require('../../math/layout/force.js');

module.exports = Class(function NetShape(javasManager, netData, options) {
  options = options || {};
  this.base(javasManager, [new JPoint(0, 0)], options);
  this.nodes = [];
  this.links = [];

  var me = this;
  netData.nodes.forEach(function(n, idx) {
    var node = new NetNodeShape(new JPoint(0, 0), me, {
      fillStyle: n.fillStyle ? n.fillStyle : '#48c8f8',
      data: n.data,
      radius: n.radius
    });
    node.__index = idx;
    node.__weight = 0;
    node.__dp = {x: 0, y: 0};
    node
      .on('dragstart', function() {
        node.fixed = true;
      })
      .on('drag', function() {
        var p = node.points[0];
        node.x = node.px = p.x;
        node.y = node.py = p.y;
        me.layout.run();
      })
      .on('dragend', function() {
        node.fixed = false;
        me.layout.run();
      });
    me.nodes.push(node);
  });
  netData.links.forEach(function(link) {
    var fn = me.nodes[link.from];
    var tn = me.nodes[link.to];
    var link = new NetLinkShape(fn, tn, me, {
      strokeStyle: options.linkColor ? options.linkColor: '#999999',
      opacity: options.linkOpacity ? options.linkOpacity : 0.6,
      lineWidth: link.lineWidth ? link.lineWidth : 2
    });
    fn.outNodes.push(tn);
    tn.inNodes.push(fn);
    me.links.push(link);
  });

  this.layout = new ForceLayout(javasManager, this.nodes, this.links, {
    width: javasManager.width,
    height: javasManager.height
  });
  javasManager._animationList.push(this.layout);
}, {
  render: function(ctx, ectx) {
    this.links.forEach(function(link) {
      link.render(ctx, ectx);
    });
    this.nodes.forEach(function(node) {
      node.render(ctx, ectx);
    });
  },
  destroy: function() {
    /*
     * 解除网状关联，防止潜在可能的内存泄露
     */
    this.nodes.forEach(function(node) {
      node.inNodes.length = 0;
      node.outNodes.length = 0;
    });
    this.links.forEach(function(link) {
      link.fromNode = null;
      link.toNode = null;
    });
    this.nodes.length = 0;
    this.links.length = 0;
  }
}, BaseShape);