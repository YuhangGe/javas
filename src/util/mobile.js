/*
 * 检查设备的移动属性，代码来源于开源社区，版权非javas所有。
 */
var
  apple_phone         = /iPhone/i,
  apple_ipod          = /iPod/i,
  apple_tablet        = /iPad/i,
  android_phone       = /(?=.*\bAndroid\b)(?=.*\bMobile\b)/i, // Match 'Android' AND 'Mobile'
  android_tablet      = /Android/i,
  windows_phone       = /IEMobile/i,
  windows_tablet      = /(?=.*\bWindows\b)(?=.*\bARM\b)/i, // Match 'Windows' AND 'ARM'
  other_blackberry    = /BlackBerry/i,
  other_blackberry_10 = /BB10/i,
  other_opera         = /Opera Mini/i,
  other_firefox       = /(?=.*\bFirefox\b)(?=.*\bMobile\b)/i, // Match 'Firefox' AND 'Mobile'
  seven_inch = new RegExp(
    '(?:' +         // Non-capturing group

    'Nexus 7' +     // Nexus 7

    '|' +           // OR

    'BNTV250' +     // B&N Nook Tablet 7 inch

    '|' +           // OR

    'Kindle Fire' + // Kindle Fire

    '|' +           // OR

    'Silk' +        // Kindle Fire, Silk Accelerated

    '|' +           // OR

    'GT-P1000' +    // Galaxy Tab 7 inch

    ')',            // End non-capturing group

    'i');           // Case-insensitive matching

var match = function(regex, userAgent) {
  return regex.test(userAgent);
};

var IsMobileClass = function(userAgent) {
  var ua = userAgent || navigator.userAgent;

  this.apple = {
    phone:  match(apple_phone, ua),
    ipod:   match(apple_ipod, ua),
    tablet: match(apple_tablet, ua),
    device: match(apple_phone, ua) || match(apple_ipod, ua) || match(apple_tablet, ua)
  };
  this.android = {
    phone:  match(android_phone, ua),
    tablet: !match(android_phone, ua) && match(android_tablet, ua),
    device: match(android_phone, ua) || match(android_tablet, ua)
  };
  this.windows = {
    phone:  match(windows_phone, ua),
    tablet: match(windows_tablet, ua),
    device: match(windows_phone, ua) || match(windows_tablet, ua)
  };
  this.other = {
    blackberry:   match(other_blackberry, ua),
    blackberry10: match(other_blackberry_10, ua),
    opera:        match(other_opera, ua),
    firefox:      match(other_firefox, ua),
    device:       match(other_blackberry, ua) || match(other_blackberry_10, ua) || match(other_opera, ua) || match(other_firefox, ua)
  };
  this.seven_inch = match(seven_inch, ua);
  this.any = this.apple.device || this.android.device || this.windows.device || this.other.device || this.seven_inch;
  // excludes 'other' devices and ipods, targeting touchscreen phones
  this.phone = this.apple.phone || this.android.phone || this.windows.phone;
  // excludes 7 inch devices, classifying as phone or tablet is left to the user
  this.tablet = this.apple.tablet || this.android.tablet || this.windows.tablet;

  if (typeof window === 'undefined') {
    return this;
  }

  /**
   * 没有鼠标的设备。
   *  包括苹果的所有移动设备，android和windows的手机，
   *  等。
   *  android和windows的平板是可能有鼠标的。
   */
  this.no_mouse = this.apple.device || this.windows.phone || this.android.phone || this.other.device || this.seven_inch;

};

module.exports = new IsMobileClass();