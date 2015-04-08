var Config = require('conf.js');

function $isUndefined(obj) {
  return typeof obj === 'undefined';
}
function $isArray(obj) {
  return Array.isArray(obj);
}
function $isObject(obj) {
  return typeof obj === 'object';
}
function $isString(obj) {
  return typeof obj === 'string';
}
function $hasProperty(obj, prop) {
  return obj.hasOwnProperty(prop);
}
function $isDefined(obj) {
  return !$isUndefined(obj);
}
function $extend(src, dst) {
  for (var k in dst) {
    if (!$hasProperty(src, k)) {
      src[k] = dst;
    } else {
      throw 'extend error';
    }
  }
}
function $query(queryString) {
  return document.querySelector(queryString);
}
function inherit(inheritClass, baseClass) {
  if (typeof inheritClass === 'undefined' || typeof baseClass === 'undefined') {
    console.trace();
    throw "inherit error!";
  }
  //首先把父类的prototype中的函数继承到子类中
  for (var pFunc in baseClass.prototype) {
    var sp = inheritClass.prototype[pFunc];
    //如果子类中没有这个函数，添加
    if (typeof sp === 'undefined') {
      inheritClass.prototype[pFunc] = baseClass.prototype[pFunc];
    }
    //如果子类已经有这个函数，则忽略。以后可使用下面的callBase函数调用父类的方法

  }
  //保存继承树，当有多级继承时要借住继承树对父类进行访问
  inheritClass.__base_objects__ = [];
  inheritClass.__base_objects__.push(baseClass);

  if (typeof baseClass.__base_objects__ !== 'undefined') {
    for (var i = 0; i < baseClass.__base_objects__.length; i++)
      inheritClass.__base_objects__.push(baseClass.__base_objects__[i]);
  }

  /**
   * 执行父类构造函数，相当于java中的this.super()
   * 不使用super是因为super是ECMAScript保留关键字.
   * @param {arguments} args 参数，可以不提供
   */
  inheritClass.prototype.base = function (args) {

    var baseClass = null, rtn = undefined;
    if (typeof this.__inherit_base_deep__ === 'undefined') {
      this.__inherit_base_deep__ = 0;
    } else {
      this.__inherit_base_deep__++;
    }

    baseClass = inheritClass.__base_objects__[this.__inherit_base_deep__];

    if (typeof args === "undefined" || args == null) {
      rtn = baseClass.call(this);
    } else if (args instanceof Array === true) {
      rtn = baseClass.apply(this, args);
    } else {
      // arguments 是Object而不是Array，需要转换。
      rtn = baseClass.apply(this, [].slice.call(arguments));
    }

    this.__inherit_base_deep__--;

    //$.dprint("d-:"+this.__inherit_deep__);
    return rtn;
  };
  /**
   * 给继承的子类添加调用父函数的方法
   * @param {string} method 父类的函数的名称
   * @param {arguments} args 参数，可以不提供
   */
  inheritClass.prototype.callBase = function (method, args) {

    var baseClass = null, rtn = undefined;

    if (typeof this.__inherit_deep__ === 'undefined') {
      this.__inherit_deep__ = 0;

    } else {
      this.__inherit_deep__++;
      //$.dprint("d+:"+this.__inherit_deep__);
    }

    //$.dprint(this.__inherit_deep__);
    baseClass = inheritClass.__base_objects__[this.__inherit_deep__];

    var med = baseClass.prototype[method];
    if (typeof med === 'function') {
      if (typeof args === "undefined" || args === null) {
        rtn = med.call(this);
      } else if (args instanceof Array === true) {
        rtn = med.apply(this, args);
      } else {
        rtn = med.apply(this, [].slice.call(arguments, 1));
      }
    } else {
      throw "There is no method:" + method + " in baseClass";
    }

    this.__inherit_deep__--;
    return rtn;
  };
}
function bind(instance, func) {
  return function (args) {
    func.apply(instance, arguments);
  }
}
var __javas_uid__ = 0;
function uid() {
  return (__javas_uid__++).toString(36);
}
function $error(msg) {
  if (Config.debug) {
    debugger;
    console.trace();
  }
  throw new Error(msg);
}
function $defineProperty(obj, prop, value, writable, enumerable) {
  //debug模式下enumerable都为true，方便调试。
  Object.defineProperty(obj, prop, {
    value : value,
    writable : writable ? true : false,
    enumerable : Config.debug ? true : (enumerable ? true : false)
  });
}
function $defineGetterSetter(obj, prop, getter, setter, configurable, enumerable) {
  var desc = {
    configurable: configurable ? true : false,
    enumerable: Config.debug ? true : (enumerable ? true : false)
  };
  if (getter) {
    desc['get'] = getter;
  }
  if (setter) {
    desc['set'] = setter;
  }
  Object.defineProperty(obj, prop, desc);
}
var Utility = {
  extend: $extend,
  inherit: inherit,
  hasProperty: $hasProperty,
  querySelector: $query,
  isString: $isString,
  uid: uid,
  isObject: $isObject,
  isUndefined: $isUndefined,
  isArray: $isArray,
  isDefined: $isDefined,
  error: $error,
  defineProperty: $defineProperty,
  defineGetterSetter: $defineGetterSetter
};

module.exports = Utility;

function walkMergeOptions(src, dst) {
  var k, v, sv;
  for (k in dst) {
    v = dst[k];
    if (!$hasProperty(src, k)) {
      src[k] = v;
    } else {
      sv = src[k];
      if (sv === true && $isObject(v)) { //如果配置为true，则表明可以使用默认的配置
        src[k] = v;
      } else if ($isObject(sv) && $isObject(v)) {
        walkMergeOptions(sv, v);
      }
    }
  }
}

$extend(Utility, {
  warn: function() {
    console.warn.apply(console, arguments);
    if (Config.debug) {
      //debug 模式下warn也断点，用于调试。
      $error('warn under debug mode');
    }
  },
  error: function(msg) {
    console.error.apply(console, arguments);
    if (Config.debug) {
      $error(msg);
    }
  },
  log: function() {
    console.log.apply(console, arguments);
  },
  mergeOptions: function (givenOptions, defaultOptions) {
    givenOptions = givenOptions || {};
    walkMergeOptions(givenOptions, defaultOptions);
    return givenOptions;
  },
  merge: function (src, dst) {
    for (var k in src) {
      if ($hasProperty(dst, k)) {
        src[k] = dst[k];
      }
    }
  },
  assert: function (condition) {
    if (!condition) {
      debugger;
      console.trace();
      throw new Error('assert failure.');
    }
  }
});