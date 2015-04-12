var _ = require('../util/util.js');
var Config = require('../util/conf.js');
var ShapeList = require('./list.js');
var JCavnas = require('./canvas.js');
var Class = require('j-oo');
var JAnimation = require('./animation.js');

var defaultOptions = {
  FPS: 80,
  unitX: 1,
  unitY: 1,
  unitS: 1,
  offsetX: 0,
  offsetY: 0
};

module.exports = Class(function Manager(target, options) {
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
  this._animationMap = new Map();
  this._aniNotifyMap = new Map();


  if (options.width) {
    this.width = options.width;
  }
  if (options.height) {
    this.height = options.height;
  }
  this.unitX = options.unitX;
  this.unitY = options.unitY;
  this.unitS = options.unitS;

  this.offsetX = options.offsetX;
  this.offsetY = options.offsetY;

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
  setSize: function (width, height) {
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
    if (!this._animationMap.has(shape.id)) {
      this._animationMap.set(shape.id, []);
    }
    this.loopRunning = true; //通知重绘（如果已经停止）
    // 返回自身，方便链式调用
    return this;
  },
  addAnimation: function(shapeId, animation) {
    var ani_list = this._animationMap.get(shapeId);
    var now = Date.now();

    var start = animation.start; // = animation.startTime ? animation.startTime + now : now;
    var shape = this.shapeList.getById(shapeId);
    var startTime;
    var wait = false;
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
      property: animation.property,
      timeFn: animation.timeFn,
      fromValue: animation.fromValue,
      toValue: animation.toValue,
      notifies: animation.notifies
    });
    ani_list.push(ani);

    if (wait) {
      ani.state = 'wait';
      w_arr.push(ani);
    } else if (startTime === now) {
      ani.start(shape, now);
    }
    //_.log(ani);
    //_.log('add', ani.startTime, ani.endTime, now);
    return ani.id;
  },
  notifyAnimation: function (shapeName) {

  },
  paint: function() {
    var ctx = this.context;
    ctx.clear();
    ctx.save();
    ctx.translate(this.offsetX, this.offsetY);
    this.shapeList.forEach(function(shape) {
      if (shape.state !== 'wait') {
        ctx.save();
        //_.log('do render');
        shape.onRender(ctx);
        ctx.restore();
      }
    });
    ctx.restore();
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
    //_.log('loop render:', curTime);
    var paused = true;
    var ctx = this.context;
    var aniMap = this._animationMap;
    var aniNotifyMap = this._aniNotifyMap;

    ctx.clear();
    ctx.save();
    ctx.translate(this.offsetX, this.offsetY);

    this.shapeList.forEach(function(shape) {

      var ani_list = aniMap.get(shape.id);
      var all_finish = true;
      var all_waiting = ani_list.length > 0;
      ani_list.forEach(function(ani) {
        if (ani.state === 'delay' && curTime > ani.startTime) {
          ani.start(shape, curTime);
        } else if (ani.state === 'run') {
          ani.execute(shape, curTime);
          //_.log('exec:', ani.id);
          ani.notifies.forEach(function(noti) {
            if (aniNotifyMap.has(noti.target)) {
              if ((noti.time && curTime >= ani.startTime + noti.time) || ani.state === 'stable') {
                var list = aniNotifyMap.get(noti.target);
                //_.log('notifies:', noti.target, list.length);
                list.forEach(function(target) {
                  target.startTime += curTime;
                  if (curTime === target.startTime) {
                    target.start(shape, curTime);
                  } else {
                    target.state = 'delay';
                  }
                });
                list.length = 0;
              }

            }
          });

          if (ani.state === 'stable') {
            ani.notifies.length = 0;
          }

        }
        if (ani.state !== 'stable') {
          all_finish = false;
        }
        if (ani.state !== 'wait') {
          all_waiting = false;
        }
      });

      if (all_finish) {
        ani_list.length = 0;
        shape.state = 'stable';
      }
      if (all_waiting) {
        shape.state = 'wait';
      }
      if (shape.state !== 'wait') {
        ctx.save();
        //_.log('do render');
        shape.onRender(ctx);
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
    this.loopStartTime = Date.now();
    this.loopNextIntervalTime = this.loopStartTime + this.loopIntervalTime;
    /*
     * 开始主循环。
     */
    setInterval(this.loopDelegate, this.loopConfigTime);
  }
});
