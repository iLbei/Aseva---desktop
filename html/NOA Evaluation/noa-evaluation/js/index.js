// 2023/10/8 v1.0.0
//  2023/10/31 v1.0.1 修复:在超链接禁用时依旧可以点击；在linux系统上点击超链接无法弹出选信号弹窗
//  2023/11/2 v1.0.2 修复:Lane line type signal->Lane type signal
var not_config = "";
$("a").on("click", function () {
  if (!$(this).hasClass("disabled_a")) {
    var id = $(this).attr("id");
    var scale = $(this).attr("scale");
    var key = $(this).attr("name");
    biSelectSignal(key, id, false, null, true, scale, null);
  }
})

function biOnSelectedSignal(key, valueSignalInfo, signBitSignalInfo, scale) {
  if (valueSignalInfo == null) {
    $('[name=' + key + ']').removeAttr('title id scale').text(not_config).removeClass("green red");
  } else {
    var id = valueSignalInfo.id;
    if (valueSignalInfo.typeName == null) {
      $('[name=' + key + ']').html(id).addClass("red").removeClass("green");
    } else {
      var signalName = valueSignalInfo.signalName;
      $('[name=' + key + ']').html(signalName).addClass("green").removeClass("red");
    }
    $('[name=' + key + ']').attr({ 'title': id, "scale": scale, "id": id });
  }
  setConfig();
}

//仅步长=精确位数-1时适用
$("body").on("input", "input[type=number]", function (e) {
  var v = $(this).val();
  if (isNaN(e.which)) {
    $(this).attr("value", compareVal(this, v)).val(compareVal(this, v))
  } else {
    $(this).attr("value", v);
  }
  setConfig();
});

$("body").on("blur", "input[type=number]", function () {
  $(this).attr("value", compareVal(this, $(this).val())).val(compareVal(this, $(this).val()));
});

function compareVal(obj, val) {
  var newVal = 0;
  var name = $(obj).attr("name");
  var step = Number($(obj).attr("step").length) - 1;
  if (isNaN(val) || !Boolean(val)) {
    newVal = Number($(obj).attr('value'));
  } else {
    var min = 0,
      max = 0;
    switch (name) {
      case "noaEnableTargetValue": {
        max = 100;
        break;
      }
      case "accEnableTargetValue": {
        max = 100;
        break;
      }
      case "accObjectDetectTargetValue": {
        max = 100;
        break;
      }
      case "accDistanceTargetValue": {
        max = 1000;
        break;
      }
      case "laneLineContactThresh": {
        max = 10;
        break;
      }
      case "cipvTTCSafeThresh": {
        max = 10000;
        break;
      }
      default:
        break;
    }
    if (val > max) {
      return max.toFixed(step);
    } else if (val < min) {
      return min.toFixed(step);
    } else {
      //解决为负数时末尾输入5不能进行四舍五入
      newVal = Math.round(Math.abs(val) * Math.pow(10, step)) / Math.pow(10, step);
      if (val < 0) newVal = -newVal;
      if (step > 0) {
        var newValString = newVal.toString();
        var index = newValString.indexOf(".");
        if (index == -1) {
          return newVal.toFixed(step);
        } else {
          if (newValString.substring(index + 1).length == step) {
            return newVal;
          } else {
            return newVal + "0".repeat(step - (newValString.length - 2));
          }
        }
      } else {
        return newVal;
      }
    }
  }
}

/*----------配置读取与存储-----------*/
$('[name]').on("change", function () {
  if ($(this).attr("name") == "noaEvaluationEnable") {
    checkboxChange(this);
  }
  setConfig();
});

//保存配置
function setConfig() {
  var text = "<?xml version=\"1.0\" encoding=\"utf-8\"?><root><config ";
  $('.container [name]').each(function () {
    var name = $(this).attr('name');
    var val = $(this).val();
    var type = $(this).attr('type');
    if (type == 'checkbox') {
      text += name + "=\"" + ($(this).is(':checked') ? "yes" : "no") + "\" ";
    } else if (type == "number") {
      text += name + "=\"" + compareVal(this, val) + "\" ";
    } else if ($(this).is("a")) {
      var txt = "null";
      var scale = 1;
      if ($(this).text().indexOf(not_config) == -1) {
        txt = $(this).attr("id");
        scale = $(this).attr("scale");
      }
      text += name + "=\"" + txt + "\" ";
      text += name + "_scale=\"" + scale + "\" ";
    } else {
      text += name + "=\"" + val + "\" ";
    }
  });
  text += " /></root>";
  biSetModuleConfig("noa-evaluation.aspluginnoaevaluation", text);
}

function biOnInitEx(config, moduleConfigs) {
  var lang = biGetLanguage() == 1 ? en : zh;
  $('[language]').each(function () {
    var value = $(this).attr('language');
    $(this).text(lang[value])
  });
  not_config = lang["not_config"];
  for (var key in moduleConfigs) {
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(moduleConfigs[key], "text/xml");
    var obj = {};
    var root = xmlDoc.getElementsByTagName('root');
    var keys = root[0].childNodes[0].attributes;
    for (var i = 0; i < keys.length; i++) {
      //获取root自身字节的属性
      obj[keys[i].nodeName] = keys[i].nodeValue;
    }
    loadConfig(obj);
  }
}

function loadConfig(obj) {
  $('.container [name]').each(function () {
    var name = $(this).attr("name");
    var val = obj[name];
    if (!Boolean(val)) return;
    var type = $(this).attr('type');
    if (type == 'checkbox') {
      $(this).prop('checked', val == 'yes');
      checkboxChange(this);
    } else if (type == "number") {
      var v = compareVal(this, val);
      $(this).val(v).attr("value", v);
    } else if ($(this).is('a')) {
      val = val == "" || val == "null" ? not_config : val;
      if (val != "") {
        biQuerySignalInfo(name, val);
        $(this).attr({ "title": val, "id": val, "scale": obj[$(this).attr("name") + "_scale"] });
      }
    } else {
      $(this).val(val);
    }
  })
}

function biOnQueriedSignalInfo(key, signalInfo) {
  if (signalInfo) {
    $("[name=" + key + "]").text(signalInfo.signalName).addClass("green");
  } else {
    $("[name=" + key + "]").text($("[name=" + key + "]").attr("id")).addClass("red");
  }
}

//部分界面Enable控制界面是否启用
function checkboxChange(obj) {
  if (!$(obj).is(':checked')) {
    $('ul>li input').addClass('disabled_background').attr('disabled', true);
    $("legend,ul>li [language]").addClass('disabled_a');
  } else {
    $('ul>li [name]').removeClass('disabled_background').attr('disabled', false);
    $("legend,ul>li [language]").removeClass('disabled_a');
  }
}