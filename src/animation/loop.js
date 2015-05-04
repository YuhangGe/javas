var Class = require('j-oo');
var _ = require('../util/util.js');

module.exports = Class(function LoopAnimation(manager) {
  this.id = _.uid();
  this.state = 'run';
  this.manager = manager;
  this.notifies = [];
}, {
  execute: function() {
  },
  run: function() {
    //if (this.state === 'run') {
    //  return;
    //}
    this.state = 'run';
    this.manager.loopIfNeed();
  },
  stop: function() {
    this.state = 'wait';
  }
});