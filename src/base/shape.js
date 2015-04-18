var _ = require('../util/util.js');
var Class = require('j-oo');
var baseOptions = require('./option.js');
var ShapeList = require('./struct/list.js');
var JColor = require('../color/color.js');

module.exports = Class(function BaseShape(points, options) {
  _.assert(_.isArray(points));
  _.assert(options);

  this.id = _.uid();
  this.state = options.state ? options.state : 'stable'; // wait, run, stable
  this._rac = 0; //running animation count;
  this.parent = options.parent ? options.parent : null;
  this.children = new ShapeList();
  this.points = points;

  this._strokeStyle = false;
  this._fillStyle = false;

  this.lineWidth = options.lineWidth ? options.lineWidth : baseOptions.lineWidth;
  this.lineCap = options.lineCap ? options.lineCap : baseOptions.lineCap;
  this.lineJoin = options.lineJoin ? options.lineJoin : baseOptions.lineJoin;
  this.opacity = options.opacity ? options.opacity : baseOptions.opacity;

  this.strokeStyle = options.strokeStyle ? options.strokeStyle : false;
  this.fillStyle = options.fillStyle ? options.fillStyle : false;

  this._spbr = options.setPropertyBeforeRender !== false;
  this._eventMap = new Map();
  /*
   * 这个参数会在Manager.addShape时设置，指向Manager的引用。
   */
  this._javasManager = null;

}, {
  strokeStyle: {
    get: function() {
      return this._strokeStyle;
    },
    set: function(val) {
      if (!val) {
        this._strokeStyle = false;
      } else if (_.isString(val)){
        this._strokeStyle = new JColor(val);
      } else {
        this._strokeStyle = val;
      }
    }
  },
  fillStyle: {
    get: function() {
      return this._fillStyle;
    },
    set: function(val) {
      if (!val) {
        this._fillStyle = false;
      } else if (_.isString(val)){
        this._fillStyle = new JColor(val);
      } else {
        this._fillStyle = val;
      }
    }
  },
  addEventListener: function(eventName, handler) {
    var em = this._eventMap;
    var e_array = em.get(eventName);
    if (!e_array) {
      e_array = [];
      em.set(eventName, e_array);
    }
    if (e_array.indexOf(handler) < 0) {
      e_array.push(handler);
    }
    this._javasManager.registerShapeEvent(this, eventName); //向Manager注册事件监听。
  },
  _onEventFire: function(eventName, jEvent) {

  },
  runningAnimationCount: {
    get: function() {
      return this._rac;
    },
    set: function(val) {
      this._rac = val < 0 ? 0 : val;
      if (this._rac === 0) {
        this.state = 'stable';
      } else {
        this.state = 'run';
      }
    }
  },
  color: {
    get: function() {
      return this.fillStyle;
    },
    set: function(color) {
      this.strokeStyle = color;
      this.fillStyle = color;
    }
  },
  _doRender: function(ctx) {
    _.warn('abstract method');
  },
  render: function(ctx) {
    if (this._spbr) {
      ctx.lineWidth = this.lineWidth;
      ctx.globalAlpha = this.opacity;
      ctx.lineCap = this.lineCap;
      ctx.lineJoin = this.lineJoin;
      if (this.strokeStyle) {
        ctx.strokeStyle = this.strokeStyle;
      }
      if (this.fillStyle) {
        ctx.fillStyle = this.fillStyle;
      }
    }
    this._doRender(ctx);
  }
});