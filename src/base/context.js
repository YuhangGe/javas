/*
 * 由于 JContext 这个类的逻辑比较复杂，代码会很长，因此进行多文件拆分。
 * context.draw.js封装绘图相关API，并进行扩展。
 * context.transform.js封装矩阵变换的相关API，并进行扩展。
 * context.main.js封装属性设置相关API，包括颜色粗细等，并进行扩展。
 */
require('./context/context.draw.js');
require('./context/context.transform.js');
module.exports = require('./context/context.main.js');