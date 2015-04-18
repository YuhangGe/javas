JContext类
------

对原生canvas的Context2D进行封装的类。

由于 JContext 这个类的逻辑比较复杂，代码会很长，因此进行多文件拆分。

* `context.draw.js` 封装绘图相关API，并进行扩展。
* `context.transform.js` 封装矩阵变换的相关API，并进行扩展。
* `context.main.js` 封装属性设置相关API，包括颜色粗细等，并进行扩展。
* `context.js` 对外暴露JContext类