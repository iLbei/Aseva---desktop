//2023/11/10 v2.1.0 1.新增车道线样本通道、左右延时报警、曲率半径设定
var not_config = "";
$('[name=enabled]').click(function () {
  check($(this));
});

function check(obj) {
  if ($(obj).is(":checked")) {
    enAbled();
    if ($('#final_msg').text().indexOf(not_config) != -1) $('#final_msg').addClass('red');
  } else {
    disAbled();
  }
}

//检查文本框的值
function checkTextValue(obj) {
  var str = $(obj).val();
  if (str.indexOf(',') != -1) {
    var flag = false;
    var arr = str.split(","),
      newArr = [];
    for (var i = 0; i < arr.length; i++) {
      if (arr[i] == "") {
        flag = true;
        break;
      }
      var v = Number(arr[i]);
      if (arr[i] != "") {
        if (isNaN(v)) {
          flag = true;
          break;
        }
      }
      newArr.push(v);
    }
    if (flag) {
      $(obj).addClass('red').removeClass('green');
    } else {
      $(obj).addClass('green').attr('value', newArr.join());
    }
  } else {
    var v = Number(str);
    if (!isNaN(v) && str != "") { //green
      $(obj).addClass('green').attr('value', v);
    } else if (str != "") { //red
      $(obj).addClass('red').removeClass('green');
    }
  }

}

$('[type=text]').bind("input propertychange", function () {
  checkTextValue($(this));
  setConfig();
}).blur(function () {
  if ($(this).hasClass('green')) {
    var str = $(this).val();
    if (str.indexOf(",") != -1) {
      var arr = str.split(','),
        newArr = [];
      for (var i = 0; i < arr.length; i++) {
        var v = Number(arr[i]);
        newArr.push(v);
      }
      $(this).val(newArr.join()).attr('value', newArr.join());
    } else {
      if (str != "") {
        var v = Number(str);
        $(this).val(v).attr('value', v);
      } else {
        var v = $(this).attr('value');
        $(this).val(v).attr('value', v);
      }
    }
  } else if ($(this).hasClass('red')) {
    var v = $(this).attr('value');
    $(this).val(v).removeClass('red').addClass('green');
  }
});


/**
 * 点击GT 
 */
function clickBsdGtSignalChecked(obj) {
  if ($(obj).is(":checked")) {
    $(obj).parent().parent().parent().parent().parent().children().find("div:nth-child(4) [language]").removeClass("disabled_a");
    $('[name=bsd_left_gt_values],[name=bsd_right_gt_values]').removeAttr("disabled").removeClass("disabled_background");
    $(obj).parents(".top").next().find("[name]").attr("disabled", true).addClass("disabled_background");
    $(obj).parents(".top").next().addClass("disabled_a");
  } else {
    $(obj).parent().parent().parent().parent().parent().children().find("div:nth-child(4) [language]").addClass("disabled_a");
    $('[name=bsd_left_gt_values],[name=bsd_right_gt_values]').attr("disabled", true).addClass("disabled_background");
    $(obj).parents(".top").next().find("[name]").removeAttr("disabled").removeClass("disabled_background");
    $(obj).parents(".top").next().removeClass("disabled_a");
    clickBsdEnabled($('[name=bsd_enabled]'));
  }
}

function clickBsdEnabled(obj) {
  if ($(obj).is(":checked")) {
    $(obj).next().removeClass("disabled_a").next().removeAttr("disabled").removeClass("disabled_background");
  } else {
    $(obj).next().addClass("disabled_a").next().attr("disabled", true).addClass("disabled_background");
  }
}

function clickLcdaEnabled(obj) {
  if ($(obj).is(":checked")) {
    $(obj).parent().nextAll().removeClass("disabled_a");
    $(obj).parent().nextAll().children('input').removeAttr("disabled").removeClass("disabled_background");
  } else {
    $(obj).parent().nextAll().addClass("disabled_a");
    $(obj).parent().nextAll().children('input').attr("disabled", true).addClass("disabled_background");
  }
}

function clickLcdaGtSignalChecked(obj) {
  if ($(obj).is(":checked")) {
    $(obj).parents(".top").children("div").children("div:nth-child(3)").find("[language]").removeClass("disabled_a");
    $('[name=lcda_right_gt_values],[name=lcda_left_gt_values]').removeAttr("disabled").removeClass("disabled_background");
    $('.content>.left>div:nth-of-type(3) .bottom [name]').attr("disabled", true).addClass("disabled_background");
    $('.content>.left>div:nth-of-type(3) .bottom').addClass("disabled_a");
  } else {
    $(obj).parents(".top").children("div").children("div:nth-child(3)").find("[language]").addClass("disabled_a");
    $("[name=lcda_right_gt_values],[name=lcda_left_gt_values]").attr("disabled", true).addClass("disabled_background");
    $('.content>.left>div:nth-of-type(3) .bottom [name]').removeAttr('disabled').removeClass("disabled_background");
    $('.content>.left>div:nth-of-type(3) .bottom').removeClass("disabled_a");
    clickLcdaEnabled($('[name=lcda_enabled]'));
  }
}

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


$('#final_msg').click(function () {
  if (!$('[name=enabled]').get(0).checked) return;
  var originID = $(this).text().indexOf(not_config) != -1 ? null : $(this).attr('val');
  biSelectBusMessage("TargetMessage", originID);
});

