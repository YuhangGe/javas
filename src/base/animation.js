var Class = require('j-oo');
var TimeFns = require('./timefn.js');
var _ = require('../util/util.js');

module.exports = Class(function JAnimation(options) {
  this.id = _.uid();
  this.state = 'delay'; // 'wait', 'run', 'stable', 'loop'
  this.addTime = options.addTime ? options.addTime : Date.now();
  this.startTime = 0;
  this.duration = options.duration ? options.duration : 0;
  this.endTime = 0;
  this.isLoop = options.isLoop ? true : false;
  this.property = options.property;
  this.fromValue = options.fromValue;
  this.toValue = options.toValue;
  this.notifies = _.isArray(options.notifies) ? options.notifies : [];
  //this.onStart = null;
  //this.onFinish = null;
  /*
   * timeFn参数可以是自定义的时间函数，也可以是使用预设的时间函数名称的字符串。
   * 如果忽略这个参数，或者传入的时间函数不存在，则默认使用linear
   */
  this.timeFn = options.timeFn ? (_.isFunction(options.timeFn) ? options.timeFn : (_.hasProperty(TimeFns, options.timeFn) ? TimeFns[options.timeFn] : TimeFns.linear)) : TimeFns.linear;
}, {
  start: function(shape, curTime) {
    shape.state = 'run';
    if (_.isUndefined(this.fromValue)) {
      this.fromValue = shape[this.property];
    }
    this.state = 'run';
    this.startTime = curTime;
    this.endTime = curTime + this.duration;
  },
  execute: function(shape, curTime) {
    shape[this.property] = this.timeFn(this.startTime, curTime, this.endTime, this.fromValue, this.toValue);
    if (curTime >= this.endTime) {
      this.state = 'stable';
    }
  }
});

