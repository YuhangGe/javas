var _ = require('../../../util/util.js');

module.exports = {
  init: init,
  step: step,
  layout: layout
};
/*
 * 当浏览器不支持fill时，添加polyfill
 */
if (!Float32Array.prototype.fill) {
  Float32Array.prototype.fill = function(val) {
    var i, len = this.length;
    for(i = 0; i < len; i++) {
      this[i] = val;
    }
  }
}
var iter = 0;
var nodes, links;
var size;
var WIDTH, HEIGHT, MARGIN;
var K, K2;
var centerNodeIndex;
var deltaX, deltaY;

var THRESHOLD = 250;
var UPPER_THRESHOLD = THRESHOLD * THRESHOLD;
var LOWER_THRESHOLD = 30 * 30;
var ejectfactor = 2;
var ejectfactor2 = 5;
var condensefactor = 20;
var maxt = 4;
var maxty = 3;

var bx1, by1, bx2, by2;

function layout(net, options) {
  init(net, options);
  for (var i = 0; i < options.maxStep ? options.maxStep : 300; i++) {
    step();
  }
}

function init(net, options) {
  nodes = net.nodes;
  links = net.links;
  WIDTH = options.width ? options.width : 500;
  HEIGHT = options.height ? options.height : 300;
  MARGIN = options.margin ? options.margin : 20;
  size = nodes.length;
  deltaX = new Float32Array(size);
  deltaY = new Float32Array(size);
  iter = 0;
  WIDTH -= 2 * MARGIN;
  HEIGHT -= 2 * MARGIN;

  var area = WIDTH * HEIGHT;
  K = Math.sqrt(size / area);
  K2 = area / size;

  bx1 = MARGIN;
  by1 = MARGIN;
  bx2 = WIDTH - MARGIN;
  by2 = HEIGHT - MARGIN;

  findCenterNode();
  randomPosition();
}

function findCenterNode() {
  var i, n;
  centerNodeIndex = 0;
  var cn = nodes[0];
  for (i = 1; i < size; i++) {
    n = nodes[i];
    if (cn.inNodes.length + cn.outNodes.length < n.inNodes.length + n.outNodes.length) {
      cn = n;
      centerNodeIndex = i;
    }
  }
}

function randomPosition() {
  var i, n, p;
  var cw = WIDTH / 2;
  var ch = HEIGHT / 2;
  for (i = 0; i < size; i++) {
    n = nodes[i];
    p = n.points[0];
    if (i === centerNodeIndex) {
      p.x = cw;
      p.y = ch;
      //_.log(p);
    } else {
      p.x = cw + (Math.random() >= 0.5 ? 1 : -1) *  Math.random() * 50;
      p.y = ch + (Math.random() >= 0.5 ? 1 : -1) *  Math.random() * 50;
    }
  }
}

function step() {
  deltaX.fill(0);
  deltaY.fill(0);
  adjustParams(iter);
  calcRepulsion();
  calcElastic();
  calcPosition();
  iter++;
  return iter;
}

/*
 * 根据迭代的次数，动态调整算法的参数。
 * 力导向算法是一种模拟算法，跟遗传算法类似，依赖一些经验值的算法参数。
 */
function adjustParams(iter) {
  ejectfactor = 2;
  ejectfactor2 = 5;

  if (iter < 50) {
    maxt = 4;
    maxty = 3;
    condensefactor = 5;
  } else if (iter < 75) {
    maxt = 3;
    maxty = 2;
  } else if (iter < 100) {
    maxt = 2;
    maxty = 2;
  } else if (iter < 125) {
    maxt = 1;
    maxty = 1;
  } else {
    maxt = 1;
    maxty = 1;
  }
  //if (iter < 20) {
  //  render_freq = 0
  //} else if (iter < 60) {
  //  render_freq = 1
  //} else if (iter >= 60 && iter < 100) {
  //  render_freq = 2
  //} else if (iter >= 100 && iter < 130) {
  //  render_freq = 3
  //} else if (iter >= 130 && iter < 180) {
  //  render_freq = 4
  //} else if (iter >= 180) {
  //  render_freq = 5
  //}
  //render_freq += TotalNodes / 100 + 1
}

/*
 * 计算两个节点之间的互斥力，把节点用电子模拟，使用库仑定律计算。
 * F = k * p1 * p2 / (r ^ 2)
 */
function calcRepulsion() {
  var dx, dy, r2, f;
  var v, u;
  var p1, p2;
  for (v = 0; v < size; v++) {
    p1 = nodes[v].points[0];
    for (u = 0; u < size; u++) {
      if (u == v) {
        continue;
      }
      p2 = nodes[u].points[0];
      dx = p1.x - p2.x;
      dy = p1.y - p2.y;
      r2 = dx * dx + dy * dy;

      if (r2 < UPPER_THRESHOLD) {
        if (r2 < LOWER_THRESHOLD) {
          ejectfactor = ejectfactor2
        }
        f = K2 * ejectfactor / r2; //库仑定律
        if (v === centerNodeIndex) {
          deltaX[u] += dx * f;
          deltaY[u] += dy * f;
        } else {
          deltaX[v] += dx * f;
          deltaY[v] += dy * f;
        }

      }
    }
  }
}

/*
 * 计算两个节点之间的弹力，把节点之间的联系用弹簧模拟，使用胡克定律计算.
 * F = k * |s - s0|
 */
function calcElastic() {
  var cur_x, cur_y;
  var dx, dy, f;
  var v;
  var nf, nt;
  var si, ei;
  var pt, pf;
  var size = links.length;
  for (v = 0; v < size; v++) {
    nf = links[v].fromNode;
    nt = links[v].toNode;
    si = nf.__index;
    ei = nt.__index;
    pf = nf.points[0];
    pt = nt.points[0];
    dx = pf.x - pt.x;
    dy = pf.y - pt.y;
    f = Math.sqrt(dx * dx + dy * dy) * K * condensefactor; //胡克定律
    cur_x = dx * f;
    cur_y = dx * f;
    if (si === centerNodeIndex) {
      deltaX[ei] += cur_x;
      deltaY[ei] += cur_y;
    } else {
      deltaX[si] -= cur_x;
      deltaY[si] -= cur_y;
    }
    if (ei === centerNodeIndex) {
      deltaX[si] -= cur_x;
      deltaY[si] -= cur_y;
    } else {
      deltaX[ei] += cur_x;
      deltaY[ei] += cur_y;
    }
  }
}

function calcPosition() {
  var cur_x, cur_y;
  var dx, dy;
  var r;
  var v, p;
  for (v = 0; v < size; v++) {
    p = nodes[v].points[0];
    dx = deltaX[v];
    dy = deltaY[v];
    r = nodes[v].radius;
    if (dx < -maxt) {
      dx = -maxt;
    } else if (dx > maxt) {
      dx = maxt;
    }
    if (dy < -maxty) {
      dy = -maxty;
    } else if (dy > maxty) {
      dy = maxty;
    }
    cur_x = p.x + dx;
    cur_y = p.y + dy;

    if (cur_x + r > bx2)
      cur_x = bx2 - r;
    if (cur_x - r < bx1)
      cur_x = bx1 + r;
    if (cur_y + r > by2)
      cur_y = by2 - r;
    if (cur_y - r < by1)
      cur_y = by1 + r;

    p.x = cur_x;
    p.y = cur_y;
  }
}