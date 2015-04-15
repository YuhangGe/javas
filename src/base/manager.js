var _ = require('../util/util.js');
var Config = require('../util/conf.js');
var ShapeList = require('./list.js');
var JCavnas = require('./canvas.js');
var Class = require('j-oo');
var JAnimation = require('./animation.js');

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

  this.loopRunning = false;

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
    this.shapeList.forEach(function(shape) {
      if (shape.state !== 'wait') {
        ctx.save();
        //_.log('do render');
        shape.render(ctx);
        ctx.restore();
      }
    });
    ctx.restore();
  },
  _loopHandler: function () {
    var curTime = window.performance.now();
    if (curTime >= this.loopNextIntervalTime) {
      if (this.loopRunning) {
        this._loopRender(curTime);
      }
      this.loopNextIntervalTime += this.loopIntervalTime;
    }
    requestAnimationFrame(this.loopDelegate);
  },
  _loopRender: function (curTime) {
    //_.log('loop render:', curTime);
    var paused = true;
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

    this.shapeList.forEach(function(shape) {

      if (shape.state !== 'wait') {
        ctx.save();
        shape.render(ctx);
        ctx.restore();
      }

      if(paused && shape.state !== 'stable') {
        paused = false;
      }
    });
    /*
     * 如果所有元素都达到了稳定状态，则可以不再重复绘制。
     */
    this.loopRunning = !paused;

    ctx.restore();
  },

  _loopStart: function () {
    this.loopStartTime = window.performance.now();
    this.loopNextIntervalTime = this.loopStartTime + this.loopIntervalTime;
    /*
     * 开始主循环。
     */
    window.requestAnimationFrame(this.loopDelegate);

  }
});
