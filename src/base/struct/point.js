var Class = require('j-oo');
var JPoint = Class(function JPoint(x, y) {
  this.x = x;
  this.y = y;
}, {
  toString: function() {
    return '[' + this.x + ', ' + this.y + ']';
  }
});

module.exports = JPoint;
/**
 * 生成空Point，如果number为 空/0， 则返回一个Point；否则，返回一个空Point的数组。
 * @param number Point的数量，可忽略
 * @returns {Array} | {JPoint}
 */
JPoint.create = function(number) {
  if (!number) {
    return new JPoint(0, 0);
  }
  var rtn = [];
  for (var i = 0; i < number; i++) {
    rtn.push(new JPoint(0, 0));
  }
  return rtn;
};
JPoint.copy = function(points, destPoints) {
  var len = points.length;
  destPoints = destPoints ? destPoints : new Array(len);
  for (var i = 0; i < len; i++) {
    var p = points[i];
    if (destPoints[i]) {
      destPoints[i].x = p.x;
      destPoints[i].y = p.y;
    } else {
      destPoints[i] = new JPoint(p.x, p.y);
    }
  }
  return destPoints;
};
