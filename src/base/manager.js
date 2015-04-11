var _ = require('../util/util.js');
var Config = require('../util/conf.js');
var ShapeList = require('./list.js');
var JCavnas = require('./canvas.js');
var Class = require('j-oo');

module.exports = Manager;


var defaultOptions = {
  FPS: 30,
  fitContainer: true,
  unitLength: 10
};

function Manager(target, options) {
  this.options = _.mergeOptions(options, defaultOptions);

  var FPS = this.options.FPS;
  var LOOP_MAX_FPS = Math.floor(1000 / Config.loopIntervalTime);
  if (FPS > LOOP_MAX_FPS) {
    console.warn('已忽略的option, FPS 最大只能设置为', LOOP_MAX_FPS);
    FPS = LOOP_MAX_FPS;
  } else if (FPS <= 0) {
    _.error('错误的option, FPS 必须大于等于1')
  }
  /*
   * 当前版本假设target一定是canvas.
   * todo check target, if target is not canvas, create new Canvas element.
   */
  this.canvas = new JCavnas(target);
  this.context = this.canvas.context;

  this.loopDelegate = _.bind(this, this._loopHandler);
  this.loopIntervalTime = Math.floor(1000 / FPS);
  this.loopNextIntervalTime = 0;
  this.loopStartTime = 0;
  this.loopConfigTime = Config.loopIntervalTime;
  this.loopHalfConfigTime = Math.floor(Config.loopIntervalTime / 2);

  this.loopRunning = false;

  this.shapeList = new ShapeList();

  this.resizeDelegate = _.bind(this, this.resizeHandler);

  this.width = 0;
  this.height = 0;
  this.originWidth = 0;
  this.originHeight = 0;
  this._unitLength = this.options.unitLength;
  this._originUnitLength = this.options.unitLength;

  this._init();

  this._loopStart();

}
var __manager_prototype = Manager.prototype = {
  _init: function () {
    if (this.options.fitContainer) {
      //window.addEventListener('resize', this.resizeDelegate);
      //this._fitSize();
      //this.originWidth = this.width;
      //this.originHeight = this.height;
    } else {
      //todo
    }

  },
  _fitSize: function () {
    var w = this.container.offsetWidth;
    var h = this.container.offsetHeight;
    this.canvas.width = this.width = w;
    this.canvas.height = this.height = h;
  },
  _resizeHandler: function () {
    this._fitSize();

  },
  setSize: function (width, height, isRelativeToUnitLength) {
    _.error('todo');
  },
  getSize: function (isRelativeToUnitLength) {
    _.error('todo');
  },
  addShape: function (shape) {
    if (!_.isObject(shape)) {
      _.error('shape is not Object');
    }
    var zIndex = shape.options.zIndex;
    if (zIndex === 'top') {
      this.shapeList.push(shape);
    } else if (zIndex === 'bottom') {
      this.shapeList.unshift(shape);
    } else {
      this.shapeList.add(shape, zIndex);
    }

    var animate = shape.options.animate;
    if (animate) {

    }
    this.loopRunning = true; //通知重绘（如果已经停止）
  },
  notifyAnimation: function (shapeName) {

  },
  repaint: function() {
    /*
     * 强制重绘，只需要简单设置loopRunning = true，则会重新绘制一次。
     */
    this.loopRunning = true;
  },
  _loopHandler: function () {
    var curTime = Date.now();
    var deltaTime = this.loopNextIntervalTime - curTime;
    if (deltaTime < this.loopHalfConfigTime) {
      if (this.loopRunning) {
        this._loopRender(curTime);
      }
      this.loopNextIntervalTime = curTime + this.loopIntervalTime;
    }
  },
  _loopRender: function (curTime) {
    _.log('loop render');
    var paused = true;
    this.shapeList.forEach(function(shape) {

      if(paused && shape.state !== 'stable') {
        paused = false;
      }
    });
    /*
     * 如果所有元素都达到了稳定状态，则可以不再重复绘制。
     */
    this.loopRunning = paused;
  },

  _loopStart: function () {
    this.loopStartTime = Date.now();
    this.loopNextIntervalTime = this.loopStartTime + this.loopIntervalTime;
    /*
     * 开始主循环。
     */
    setInterval(this.loopDelegate, this.loopConfigTime);
  }
};

_.defineGetterSetter(__manager_prototype, 'unitLength', function () {
  return this._unitLength;
}, function (val) {
  this._unitLength = val;
  _.error('todo: implemented.')
});

