var _ = require('../util/util.js');
var BaseShape = require('../base/shape.js');
var baseOptions = require('../base/option.js');
var Class = require('j-oo');

var defaultOptions = _.mergeOptions({
  /*
   * animate代表使用的动画，从添加到JManager之后的进入动画。
   * property[@time-function] [start-time]
   * 其中，start-time:
   *   忽略，添加后立即开始
   *   '0'/'2s'/'300ms'这样的参数，添加后延迟时间开始
   *   after anotherAnimateName 0/2s/300ms 在其它动画开始后多少时间后开始
   *   wait anotherAniamteName 0/2s/300ms 在其它动画结束后多少时间开始，省略数值代表立刻开始
   *   notify myAnimateName 等待其它动画/Shape/代码通过调用JManager的notify函数通知后才开始。
   * 其中，time-function，动画的时间函数，类似于css3动画的timing-function
   *   忽略，默认为linear
   *   linear/ease/ease-in/ease-out/... 预设好的时间函数
   *   aniMyLinear,... 自定义的时间函数，必须以ani开头。
   */
  animate: 'opacity@linear 0',
  /*
   * onRender参数如果提供，则animate参数失效。这个参数提供一个绘图函数，可以完全自定义绘制形状，以及控制动画。
   * 如果onRender参数都不能满足，则可以自己写一个继承自LineShape的Class，重写其onRender函数。
   */
  onRender: function(ctx) {

  }
}, baseOptions);

module.exports = Class(function LineShape(x1, y1, x2, y2) {
  this.base();
  this.x1 = x1;
  this.y1 = y1;
  this.x2 = x2;
  this.y2 = y2;
}, {
  _doRender: function(ctx) {
    ctx.drawLine(this.x1, this.y1, this.x2, this.y2);
  },
  addAnimate: function() {
    this.state = 'animating';

  }
}, BaseShape);


