var JColor = require('./../color/color.js');
var JMatrix = require('./struct/matrix.js');

var defaultBaseOptions = {
  zIndex: 'top', // 'bottom' / 2
  strokeStyle: JColor.BLACK,
  fillStyle: JColor.BLACK,
  lineWidth: 2.0,
  lineCap: 'round',
  lineJoin: 'round',
  opacity: 1.0,
  transformMatrix: new JMatrix()
};

module.exports = defaultBaseOptions;