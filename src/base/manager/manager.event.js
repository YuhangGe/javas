var Class = require('j-oo');
var Manager = require('./manager.main.js');
var Config = require('../../util/conf.js');
var JColor = require('../../color/color.js');
var _ = require('../../util/util.js');
var $ = require('../../util/event.js');
var JCavnas = require('../canvas.js');

Class.partial(Manager, function() {
  this._mOverShape = null;
  this._mdDelegate = _.bind(this, this._mdHandler);
  this._mvDelegate = _.bind(this, this._mvHandler);
  this._muDelegate = _.bind(this, this._muHandler);

  this._isMouseDown = false;

  this._mdtCount = 0;
  this._mdtTimeout = null;
  this._mdtDelegate = _.bind(this, function() {
    this._mdtCount = 0;
    this._mdtTimeout = null;
  });

  this._initEvent();
}, {
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

      $.on(canvas, 'contextmenu', function(e) {
        $.stop(e);
      });
    }
  },
  _mCheckHandler: function(event) {
    if (this._isMouseDown) {
      return;
    }
    var x = event.offsetX;
    var y = event.offsetY;
    var shape = this._chooseShape(x, y);

    if (shape) {
      if (shape === this._mOverShape) {
        this._mOverShape.onMouseMove();
      } else if (!this._mOverShape) {
        shape._emit('mouseenter');
      } else {
        this._mOverShape.onMouseLeave();
        shape.onMouseEnter();
      }
    } else {
      if (this._mOverShape) {
        this._mOverShape.onMouseLeave();
      }
    }

    this._mOverShape = shape;

  },
  _mdHandler: function(event) {
    this._isMouseDown = true;

    $.on(window, $.touchEvent.move, this._mvDelegate);
    $.on(window, $.touchEvent.up, this._muDelegate);
  },
  _mvHandler: function(event) {
    console.log(event.pageX, event.offsetY);
  },
  _muHandler: function(event) {

    this._isMouseDown = true;
    $.off(window, $.touchEvent.move, this._mvDelegate);
    $.off(window, $.touchEvent.up, this._muDelegate);
  }
});