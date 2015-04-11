var JColor = require('./color.js');
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
  strokeStyle: new JColor(0, 0, 0),
  fillStyle: new JColor(0, 0, 0),
  lineWidth: 2.0,
  lineCap: 'round',
  lineJoin: 'round',
  transformMatrix: new JMatrix()
};

module.exports = defaultBaseOptions;