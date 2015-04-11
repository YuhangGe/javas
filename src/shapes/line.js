var _ = require('../util/util.js');
var BaseShape = require('../base/shape.js');
var baseOptions = require('../base/option.js');
var Class = require('j-oo');

var defaultOptions = _.mergeOptions({
  animate: {
    start: {
      type: 'immediate'
    },
    duration: {
      type: 'time',
      length: 300
    },
    fn : 'linear'
  }
}, baseOptions);

var Line = Class(function (x1, y1, x2, y2, options) {
  this.base(_.mergeOptions(options, defaultOptions));
  this.x1 = x1;
  this.y1 = y1;
  this.x2 = x2;
  this.y2 = y2;
}, {

}, BaseShape);


