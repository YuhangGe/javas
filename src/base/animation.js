var Class = require('j-oo');
var TimeFns = require('./timefn.js');
var _ = require('../util/util.js');

module.exports = Class(function JAnimation(options) {
  this.id = _.uid();
  this.state = 'delay'; // 'wait', 'run', 'stable', 'loop'
  this.addTime = options.addTime ? options.addTime : window.performance.now();
  this.startTime = 0;
  this.duration = options.duration ? options.duration : 0;
  this.isLoop = options.isLoop ? true : false;
  this.property = options.property;
  this.fromValue = options.fromValue;
  this.toValue = options.toValue;
  this.notifies = _.isArray(options.notifies) ? options.notifies : [];
  this.targets = _.isArray(options.targets) ? options.targets : [];
  /*
   * timeFn参数可以是自定义的时间函数，也可以是使用预设的时间函数名称的字符串。
   * 如果忽略这个参数，或者传入的时间函数不存在，则默认使用linear
   */
  this.timeFn = options.timeFn ? (_.isFunction(options.timeFn) ? options.timeFn : (_.hasProperty(TimeFns, options.timeFn) ? TimeFns[options.timeFn] : TimeFns.linear)) : TimeFns.linear;
}, {
  add: function(target) {
    [].push.apply(this.targets, arguments);
  },
  start: function(curTime) {
    this.targets.forEach(function(target) {
      if (_.isUndefined(target.fromValue)) {
        target.fromValue = target.shape[target.property];
      }
      if (_.isUndefined(target.toValue)) {
        target.toValue = target.shape[target.property];
      }
      target.shape.runningAnimationCount++;
    });
    this.state = 'run';
    this.startTime = curTime;
  },
  execute: function(curTime) {
    var cd = curTime - this.startTime;
    var k = this.timeFn(cd / this.duration);
    var isEnd = cd >= this.duration;
    this.targets.forEach(function(target) {
      target.shape[target.property] = isEnd ? target.toValue : target.fromValue + (target.toValue - target.fromValue) * k;
      if (isEnd) {
        target.shape.runningAnimationCount--;
      }
    });
    if (isEnd) {
      this.state = 'stable';
    }
  }
});

