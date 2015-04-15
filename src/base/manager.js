var _ = require('../util/util.js');
var Config = require('../util/conf.js');
var ShapeList = require('./list.js');
var JCavnas = require('./canvas.js');
var Class = require('j-oo');
var JAnimation = require('./animation.js');
var JColor = require('../color/color.js');

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

module.exports = Class(function Manager(target, options) {

  options = _.mergeOptions(options, defaultOptions);

  var FPS = options.FPS;
  _.log('Javas Manager Created. FPS:', FPS);

  /*
   * 当前版本假设target一定是canvas.
   * todo check target, if target is not canvas, create new Canvas element.
   */
  this.canvas = new JCavnas(target);
  this.context = this.canvas.context;

  this.loopDelegate = _.bind(this, this._loopHandler);
  this.loopIntervalTime = 1000 / FPS;
  this.loopNextIntervalTime = 0;
  this.loopStartTime = 0;
  //this.loopConfigTime = Config.loopIntervalTime;
  //this.loopHalfConfigTime = Math.floor(Config.loopIntervalTime / 2);

  this._loopRunning = false;
  this._fps_show = Config.showFPS;
  this._fps_time = 0;
  this._fps_count = 0;

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

  /*
   * start loop
   */
  this._loopStart();

}, {
  loopRunning: {
    get: function() {
      return this._loopRunning;
    },
    set: function(val) {
      if (this._loopRunning === val) {
        return;
      }
      this._loopRunning = val;
      if (val) {
        this._fps_time = _.now();
        this._fps_count = 0;
        this._loopStart();
      }
    }
  },
  width: {
    get: function() {
      return this.canvas.width;
    },
    set: function(width) {
      this.canvas.width = width;
    }
  },
  height: {
    get: function() {
      return this.canvas.width;
    },
    set: function(height) {
      this.canvas.height = height;
    }
  },
  unitX: {
    get: function() {
      return this.context.unitX;
    },
    set: function(val) {
      this.context.unitX = val;
    }
  },
  unitY: {
    get: function() {
      return this.context.unitY;
    },
    set: function(val) {
      this.context.unitY = val;
    }
  },
  unitS: {
    get: function() {
      return this.context.unitS;
    },
    set: function(val) {
      this.context.unitS = val;
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
  },
  notifyAnimation: function (shapeName) {

  },
  paint: function() {
    var ctx = this.context;
    ctx.clear();
    ctx.save();
    ctx.scale(this.scaleX, this.scaleY);
    ctx.translate(this.offsetX, this.offsetY);
    this._paintShapes(ctx);
    this._paintFPS(ctx, _.now());
    ctx.restore();
  },
  _paintShapes: function(ctx) {
    var paused = true;
    this.shapeList.forEach(function(shape) {

      if (shape.state === 'run' || shape.state === 'stable') {
        ctx.save();
        shape.render(ctx);
        ctx.restore();
      }

      if(paused && shape.state !== 'stable') {
        paused = false;
      }
    });
    /*
     * 如果没有动画并且所有元素都达到了稳定状态，则可以不再重复绘制。
     */
    this.loopRunning = this._animationList.length > 0 || !paused;
  },
  _paintFPS: function(ctx, nowTime) {
    if (!this._fps_show) {
      return;
    }
    ctx.fillStyle = JColor.CHOCOLATE;
    ctx.font = '15px Arial';
    ctx.textBaseline = 'top';
    ctx.textAlign = 'left';
    var info = 'FPS: stop';
    if (this._loopRunning) {
      info = 'FPS: ' + (this._fps_count / (nowTime - this._fps_time) * 1000).toFixed(2);
    }
    ctx.fillText(info, 10, 10);
  },
  _loopHandler: function () {
    var curTime = _.now();
    if (curTime >= this.loopNextIntervalTime) {
      this._loopRender(curTime);
      this._fps_count++;
      this.loopNextIntervalTime += this.loopIntervalTime;
    }
    if (this._loopRunning) {
      requestAnimationFrame(this.loopDelegate);
    }
  },
  _loopRender: function (curTime) {
    //_.log('loop render:', curTime);
    var ctx = this.context;
    var aniNotifyMap = this._aniNotifyMap;

    ctx.clear();
    ctx.save();
    ctx.save(this.scaleX, this.scaleY);
    ctx.translate(this.offsetX, this.offsetY);

    var all_finish = true;
    this._animationList.forEach(function(ani) {
      if (ani.state === 'delay' && curTime > ani.startTime) {
        ani.start(curTime);
      } else if (ani.state === 'run') {
        ani.execute(curTime);
        ani.notifies.forEach(function(noti) {
          if (aniNotifyMap.has(noti.target)) {
            if ((noti.time && curTime >= ani.startTime + noti.time) || ani.state === 'stable') {
              var list = aniNotifyMap.get(noti.target);
              list.forEach(function(target) {
                target.startTime += curTime;
                if (curTime === target.startTime) {
                  target.start(curTime);
                } else {
                  target.state = 'delay';
                }
              });
              list.length = 0;
            }
          }
        });
      }
      if (ani.state !== 'stable') {
        all_finish = false;
      }
    });

    if (all_finish) {
      this._animationList.length = 0;
    }

    /*
     * 绘制图形
     */
    this._paintShapes(ctx);

    /*
     * 绘制FPS信息。放在最后绘制，保证绘制在最顶部。
     */
    this._paintFPS(ctx, curTime);

    ctx.restore();
  },

  _loopStart: function () {
    this.loopStartTime = this._fps_time = _.now();
    this.loopNextIntervalTime = this.loopStartTime + this.loopIntervalTime;
    /*
     * 开始主循环。
     */
    window.requestAnimationFrame(this.loopDelegate);

  }
});
