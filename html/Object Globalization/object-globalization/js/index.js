//2023/10/12 v2.1.0 输出频率增加  0.1 和 0.2两个选项
$('[name]').change(function () {
  if ($(this).attr("type") == "checkbox") isDisabled();
  setConfig();
})

/*---------------input [type=number]--------------*/
$('.container').on("change", "input[type=number]", function () {
  $(this).val(compareVal(this, $(this).val()));
}).on('input', "input[type=number]", function (e) {
  if (e.which == undefined) {
    var step = $(this).attr("step").length - 2;
    var val = Number($(this).val());
    $(this).val(step > 0 ? val.toFixed(step) : val);
  }
  setConfig();
}).on('keypress', "input[type=number]", function (e) {
  if (!(e.charCode >= 48 && e.charCode <= 57) && !(e.charCode == 45 || e.charCode == 46)) return false;
})

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
/**
 *  页面加载时,读取本地配置
 */
function loadConfig(val) {
  $('[name]').each(function () {
    var name = $(this).attr('name');
    if ($(this).attr('type') == 'checkbox') {
      $(this).attr('checked', val[name] == "yes");
    } else if ($(this).attr('type') == 'number') {
      $(this).val(compareVal(this, val[name]));
    } else {
      $(this).val(val[name]);
    }
  });
  isDisabled();
}

function isDisabled() {
  if ($('[name=enabled]').is(":checked")) {
    $('.container>div:not(:first-child) [name]').removeAttr("disabled").removeClass("disabled_background");
    $('.container>div:not(:first-child) span').removeClass("disabled_a");
  } else {
    $('.container>div:not(:first-child) [name]').attr("disabled", true).addClass("disabled_background");
    $('.container>div:not(:first-child) span').addClass("disabled_a");
  }
}

/**
 * 写配置
 */
function setConfig() {
  var text = "<?xml version=\"1.0\" encoding=\"utf-8\"?><root";
  $('[name]').each(function () {
    var key = $(this).attr('name');
    var val = $(this).val();
    if ($(this).attr('type') == "checkbox") {
      val = $(this).get(0).checked == true ? "yes" : "no";
    } else if ($(this).attr('type') == "number") {
      val = compareVal(this, $(this).val());
    }
    text += " " + key + "=\"" + val + "\"";
  });
  text += " traffic_source=\"(Disabled)\" />";
  biSetModuleConfig("object-globalization.asplugindynamictrafficgen", text);
}

function biOnInitEx(config, moduleConfigs) {
  var lang = biGetLanguage() == 1 ? en : zh;
  $('[language]').each(function () {
    var value = $(this).attr('language');
    $(this).text(lang[value])
  });
  for (var key in moduleConfigs) {
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(moduleConfigs[key], "text/xml");
    var countrys = xmlDoc.getElementsByTagName('root');
    var keys = countrys[0].attributes;
    var obj = new Object();
    for (var i = 0; i < keys.length; i++) {
      obj[keys[i].nodeName] = keys[i].nodeValue;
    }
    loadConfig(obj);
  }
}