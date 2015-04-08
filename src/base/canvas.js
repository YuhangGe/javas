var _ = require('../util/util.js');
var JContext = require('./context.js');

module.exports = JCanvas;

function JCanvas(originCanvas) {
  this.originCanvas = originCanvas;
  this.canvas = originContext2d.canvas;
}
var __jcanvas_prototype = JCanvas.prototype = {
  getContext: function(type) {
    if (type !== '2d') {
      _.warn('todo. ')
    } else {
      return new JContext(this);
    }
  }
};

_.defineGetterSetter(__jcanvas_prototype, 'width', function() {
  return this.originCanvas.width;
}, function(val) {
  /*
   * todo 结合unitLength自动配置scale
   */
  this.originCanvas.width = val;
});

_.defineGetterSetter(__jcanvas_prototype, 'height', function() {
  return this.originCanvas.height;
}, function(val) {
  /*
   * todo 结合unitLength自动配置scale
   */
  this.originCanvas.height = val;
});
