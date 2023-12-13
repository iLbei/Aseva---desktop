var language_type = "",
  not_config = "";
$(function () {
  onClickEnabled($('[name=enabled]'));
});

function onClickEnabled(obj) {
  if ($(obj).get(0).checked) {
    enAbled();
    if ($('#message_id').text().indexOf(not_config) != -1) $('#message_id').addClass('red');
  } else {
    disAbled();
  }
}

function clickDepartEnabled(obj) {
  if ($(obj).get(0).checked) {
    $(obj).next().next().removeAttr("disabled").removeClass("disabled_background");
  } else {
    $(obj).next().next().attr("disabled", true).addClass("disabled_background");
  }
}
//检查文本框的值
function checkTextValue(obj) {
  var str = $(obj).val();
  if (str.indexOf(',') != -1) {
    var flag = false;
    var arr = str.split(","),
      newArr = [];;
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
    } else if (str == "" && $(obj).hasClass('bar')) {
      $(obj).attr('value', "");
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


$('[name]').change(function () {
  setConfig();
});
$('[type=number]').change(function () {
  $(this).attr('value', $(this).val());
}).blur(function () {
  $(this).val(compareVal(this, $(this).val()));
}).on("input", function () {
  setConfig();
});

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
 * 选择报文
 */
$('#message_id').click(function () {
  if (!$('[name=enabled]').get(0).checked) return;
  // var originID = $(this).text().lastIndexOf('(') != -1 ? null : $(this).attr('val');
  var originID = $(this).text().indexOf(not_config) != -1 ? null : $(this).attr('val')
  biSelectBusMessage("TargetMessage", originID);
});

function biOnSelectedBusMessage(key, info) {
  if (key == "TargetMessage") {
    if (info == null) {
      $('#message_id').removeAttr("val title");
      $('#message_id').text(not_config);
      // $('#message_id').attr("val", $('#message_id').attr('val'));
      $('#message_id').removeClass('green');
    } else {
      $('#message_id').attr({
        "val": info.id,
        "title": info.name
      });
      $('#message_id').text(info.name);
      $('#message_id').addClass('green');
    }
  }
  setConfig();
}

function biOnQueriedBusMessageInfo(key, busMessageInfo) {
  if (key == "TargetMessage") {
    if (busMessageInfo == null) {
      $('#message_id').text($('#message_id').attr('val')).attr("title", $('#message_id').attr('val'));
      $('#message_id').removeClass('green').addClass('red');
    } else {
      $('#message_id').attr({
        "val": busMessageInfo.id,
        'title': busMessageInfo.name
      });
      $('#message_id').text(busMessageInfo.name)
      $('#message_id').addClass('green').removeClass('red');
    }
  }
  setConfig();
}

/**
 * 禁用表单元素
 */
function disAbled() {
  $('.container>div:not(:first-child) [name]').attr("disabled", true).addClass("disabled_background").removeClass("red green");
  $('.container>div:not(:first-child)').find("span, a,label,p").addClass('disabled_a');
}
/**
 * 启用
 */
function enAbled() {
  $('.container>div:not(:first-child) [name]').removeAttr("disabled").removeClass("disabled_background");
  $('.container>div:not(:first-child)').find("span, a,label,p").removeClass('disabled_a');
  clickDepartEnabled($('[name=departing_enabled]'));
  $("input[type=text]").each(function () {
    checkTextValue(this);
  })
}


/**
 * 加载配置
 */
function loadConfig(val) {
  if (val == null) return;
  $('[name]').each(function () {
    var name = $(this).attr('name');
    var type = $(this).attr('type');
    if (type == 'checkbox') {
      $(this).attr('checked', val[name] == "yes");
    } else if (type == "text") {
      if (val[name] != undefined && val[name] != "") {
        var v = val[name].substring(0, val[name].lastIndexOf(","));
        $(this).val(v).attr('value', v).addClass("green");
      }
      if (val[name] == "" && $(this).hasClass('bar')) $(this).val("");
    } else if (type == "number") {
      $(this).val(compareVal(this, val[name]));
    } else {
      $(this).val(val[name]);
    }
  });
  $('a').each(function () {
    var id = $(this).attr('id');
    if (id == "message_id" && val['message_id'] != "null") {
      $(this).attr('val', val["message_id"]);
      biQueryBusMessageInfo("TargetMessage", val["message_id"]);
    } else {
      if (val[id] != "null") {
        $(this).attr('val', val[id]);
        biQuerySignalInfo(id, val[id]);
        if ($(this).hasClass('red')) {
          $(this).text(val[id]);
        } else {
          $(this).addClass('green');
          $(this).text(val[id].substring(val[id].lastIndexOf(":") + 1));
        }
      }
    }
  });
  if ($('[name=enabled]').get(0).checked) {
    enAbled();
    if ($('#message_id').text().indexOf(not_config) != -1) $('#message_id').addClass('red');
  } else {
    disAbled();
  }
}

function biOnQueriedSignalInfo(key, signalInfo) {
  if (signalInfo != null) {
    $('#' + key).addClass('green').removeClass('red');
    $('#' + key).attr('title', signalInfo.typeName + ':' + signalInfo.signalName)
  } else {
    $('#' + key).addClass('red').removeClass('green').text($('#' + key).attr('val'));
  }
}


/**
 * 写配置
 */

function setConfig() {
  var text = "<?xml version=\"1.0\" encoding=\"utf-8\"?><root ";
  $('[name]').each(function () {
    var key = $(this).attr('name');
    var type = $(this).attr('type');
    if ($(this).attr('type') == "checkbox") {
      var val = $(this).get(0).checked == true ? "yes" : "no";
      text += " " + key + "=\"" + val + "\"";
    } else if (type == "number") {
      var step = $(this).attr('step').length - 2;
      var v = Number($(this).val());
      var value;
      if (!isNaN(v) && $(this).val() != "") {
        var min = parseFloat($(this).attr('min')),
          max = parseFloat($(this).attr('max'));
        v = v < min ? min : v;
        v = v > max ? max : v;
        if (step <= -1) {
          value = v.toFixed(0);
        } else {
          value = v.toFixed(step);
        }
      } else {
        value = $(this).attr('value');
      }
      text += " " + key + "=\"" + value + "\"";
    } else if (type == "text") {
      var value = $(this).val();
      if (($(this).hasClass('red') && !$(this).hasClass('green')) || value == "") {
        text += " " + key + "=\"" + "null\"";
      } else {
        text += " " + key + "=\"" + value + ",\"";
      }

    } else {
      text += " " + key + "=\"" + $(this).val() + "\"";
    }

  });

  text += " message_id" + "=\"" + ($('#message_id').attr('val') == undefined ? "null" : $('#message_id').attr('val')) + "\"";
  $('a').each(function () {
    var idName = $(this).attr('id');
    if (idName != "message_id") {
      var val = $(this).attr('val') == undefined ? null : $(this).attr('val');
      text += " " + idName + "=\"" + val + "\"";
    }
  });
  text += " />";
  biSetModuleConfig("acc-evaluation.adasevaluation", text);
}

/**
 * 选择信号
 * @param {} obj 
 */
var idName = null; //选择的元素的id名
function onClick(obj, flag) {
  if (!$('[name=enabled]').get(0).checked) return;
  var originID = null;
  if ($(obj).text().indexOf(not_config) == -1) originID = $(obj).attr('val');
  idName = "#" + $(obj).attr('id');
  var scale = flag ? $(obj).attr("scaleVal") : 1;
  scale = parseInt(scale);
  biSelectSignal("TargetSignal", originID, false, null, flag, scale, "[m]");
}

function biOnSelectedSignal(key, valueInfo, signBitInfo, scale) {
  if (key == "TargetSignal") {
    if (valueInfo == null) {
      $(idName).removeClass('green blue red');
      $(idName).text(not_config);
      $(idName).removeAttr("val title");
      setConfig();
    } else if (valueInfo.typeName == undefined) {
      $(idName).addClass('red').removeClass('green').text(valueInfo.id).attr('val', valueInfo.id);
    } else {
      $(idName).text(valueInfo.signalName);
      $(idName).attr("val", valueInfo.id);
      $(idName).attr('scaleVal', scale);
      $(idName).addClass('green').removeClass('red');
      $(idName).attr('title', valueInfo.typeName + ':' + valueInfo.signalName);
    }
  }
  setConfig();
}

var createFileHandle = null;

var signalScale = 1;


function biOnInitEx(config, moduleConfigs) {
  language_type = biGetLanguage();
  if (language_type == 1) {
    $('[language]').each(function () {
      var value = $(this).attr('language');
      $(this).text(en[value])
    });
    not_config = en["not_config"];
  } else {
    $('[language]').each(function () {
      var value = $(this).attr('language');
      $(this).text(cn[value])
    });
    not_config = cn["not_config"];
    $('.acc_enabled>div').children('div:nth-of-type(4)').css('width', '238px');
    $('.acc_enabled>div').children('div:nth-of-type(3)').css('width', '238px');
    $('.acc_set_time_gap [type=text]').css("marginRight", '37px');
    $('.content>div>div:nth-of-type(2)>div:nth-of-type(2)>div>div>div').css("marginLeft", "27px");
  }
  var plat = biGetPlatform();
  if (plat == 1) {
    $('p,span,input,a,div').focus(function () {
      $(this).css("outline", "0");
    });
  }
  for (var key in moduleConfigs) {
    var parser = new DOMParser();
    if (moduleConfigs[key] != "") {
      var xmlDoc = parser.parseFromString(moduleConfigs[key], "text/xml");
      var countrys = xmlDoc.getElementsByTagName('root');
      var keys = countrys[0].attributes;
      var obj = new Object();
      for (var i = 0; i < keys.length; i++) {
        obj[keys[i].nodeName] = keys[i].nodeValue;
      };
      loadConfig(obj);
    }
  }
}