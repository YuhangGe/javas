Javas核心管理器 - JManager类
-------

* `manager.js` 对外提供Manager类的接口文件
* `manager.main.js` 定义Manager类的主文件
* `manager.event.js` 处理事件的部分
* `manager.render.js` 处理绘图、动画的部分

Manager类功能复杂且耦合度高，不适合模块化，故拆分成多个文件。思想来源于.NET的partial关键字。