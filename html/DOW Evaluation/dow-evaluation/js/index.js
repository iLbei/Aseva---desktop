//2023/11/14 v1.0.0 首个版本
var not_config = "";
$('[name=enabled]').click(function () {
  check($(this));
});

$('[name]').change(function () {
  setConfig();
});

$('input[type=number]').on({
  "change": function () {
    $(this).val(compareVal(this, $(this).val()));
  },
  'input': function (e) {
    if (e.which == undefined) {
      var step = $(this).attr("step").length - 2;
      var val = Number($(this).val());
      $(this).val(step > 0 ? val.toFixed(step) : val);
    }
    setConfig();
  },
  'keypress': function (e) {
    if (!(e.charCode >= 48 && e.charCode <= 57) && !(e.charCode == 45 || e.charCode == 46)) {
      return false;
    }
  }
})

$("input[type=text]").on("keyup", function () {
  if ($(this).is(":valid")) {
    $(this).attr("value", $(this).val());
    setConfig();
  }
}).on("blur", function () {
  $(this).val($(this).attr('value'));
  setConfig();
})

$("a").click(function () {
  if ($(this).hasClass("disabled_a")) return;
  var name = $(this).attr('name');
  if (name == "final_msg") {
    var originID = $(this).text().indexOf(not_config) != -1 ? null : $(this).attr('val');
    biSelectBusMessage("TargetMessage", originID);
  } else {
    biSelectSignal(name, $(this).attr('val'), false, null, false, null, null);
  }
})

function check(obj) {
  if ($(obj).is(":checked")) {
    enAbled();
    if ($('[name=final_msg]').text().indexOf(not_config) != -1) $('[name=final_msg]').addClass('red');
    clickDowGtSignalChecked($('[name=dow_gt_signal_checked]'));
  } else {
    disAbled();
  }
}

//全局禁用启用
function disAbled() {
  $('.content [name]:not(a)').each(function () {
    $(this).attr("disabled", "disabled").addClass("disabled_background");
  });
  $('.content,a').addClass('disabled_a');
}

function enAbled() {
  $('.content [name]:not(a)').each(function () {
    $(this).removeAttr("disabled").removeClass("disabled_background");
  });
  $('.content,a').removeClass("disabled_a");
}

//局部禁用启用-dow left gt signal
function clickDowGtSignalChecked(obj) {
  if (!$(obj).is(":checked")) {
    $(obj).parents(".top").parent().find(".bottom,.bottom2").removeClass("disabled_a");
    $(obj).parents(".top").parent().find(".bottom [name],.bottom2 [name]").removeClass("disabled_background");
    $('.top>li:nth-child(8) [name]:not([name=dow_gt_signal_checked],a),.top>li:nth-child(9) [name]').attr("disabled", "disabled").addClass("disabled_background");
    $('.top>li:nth-child(8) [language],.top>li:nth-child(9) [language]').addClass("disabled_a");
  } else {
    $(obj).parents(".top").parent().find(".bottom,.bottom2").addClass("disabled_a");
    $(obj).parents(".top").parent().find(".bottom [name],.bottom2 [name]").addClass("disabled_background");
    $('.top>li:nth-child(8) [name]:not([name=dow_gt_signal_checked],a),.top>li:nth-child(9) [name]').removeAttr('disabled').removeClass("disabled_background");
    $('.top>li:nth-child(8) [language],.top>li:nth-child(9) [language]').removeClass("disabled_a");
  }
}

function setConfig() {
  var text = "<?xml version=\"1.0\" encoding=\"utf-8\"?><root ";
  $('[name]').each(function () {
    var key = $(this).attr('name');
    var type = $(this).attr('type');
    var val = $(this).val();
    if (type == "checkbox") {
      val = $(this).is(":checked") ? "yes" : "no";
    } else if ($(this).is("a")) {
      val = $(this).attr('val') == undefined ? null : $(this).attr('val');
    } else if (type == "number") {
      val = $(this).val();
    }
    text += " " + key + "=\"" + val + "\"";
  });
  text += " />";
  biSetModuleConfig("dow-evaluation.adasevaluation", text);
}

function biOnSelectedSignal(key, valueInfo, signBitInfo, scale) {
  if (valueInfo == null) {
    $("[name=" + key + "]").removeClass('green red').text(not_config).removeAttr("val title");
  } else if (valueInfo.typeName == undefined) {
    $("[name=" + key + "]").addClass('red').removeClass('green');
  } else {
    $("[name=" + key + "]").text(valueInfo.signalName).attr({
      "val": valueInfo.id,
      'scaleVal': scale,
      "title": valueInfo.id
    }).addClass('green');
  }
  setConfig();
}

function biOnQueriedSignalInfo(key, signalInfo) {
  if (signalInfo != null) {
    $("[name=" + key + "]").addClass('green').removeClass('red').attr('title', signalInfo.typeName + ':' + signalInfo.signalName);
  } else {
    $("[name=" + key + "]").addClass('red').removeClass('green').text($("[name=" + key + "]").attr('val'));
  }
}

function biOnSelectedBusMessage(key, info) {
  if (info == null) {
    $('[name=final_msg]').removeAttr("val title").text(not_config).removeClass('green');
  } else {
    $('[name=final_msg]').attr({ "val": info.id, "title": info.id }).text(info.name).addClass('green');
  }
  setConfig();
}

function biOnQueriedBusMessageInfo(key, busMessageInfo) {
  if (busMessageInfo == null) {
    $('[name=final_msg]').text($('[name=final_msg]').attr('val')).attr("title", $('[name=final_msg]').attr('val')).removeClass('green').addClass('red');
  } else {
    $('[name=final_msg]').attr({
      "val": busMessageInfo.id,
      "title": busMessageInfo.id
    }).text(busMessageInfo.name).addClass('green');
  }
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
    var countrys = xmlDoc.getElementsByTagName('root');
    var keys = countrys[0].attributes;
    var obj = new Object();
    for (var i = 0; i < keys.length; i++) {
      obj[keys[i].nodeName] = keys[i].nodeValue;
    }
    loadConfig(obj);
  }
}

function loadConfig(val) {
  $('[name]').each(function () {
    var name = $(this).attr('name');
    var type = $(this).attr('type');
    if (type == 'checkbox') {
      $(this).attr('checked', val[name] == "yes");
    } else if (type == "number") {
      var v = compareVal(this, val[name]);
      $(this).val(v).attr('value', v);
    } else if ($(this).is("a")) {
      if (name == "final_msg") {
        if (val[name] != "null") {
          $(this).attr('val', val[name]);
          biQueryBusMessageInfo("TargetMessage", val[name]);
        }
      } else {
        if (val[name] != "null") {
          biQuerySignalInfo(name, val[name]);
          $(this).attr('val', val[name]);
          if ($(this).hasClass('red')) {
            $(this).text(val[name]);
          } else {
            $(this).text(val[name].substring(val[name].lastIndexOf(":") + 1)).addClass('green');
          }
        }
      }
    } else {
      if(type=="text") $(this).attr("value",val[name]);
      $(this).val(val[name]);
    }
  });
  check($('[name=enabled]'));
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