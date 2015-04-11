var Config = {
  debug: true,
  /*
   * 这里设置Manager的循环时间。10ms代表每秒loop的次数大概是100次，
   * 也就是，Manager可以达到的最大FPS是100。
   * 10ms虽然很频繁，但只进行了两行if一行加法的计算（见manager.js中_loopHandler函数代码），通常情况下，你不需要修改这个参数。
   * 但考虑到处女座同学，可能就希望把这个值改大些，以避免频繁运算；
   *   或者某些情况下，需要超过100FPS的极限；
   *   这里仍然提供了可以配置的选项。
   */
  loopIntervalTime: 10
};

module.exports = Config;