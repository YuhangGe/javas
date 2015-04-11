var _ = require('../util/util.js');

module.exports = JColor;

function JColor(r, g, b, a) {
  var rgba;

  if (_.isString(r)) {
    rgba = $str2rgba(r);
  } else {
    rgba = {
      r: r,
      g: g,
      b: b,
      a: _.isDefined(a) ? a : 1
    }
  }

  this.rgba = rgba;
  this.value = $rgba2str(rgba);
}
JColor.prototype.toString = function() {
  return this.value;
};
JColor.prototype.valueOf = function() {
  return this.value;
};

JColor.createGradient = function() {
  return new JGradient();
};

function JGradient() {

}

function $str2rgba(str) {

  function parse(clr) {
    var l = clr.length === 7;
    var r = l ? clr.substr(1, 2) : clr[1];
    var g = l ? clr.substr(3, 2) : clr[2];
    var b = l ? clr.substr(5, 2) : clr[3];
    return {
      r: parseInt(r, 16),
      g: parseInt(g, 16),
      b: parseInt(b, 16),
      a: 1.0
    }
  }

  if (/^#[0-9a-fA-F]{3}$/.test(str) || /^#[0-9a-fA-F]{6}$/.test(str)) {
    return parse(str);
  }
  var c = $clrMap[str];
  if (!c) {
    _.warn('color "' + str + '" not found, use #000 instead.');
    return parse('#000');
  } else {
    return parse(c);
  }
}

function $rgba2str(rgba) {
  return 'rgba(' + rgba.r + ',' + rgba.g + ',' + rgba.b + ',' + rgba.a.toFixed(2) + ')';
}


//todo 完善css命名颜色到 rgb 的映射
var $clrMap = {
  'black': '#000',
  'white': '#fff'
};
