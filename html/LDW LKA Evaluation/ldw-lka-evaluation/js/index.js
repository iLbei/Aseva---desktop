var not_config = "";
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

$('[name]').change(function () {
  var name = $(this).attr("name");
  if (name == "enabled") {
    checkboxChange(this)
  } else if (name == "ldw_gt_signal_checked") {
    clickLdwGTSignalChecked(this);
  }
  setConfig();
});

$("[type=text]").on("keyup", function () {
  if ($(this).is(":valid")) {
    $(this).attr("value", $(this).val());
    setConfig()
  }
}).on("blur", function () {
  $(this).val($(this).attr('value'));
  setConfig();
})

$("a").on("click", function () {
  if (!$(this).hasClass("disabled_a")) {
    var name = $(this).attr("name");
    var val = $(this).attr("id");
    if (name == "message_id") {
      biSelectBusMessage(name, val);
    } else {
      biSelectSignal(name, val, false, null, false, null, null);
    }
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
    $('[name=' + key + ']').attr({ 'title': id, "id": id });
  }
  setConfig();
}

function biOnSelectedBusMessage(key, info) {
  if (info == null) {
    $("[name=" + key + "]").removeAttr("val title").text(not_config).removeClass('green');
  } else {
    $("[name=" + key + "]").attr({
      "id": info.id,
      "title": info.id
    }).text(info.name).addClass('green');
  }
  setConfig();
}

function clickLdwGTSignalChecked(obj) {
  if (!$(obj).get(0).checked) {
    $('.container>div:nth-of-type(4)').find('[name]').each(function () {
      $(this).removeAttr("disabled").removeClass("disabled_background");
    });
    $('.container>div:nth-of-type(4)').find('span,a,p,label').each(function () {
      $(this).removeClass("disabled_a");
    });
    $('.container>div:nth-of-type(5)').find('input[type=text]').each(function () {
      $(this).attr("disabled", true).addClass("disabled_background");
    });
    $('.container>div:nth-of-type(5)').find('p,a,span,label').each(function () {
      $(this).addClass("disabled_a");
    });
  } else {
    $('.container>div:nth-of-type(4)').find('[name]').each(function () {
      $(this).attr("disabled", true).addClass("disabled_background");
    });
    $('.container>div:nth-of-type(4)').find('p,a,span,label').each(function () {
      $(this).addClass("disabled_a");
    });
    $('.container>div:nth-of-type(5)').find('input[type=text]').each(function () {
      $(this).removeAttr("disabled").removeClass("disabled_background");
    });
    $('.container>div:nth-of-type(5)').find('span,a,p,label').each(function () {
      $(this).removeClass("disabled_a");
    });
  }
}

function compareVal(obj, val) {
  var step = $(obj).attr('step').length > 2 ? $(obj).attr('step').length - 2 : 0,
    v = Number(val);
  if (isNaN(val) || !Boolean(val)) {
    newVal = Number($(obj).attr('value'));
  } else {
    var v = Number(val);
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
 * 加载配置
 */

function loadConfig(obj) {
  $('.container [name]').each(function () {
    var name = $(this).attr("name");
    var val = obj[name];
    if (!Boolean(val) || val == "null") return;
    var type = $(this).attr('type');
    if (type == 'checkbox') {
      $(this).prop('checked', val == 'yes');
      if (name == "enabled") checkboxChange(this);
      if (name == "ldw_gt_signal_checked" && obj["enabled"] == "yes") clickLdwGTSignalChecked(this);
    } else if (type == "number") {
      var v = compareVal(this, val);
      $(this).val(v).attr("value", v);
    } else if ($(this).is('a')) {
      if (!["", "null", not_config].includes(val)) {
        if (name == "message_id") {
          biQueryBusMessageInfo(name, val)
        } else {
          biQuerySignalInfo(name, val);
        }
        $(this).attr({ "title": val, "id": val });
      }
    } else if (type == "text") {
      var v = val;
      if (!["ldw_dtlc_level1", "ldw_ttlc_level1"].includes(name) && v.charAt(v.length - 1) == ",") v = v.substr(0, v.length - 1);
      $(this).attr("value", v).val(v);
    } else {
      $(this).val(val);
    }
  })
}

function checkboxChange(obj) {
  if (!$(obj).is(':checked')) {
    $('.container>div:not(:first-child) [name]:not(a)').addClass('disabled_background').attr('disabled', true);
    $(".container>div:not(:first-child) [language]").addClass('disabled_a');
  } else {
    $('.container>div:not(:first-child) [name]:not(a)').removeClass('disabled_background').attr('disabled', false);
    $(".container>div:not(:first-child) [language]").removeClass('disabled_a');
    clickLdwGTSignalChecked($('[name=ldw_gt_signal_checked]'));
  }
}

function biOnQueriedSignalInfo(key, signalInfo) {
  if (signalInfo) {
    $("[name=" + key + "]").text(signalInfo.signalName).addClass("green");
  } else {
    $("[name=" + key + "]").text($("[name=" + key + "]").attr("id")).addClass("red");
  }
}

/**
 * 写配置
 */
function setConfig() {
  var text = "<?xml version=\"1.0\" encoding=\"utf-8\"?><root ";
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
      if ($(this).text().indexOf(not_config) == -1) {
        txt = $(this).attr("id");
      }
      text += name + "=\"" + txt + "\" ";
    } else if (type == "text") {
      var v = $(this).val()
      if (v.trim() != "" && !(v.charAt(v.length - 1) == ",") && !["ldw_dtlc_level1", "ldw_ttlc_level1"].includes(name)) v += ",";
      text += " " + name + "=\"" + v + "\" ";
    } else {
      text += name + "=\"" + val + "\" ";
    }
  });
  text += " />";
  biSetModuleConfig("ldw-lka-evaluation.adasevaluation", text);
}

function biOnQueriedBusMessageInfo(key, busMessageInfo) {
  if (busMessageInfo == null) {
    $('[name=message_id]').text($('[name=message_id]').attr('val'));
    $('[name=message_id]').removeClass('green').addClass('red');
  } else {
    $('[name=message_id]').attr({ "id": busMessageInfo.id, 'title': busMessageInfo.id });
    $('[name=message_id]').text(busMessageInfo.name);
    $('[name=message_id]').addClass('green').removeClass("red");
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
    var obj = {};
    for (var i = 0; i < keys.length; i++) {
      obj[keys[i].nodeName] = keys[i].nodeValue;
    }
    loadConfig(obj);
  }
}