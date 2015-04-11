var _ = require('./util.js');
var Point = require('./point.js');

module.exports = {
  getMiddlePoint: function(p1, p2) {
    return new Point((p1.x + p2.x) / 2, (p1.y + p2.y) / 2);
  }
};