$(".container").on("input", "input[type=number]", function (e) {
  var v = Number($(this).val());
  var name = $(this).attr("name");
  if (isNaN(e.which)) {
    var step = $(this).attr("step");
    step.length > 1 ? $(this).val(v.toFixed(name == "matchThresh" ? step.length - 1 : step.length)) : $(this).val(v);
  }
  $(this).attr("value", compareVal(this,v));
  setConfig();
});
$(".container").on("blur", "input[type=number]", function () {
  $(this).val(compareVal(this, $(this).val())).attr("value",compareVal(this, $(this).val()));
});
//有input type=number 情况下比较大小
function compareVal(obj, val) {
  var newVal = 0,
    step = $(obj).attr("step").length,
    name = $(obj).attr("name");
  if (isNaN(Number(val))) {
    newVal = Number($(obj).attr('value'));
  } else {
    var min = 0,
      max = Number($(obj).attr("max"));
    switch (name) {
      case "matchThresh": {
        max = 100;
        break;
      }
      case "absZeroPowerLimit":
      case "absSecondPowerLimit":
      case "absFirstPowerLimit":
      case "absThirdPowerLimit": {
        max = 10000;
        break;
      }
      default:
        break;
    }
    if (val > max) {
      val = max;
    } else if (val < min) {
      val = min;
    }
    if (name == "matchThresh") step = step - 1;
    newVal = Math.round(Math.abs(val) * Math.pow(10, step)) / Math.pow(10, step);
    if (val < 0) newVal = -newVal;
    newVal = newVal.toFixed(step);
  }
  return newVal;
}
/*----------配置读取与存储-----------*/
// 表单内容改变保存配置
$('[name]').change(function () {
  if ($(this).attr("name") == "lfEnable") enabledChange();
  setConfig();
});
function enabledChange() {
  if ($("[name=lfEnable]").is(":checked")) {
    $('.container>ul').find('[language]').removeClass('disabled_a');
    $('.container>ul [name]').attr('disabled', false).removeClass('disabled disabled_background');
  } else {
    $('.container>ul').find('[language]').addClass('disabled_a');
    $('.container>ul [name]').attr('disabled', true).addClass('disabled disabled_background');
  }
}
//保存配置
function setConfig() {
  var text = "<?xml version=\"1.0\" encoding=\"utf-8\"?><root><config ";
  $('.container [name]').each(function () {
    var name = $(this).attr('name');
    var val = $(this).val();
    if ($(this).attr('type') == 'checkbox') {
      text += name + "=\"" + ($(this).is(':checked') ? "yes" : "no") + "\" ";
    } else {
      text += name + "=\"" + val + "\" ";
    }
  });
  text += " /></root>";
  biSetModuleConfig("lanes-fusion.aspluginlanesfusion", text);
}
//初始化
function biOnInitEx(config, moduleConfigs) {
  $('[language]').each(function () {
    var value = $(this).attr('language');
    $(this).html(biGetLanguage() == 1 ? en[value] : cn[value])
  });
  for (var key in moduleConfigs) {
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(moduleConfigs[key], "text/xml");
    var obj = new Object();
    var root = xmlDoc.getElementsByTagName('config');
    var keys = root[0].attributes;
    for (var i = 0; i < keys.length; i++) {
      //获取root自身字节的属性
      obj[keys[i].nodeName] = keys[i].nodeValue;
    }
    loadConfig(obj);
  }
}
function loadConfig(obj) {
  if (obj == null) return;
  $('.container [name]').each(function () {
    var name = $(this).attr('name');
    var type = $(this).attr('type');
    var val = obj[name];
    if (type == 'checkbox') {
      $(this).prop('checked', val == 'yes');
    } else if (type == "number") {
      var step = $(this).attr("step").length;
      val = Number(compareVal(this, val));
      $(this).val(step > 2 ? val.toFixed(name == "matchThresh" ? step - 1 : step) : val).attr("value", val);
    } else {
      $(this).val(val);
    }
  })
  enabledChange();
}