var _ = require('../util/util.js');

module.exports = JContext;

function JContext(jcanvas) {
  this.ctx = jcanvas.originCanvas.getContext('2d');
  this.canvas = jcanvas;
}
JContext.prototype = {

};