var _ = require('../util/util.js');
var Class = require('j-oo');

var JColor = Class(function JColor(r, g, b, a) {
  var rgba;

  if (_.isString(r)) {
    rgba = $str2rgba(r);
  } else if (_.isObject(r)) {
    rgba = r;
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
}, {
  opacity: {
    get: function() {
      return this.rgba.a;
    },
    set: function(val) {
      this.rgba.a = val;
      this.value = $rgba2str(this.rgba);
    }
  },
  toString: function() {
    return this.value;
  },
  createGradient: function() {
  }
});

module.exports = JColor;

function $str2rgba(str) {
  if (/^#[0-9a-fA-F]{3}$/.test(str) || /^#[0-9a-fA-F]{6}$/.test(str)) {
    return parse(str);
  }
  var m;
  m = str.match(/^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/);
  if (m) {
    return {
      r: parseInt(m[1]),
      g: parseInt(m[2]),
      b: parseInt(m[3]),
      a: 1.0
    }
  }
  m = str.match(/^rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([^\s]+)\s*\)$/);
  if (m) {
    return {
      r: parseInt(m[1]),
      g: parseInt(m[2]),
      b: parseInt(m[3]),
      a: parseFloat(m[4])
    }
  }
  var c = $clrMap[str.toLowerCase()];
  if (!c) {
    _.warn('color "' + str + '" not found, use #000 instead.');
    return $clrMap.black;
  } else {
    return c;
  }
}

function $rgba2str(rgba) {
  return 'rgba(' + rgba.r + ',' + rgba.g + ',' + rgba.b + ',' + rgba.a.toFixed(2) + ')';
}

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

/*
 * css named colors. see http://www.w3schools.com/cssref/css_colornames.asp
 *
 */
