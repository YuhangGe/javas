var Class = require('j-oo');
var _ = require('../../util/util.js');

module.exports = Class(function JEvent(ev) {
  this.originEvent = ev;
  this.x = ev.layerX;
  this.y = ev.layerY;
  this.ctrlKey = ev.ctrlKey || ev.metaKey;
  this.deltaX = 0;
  this.deltaY = 0;
  this.keyCode = ev.keyCode;
}, {
  stop: function() {
    this.originEvent.stopPropagation();
    this.originEvent.preventDefault();
  }
});