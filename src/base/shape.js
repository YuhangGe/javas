var _ = require('../util/util.js');
var Class = require('j-oo');
var baseOptions = require('./option.js');
var JColor = require('../color/color.js');

function getStyle(sty) {
  if (!sty) {
    return false;
  } else if (_.isString(sty)) {
    return new JColor(sty);
  } else {
    return sty;
  }
}

module.exports = Class(function BaseShape(container, points, options) {
  _.assert(_.isArray(points));
  _.assert(options);

  this.id = _.uid();
  /*
   * container 是Shape所在的容器，可能是javasManager，也可能是GroupShape
   */
  this.container = container;
  this.state = options.state ? options.state : 'stable'; // wait, run, stable
  this.points = points;
  this.cursor = options.cursor ? options.cursor : container.cursor;

  this._chooseId = '';
  this._chooseColor = null;
  this._rac = 0; //running animation count;

  this._opacity = options.opacity ? options.opacity : baseOptions.opacity;
  this._lineWidth = options.lineWidth ? options.lineWidth : baseOptions.lineWidth;
  this._strokeStyle = getStyle(options.strokeStyle);
  this._fillStyle = getStyle(options.fillStyle);

  this._eventMap = new Map();
  this._needChooseRender = false;
  /*
   * add shape to manager
   */
  container.addShape(this);

  if (options.cursor) {
    this._needChooseRender = true;
    container.registerEventShape(this);
  }
}, {
  lineWidth: {
    get: function() {
      return this._lineWidth;
    },
    set: function(val) {
      if (this._lineWidth === val) {
        return;
      }
      this._lineWidth = val;
      this.paint();
    }
  },
  opacity: {
    get: function() {
      return this._opacity;
    },
    set: function(val) {
      if (this._opacity === val) {
        return;
      }
      this._opacity = val;
      this.paint();
    }
  },
  strokeStyle: {
    get: function() {
      return this._strokeStyle;
    },
    set: function(val) {
      if (this._strokeStyle === val) {
        return;
      }
      this._strokeStyle = getStyle(val);
      this.paint();
    }
  },
  fillStyle: {
    get: function() {
      return this._fillStyle;
    },
    set: function(val) {
      if (this._fillStyle === val) {
        return;
      }
      this._fillStyle = getStyle(val);
      this.paint();
    }
  },
  on: function(eventName, handler) {
    var em = this._eventMap;
    var reg = em.size === 0;
    var e_array = em.get(eventName);
    if (!e_array) {
      e_array = [];
      em.set(eventName, e_array);
    }
    if (e_array.indexOf(handler) < 0) {
      e_array.push(handler);
    }
    if (reg && !this._chooseId) {
      this._needChooseRender = true;
      this.container.registerEventShape(this);
    }
    return this;
  },
  off: function(eventName, handler) {
    //todo
  },
  _emit: function(eventName, jEvent) {
    var me = this;
    var e_array = this._eventMap.get(eventName);
    if (!e_array) {
      return;
    }
    e_array.forEach(function(handler) {
      handler.call(me, jEvent);
    });
  },
  _onMouseMove: function(event) {
    this._emit('mousemove', event);
  },
  _onMouseDown: function(event) {
    this._emit('mousedown', event);
  },
  _onMouseEnter: function(event) {
    this._emit('mouseenter', event);
  },
  _onMouseLeave: function(event) {
    this._emit('mouseleave', event);
  },
  _onMouseUp: function(event) {
    this._emit('mouseup', event);
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
    //abstract method
  },
  _paintRender: function(ctx) {
    ctx.save();
    ctx.globalAlpha = this._opacity;
    ctx.lineWidth = this._lineWidth;
    if (this._strokeStyle) {
      ctx.strokeStyle = this._strokeStyle;
    }
    if (this._fillStyle) {
      ctx.fillStyle = this._fillStyle;
    }
    this._doRender(ctx);
    ctx.restore();
  },
  _chooseRender: function(ctx) {
    ctx.save();
    ctx.lineWidth = this._lineWidth;
    ctx.strokeStyle = this._chooseColor;
    ctx.fillStyle = this._chooseColor;
    this._doRender(ctx);
    ctx.restore();
  },
  render: function(ctx, ectx) {
    if (this.state === 'run' || this.state === 'stable') {
      this._paintRender(ctx);
      if (this._needChooseRender > 0) {
        this._chooseRender(ectx);
      }
    }
  },
  animate: function(options) {
    this.container.addAnimation({
      start: options.start,
      targets: [{
        shape: this,
        property: options.property,
        fromValue: options.fromValue,
        toValue: options.toValue
      }],
      duration: options.duration,
      notifies: options.notifies
    });
  },
  addAnimation: function(animation) {
    this.container.addAnimation(animation);
  },
  paint: function() {
    this.container.paintIfNeed();
  },
  paintIfNeed: function() {
    this.container.paintIfNeed();
  },
  registerEventShape: function(shape) {
    this.container.registerEventShape(shape);
  },
  addShape: function() {
    //do nothing
    //_.warn('abstract method');
  }
  //putCursor: function(cursor) {
  //  this.container.putCursor(cursor);
  //},
  //popCursor: function() {
  //  this.container.popCursor();
  //}
});