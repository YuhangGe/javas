var Config = require('./conf.js');

function $isUndefined(obj) {
  return typeof obj === 'undefined';
}
function $isArray(obj) {
  return Array.isArray(obj);
}
function $isObject(obj) {
  return obj !== null && typeof obj === 'object';
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
      src[k] = dst[k];
    } else {
      throw 'extend error';
    }
  }
}
function $query(queryString) {
  return document.querySelector(queryString);
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
    enumerable : Config.debug ? true : (enumerable ? true : false),
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
    if (Config.debug && !condition) {
      debugger;
      console.trace();
      throw new Error('assert failure.');
    }
  }
});