var _ = require('../../util/util.js');
var ShapeList = require('../struct/list.js');
var JCavnas = require('../canvas.js');
var Class = require('j-oo');
var JAnimation = require('../animation.js');
var JColor = require('../../color/color.js');
/**
 * 默认的参数。
 * FPS：期待的FPS，最大值由浏览器决定。（通常是130左右）
 *
 */
var defaultOptions = {
  FPS: 80,
  unitX: 1.0,
  unitY: 1.0,
  offsetX: 1.0,
  offsetY: 1.0,
  scaleX: 1.0,
  scaleY: 1.0
};

function rgb2str(data) {
  return 'rgb(' + data[0] + ',' + data[1] + ',' + data[2] + ')';
}

module.exports = Class(function Manager(target, options) {

  options = _.mergeOptions(options, defaultOptions);

  this.FPS = options.FPS;
  _.log('Javas Manager Created. FPS:', this.FPS);

  /*
   * 当前版本假设target一定是canvas.
   * todo check target, if target is not canvas, create new Canvas element.
   */
  this.canvas = new JCavnas(target);
  this.context = this.canvas.context;
  this._ecanvas = new JCavnas(document.createElement('canvas'));
  this._econtext = this._ecanvas.getContext('2d');

  this.shapeList = new ShapeList();
  this._animationList = [];
  this._aniNotifyMap = new Map();


  this.width = options.width;
  this.height = options.height;

  this.unitX = options.unitX;
  this.unitY = options.unitY;

  this.offsetX = options.offsetX;
  this.offsetY = options.offsetY;
  this.scaleX = options.scaleX;
  this.scaleY = options.scaleY;

  this._chooseColor = new Uint8Array(4);
  this._chooseMap = new Map();

}, {
  _nextChooseColor: function() {
    var cc = this._chooseColor;
    cc[3] = (cc[3] + 1) % 3;
    cc[cc[3]]++;
    return rgb2str(cc);
  },
  width: {
    get: function() {
      return this.canvas.width;
    },
    set: function(width) {
      this.canvas.width = width;
      this._ecanvas.width = width;
    }
  },
  height: {
    get: function() {
      return this.canvas.width;
    },
    set: function(height) {
      this.canvas.height = height;
      this._ecanvas.height = height;
    }
  },
  unitX: {
    get: function() {
      return this.context.unitX;
    },
    set: function(val) {
      this.context.unitX = val;
      this._econtext.unitX = val;
    }
  },
  unitY: {
    get: function() {
      return this.context.unitY;
    },
    set: function(val) {
      this.context.unitY = val;
      this._econtext.unitY = val;
    }
  },
  resize: function (width, height) {
    this.width = width;
    this.height = height;
  },
  getSize: function () {
    _.error('todo');
  },
  addShape: function (shape, zIndex) {
    _.assert(_.isObject(shape));
    if (_.isUndefined(zIndex) || zIndex === 'top') {
      this.shapeList.push(shape);
    } else if (zIndex === 'bottom') {
      this.shapeList.unshift(shape);
    } else {
      this.shapeList.add(shape, zIndex);
    }
    var chooseColor = this._nextChooseColor();
    shape._chooseColor = new JColor(chooseColor);
    this._chooseMap.set(chooseColor, shape);

    this.loopRunning = true; //通知重绘（如果已经停止）
    // 返回自身，方便链式调用
    return this;
  },
  _chooseShape: function(x, y) {
    var dt = this._econtext.getImageData(x, y, 1, 1);
    var cd = dt.data;
    var k;
    if (cd[3] === 255 && this._chooseMap.has((k = rgb2str(cd)))) {
      return this._chooseShape.get(k);
    } else {
      return null;
    }
  },
  addAnimation: function(animation) {
    var now = window.performance.now();
    var start = animation.start;
    var wait = false;
    var startTime;
    if (_.isUndefined(start)) {
      startTime = now;
    } else if (_.isObject(start)) {
      _.assert(start.waitFor);
      var w_arr = this._aniNotifyMap.get(start.waitFor);
      if (!w_arr) {
        w_arr = [];
        this._aniNotifyMap.set(start.waitFor, w_arr);
      }
      startTime = start.delay ? start.delay : 0;
      wait = true;
    } else {
      startTime = start + now;
    }

    var ani = new JAnimation({
      addTime: now,
      duration: animation.duration,
      timeFn: animation.timeFn,
      notifies: animation.notifies,
      targets: animation.targets
    });
    this._animationList.push(ani);

    if (wait) {
      ani.state = 'wait';
      w_arr.push(ani);
    } else if (startTime === now) {
      ani.start(now);
    } else {
      ani.state = 'delay';
      ani.startTime = startTime;
    }
    return ani.id;
  }
});
