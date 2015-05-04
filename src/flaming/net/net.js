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
      .on('mousedown', function() {
        _.log('md', node.id);
        _.log(node.points[0]);
        node.fixed = true;
        var p = node.points[0];
        node.__dp.x = node.px;
        node.__dp.y = node.py;
        _.log(node.__dp);
      })
      .on('mousedrag', function(ev) {
        var p = node.points[0];
        //node.py = node.x = p.x = node.__dp.x + ev.deltaX;
        //node.py = node.y = p.y = node.__dp.y + ev.deltaY;
        p.x = node.x = node.px = node.__dp.x + ev.deltaX;
        p.y = node.y = node.py = node.__dp.y + ev.deltaY;
        //node.paint();
        me.layout.run();
      })
      .on('mouseup', function(ev) {

        node.fixed = false;
        //node.py = ev.x;
        //node.px = ev.y;
        node.px = node.__dp.x + ev.deltaX;
        node.py = node.__dp.y + ev.deltaY;
        _.log(ev.x, ev.y, ev.deltaX, ev.deltaY);
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