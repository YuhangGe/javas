javas
------

轻量的动静态绘图库


优化
====

* 主循环里，requestAnimationFrame 在所有形状都不需要重绘的时候暂停。