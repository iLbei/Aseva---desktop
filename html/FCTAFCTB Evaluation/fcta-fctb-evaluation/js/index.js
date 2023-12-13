//2023/11/15 v1.0.0 首个版本
var not_config = "";
$('[type=checkbox]').change(function () {
  var name = $(this).attr("name");
  if (name == "enabled") {
    check($(this));
  } else if (["FCTBGTSignalChecked", "FCTAGTSignalChecked"].includes(name)) {
    clickRCTGtSignalChecked(this);
  }
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

$("input[type=text]").on("keyup", function () {
  if ($(this).is(":valid")) {
    $(this).attr("value", $(this).val());
    setConfig()
  }
}).on("blur", function () {
  $(this).val($(this).attr('value'));
  setConfig();
})

function check(obj) {
  if ($(obj).is(":checked")) {
    enAbled();
    if ($('[name=final_msg]').text().indexOf(not_config) != -1) $('[name=final_msg]').addClass('red');
    clickRCTGtSignalChecked($('[name=FCTBGTSignalChecked]'));
    clickRCTGtSignalChecked($('[name=FCTAGTSignalChecked]'));
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

//局部禁用启用-FCTB/FCTA left gt signal
function clickRCTGtSignalChecked(obj) {
  if ($(obj).is(":checked")) {
    $(obj).parent().next().addClass("disabled_a");
    $(obj).parent().next().find("[name]").addClass("disabled_background").attr("disabled", "disabled");
    $(obj).next().find("[name]").removeAttr('disabled').removeClass("disabled_background");
    $(obj).next().find("[language]").removeClass("disabled_a");

  } else {
    $(obj).parent().next().removeClass("disabled_a");
    $(obj).parent().next().find("[name]").removeClass("disabled_background").removeAttr("disabled");
    $(obj).next().find("input[name]").addClass("disabled_background").attr("disabled", "disabled");
    $(obj).next().find("[language]").addClass("disabled_a");
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
      var txt = "null";
      if ($(this).text().indexOf(not_config) == -1) {
        txt = $(this).attr("val");
      }
      val = txt;
    } else if (type == "number") {
      val = $(this).val();
    }
    text += " " + key + "=\"" + val + "\"";
  });
  text += " />";
  biSetModuleConfig("fcta-fctb-evaluation.adasevaluation", text);
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
  if (signalInfo) {
    $("[name=" + key + "]").text(signalInfo.signalName).addClass("green");
  } else {
    $("[name=" + key + "]").text($("[name=" + key + "]").attr("val")).addClass("red");
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

function loadConfig(obj) {
  $('[name]').each(function () {
    var name = $(this).attr('name');
    var type = $(this).attr('type');
    var val = obj[name];
    if (type == 'checkbox') {
      $(this).attr('checked', val == "yes");
    } else if (type == "number") {
      var v = compareVal(this, val);
      $(this).val(v).attr('value', v);
    } else if ($(this).is("a")) {
      if (name == "final_msg") {
        if (val != "null") {
          $(this).attr('val', val);
          biQueryBusMessageInfo("TargetMessage", val);
        }
      } else {
        if (val != "" && val != "null") {
          biQuerySignalInfo(name, val);
          $(this).attr({ "title": val, "val": val });
        }
      }
    } else {
      if ($(this).attr("type") == "text") $(this).attr("value", val);
      $(this).val(val);
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