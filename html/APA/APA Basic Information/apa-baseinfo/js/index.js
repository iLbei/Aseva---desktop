var lang = '';
$('input').on({
  'change': function () {
    if ($(this).attr('type') == 'number') {
      $(this).val(compareVal(this, $(this).val()));
    }
  },
  'keypress': function (e) {
    if ($(this).attr('type') == 'number') {
      if (e.charCode < 45 || e.charCode > 57) {
        return false;
      }
    }
  },
  "focus": function () {
    if ($(this).attr('name') == 'dateTime') {
      var date = new Date,
        year = date.getFullYear(),
        month = (date.getMonth() + 1) < 10 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1),
        day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate(),
        hours = date.getHours() < 10 ? '0' + date.getHours() : date.getHours(),
        minutes = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes(),
        seconds = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();
      $(this).val(year + '/' + month + '/' + day + ' ' + hours + ':' + minutes + ':' + seconds);
    }
  }
});
$('button').click(function () {
  $('input').each(function () {
    biSetGlobalParameter("APABaseInfo." + $(this).prev().attr('language') + "", $(this).val());
  })
  setConfig();
  biAlert(lang == 1 ? 'Information input succeeded!' : '信息输入成功!', '');
})
function biOnInitEx(config, moduleConfigs) {
  lang = biGetLanguage();
  $('[language]').each(function () {
    var value = $(this).attr('language');
    $(this).html(lang == 1 ? en[value] : cn[value]);
  });
  for (var key in moduleConfigs) {
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(moduleConfigs[key], "text/xml");
    var countrys = xmlDoc.getElementsByTagName('config');
    var keys = countrys[0].attributes;
    var obj = new Object();
    for (var i = 0; i < keys.length; i++) {
      obj[keys[i].nodeName] = keys[i].nodeValue;
    }
    loadConfig(obj);
  }
}
function loadConfig(config) {
  if (config == null) return;
  $('.container [name]').each(function () {
    var name = $(this).attr('name');
    if (config[name] == '' || config[name] == 'null') return;
    $(this).val(config[name]);
    if ($(this).attr('type') == 'number') {
      $(this).val(compareVal(this, config[name]));
    }
  });
}
function setConfig() {
  var text = "<?xml version=\"1.0\" encoding=\"utf-8\"?><root><config";
  $('.container [name]').each(function () {
    var key = $(this).attr('name');
    text += " " + key + "=\"" + $(this).val() + "\"";
  });
  text += " /></root>";
  biSetModuleConfig("apa-baseinfo.aspluginapaevaluation", text);
}

function compareVal(obj, val) {
  var step = $(obj).attr('step').length > 2 ? $(obj).attr('step').length - 2 : 0;
  var v = Number(val);
  var newVal = "";
  if (isNaN(val) || !Boolean(val)) {
    newVal = Number($(obj).attr('value'));
  } else {
    var min = Number($(obj).attr('min')),
      max = Number($(obj).attr('max'));
    v = v < min ? min : v;
    v = v > max ? max : v;
    if (step > 0) {
      newVal = Math.round((Math.abs(v) * Math.pow(10, step)).toFixed(1)) / Math.pow(10, step);
      if (v < 0) newVal = -newVal;
    } else {
      newVal = Math.floor(v);
    }
  }
  return step > 0 ? newVal.toFixed(step) : newVal;
}