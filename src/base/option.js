var JColor = require('./color.js');

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
  strokeColor: new JColor(0, 0, 0),
  fillColor: new JColor(0, 0, 0)
};

module.exports = defaultBaseOptions;