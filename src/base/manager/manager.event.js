var Class = require('j-oo');
var Manager = require('./manager.main.js');
var Config = require('../../util/conf.js');
var _ = require('../../util/util.js');
var $ = require('../../util/event.js');
var JPoint = require('../struct/point.js');
var JEvent = require('../struct/event.js');

var KEY_TABLE = {
  33 : 'pageup',
  34 : 'pagedown',
  36 : 'home',
  35 : 'end',
  37 : 'left',
  39 : 'right',
  38 : 'up',
  40 : 'down'
};

/*
 * 个另按键在不同浏览器下面的keycode不一致。参考：http://www.javascripter.net/faq/keycodes.htm
 * 本来应该是把快捷键处理放在keypress事件中，使用charCode就能达到一致了，但keypress对于某些按键不会触发。
 * opera浏览器已经彻底忽略。
 */
if($.browserDetect.firefox) {
  KEY_TABLE[173] = '-';
  KEY_TABLE[61] = '=';
} else {
  KEY_TABLE[189] = '-';
  KEY_TABLE[187] = '=';
}

Class.partial(Manager, function() {
  this._mOverShape = null;
  this._mdDelegate = _.bind(this, this._mdHandler);
  this._mvDelegate = _.bind(this, this._mvHandler);
  this._muDelegate = _.bind(this, this._muHandler);

  this._isMouseDown = false;
  this._isScrollDown = false;

  this._mdPoint = {
    x: 0,
    y: 0,
    offsetX: 0,
    offsetY: 0
  };
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

    }

    $.on(document.body, 'keydown', _.bind(this, this._kpHandler));

    if (this.scalable) {
      this.on('ctrl-=', _.bind(this, this._zoomOutHandler));
      this.on('ctrl--', _.bind(this, this._zoomInHandler));
      this.on('ctrl-0', _.bind(this, this._zoomOriginHandler));
      $.on(canvas, 'mousewheel', _.bind(this, this._wheelZoomHandler));
    }

    if (this.scrollable) {
      $.on(canvas, 'mousewheel', _.bind(this, this._wheelScrollHandler));
    }
    //this.on('left', _.bind(this, this._keyLeftHandler));
    //this.on('right', _.bind(this, this._keyRightHandler));
    //this.on('up', _.bind(this, this._keyUpHandler));
    //this.on('down', _.bind(this, this._keyDownHandler));

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

    var m = this._mdPoint;
    var x = event.layerX;
    var y = event.layerY;
    m.x = x;
    m.y = y;
    m.offsetX = this._offsetX;
    m.offsetY = this._offsetY;
    var ev;

    var shape = this._chooseShape(x, y);
    if (shape) {
      ev = new JEvent(event);
      shape._onMouseDown(ev);
    } else if (this.scrollable) {
      this._isScrollDown = true;
      this.cursor = 'move';
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

    if (this._isScrollDown) {
      this._offsetX = m.offsetX + (x - m.x) / this.scaleX;
      this._offsetY = m.offsetY + (y - m.y) / this.scaleY;
      this.paintIfNeed();
    } else {
      this._cShape(event);
    }

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
    if (this._isScrollDown) {
      this.cursor = this._defaultCursor;
    } else {
      var shape = this._chooseShape(x, y);
      if (shape) {
        ev = new JEvent(event);
        shape._onMouseUp(ev);
      }
    }

    if (this._emitMap.has('mouseup')) {
      ev = new JEvent(event);
      this._emit('mouseup', ev);
    }

    $.off(window, $.touchEvent.move, this._mvDelegate);
    $.off(window, $.touchEvent.up, this._muDelegate);
  },
  _wheelZoomHandler: function(e) {
    if (!e.ctrlKey && !e.metaKey) {
      return;
    }
    var delta = $.getWheelDelta(e);
    var x = e.layerX;
    var y = e.layerY;
    var ps = this.scaleX;
    var py = this.scaleY;
    this.scaleX *= (1 + delta.deltaY / 100);
    this.scaleY *= (1 + delta.deltaY / 100);
    this._offsetX -= x * (this.scaleX / ps - 1) / this.scaleX;
    this._offsetY -= y * (this.scaleY / py - 1) / this.scaleY;
    this.paintIfNeed();
    $.stop(e);
  },
  _wheelScrollHandler: function(e) {
    if (e.ctrlKey || e.metaKey) {
      return;
    }
    var delta = $.getWheelDelta(e);
    this._offsetX += delta.deltaX / this.scaleX;
    this._offsetY += delta.deltaY / this.scaleY;
    this.paintIfNeed();
    $.stop(e);
  },
  _kpHandler: function(ev) {
    var ctrlKey = ev.ctrlKey || ev.metaKey;
    var c = ev.keyCode;
    var c_key = (ctrlKey ? "ctrl-" : "") + (ev.shiftKey ? "shift-" : "") + (ev.altKey ? "alt-" : "") + (KEY_TABLE[c] ? KEY_TABLE[c] : String.fromCharCode(c).toLowerCase());
    if (this._emitMap.has(c_key)) {
      this._emit(c_key);
      $.stop(ev);
    }
    if (this._emitMap.has('keydown')) {
      this._emit('keydown', ev);
    }
  },
  _zoomOutHandler: function() {
    this._zoom(1);
  },
  _zoomInHandler: function() {
    this._zoom(-1);
  },
  _zoomOriginHandler: function() {
    this._zoom(0);
  },
  _zoom: function(type) {
    var x = this.width / 2;
    var y = this.height / 2;
    var ps = this.scaleX;
    var py = this.scaleY;
    var ns = type === 0 ? 1.0 : this.scaleX * (1 + type * 0.1);
    var ny = type === 0 ? 1.0 : this.scaleY * (1 + type * 0.1);
    this.scaleX = ns;
    this._offsetX -= x * (this.scaleX / ps - 1) / this.scaleX;
    this.scaleY = ny;
    this._offsetY -= y * (this.scaleY / py - 1) / this.scaleY;
    this.paintIfNeed();
  },
  adjust: function(dx, dy) {
    this._offsetX += dx;
    this._offsetY += dy;
    this.paintIfNeed();
  }
});