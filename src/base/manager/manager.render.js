var Class = require('j-oo');
var Manager = require('./manager.main.js');
var Config = require('../../util/conf.js');
var JColor = require('../../color/color.js');
var _ = require('../../util/util.js');

Class.partial(Manager, function() {

  this.loopDelegate = _.bind(this, this._loopHandler);
  this.loopIntervalTime = 1000 / this.FPS;
  this.loopNextIntervalTime = 0;
  this.loopStartTime = 0;

  this._loopRunning = false;
  this._fps_show = Config.showFPS;
  this._fps_time = 0;
  this._fps_count = 0;

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