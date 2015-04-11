var Class = require('j-oo');
var _ = require('../util/util.js');

module.exports = Class(function JMatrix(m) {
  this.m = _.isUndefined(m)
    ? [1, 0, 0, 1, 0 ,0, 0, 0, 1]
    : (_.isArray(m) ? m : [].slice.call(arguments, 0)); // arguments 本身不是Array，需要转换。

}, {
  /*
   * 下面定义的这些属性，本质上是可以不需要的，只是为了方便理解。
   */
  a: {
    get: function() {
      return this.m[0];
    },
    set: function(val) {
      this.m[0] = val;
    }
  },
  b: {
    get: function() {
      return this.m[3];
    },
    set: function(val) {
      this.m[3] = val;
    }
  },
  c: {
    get: function() {
      return this.m[1];
    },
    set: function(val) {
      this.m[1] = val;
    }
  },
  d: {
    get: function() {
      return this.m[4];
    },
    set: function(val) {
      this.m[4] = val;
    }
  },
  e: {
    get: function() {
      return this.m[2];
    },
    set: function(val) {
      this.m[2] = val;
    }
  },
  f: {
    get: function() {
      return this.m[5];
    },
    set: function(val) {
      this.m[5] = val;
    }
  },
  scaleX: {
    get: function() {
      return this.m[0];
    },
    set: function(val) {
      this.m[0] = val;
    }
  },
  scaleY: {
    get: function() {
      return this.m[3];
    },
    set: function(val) {
      this.m[3] = val;
    }
  },
  skewX: {
    get: function() {
      return this.m[1];
    },
    set: function(val) {
      this.m[1] = val;
    }
  },
  skewY: {
    get: function() {
      return this.m[4];
    },
    set: function(val) {
      this.m[4] = val;
    }
  },
  offsetX: {
    get: function() {
      return this.m[2];
    },
    set: function(val) {
      this.m[2] = val;
    }
  },
  offsetY: {
    get: function() {
      return this.m[5];
    },
    set: function(val) {
      this.m[5] = val;
    }
  }
});