//2023/11/15 v1.0.0 首个版本
var not_config = "";
$('[type=checkbox]').change(function () {
  var name = $(this).attr("name");
  if (name == "enabled") {
    check($(this));
  } else if (["rcw_gt_signal_checked"].includes(name)) {
    clickRCWSignalChecked(this);
  }
});
$("input").on("input", function () {
  setConfig();
})
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
  if (name == "message_id") {
    var originID = $(this).text().indexOf(not_config) != -1 ? null : $(this).attr('val');
    biSelectBusMessage("TargetMessage", originID);
  } else {
    biSelectSignal(name, $(this).attr('val'), false, null, false, null, null);
  }
})

$(".tbody").on("click", "td", function () {
  $(this).addClass("bgblue").siblings().removeClass("bgblue").parent().siblings().children().removeClass("bgblue")
  if ($(this).index() == 0) {
    $(this).parent().addClass("bgblue");
  } else {
    $(this).parent().removeClass("bgblue");
  }
  $(this).parent().siblings().removeClass("bgblue");
}).on("input", "td", function () {
  $(this).removeClass("bgblue");
  if ($(this).parent().next().length == 0) {
    $(".tbody tbody").append("<tr><td></td><td contenteditable></td><td contenteditable></td><td contenteditable></td></tr>");
  }
  setConfig();
})

$("body").on("keydown", function (e) {
  if (e.keyCode == 46 && $(".bgblue").is("tr") && $(".bgblue").index() != $(".tbody>table>tbody").children().length - 1) {
    $(".bgblue").remove();
    setConfig();
  }
})

$("[type=text]").on("keyup", function () {
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
    if ($('[name=message_id]').text().indexOf(not_config) != -1) $('[name=message_id]').addClass('red');
    clickRCWSignalChecked($('[name=rcw_gt_signal_checked]'));
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
  $(".tbody>table>tbody>tr>td:not(:nth-child(1))").attr("contenteditable", false);
}

function enAbled() {
  $('.content [name]:not(a)').each(function () {
    $(this).removeAttr("disabled").removeClass("disabled_background");
  });
  $('.content,a').removeClass("disabled_a");
  $(".tbody>table>tbody>tr>td:not(:nth-child(1))").attr("contenteditable", true);
}

//局部禁用启用-RCW/rcta left gt signal
function clickRCWSignalChecked(obj) {
  if ($(obj).is(":checked")) {
    $(obj).parent().next().addClass("disabled_a");
    $(obj).parent().next().find("[name]").addClass("disabled_background").attr("disabled", "disabled");
    $(obj).next().find("[name]").removeAttr('disabled').removeClass("disabled_background");
    $(obj).next().find("[language]").removeClass("disabled_a");
    $(".tbody>table>tbody>tr>td:not(:nth-child(1))").attr("contenteditable", false);
  } else {
    $(obj).parent().next().removeClass("disabled_a");
    $(obj).parent().next().find("[name]").removeClass("disabled_background").removeAttr("disabled");
    $(obj).next().find("input[name]").addClass("disabled_background").attr("disabled", "disabled");
    $(obj).next().find("[language]").addClass("disabled_a");
    $(".tbody>table>tbody>tr>td:not(:nth-child(1))").attr("contenteditable", true);
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
      text += " " + key + "=\"" + val + "\"";
    } else if ($(this).is("a")) {
      var txt = "null";
      if ($(this).text().indexOf(not_config) == -1) {
        txt = $(this).attr("val");
      }
      text += " " + key + "=\"" + txt + "\"";
    } else if (type == "number") {
      text += " " + key + "=\"" + compareVal(this, $(this).val()) + "\"";
    } else if ($(this).is("select")) {
      text += " " + key + "=\"" + $(this).val() + "\"";
    } else if (type == "text") {
      var v = $(this).val()
      if (v.trim() != "" && !(v.charAt(v.length - 1) == ",") && ["rcw_enable_values", "rcw_active_values","rcw_gt_values"].includes(key)) v += ",";
      text += " " + key + "=\"" + v + "\"";
    }
  });
  text += " rcw_vx_rel=\"" + ($("#rcw_vx_rel1").is(":checked") ? "yes" : "no") + "\"";
  text += " rcw_algorithm_config=\"";
  $(".tbody>table>tbody>tr:not(:last-child)").each(function () {
    var v = "";
    $(this).find("td").each(function () {
      var i = $(this).index();
      if (i > 0 && $(this).text().trim().length > 0) {
        v += $(this).text() + (i == 3 ? "" : ",");
      }
    })
    if (v.split(",").length == 3) text += v + ":";
  })
  text += "\" />";
  biSetModuleConfig("rcw-evaluation.adasevaluation", text);
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
    $('[name=message_id]').removeAttr("val title").text(not_config).removeClass('green');
  } else {
    $('[name=message_id]').attr({ "val": info.id, "title": info.id }).text(info.name).addClass('green');
  }
  setConfig();
}

function biOnQueriedBusMessageInfo(key, busMessageInfo) {
  if (busMessageInfo == null) {
    $('[name=message_id]').text($('[name=message_id]').attr('val')).attr("title", $('[name=message_id]').attr('val')).removeClass('green').addClass('red');
  } else {
    $('[name=message_id]').attr({
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
    if (!Boolean(val) || val == "null") return;
    if (type == 'checkbox') {
      $(this).attr('checked', val == "yes");
    } else if (type == "number") {
      var v = compareVal(this, val);
      $(this).val(v).attr('value', v);
    } else if ($(this).is("a")) {
      if (name == "message_id") {
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
    } else if (type == "radio") {
      if (val == "yes") {
        $("#rcw_vx_rel1").attr("checked", true);
      } else {
        $("#rcw_vx_rel2").attr("checked", true);
      }
    } else if (type == "text") {
      var v = val;
      if (v.charAt(v.length - 1) == ",") v = v.substr(0, v.length - 1);
      $(this).attr("value", v).val(v);
    } else {
      $(this).val(val);
    }
  });
  var algorithm = obj["rcw_algorithm_config"].split(":");
  var arr = algorithm.splice(0, algorithm.length - 1);
  $(".tbody tbody").empty();
  for (let i in arr) {
    var v = arr[i].split(",");
    $(".tbody tbody").append("<tr><td></td><td contenteditable>" + v[0] + "</td><td contenteditable>" + v[1] + "</td><td contenteditable>" + v[2] + "</td></tr>");
  }
  $(".tbody tbody").append("<tr><td></td><td contenteditable></td><td contenteditable></td><td contenteditable></td></tr>");
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