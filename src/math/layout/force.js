var create_quad_tree = require('./quadtree.js');
var $ = require('../../util/util.js');
var Class = require('j-oo');
var JLoopAnimation = require('../../animation/loop.js');

function getDefaultOptions(options) {
  var def = {
    width: 1,
    height: 1,
    friction : .9,
    linkDistance : 100,
    linkStrength : 1,
    charge : -200,
    chargeDistance2 : Infinity,
    gravity: 0.1,
    theta2: 0.64
  };
  if (options) {
    $.merge(def, options);
    if (!isNaN(options.theta)) {
      def.theta2 = options.theta * 2;
    }
    if (!isNaN(options.chargeDistance)) {
      def.chargeDistance2 = options.chargeDistance * 2;
    }
  }
  return def;
}

module.exports = Class(function ForceLayout(javasManager, nodes, links, options) {
  this.base(javasManager);
  options = getDefaultOptions(options);
  this.width = options.width;
  this.height = options.height;
  this.nodes = nodes;
  this.links = links;
  this.alpha = 0.1;
  this.friction = options.friction;
  this.linkDistance = 100;
  this.linkStrength = 1;
  this.charge = options.charge;
  this.chargeDistance2 = options.chargeDistance2;
  this.gravity = options.gravity;
  this.theta2 = options.theta2;
  this.distances = new Float32Array(links.length);
  this.strengths = new Float32Array(links.length);
  this.charges = new Float32Array(nodes.length);
  this.neighbors = new Array(nodes.length);

  this._init();

  $.log(this);
}, {
  run: function() {
    this.alpha = 0.1;
    this.callBase('run');
  },
  _init: function() {
    var me = this;
    this.nodes.forEach(function(node, idx) {
      node.__index = idx;
      node.__weight = 0;
    });
    this.links.forEach(function(link) {
      link.fromNode.__weight++;
      link.toNode.__weight++;
    });
    fill.call(this.neighbors, []);
    this.links.forEach(function(link) {
      me.neighbors[link.fromNode.__index].push(link.toNode);
      me.neighbors[link.toNode.__index].push(link.fromNode);
    });

    this.nodes.forEach(function(node, idx) {
      if (isNaN(node.x)) node.x = position("x", me.width, idx);
      if (isNaN(node.y)) node.y = position("y", me.height, idx);
      if (isNaN(node.px)) node.px = node.x;
      if (isNaN(node.py)) node.py = node.y;
    });
    this.distances.fill(this.linkDistance);
    this.strengths.fill(this.linkStrength);
    this.charges.fill(this.charge);



    // inherit node position from first neighbor with defined position
    // or if no such neighbors, initialize node position randomly
    // initialize neighbors lazily to avoid overhead when not needed
    function position(dimension, size, i) {
      var candidates = me.neighbors[i],
        j = -1,
        l = candidates.length,
        x;
      while (++j < l) {
        if (!isNaN(x = candidates[j][dimension])) {
          return x;
        }
      }
      return Math.random() * size;
    }
  },
  _repulse: function(node) {
    var me = this;
    return function(quad, x1, _, x2) {
      var k;
      if (quad.point !== node) {
        var dx = quad.cx - node.x,
          dy = quad.cy - node.y,
          dw = x2 - x1,
          dn = dx * dx + dy * dy;

        /* Barnes-Hut criterion. */
        if (dw * dw / me.theta2 < dn) {
          if (dn < me.chargeDistance2) {
            k = quad.charge / dn;
            node.px -= dx * k;
            node.py -= dy * k;
          }
          return true;
        }

        if (quad.point && dn && dn < me.chargeDistance2) {
          k = quad.pointCharge / dn;
          node.px -= dx * k;
          node.py -= dy * k;
        }
      }
      return !quad.charge;
    };
  },
  execute: function() {
    var me = this;
    // simulated annealing, basically
    if ((this.alpha *= .99) < .005) {
      this.alpha = 0;
      this.stop();
      return;
    }
    // gauss-seidel relaxation for links
    this.links.forEach(function(link, i) {
      var s = link.fromNode;
      var t = link.toNode;
      var x = t.x - s.x;
      var y = t.y - s.y;
      var l;
      if (l = (x * x + y * y)) {
        l = me.alpha * me.strengths[i] * ((l = Math.sqrt(l)) - me.distances[i]) / l;
        x *= l;
        y *= l;
        t.x -= x * (k = s.__weight / (t.__weight + s.__weight));
        t.y -= y * k;
        s.x += x * (k = 1 - k);
        s.y += y * k;
      }
    });

    var k = this.alpha * this.gravity;
    // apply gravity forces
    if (k) {
      this.nodes.forEach(function(node) {
        node.x += (me.width / 2 - node.x) * k;
        node.y += (me.height / 2 - node.y) * k;
      });
    }

    // compute quadtree center of mass and apply charge forces
    if (this.charge) {
      var q = create_quad_tree(this.nodes);
      d3_layout_forceAccumulate(q, this.alpha, this.charges);
      this.nodes.forEach(function(node) {
        if (!node.fixed) {
          q.visit(me._repulse(node));
        }
      })
    }

    // position verlet integration
    this.nodes.forEach(function(node) {
      if (node.fixed) {
        node.x = node.px;
        node.y = node.py;
      } else {
        node.x -= (node.px - (node.px = node.x)) * me.friction;
        node.y -= (node.py - (node.py = node.y)) * me.friction;
      }

      var p = node.points[0];
      p.x = node.x;
      p.y = node.y;
    });
  }
}, JLoopAnimation);

/*
 * 当浏览器不支持fill时，添加polyfill
 */
if (!Float32Array.prototype.fill) {
  Float32Array.prototype.fill = fill;
}
function fill(val) {
  var i, len = this.length;
  for(i = 0; i < len; i++) {
    this[i] = val;
  }
}



function d3_layout_forceAccumulate(quad, alpha, charges) {
  var cx = 0,
    cy = 0;
  quad.charge = 0;
  if (!quad.leaf) {
    var nodes = quad.nodes,
      n = nodes.length,
      i = -1,
      c;
    while (++i < n) {
      c = nodes[i];
      if (c == null) continue;
      d3_layout_forceAccumulate(c, alpha, charges);
      quad.charge += c.charge;
      cx += c.charge * c.cx;
      cy += c.charge * c.cy;
    }
  }
  if (quad.point) {
    // jitter internal nodes that are coincident
    if (!quad.leaf) {
      quad.point.x += Math.random() - .5;
      quad.point.y += Math.random() - .5;
    }
    var k = alpha * charges[quad.point.__index];
    quad.charge += quad.pointCharge = k;
    cx += k * quad.point.x;
    cy += k * quad.point.y;
  }
  quad.cx = cx / quad.charge;
  quad.cy = cy / quad.charge;
}
