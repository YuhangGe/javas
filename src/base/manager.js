var _ = require('../util/util.js');

module.exports = Manager;

var LOOP_INTERVAL_TIME = 10;
var LOOP_MAX_FPS = Math.floor(1000 / LOOP_INTERVAL_TIME);
var LOOP_HALF_INTERVAL_TIME = Math.floor(LOOP_INTERVAL_TIME);

var defaultOptions = {
  FPS: 30,
  fitContainer: true,
  unitLength: 10
};

function Manager(target, options) {
  this.options = _.mergeOptions(options, Manager.defaultOptions);

  var FPS = this.options.FPS;
  if (FPS > LOOP_MAX_FPS) {
    console.warn('已忽略的option, FPS 当前版本最大只能设置为', LOOP_MAX_FPS);
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
  //this.loopTimeout = null;
  this.loopIntervalTime = Math.floor(1000 / FPS);
  this.loopRunning = false;
  this.loopStartTime = 0;
  this.loopPreviousTime = 0;
  this.loopTotalDurationTime = 0;
  this.loopNextIntervalTime = 0;

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

    var deltaTime = this.loopNextIntervalTime - this.loopPreviousTime;

    if (deltaTime < LOOP_HALF_INTERVAL_TIME) {

      //todo

      this.loopNextIntervalTime += this.loopIntervalTime;
    }

    this.loopTotalDurationTime = curTime - this.loopStartTime;

  },
  _loopCheck: function () {

  },
  _loopStart: function () {
    this.loopStartTime = Date.now();
    this.loopPreviousTime = this.loopStartTime;
    this.loopNextIntervalTime = this.loopStartTime + this.loopIntervalTime;
    /*
     * 开始主线程循环。
     */
    setInterval(this.loopDelegate, LOOP_INTERVAL_TIME);
  },
  loop: function () {
    if (this.loopRunning) {
      return;
    }
    if (this._loopCheck()) {
      this._loopStart();
    }
  }
};

_.defineGetterSetter(__manager_prototype, 'unitLength', function () {
  return this._unitLength;
}, function (val) {
  this._unitLength = val;
  _.error('todo: implemented.')
});

