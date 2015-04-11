var _ = require('../util/util.js');
var Class = require('j-oo');
var JContext = require('./context.js');
module.exports = Class(function JCanvas(originCanvas) {
  this._originCanvas = originCanvas;
  this._context2d = null;
}, {
  getContext: function(type) {
    if (type !== '2d') {
      _.warn('todo. 3d context is to be implemented.');
      return null;
    }
    if (!this._context2d) {
      this._context2d = new JContext(this);
    }
    return this._context2d;
  },
  context: {
    get: function() {
      if (!this._context2d) {
        this._context2d = new JContext(this);
      }
      return this._context2d;
    }
  },
  width: {
    get: function() {
      return this._originCanvas.width;
    },
    set: function(val) {
      /*
       * todo 结合unitLength自动配置scale
       */
      this._originCanvas.width = val;
    }
  },
  height: {
    get: function() {
      return this._originCanvas.height;
    },
    set: function(val) {
      /*
       * todo 结合unitLength自动配置scale
       */
      this._originCanvas.height = val;
    }
  }
});