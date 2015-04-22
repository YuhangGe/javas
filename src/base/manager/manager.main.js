var _ = require('../../util/util.js');
var ShapeList = require('../struct/list.js');
var JCavnas = require('../canvas.js');
var Class = require('j-oo');
var JAnimation = require('../animation.js');
var JColor = require('../../color/color.js');

var defaultOptions = {
  FPS: 80,
  unitX: 1.0,
  unitY: 1.0,
  offsetX: 1.0,
  offsetY: 1.0,
  scaleX: 1.0,
  scaleY: 1.0,
  lineJoin: 'round',
  lineCap: 'round',
  lineWidth: 3,
  cursor: 'default'
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
  target.setAttribute('tabindex', 1);

  this.context = this.canvas.context;
  this._ecanvas = new JCavnas(document.createElement('canvas'));
  this._econtext = this._ecanvas.context;
  this._defaultCursor = options.cursor;
  this._cursor = '';

  this.shapeList = new ShapeList();
  this._animationList = [];
  this._aniNotifyMap = new Map();


  this.width = options.width;
  this.height = options.height;

  this.unitX = options.unitX;
  this.unitY = options.unitY;
  this.lineJoin = options.lineJoin;
  this.lineCap = options.lineCap;
  this.lineWidth = options.lineWidth;
  this._offsetX = options.offsetX;
  this._offsetY = options.offsetY;
  this.scaleX = options.scaleX;
  this.scaleY = options.scaleY;

  this._chooseColor = new Uint8Array(3);
  this._chooseMap = new Map();

  this.cursor = this._defaultCursor;

}, {

  offsetX: {
    get: function() {
      return this._offsetX;
    },
    set: function(val) {
      if (this._offsetX === val) {
        return;
      }
      this._offsetX = val;
      this.paintIfNeed();
    }
  },
  offsetY: {
    get: function() {
      return this._offsetY;
    },
    set: function(val) {
      if (this._offsetY === val) {
        return;
      }
      this._offsetY = val;
      this.paintIfNeed();
    }
  },
  cursor: {
    get: function() {
      return this._cursor;
    },
    set: function(val) {
      if (this._cursor === val) {
        return;
      }
      this.canvas._originCanvas.style.cursor = this._cursor = val;
    }
  },
  _nextChooseId: function() {
    var cc = this._chooseColor;
    function inc(idx, cc) {
      try {
        cc[idx]++;
      } catch(e) {
        debugger;
      }
      if (cc[idx] === 0xFF) {
        inc(idx + 1, cc);
        cc[idx] = 0;
      }
    }
    inc(0, cc);
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
    this.loopRunning = true; //通知重绘（如果已经停止）
    // 返回自身，方便链式调用
    return this;
  },
  registerEventShape: function(shape) {
    if (shape._chooseId) {
      //已经注册过了
      return;
    }
    shape._chooseId = this._nextChooseId();
    shape._chooseColor = new JColor(shape._chooseId);
    this._chooseMap.set(shape._chooseId, shape);
  },
  _chooseShape: function(x, y) {
    var dt = this._econtext.getImageData(x, y, 1, 1);
    var cd = dt.data;
    //_.log(x, y);
    var k;
    if (cd[3] === 255 && this._chooseMap.has((k = rgb2str(cd)))) {
      return this._chooseMap.get(k);
    } else {
      return null;
    }
  },
  addAnimation: function(animation) {
    var now = _.now();
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
    _.assert(animation.duration);
    _.assert(animation.targets);

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
