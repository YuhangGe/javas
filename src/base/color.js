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

var $clrMap = {
  'black': '#000',
  'white': '#fff'
};

function $clr(str) {

}

function $str2rgba(str) {
  if (/^#(?:[0-9a-fA-F]{3})|(?:[0-9a-fA-F]{6})$/.test(str)) {
    return;
  }
  var c = $clrMap[str];
  if (!c) {
    _.warn('color "' + str + '" not found, use #000 instead.');
    return '#000';
  } else {
    return c;
  }
}

function $rgba2str(rgba) {
  return 'rgba(' + rgba.r + ',' + rgba.g + ',' + rgba.b + ',' + rgba.a.toFixed(2) + ')';
}