var channels = [];
$('[name]').change(function () {
  if ($(this).attr('name') == 'ip') return;
  setConfig();
});
function setConfig() {
  var text = "<?xml version=\"1.0\" encoding=\"utf-8\"?><root";
  text += " enabled" + "=\"" + ($('[name=connect]').is(":checked") ? "yes" : "no") + "\"";
  text += " ip" + "=\"" + $('[name=ip]').val() + "\"";
  text += " port" + "=\"" + compareVal($('[name=port]'), $('[name=port]').val()) + "\"";
  text += " dataPath=\"\"";
  text += "/>";
  biSetModuleConfig("zhuishi-8m-cameras.pluginzhuishi", text);
}
function biOnInitEx(config, moduleConfigs) {
  $('[language]').each(function () {
    var value = $(this).attr('language');
    $(this).html(biGetLanguage() == 1 ? en[value] : cn[value])
  });
  for (var key in moduleConfigs) {
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(moduleConfigs[key], "text/xml");
    var obj = new Object();
    var root = xmlDoc.getElementsByTagName('root');
    var keys = root[0].attributes;
    for (var i = 0; i < keys.length; i++) {
      obj[keys[i].nodeName] = root[0].getAttribute(keys[i]) == "null" ? "" : keys[i].nodeValue;
    }
    loadConfig(obj);
  }
}
function loadConfig(val) {
  if (val == null) return;
  $('[name=ip]').val(val['ip']).addClass('green');
  $('[name=port]').val(val['port']);
  if (val['enabled'] == "yes") $('[name=connect]').attr('checked', true);
}
$('input[type=number]').on({
  'blur': function () {
    $(this).val(compareVal(this, $(this).val()));
  },
  'input': function (e) {
    setConfig();
  },
  'keypress': function (e) {
    setConfig()
    if (e.charCode == 43) return false;
  }
});
$('[type=text]').on("keyup", function () {
  var reg = /^([1-9]|([1-9][0-9])|(1[0-9][0-9])|(2[0-4][0-9])|(25[0-5]))(\.([0-9]|([1-9][0-9])|(1[0-9][0-9])|(2[0-4][0-9])|(25[0-5]))){3}$/;
  var val = $(this).val();
  reg.test(val) ? $(this).addClass('green').attr('value', val).removeClass('red') : $(this).removeClass('green').addClass('red');
  if (!$(this).hasClass('red')) setConfig();
}).blur(function () {
  if ($(this).val() == "" || $(this).hasClass('red')) {
    $(this).val($(this).attr('value')).addClass('green').removeClass('red');
  } else {
    setConfig();
  }
})
function compareVal(obj, val) {
  var step = $(obj).attr('step').length > 2 ? $(obj).attr('step').length - 2 : 0,
    v = Number(val),
    newVal = 0;
  if (isNaN(v)) {
    newVal = Number($(obj).attr('value'));
  } else {
    var min = Number($(obj).attr('min')),
      max = Number($(obj).attr('max'));
    v = v < min ? min : v;
    v = v > max ? max : v;
    newVal = Math.round(Math.abs(v) * Math.pow(10, step)) / Math.pow(10, step);
    if (v < 0) newVal = -newVal;
  }
  return newVal.toFixed(step);
}