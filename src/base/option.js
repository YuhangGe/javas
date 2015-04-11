var JColor = require('./../color/color.js');
var JMatrix = require('./matrix.js');

var defaultBaseOptions = {
  //animate : { //如果animate为false, 则表示不动画
  //  start: {
  //    type: 'immediate', //'delay', 'notify', 'wait', 'after'
  //
  //  },
  //  duration: {
  //
  //  }
  //},
  animate: false,
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