var _ = require('../util/util.js');
/**
 * 树的较美观排版算法。
 * 算法的思想来自：http://emr.cs.iit.edu/~reingold/tidier-drawings.pdf
 *
 */
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

var levelIndexes = [];
var MIN_MARGIN = 40;
var LEVEL_MARGIN = 90;

/*
 * 深度遍历整棵树，将每个节点加入到每一层的levelIndexes里。
 * 同时，__cLevel保存了当前节点的高度（含本身和子节点）。
 *   获取__cLevel的思想是，当前节点的高度 = Max(所有子节点高度) + 1
 */
function walkLevel(node, level) {
  if (levelIndexes.length < level + 1) {
    levelIndexes.push([]);
  }
  var indexes = levelIndexes[level];
  indexes.push(node);
  if (node.children.length === 0 || !node.expand) {
    node.__cLevel = 1;
  } else {
    var i;
    for (i = 0; i < node.children.length; i++) {
      walkLevel(node.children[i], level + 1);
    }
    var m = 0;
    for (i = 0; i < node.children.length; i++) {
      m = Math.max(m, node.children[i].__cLevel);
    }
    node.__cLevel = m + 1;
  }

  node.__left_bound = new Float32Array(node.__cLevel);
  node.__right_bound = new Float32Array(node.__cLevel);
}

function walkRelative() {
  var level, j, nodes, n_len;
  var node;

  for (level = levelIndexes.length - 1; level >= 0; level--) {
    nodes = levelIndexes[level];
    n_len = nodes.length;

    for (j = 0; j < n_len; j++) {
      node = nodes[j];
      if (node.__cLevel === 1) {
        node.__x = 0;
        node.__left_bound[0] = -node.__w / 2;
        node.__right_bound[0] = node.__w / 2;
      } else {
        move(node.children, node);
      }
    }
  }

  function move(children, node) {
    function log() {
      if (node.id === '0-0-0-2') {
        console.log.apply(console, arguments);
      }
    }
    var i, len = children.length - 1;
    var n_a, n_b, n_f = children[0];
    var cLevel;
    var mLevel;
    var l_a = n_f.__left_bound;
    var r_a = n_f.__right_bound;
    var l_b, r_b;

    var _len = node.__cLevel - 1;
    var right = new Float32Array(_len);
    var left = new Float32Array(_len);
    left.fill(0xfffffff0);

    var maxR, tmp;
    var j;

    n_f.__x = 0;
    for (j = 0; j < n_f.__cLevel; j++) {
      //l_a[j] = 0;
      right[j] = r_a[j];
      left[j] = l_a[j];
    }
    mLevel = n_f.__cLevel;
    //log(right);

    for (i = 1; i <= len; i++) {
      n_a = children[i - 1];
      n_b = children[i];
      cLevel = mLevel > n_b.__cLevel ? n_b.__cLevel : mLevel;
      mLevel = mLevel > n_b.__cLevel ? mLevel : n_b.__cLevel;

      l_b = n_b.__left_bound;
      r_b = n_b.__right_bound;
      maxR = 0;
      for (j = 0; j < cLevel; j++) {
        tmp = right[j] + MIN_MARGIN - l_b[j];
        if (maxR < tmp) {
          maxR = tmp;
        }
      }
      //log(right);
      //log(l_b);
      //log('maxR:', maxR, cLevel);
      n_b.__x = maxR;

      for (j = 0; j < n_b.__cLevel; j++) {
        right[j] = maxR + r_b[j];
        tmp = maxR + l_b[j];
        if (tmp < left[j]) {
          left[j] = tmp;
        }
      }
      //console.log(right);

    }
    //console.log(right);
    var center = children[len].__x / 2;
    //console.log('c:', center);
    for (i = 0; i <= len; i++) {
      children[i].__x -= center;
      //console.log(children[i].__x);
    }

    var r = node.__right_bound;
    var l = node.__left_bound;
    l[0] = -node.__w / 2;
    r[0] = node.__w / 2;
    for (j = 1; j < node.__cLevel; j++) {
      r[j] = right[j -  1] - center;
      l[j] = left[j - 1] - center;
    }
    //console.log(node.__right_bound);
    //console.log(node.__left_bound);

  }
}

function walkAbsolute(chs, px, py) {
  var i, len = chs.length;
  var n;
  var x, y;
  for (i = 0; i < len; i++) {
    n = chs[i];
    x = n.__x + px;
    y = py + LEVEL_MARGIN;
    n._afterLayout(x, y);
    if (chs[i].expand) {
      walkAbsolute(chs[i].children, x, y);
    }
    n._afterChildrenLayout(x, y);
  }
}

function layout(treeRoot, options) {
  options = _.mergeOptions(options, {
    topX: 0,
    topY: 0,
    minMargin: 40,
    levelMargin: 90
  });
  MIN_MARGIN = options.minMargin;
  LEVEL_MARGIN = options.levelMargin;

  walkLevel(treeRoot, 0);
  walkRelative();
  treeRoot._afterLayout(options.topX, options.topY);
  walkAbsolute(treeRoot.children, options.topX, options.topY);
  treeRoot._afterChildrenLayout(options.topX, options.topY);

  //levelIndexes.forEach(function(lev) {
  //  var l = [];
  //  lev.forEach(function(node) {
  //    l.push(node.__x + '(' + node.points[0] + ')');
  //  });
  //  console.log(l.join('  '));
  //});
  //
  //console.log(treeRoot);

  levelIndexes.length = 0;
}

module.exports.layout = layout;
