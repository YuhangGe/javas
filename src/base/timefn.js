var _ = require('../util/util.js');

_.extend(module.exports, {
  'linear': timefn(linear, 0, 0, 1, 1),
  'quadratic-in': timefn(quad_in),
  'ease': timefn(cubic_bezier),
  'ease-in': timefn(cubic_bezier, 0.42, 0, 1, 1),
  'cubic-bezier': function(px0, py0, px1, py1) {
    if (Math.max(px0, py0, px1, py1) > 1
      || Math.min(px0, py0, px1, py1) < 0) {
      return timefn(linear, 0, 0, 1, 1);
    }
    return timefn(cubic_bezier, px0, py0, px1, py1);
  }
});

function linear(t) {
  return t;
}

function quad_in(k) {
  var s = 1.70158;
  return k * k * ((s + 1) * k - s);
}

function cubic_bezier(t, px0, py0, px1, py1) {
  var t2 = t * t;
  var t3 = t * t * t; // 不清楚Math.pow(t, 3)和 t * t * t哪个性能更好，但相信如果性能有显著差异，虚拟机会自动优化
  var pt = 1 - t;
  var pt2 = pt * pt;
  var pt3 = pt * pt * pt;

  return 3 * pt2 * t * px0 + 3 * pt * t2 * px1 + t*t*t
}

function timefn(fn, a, b, c, d) {
  return function(startTime, curTime, endTime, fromValue, toValue) {
    var dt = endTime - startTime;
    var dc = curTime - startTime;
    return fn(dc / dt, a, b, c, d) * (toValue - fromValue) + fromValue;
  }
}