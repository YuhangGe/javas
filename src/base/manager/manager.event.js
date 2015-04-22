var Class = require('j-oo');
var Manager = require('./manager.main.js');
var Config = require('../../util/conf.js');
var _ = require('../../util/util.js');
var $ = require('../../util/event.js');
var JPoint = require('../struct/point.js');
var JEvent = require('../struct/event.js');

Class.partial(Manager, function() {
  this._mOverShape = null;
  this._mdDelegate = _.bind(this, this._mdHandler);
  this._mvDelegate = _.bind(this, this._mvHandler);
  this._muDelegate = _.bind(this, this._muHandler);

  this._isMouseDown = false;
  this._isMouseDrag = false;

  this._mdPoint = new JPoint(0, 0);
  this._mdtCount = 0;
  this._mdtTimeout = null;
  this._mdtDelegate = _.bind(this, function() {
    this._mdtCount = 0;
    this._mdtTimeout = null;
  });

  this._hasMV = false;
  this._emitMap = new Map();

  this._initEvent();
}, {
  on: function(eventName, handler) {
    var e_array;
    if (this._emitMap.has(eventName)) {
      e_array = this._emitMap.get(eventName);
    } else {
      e_array = [];
      this._emitMap.set(eventName, e_array);
    }
    e_array.push(handler);
    if (eventName === 'mousemove') {
      this._hasMV = true;
    }
  },
  off: function() {
    //todo
  },
  _emit: function(eventName, jEvent) {
    this._emitMap.get(eventName).forEach(function(handler) {
      handler.call(this, jEvent);
    });
  },
  _initEvent: function() {
    var canvas = this.canvas._originCanvas;

    if ($.touchable) {
      $.addGesture(canvas,
        this._mdDelegate,
        _.bind(this, this._gestureStartHandler),
        _.bind(this, this._gesturePinchHandler),
        _.bind(this, this._gestureDragHandler),
        function() {}
      );
    } else {
      $.on(canvas, 'mousedown', this._mdDelegate);
      $.on(canvas, 'mousemove', _.bind(this, this._mCheckHandler));

      $.on(canvas, 'contextmenu', $.stop);
      $.on(canvas, 'mousewheel', _.bind(this, this._wheelHandler));

    }

    $.on(canvas, 'keydown', _.bind(this, this._kpHandler));

  },
  _mCheckHandler: function(event) {
    if (this._isMouseDown) {
      return;
    }

    this._cShape(event);
    if (this._hasMV) {
      var ev = new JEvent(event);
      this._emit('mousemove', ev);
    }

  },
  _cShape: function(event) {
    var x = event.layerX;
    var y = event.layerY;
    var shape = this._chooseShape(x, y);
    if (shape) {
      if (shape === this._mOverShape) {
        this._mOverShape._onMouseMove(new JEvent(event));
      } else if (!this._mOverShape) {
        shape._onMouseEnter();
        this.cursor = shape.cursor;
      } else {
        this._mOverShape._onMouseLeave();
        shape._onMouseEnter();
        this.cursor = shape.cursor;
      }
    } else {
      if (this._mOverShape) {
        this._mOverShape._onMouseLeave();
        this.cursor = this._defaultCursor;
      }
    }
    this._mOverShape = shape;
  },
  _mdHandler: function(event) {
    this._isMouseDown = true;

    var x = event.layerX;
    var y = event.layerY;
    this._mdPoint.x = x;
    this._mdPoint.y = y;
    var ev;

    var shape = this._chooseShape(x, y);
    if (shape) {
      ev = new JEvent(event);
      shape._onMouseDown(ev);
    }
    if (this._emitMap.has('mousedown')) {
      ev = new JEvent(event);
      this._emit('mousedown', ev);
    }

    $.on(window, $.touchEvent.move, this._mvDelegate);
    $.on(window, $.touchEvent.up, this._muDelegate);
  },
  _mvHandler: function(event) {

    var x = event.layerX;
    var y = event.layerY;
    var m = this._mdPoint;
    var ev;

    this._cShape(event);

    if (this._hasMV) {
      ev = new JEvent(event);
      this._emit('mousemove', ev);
    }

    if (this._emitMap.has('mousedrag')) {
      ev = new JEvent(event);
      ev.deltaX = x - m.x;
      ev.deltaY = y - m.y;
      this._emit('mousedrag', ev)
    }

  },
  _muHandler: function(event) {
    this._isMouseDown = false;

    var x = event.layerX;
    var y = event.layerY;
    var ev;
    var shape = this._chooseShape(x, y);
    if (shape) {
      ev = new JEvent(event);
      shape._onMouseUp(ev);
    }
    if (this._emitMap.has('mouseup')) {
      ev = new JEvent(event);
      this._emit('mouseup', ev);
    }

    $.off(window, $.touchEvent.move, this._mvDelegate);
    $.off(window, $.touchEvent.up, this._muDelegate);
  },
  _wheelHandler: function(e) {
    if(!this._emitMap.has('mousewheel'))
      return;

    var	deltaX = 0;
    var deltaY = 0;
    if(_.isDefined(e.wheelDeltaY)) {
      deltaY = e.wheelDeltaY / 10;
      deltaX = e.wheelDeltaX / 10;
    } else if(typeof e.wheelDelta !== 'undefined') {
      deltaY = e.wheelDelta / 10;
      deltaX = 0;
    } else if(e.detail) {
      deltaY = -e.detail;
      deltaX = 0;
    }

    var ev = new JEvent(e);
    ev.deltaX = deltaX;
    ev.deltaY = deltaY;

    this._emit('mousewheel', ev);
    $.stop(e);
  },
  _kpHandler: function(ev) {
    this._emit('keydown', new JEvent(ev));
  }
});