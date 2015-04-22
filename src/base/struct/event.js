var Class = require('j-oo');
var _ = require('../../util/util.js');

module.exports = Class(function JEvent(ev) {
  //this.target = targetShape;
  /*
   * x, y 是在当前targetShape里的相对位置。
   * 这个相对位置根据每个Shape的不同，会有不一样的计算方法。
   * 比如（只是可能）：
   *   针对Rect，则是相对左上角。
   *   针对Circle，则是相对圆心。
   *   针对Line，则是相对第一个点。
   *   ...
   */
  //this.x = 0;
  //this.y = 0;
  /*
   * originX, originY 是在整个Canvas里的位置，也就是DOM元素上的offsetX, offsetY
   */
  this.originEvent = ev;
  this.x = ev.layerX;
  this.y = ev.layerY;
  this.ctrlKey = ev.ctrlKey || ev.metaKey;
  this.deltaX = 0;
  this.deltaY = 0;
  this.keyCode = ev.keyCode;
}, {
  stop: function() {
    this.originEvent.stopPropagation();
    this.originEvent.preventDefault();
  }
});