function biOnSelectedBusMessage(key, info) {
  if (key == "TargetMessage") {
    if (info == null) {
      $('#final_msg').removeAttr("val title").text(not_config).removeClass('green');
    } else {
      $('#final_msg').attr("val", info.id).attr("title", info.id).text(info.name).addClass('green');
    }
  }
  setConfig();
}

function biOnQueriedBusMessageInfo(key, busMessageInfo) {
  if (key == "TargetMessage") {
    if (busMessageInfo == null) {
      $('#final_msg').text($('#final_msg').attr('val')).attr("title", $('#final_msg').attr('val')).removeClass('green').addClass('red');
    } else {
      $('#final_msg').attr({
        "val": busMessageInfo.id,
        "title": busMessageInfo.id
      }).text(busMessageInfo.name).addClass('green');
    }
  }
}

/**
 * 禁用表单元素
 */
function disAbled() {
  $('.content [name]').each(function () {
    $(this).attr("disabled", true).addClass("disabled_background");
  });
  $('.content label,span,p,a,.content div').each(function () {
    $(this).attr("disabled", true).addClass('disabled_a');
  });
}
/**
 * 启用
 */
function enAbled() {
  $('.content [name]').each(function () {
    $(this).removeAttr("disabled").removeClass("disabled_background");
  });
  $('.content label,span,p,a,.content div').each(function () {
    $(this).removeAttr("disabled").removeClass("disabled_a");
  });
  clickBsdGtSignalChecked($('[name=bsd_gt_signal_checked]'));
  clickLcdaEnabled($('[name=lcda_enabled]'));
  clickLcdaGtSignalChecked($('[name=lcda_gt_signal_checked]'));
}

function loadConfig(val) {
  $('[name]').each(function () {
    var value = $(this).attr('name');
    var type = $(this).attr('type');
    if (type == 'checkbox') {
      $(this).attr('checked', val[value] == "yes");
    } else if (type == "number") {
      $(this).val(compareVal(this, val[value])).attr('value', compareVal(this, val[value]));
    } else {
      $(this).val(val[value]);
    }
  });
  $('a').each(function () {
    var id = $(this).attr('id');
    if (id == "final_msg") {
      if (val[id] != "null") {
        $(this).attr('val', val[id]);
        biQueryBusMessageInfo("TargetMessage", val[id]);
      }
    } else {
      if (val[id] != "null") {
        biQuerySignalInfo(id, val[id]);
        $(this).attr('val', val[id]);
        if ($(this).hasClass('red')) {
          $(this).text(val[id]);
        } else {
          $(this).text(val[id].substring(val[id].lastIndexOf(":") + 1)).addClass('green');
        }
      }
    }

  });
  check($('[name=enabled]'));
}

function setConfig() {
  var text = "<?xml version=\"1.0\" encoding=\"utf-8\"?><root ";
  $('[name]').each(function () {
    var key = $(this).attr('name');
    var type = $(this).attr('type');
    var val = $(this).val();
    if (type == "checkbox") {
      val = $(this).is(":checked") ? "yes" : "no";
    } else if (type == "number") {
      val = $(this).val();
    }
    text += " " + key + "=\"" + val + "\"";
  });

  text += " final_msg" + "=\"" + ($('#final_msg').attr('val') == undefined ? "null" : $('#final_msg').attr('val')) + "\"";
  $('a').each(function () {
    var idName = $(this).attr('id');
    if (idName != "final_msg") {
      var val = $(this).attr('val') == undefined ? null : $(this).attr('val');
      text += " " + idName + "=\"" + val + "\"";
    }
  });
  text += " />";
  biSetModuleConfig("bsd-lcda-evaluation.adasevaluation", text);
}

/**
 * 选择信号
 * @param {} obj 
 */
var idName = null; //选择的元素的id名
function onClick(obj) {
  if (!$('[name=enabled]').get(0).checked) return;
  if ($(obj).hasClass("disabled_a")) return
  var originID = null;
  if ($(obj).text().indexOf(not_config) == -1) originID = $(obj).attr('val');
  idName = "#" + $(obj).attr('id');
  var scale = $(obj).attr('scaleVal');
  scale = parseInt(scale);
  biSelectSignal("TargetSignal", originID, false, null, false, scale, "[m]");
}

function biOnSelectedSignal(key, valueInfo, signBitInfo, scale) {
  if (key == "TargetSignal") {
    if (valueInfo == null) {
      $(idName).removeClass('green red');
      $(idName).text(not_config);
      $(idName).removeAttr("val title");
    } else if (valueInfo.typeName == undefined) {
      $(idName).addClass('red').removeClass('green');
    } else {
      $(idName).text(valueInfo.signalName);
      $(idName).attr({
        "val": valueInfo.id,
        'scaleVal': scale,
        "title": valueInfo.id
      }).addClass('green');
    }
  }
  setConfig();
}

function biOnQueriedSignalInfo(key, signalInfo) {
  if (signalInfo != null) {
    $('#' + key).addClass('green').removeClass('red');
    $('#' + key).parent().attr('title', signalInfo.typeName + ':' + signalInfo.signalName);
  } else {
    $('#' + key).addClass('red').removeClass('green').text($('#' + key).attr('val'));
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