/**
 * 树的较美观排版算法。
 * 算法的思想来自：http://emr.cs.iit.edu/~reingold/tidier-drawings.pdf
 *
 */

var levelIndexes = [];
var levelTmpLeft;
var levelTmpRight;
var MIN_MARGIN = 40;
var LEVEL_MARGIN = 90;

function walkLevel(node, level) {
  if (levelIndexes.length < level + 1) {
    levelIndexes.push([]);
  }
  var indexes = levelIndexes[level];
  indexes.push(node);
  node.__level_at = level;

  var i;
  for (i = 0; i < node.children.length; i++) {
    walkLevel(node.children[i], level + 1);
  }
}

function walkRelative() {
  var level, j, nodes, n_len;
  var node, chs;

  for (level = levelIndexes.length - 1; level >= 0; level--) {
    nodes = levelIndexes[level];
    n_len = nodes.length;

    for (j = 0; j < n_len; j++) {
      node = nodes[j];
      chs = node.children;
      if (chs.length === 0) {
        node.__left_bound = -node.width / 2;
        node.__right_bound = node.width / 2;
      } else if (chs.length === 1) {
        if (chs[0].__x !== 0) {
          throw 'something wrong';
        }
        node.__left_bound = chs[0].__left_bound;
        node.__right_bound = chs[0].__right_bound;
      } else {
        move(chs, node);
      }

    }
  }

  function move(children, node) {
    var i, len = children.length - 1;
    var n_b;
    var right = children[0].__right_bound;
    for (i = 1; i <= len; i++) {
      n_b = children[i];

      if (!(n_b.__left_bound < 0 && n_b.__right_bound > 0)) {
        throw 'assert failure';
      }

      n_b.__x = right + MIN_MARGIN - n_b.__left_bound;
      right = n_b.__x + n_b.__right_bound;

    }
    var center = children[len].__x / 2;
    for (i = 0; i <= len; i++) {
      children[i].__x -= center;
    }

    if (!(children[0].__x < 0)) {
      throw 'assert failure';
    }
    node.__right_bound = right + children[0].__x;
    node.__left_bound = children[0].__x + children[0].__left_bound;

  }
}

function walkAbsolute(chs, px, py) {
  var i, len = chs.length;
  var n;
  for (i = 0; i < len; i++) {
    n = chs[i];
    n.p.x = n.__x + px;
    n.p.y = py + LEVEL_MARGIN;
    walkAbsolute(chs[i].children, n.p.x, n.p.y);
  }
}

function layout(treeRoot) {
  levelIndexes.length = 0;
  walkLevel(treeRoot, 0);
  levelTmpLeft = new Float32Array(levelIndexes.length);
  levelTmpRight = new Float32Array(levelIndexes.length);

  walkRelative();
  walkAbsolute(treeRoot.children, treeRoot.p.x, treeRoot.p.y);

  console.log(treeRoot);
  /*
   *
   */
  //levelTmpLeft = null;
  //levelTmpRight = null;

}

module.exports.layout = layout;
