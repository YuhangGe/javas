var _ = require('../util/util.js');

module.exports = ShapeList;

function ListNode(value, previous, next) {
  this.value = value;
  this.animationList = [];
  this.previous = previous ? previous : null;
  this.next = next ? next : null;
}

function ShapeList() {
  this.length = 0;
  this.head = null;
  this.tail = null;
  this.map = new Map();
}
ShapeList.prototype = {
  pop: function() {
    if (!this.tail) {
      _.warn('try pop ShapeList with length 0');
      return undefined;
    }
    var n = this.tail;
    if (this.tail === this.head) {
      this.tail = this.head = null;
    } else {
      n.previous.next = null;
      this.tail = n.previous;
    }
    n.previous = n.next = null;
    this.map.delete(n.value.id);
    return n.value;
  },
  push: function(shape) {
    this.add(shape, this.length);
  },
  unshift: function(shape) {
    this.add(shape, 0);
  },
  getById: function(shapeId) {
    return this.map.get(shapeId).value;
  },
  add: function(shape, index) {
    if (!shape.id) {
      shape.id = _.uid();
    }
    if (this.map.has(shape.id)) {
      return;
    }
    var n = new ListNode(shape);
    if (!this.head) {
      this.head = this.tail = n;
    } else if (index >= this.length - 1) {
      this.tail.next = n;
      n.previous = this.tail;
      this.tail = n;
    } else if (index <= 0) {
      n.next = this.head;
      this.head.previous = n;
      this.head = n;
    } else {
      var i, p = this.head;
      for (i = 0; i < index - 1; i++) {
        p = p.next;
      }
      p.next.previous = n;
      p.next = n;
    }
    this.length++;
    this.map.set(shape.id, n);
  },
  remove: function(shape) {
    if (!this.map.has(shape.id)) {
      return;
    }
    var n = this.map.get(shape.id);
    if (!n.next) {
      this.tail = n.previous;
    }
    if (!n.previous) {
      this.head = n.next;
    }
    n.previous = n.next = null;
    n.value = null;
    this.length--;
  },
  forEach: function(fn, startIndex, endIndex, descOrder) {
    var c = this.head;
    var i = 0, rtn;
    while(c) {
      rtn = fn(c.value, i);
      if (rtn === false) {
        /*
         * 如果函数返回了false，则相当于调用了break，跳出循环.
         */
        return;
      }
      c = c.next;
      i++;
    }
  }
};