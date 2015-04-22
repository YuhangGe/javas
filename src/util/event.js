var BrowserDetect = require('./browser.js');
var MobileDetect = require('./mobile.js');

var DEVICE_HAVE_NO_MOUSE = MobileDetect.no_mouse;
var TAP_DURATION = 750; // Shorter than 750ms is a tap, longer is a taphold or drag.
var MOVE_TOLERANCE = 12; // 12px seems to work in most mobile browsers.

function stopEvent(event) {
  event.stopPropagation();
  event.preventDefault();
}

function addEvent(element, eventName, eventHandler) {
  if (eventName === 'mousewheel' && BrowserDetect.firefox) {
    eventName = 'DOMMouseScroll';
  }
  element.addEventListener(eventName, eventHandler);
}

function delEvent(element, eventName, eventHandler) {
  element.removeEventListener(eventName, eventHandler);
}

function getPoint(event) {
  var x= 0, y=0;
  if ( typeof e.pageX !== 'undefined') {
    x = e.pageX;
    y = e.pageY;
  } else if(typeof e.clientX !== 'undefined') {
    x = e.clientX;
    y = e.clientY;
  } else {
    return null;
  }
  return {
    x : x,
    y : y
  };
}

module.exports = {
  touchable: BrowserDetect.touchable,
  touchEvent: BrowserDetect.touchEvent,
  on: addEvent,
  off: delEvent,
  point: getPoint,
  stop: stopEvent,
  browserDetect: BrowserDetect,
  mobileDetect: MobileDetect,
  addGesture : function(ele, touch_start_handler, start_handler, pinch_handler, drag_handler, touch_end_handler) {
    if(typeof touch_end_handler !== 'function') {
      touch_end_handler = function() {}
    }
    var is_pinching = false, is_draging = false;
    var pre_data = {
      scale : 0,
      x : 0,
      y : 0
    };
    var ie_scale = 1.0, s_b;
    var start_ges = function() {
      start_handler();
    };
    var deal_ges = function(scale, deltaX, deltaY) {
      var status = 0;
      if(!is_draging && !is_pinching) {
        s_b = scale / pre_data.scale;
        if(s_b < 0.97 || s_b > 1.03) {
          is_pinching = true;
        } else if(Math.abs(deltaX)>8 || Math.abs(deltaY)>8) {
          is_draging = true;
        }
      }

      if(is_pinching) {
        s_b = scale / pre_data.scale;
        if(s_b < 0.88 || s_b > 1.12) {
          pinch_handler(scale);
          status = 1;
        }
      } else if(is_draging) {
        if(Math.abs(deltaX)>10 || Math.abs(deltaY)>10) {
          drag_handler(deltaX, deltaY);
          status = 2;
        }
      }
      return status;
    };
    var end_ges = function(ev) {
      is_pinching = false;
      is_draging = false;
      pre_data.x = 0;
      pre_data.y = 0;
      stopEvent(ev);

    };
    var ie_data = {
      ie_timeout : null,
      ie_event : null
    };
    var ie_timeout_handler = function() {
      ie_data.ie_timeout = null;
      touch_start_handler(ie_data.ie_event);
    };

    if(MobileDetect.ie) {
      var myGesture = new MSGesture(), myPointers = [];

      myGesture.target = ele;
      addEvent(ele, "MSGestureStart", function(ev) {
        ie_scale = ev.scale;
        pre_data.scale = ev.scale;
        pre_data.x = ev.translationX;
        pre_data.y = ev.translationY;
        start_ges();
        stopEvent(ev);
      });

      addEvent(ele, "MSGestureChange", function(ev) {

        pre_data.x += ev.translationX;
        pre_data.y += ev.translationY;
        ie_scale *= ev.scale;
        var ges_status = deal_ges(ie_scale, pre_data.x, pre_data.y);
        if(ges_status === 1) {
          pre_data.scale = ie_scale;
        } else if(ges_status === 2) {
          pre_data.x = 0;
          pre_data.y = 0;
        }
        stopEvent(ev);

      });

      addEvent(ele, "MSGestureEnd", end_ges);

      addEvent(ele, MobileDetect.touchEventType.start, function(ev) {
        var pi = myPointers.indexOf(ev.pointerId);
        if(pi>=0) {
          //pointer已经存在。这几乎是不可能的。因为系统每次pointerdown时生成的pointerId肯定不一样。
          return;
        }
        if(myPointers.length === 0) {
          myPointers.push(ev.pointerId);
          ie_data.ie_event = ev;
          ie_data.ie_timeout = window.setTimeout(ie_timeout_handler, 80);
        } else if(myPointers.length === 1) {
          if(ie_data.ie_timeout !== null) {
            window.clearTimeout(ie_data.ie_timeout);
            ie_data.ie_timeout = null;
          }
          myPointers.push(ev.pointerId);

          for(pi = 0;pi<myPointers.length;pi++ ) {
            myGesture.addPointer(myPointers[pi]);
          }
        }

      });
      addEvent(ele, MobileDetect.touchEventType.end, function(ev) {
        if(myPointers.length === 1) {
          if(ie_data.ie_timeout !== null) {
            window.clearTimeout(ie_data.ie_timeout);
            ie_data.ie_timeout = null;
            touch_start_handler(ie_data.ie_event);
          }
          touch_end_handler(ev);
        }
        myPointers.length = 0;
      });

    } else {
      var is_ges = false;
      addEvent(ele, "mousedown", function(ev) {
        is_ges = false;
        touch_start_handler(ev);
      });
      addEvent(ele, "gesturestart", function(ev) {
        is_ges = true;
        pre_data.scale = ev.scale;
        pre_data.x = ev.pageX;
        pre_data.y = ev.pageY;
        start_ges();
        stopEvent(ev);
      });
      addEvent(ele, "gesturechange", function(ev) {
        var ges_status = deal_ges(ev.scale, ev.pageX - pre_data.x, ev.pageY - pre_data.y);
        if(ges_status === 1) {
          pre_data.scale = ev.scale;
        } else if(ges_status === 2) {
          pre_data.x = ev.pageX;
          pre_data.y = ev.pageY;
        }
        stopEvent(ev);

      });
      addEvent(ele, "gestureend", end_ges);
      addEvent(ele, "mouseup", function(ev) {
        if(is_ges === false) {
          touch_end_handler(ev);
        }
      });
    }
  },
  addMouseEvent : function(ele, event, handler) {
    var pre_timestamp = 0;
    function _f_touch(e) {
      if((e.touches && e.touches.length === 1) ||(e.changedTouches && e.changedTouches.length === 1)) {
        //多点触屏不处理。
        handler.apply(this, arguments);
      }
    }

    function _f_mouse(e) {
      if(pre_timestamp > 0 && e.timeStamp - pre_timestamp < 800) {
        return;
      }
      handler.apply(this, arguments);
    }
    function _f_touch_mouse(e) {
      if((e.touches && e.touches.length === 1) ||(e.changedTouches && e.changedTouches.length === 1)) {
        //多点触屏不处理。
        pre_timestamp = e.timeStamp;
        handler.apply(this, arguments);
      }
    }

    var rtn = {};
    if($.touchable && (['mousedown','mousemove','mouseup'].indexOf(event)>=0)) {
      var event_touch = event === 'mousedown' ? $.touchEventType.start : (event === 'mousemove' ? $.touchEventType.move : $.touchEventType.end);
      if(!DEVICE_HAVE_NO_MOUSE) {
        addEvent(ele, event, _f_mouse);
        addEvent(ele, event_touch, _f_touch_mouse);
        rtn[event_touch] = _f_touch_mouse;
        rtn[event] = _f_mouse;
      } else {
        addEvent(ele, event_touch, _f_touch);
        rtn[event_touch] = _f_touch;
      }
    } else {
      addEvent(ele, event, handler);
      rtn[event] = handler;
    }
    return rtn;
  },
  delMouseEvent : function(ele, event) {
    for(var e_name in event) {
      delEvent(ele, e_name, event[e_name]);
    }
  },
  /**
   * 添加Click事件。为了统一处理触屏和鼠标，代码逻辑比较复杂。
   *   触屏设备在touch事件时，也会激活mousedown事件。
   *   但在考虑像surface pro这种可以带鼠标的触屏设备，
   *   就不能单一地只处理mouse事件或者touch事件。
   * @param ele
   * @param handler
   */
  addMouseClickEvent : function(ele, handler) {
    var mouse_down_point = {
      x : 0,
      y : 0
    };
    var mouse_down_timestamp = 0;
    function _dist(x1, y1, x2, y2) {
      return Math.sqrt(Math.pow(x2-x1, 2), Math.pow(y2-y1, 2));
    }
    function _down_mouse(e) {
      mouse_down_point.x = e.pageX;
      mouse_down_point.y = e.pageY;
    }
    function _down_touch(e) {
      if(!e.touches || e.touches.length !== 1) {
        return;
      }
      mouse_down_point.x = e.touches[0].pageX;
      mouse_down_point.y = e.touches[0].pageY;
    }
    function _up_mouse(e) {
      if(_dist(mouse_down_point.x, mouse_down_point.y, e.pageX, e.pageY) < MOVE_TOLERANCE) {
        handler.apply(this, arguments);
      }
    }
    function _up_touch(e) {
      if(!e.changedTouches || e.changedTouches.length !== 1) {
        return;
      }
      if(_dist(mouse_down_point.x, mouse_down_point.y, e.changedTouches[0].pageX, e.changedTouches[0].pageY) < MOVE_TOLERANCE) {
        handler.apply(this, arguments);
      }
    }
    function _up_mouse_touch(e) {
      if(_dist(mouse_down_point.x, mouse_down_point.y, e.pageX, e.pageY) < MOVE_TOLERANCE) {
        mouse_down_timestamp = e.timeStamp;
        handler.apply(this, arguments);
      } else {
        mouse_down_timestamp = -1;
      }
    }
    function _up_touch_mouse(e) {
      if(!e.changedTouches || e.changedTouches.length !== 1 || mouse_down_timestamp<0 || e.timeStamp - mouse_down_timestamp > 100) {
        return;
      }
      if(_dist(mouse_down_point.x, mouse_down_point.y, e.changedTouches[0].pageX, e.changedTouches[0].pageY) < MOVE_TOLERANCE) {
        handler.apply(this, arguments);
      }
    }
    function _down_mouse_touch(e) {
      mouse_down_point.x = e.pageX;
      mouse_down_point.y = e.pageY;
      mouse_down_timestamp = e.timeStamp;
    }
    function _down_touch_mouse(e) {
      if(!e.touches || e.touches.length !== 1 || e.timeStamp - mouse_down_timestamp < 100) {
        return;
      }
      mouse_down_point.x = e.touches[0].pageX;
      mouse_down_point.y = e.touches[0].pageY;
    }
    if(BrowserDetect.touchable) {
      if(!DEVICE_HAVE_NO_MOUSE) {
        addEvent(ele, 'mousedown', _down_mouse_touch);
        addEvent(ele, BrowserDetect.touchEventType.start, _down_touch_mouse);
        addEvent(ele, 'mouseup', _up_mouse_touch);
        addEvent(ele, BrowserDetect.touchEventType.end, _up_touch_mouse);
      } else {
        addEvent(ele, BrowserDetect.touchEventType.start, _down_touch);
        addEvent(ele, BrowserDetect.touchEventType.end, _up_touch);
      }
    } else {
      addEvent(ele, 'mousedown', _down_mouse);
      addEvent(ele, 'mouseup', _up_mouse);
    }
  },
  getWheelDelta: function(e) {
    var	deltaX = 0;
    var deltaY = 0;
    if(typeof e.wheelDeltaY !== 'undefined') {
      deltaY = e.wheelDeltaY / 5;
      deltaX = e.wheelDeltaX / 5;
    } else if(typeof e.wheelDelta !== 'undefined') {
      deltaY = e.wheelDelta / 5;
      deltaX = 0;
    } else if(e.detail) {
      deltaY = -e.detail * 2;
      deltaX = 0;
    }
    return {
      deltaX: deltaX,
      deltaY: deltaY
    }
  }
};