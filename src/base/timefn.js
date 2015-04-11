var _ = require('../util/util.js');

_.extend(module.exports, {
  linear: function(startTime, curTime, endTime, fromValue, toValue) {
    var t = endTime - startTime;
    var d = curTime - startTime;
    return  Math.min(1, d / t) * (toValue - fromValue) + fromValue;
  },
  ease: function() {
    //todo
  }
});