var _ = require('../util/util.js');
var Config = require('../util/conf.js');

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
  this.canvas = target;
  this.ctx = target.getContext('2d');
  this.container = target.parentElement;

  this.loopDelegate = _.bind(this, this._loopHandler);
  this.loopIntervalTime = Math.floor(1000 / FPS);
  this.loopNextIntervalTime = 0;
  this.loopStartTime = 0;
  this.loopConfigTime = Config.loopIntervalTime;
  this.loopHalfConfigTime = Math.floor(Config.loopIntervalTime / 2);

  this.loopRunning = false;

  this.shapeList = [];

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
      window.addEventListener('resize', this.resizeDelegate);
      this._fitSize();
      this.originWidth = this.width;
      this.originHeight = this.height;
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

  },
  notifyAnimation: function (shapeName) {

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

  },
  _loopCheck: function () {
    //todo

    //this.loopRunning = true/false;
  },
  _loopStart: function () {
    this.loopStartTime = Date.now();
    this.loopNextIntervalTime = this.loopStartTime + this.loopIntervalTime;
    /*
     * 开始主线程循环。
     */
    setInterval(this.loopDelegate, this.loopConfigTime);
  },
  loop: function () {
    if (this.loopRunning) {
      return;
    }
    this._loopCheck();
  }
};

_.defineGetterSetter(__manager_prototype, 'unitLength', function () {
  return this._unitLength;
}, function (val) {
  this._unitLength = val;
  _.error('todo: implemented.')
});

