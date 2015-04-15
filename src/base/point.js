var Class = require('j-oo');
var JPoint = Class(function JPoint(x, y) {
  this.x = x;
  this.y = y;
}, {
  //todo 以后可能需要进行二维向量计算
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