var $clrMap = {
  aliceblue: parse('#F0F8FF'),
  antiquewhite: parse('#FAEBD7'),
  aqua: parse('#00FFFF'),
  aquamarine: parse('#7FFFD4'),
  azure: parse('#F0FFFF'),
  beige: parse('#F5F5DC'),
  bisque: parse('#FFE4C4'),
  black: parse('#000000'),
  blanchedalmond: parse('#FFEBCD'),
  blue: parse('#0000FF'),
  blueviolet: parse('#8A2BE2'),
  brown: parse('#A52A2A'),
  burlywood: parse('#DEB887'),
  cadetblue: parse('#5F9EA0'),
  chartreuse: parse('#7FFF00'),
  chocolate: parse('#D2691E'),
  coral: parse('#FF7F50'),
  cornflowerblue: parse('#6495ED'),
  cornsilk: parse('#FFF8DC'),
  crimson: parse('#DC143C'),
  cyan: parse('#00FFFF'),
  darkblue: parse('#00008B'),
  darkcyan: parse('#008B8B'),
  darkgoldenrod: parse('#B8860B'),
  darkgray: parse('#A9A9A9'),
  darkgreen: parse('#006400'),
  darkkhaki: parse('#BDB76B'),
  darkmagenta: parse('#8B008B'),
  darkolivegreen: parse('#556B2F'),
  darkorange: parse('#FF8C00'),
  darkorchid: parse('#9932CC'),
  darkred: parse('#8B0000'),
  darksalmon: parse('#E9967A'),
  darkseagreen: parse('#8FBC8F'),
  darkslateblue: parse('#483D8B'),
  darkslategray: parse('#2F4F4F'),
  darkturquoise: parse('#00CED1'),
  darkviolet: parse('#9400D3'),
  deeppink: parse('#FF1493'),
  deepskyblue: parse('#00BFFF'),
  dimgray: parse('#696969'),
  dodgerblue: parse('#1E90FF'),
  firebrick: parse('#B22222'),
  floralwhite: parse('#FFFAF0'),
  forestgreen: parse('#228B22'),
  fuchsia: parse('#FF00FF'),
  gainsboro: parse('#DCDCDC'),
  ghostwhite: parse('#F8F8FF'),
  gold: parse('#FFD700'),
  goldenrod: parse('#DAA520'),
  gray: parse('#808080'),
  green: parse('#008000'),
  greenyellow: parse('#ADFF2F'),
  honeydew: parse('#F0FFF0'),
  hotpink: parse('#FF69B4'),
  indianred: parse('#CD5C5C'),
  indigo: parse('#4B0082'),
  ivory: parse('#FFFFF0'),
  khaki: parse('#F0E68C'),
  lavender: parse('#E6E6FA'),
  lavenderblush: parse('#FFF0F5'),
  lawngreen: parse('#7CFC00'),
  lemonchiffon: parse('#FFFACD'),
  lightblue: parse('#ADD8E6'),
  lightcoral: parse('#F08080'),
  lightcyan: parse('#E0FFFF'),
  lightgoldenrodyellow: parse('#FAFAD2'),
  lightgray: parse('#D3D3D3'),
  lightgreen: parse('#90EE90'),
  lightpink: parse('#FFB6C1'),
  lightsalmon: parse('#FFA07A'),
  lightseagreen: parse('#20B2AA'),
  lightskyblue: parse('#87CEFA'),
  lightslategray: parse('#778899'),
  lightsteelblue: parse('#B0C4DE'),
  lightyellow: parse('#FFFFE0'),
  lime: parse('#00FF00'),
  limegreen: parse('#32CD32'),
  linen: parse('#FAF0E6'),
  magenta: parse('#FF00FF'),
  maroon: parse('#800000'),
  mediumaquamarine: parse('#66CDAA'),
  mediumblue: parse('#0000CD'),
  mediumorchid: parse('#BA55D3'),
  mediumpurple: parse('#9370DB'),
  mediumseagreen: parse('#3CB371'),
  mediumslateblue: parse('#7B68EE'),
  mediumspringgreen: parse('#00FA9A'),
  mediumturquoise: parse('#48D1CC'),
  mediumvioletred: parse('#C71585'),
  midnightblue: parse('#191970'),
  mintcream: parse('#F5FFFA'),
  mistyrose: parse('#FFE4E1'),
  moccasin: parse('#FFE4B5'),
  navajowhite: parse('#FFDEAD'),
  navy: parse('#000080'),
  oldlace: parse('#FDF5E6'),
  olive: parse('#808000'),
  olivedrab: parse('#6B8E23'),
  orange: parse('#FFA500'),
  orangered: parse('#FF4500'),
  orchid: parse('#DA70D6'),
  palegoldenrod: parse('#EEE8AA'),
  palegreen: parse('#98FB98'),
  paleturquoise: parse('#AFEEEE'),
  palevioletred: parse('#DB7093'),
  papayawhip: parse('#FFEFD5'),
  peachpuff: parse('#FFDAB9'),
  peru: parse('#CD853F'),
  pink: parse('#FFC0CB'),
  plum: parse('#DDA0DD'),
  powderblue: parse('#B0E0E6'),
  purple: parse('#800080'),
  rebeccapurple: parse('#663399'),
  red: parse('#FF0000'),
  rosybrown: parse('#BC8F8F'),
  royalblue: parse('#4169E1'),
  saddlebrown: parse('#8B4513'),
  salmon: parse('#FA8072'),
  sandybrown: parse('#F4A460'),
  seagreen: parse('#2E8B57'),
  seashell: parse('#FFF5EE'),
  sienna: parse('#A0522D'),
  silver: parse('#C0C0C0'),
  skyblue: parse('#87CEEB'),
  slateblue: parse('#6A5ACD'),
  slategray: parse('#708090'),
  snow: parse('#FFFAFA'),
  springgreen: parse('#00FF7F'),
  steelblue: parse('#4682B4'),
  tan: parse('#D2B48C'),
  teal: parse('#008080'),
  thistle: parse('#D8BFD8'),
  tomato: parse('#FF6347'),
  turquoise: parse('#40E0D0'),
  violet: parse('#EE82EE'),
  wheat: parse('#F5DEB3'),
  white: parse('#FFFFFF'),
  whitesmoke: parse('#F5F5F5'),
  yellow: parse('#FFFF00'),
  yellowgreen: parse('#9ACD32')
};

(function() {
  /*
   * 定义一些预设的颜色，然后就可以通过JColor.BLUE, JColor.RED这样访问。
   */
  for(var clrName in $clrMap) {
    JColor[clrName.toUpperCase()] = new JColor($clrMap[clrName]);
  }
})();