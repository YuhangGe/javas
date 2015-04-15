var Config = {
  debug: true,
  /*
   * 这里设置Manager的循环时间。10ms代表每秒loop的次数大概是100次，
   * 也就是，Manager可以达到的最大FPS是100。
   * 10ms虽然很频繁，但只进行了两行if一行加法的计算（见manager.js中_loopHandler函数代码），通常情况下，你不需要修改这个参数。
   *
   * todo 以后需要进一步优化FPS策略，使用比如
   */
  loopIntervalTime: 10
};

module.exports = Config;