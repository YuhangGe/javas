/*
 * 检查浏览器的名称和版本，是否是触屏状态以及触屏事件的名称。
 *   触屏事件的名称不同浏览器差异较大，特别是IE系列在11之前都不稳定。
 *   随着浏览器版本的更新以及W3C的标准制定，此处的代码有可能过时。
 */
var $ = {};
var ua = navigator.userAgent.toLowerCase();
var s;
(s = ua.match(/msie ([\d.]+)/)) ? $.ie = s[1] : ( s = ua.match(/firefox\/([\d.]+)/)) ? $.firefox = s[1] : ( s = ua.match(/chrome\/([\d.]+)/)) ? $.chrome = s[1] : ( s = ua.match(/opera.([\d.]+)/)) ? $.opera = s[1] : ( s = ua.match(/version\/([\d.]+).*safari/)) ? $.safari = s[1] : 0;

//检测ie11以上版本需要特别处理
(s = ua.match(/trident\/.*rv:([\d.]+)/)) ? $.ie = s[1] : 0;

(s = ua.match(/mac os x (\d+)[\._](\d+)/)) ? ($.macOS = s[1] + "." + s[2]) : $.winOS = true;
(s = ua.match(/ipad;.+version\/(\d+\.\d+)/)) ? ($.iPad = s[1]) : 0;
(s = ua.match(/android/)) ? ($.android = true) : 0;

//检测是否是触屏。对于ie浏览器目前是单独的判断。
var has_tstart = ('ontouchstart' in window);
$.touchable = !!(has_tstart || window.navigator.msMaxTouchPoints);
var _ms = window.navigator.msPointerEnabled;

$.touchEvent = {
  'down': _ms ? ($.ie === '9.0' ? 'pointerdown' : 'MSPointerDown') : (has_tstart ? 'touchstart' : 'mousedown'),
  'move': _ms ? ($.ie === '9.0' ? 'pointermove' : 'MSPointerMove') : (has_tstart ? 'touchmove' : 'mousemove'),
  'up': _ms ? ($.ie === '9.0' ? 'pointerup' : 'MSPointerUp') : (has_tstart ? 'touchend' : 'mouseup')
};

module.exports = $;