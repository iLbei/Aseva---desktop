var signalCount = 0;
var language_type = "";
var busInfoArr = []; //保存已添加过的报文

$('[name]').change(function () {
  setConfig();
});

$('[type=number]').bind('input propertychange', function () {
  numChange($(this));
  setConfig();
}).blur(function () {
  var value = $(this).attr('value');
  $(this).val(value);
  setConfig();
});


function numChange(obj) {
  var value = $(obj).val();
  var step = $(obj).attr('step').length - 2;
  var min = Number($(obj).attr('min'));
  var max = Number($(obj).attr('max'));
  var v = Number(value);
  if (!isNaN(v)) {
    v = v < min ? min : v;
    v = v > max ? max : v;
    var value;
    if (step <= -1) {
      value = v.toFixed(0);
    } else {
      value = v.toFixed(step);
    }
    $(obj).attr('value', value);
  } else {
    $(obj).val($(obj).attr('value'));
  }
}
//单个添加
function addSignal(name, id) {
  $box = $('.box').clone(true);
  var index = 0;
  var arr = [];
  $('.content>div:not(:first-of-type)').each(function () {
    var val = parseInt($(this).find('[name=output]').val());
    arr.push(val);
  });
  arr.sort(function (a, b) {
    return a - b;
  });
  var flag = false;
  for (var i = 0; i < arr.length; i++) {
    var n = arr[i] + 1;
    if (arr.indexOf(n) == -1) {
      flag = true;
      index = n;
      break;
    }
  }
  if (!flag && arr.length != 0) index = arr[arr.length - 1] + 1;
  if (arr.indexOf(0) == -1) index = 0;
  if (name != undefined) {
    $box.find('a').text(name);
    $box.find('a').removeClass('red');
    $box.find('a').attr({
      'val': id,
      "title": name
    });
    $box.find('a').addClass('green');
  }
  $box.find('[name=output]').val(index);
  if (signalCount >= 100) {
    var msg = language_type == 1 ? "No available output channels" : "无输出通道";
    var title = language_type == 1 ? "error" : "错误";
    biAlert(msg, title);
    return
  }
  signalCount++;
  $('.content').append($box[0]);
  setConfig();
}
//多个添加
/**
 * 选择报文
 */
function addSignals() {
  biSelectBusMessage("TargetMessage", null);
}

function biOnSelectedBusMessage(key, info) {
  if (key == "TargetMessage") {
    if (info != null) {
      if (busInfoArr.indexOf(info.id) == -1) {
        biQuerySignalsInBusMessage(info.id, info.id);
      }
    }
  }
}

function biOnQueriedSignalsInBusMessage(key, signalIDList) {
  if (signalIDList.length != 0) {
    for (var i = 0; i < signalIDList.length; i++) {
      var arr = signalIDList[i].split(":");
      var dbcId = key + ":" + signalIDList[i];
      if (busInfoArr.indexOf(dbcId) == -1) {
        addSignal(arr[arr.length - 1], dbcId);
        busInfoArr.push(dbcId);
      }
    }
  }
  setConfig();
}
//删除
function remove(obj) {
  var dbcId = $(obj).parent().parent().find('a').attr('val');
  $(obj).parent().parent().remove();
  if (dbcId != undefined && dbcId.indexOf(".dbc") != -1) {
    var index = busInfoArr.indexOf(dbcId);
    busInfoArr.splice(index, 1);
  }
  signalCount--;
  setConfig();
}

/**
 * 加载配置
 */
function loadConfig(arr) {
  if (arr == null) return;
  setTimeout(() => {
    for (var i = 0; i < arr.length; i++) {
      var obj = arr[i];
      $box = $('.box').clone(true);
      $box.find('[name]').each(function () {
        var type = $(this).attr('type');
        var name = $(this).attr('name');
        if (type == "checkbox") {
          $(this).attr('checked', obj[name] == "yes");
        } else if (type == "number") {
          $(this).val(compareVal(this, obj[name]));
        } else {
          $(this).val(obj[name])
        }
      });
      $('.content').append($box[0]);
      if (obj['signal'] != "null") {
        $box.find('a').attr('id', 'box' + $box.length);
        var id = $box.find('a').attr('id');
        $box.find('a').attr({
          'val': obj['signal']
        })
        biQuerySignalInfo(id, obj['signal']);
        if (obj['signal'].indexOf('.dbc') != -1) {
          if (busInfoArr.indexOf(obj['signal']) == -1) busInfoArr.push(obj['signal']);
        }
      }
    }
    signalCount = arr.length;
  });
}

function biOnQueriedSignalInfo(key, signalInfo) {
  if (signalInfo != null) {
    $('#' + key).addClass('green').removeClass('red').text(signalInfo.signalName).attr("title", signalInfo.signalName);
  } else {
    $('#' + key).addClass('red').removeClass('green').text($('#' + key).attr('val')).removeAttr("title");
  }
  if (!$box.find('a').hasClass('red')) {
    $box.find('a').addClass('green');
    $box.find('a').text(obj['signal'].substring(obj['signal'].lastIndexOf(":") + 1));
  }
}

/**
 * 写配置
 */
function setConfig() {
  var text = "<?xml version=\"1.0\" encoding=\"utf-8\"?><root>";
  $('.content>div:not(:first-of-type)').each(function () {
    text += "<s";
    $(this).find('[name]').each(function () {
      var type = $(this).attr('type');
      var name = $(this).attr('name');
      if (type == "checkbox") {
        text += " " + name + "=\"" + ($(this).get(0).checked ? "yes" : "no") + "\"";
      } else if (type == "number") {
        text += " " + name + "=\"" + compareVal(this, $(this).val()) + "\"";
      } else if (type == "range") {
        text += " " + name + "=\"" + $(this).attr('val') + "\"";
      } else {
        text += " " + name + "=\"" + $(this).val() + "\"";
      }
    });
    text += " signal=\"" + ($(this).find('.signal').attr('val') == undefined ? null : $(this).find('.signal').attr('val')) + "\"";
    text += " />";
  });
  text += "</root>";
  biSetModuleConfig("signal-lasting.pluginsignalutility", text);
}

/**
 * 选择信号
 * @param {} obj 
 */
var idName = null; //选择的元素的id名
function onClick(obj) {
  var originID = null;
  if ($(obj).text().lastIndexOf('(') == -1) originID = $(obj).attr('val');
  idName = obj;
  biSelectSignal("TargetSignal", originID, false, null, false, 1, "[m]");
}

function biOnSelectedSignal(key, valueInfo, signBitInfo, scale) {
  if (key == "TargetSignal") {
    if (valueInfo == null) {
      $(idName).removeClass('green');
      $(idName).text(not_config);
      $(idName).removeAttr("val title");
      $(idName).next().text("");
      if (!$(idName).hasClass('red')) $(idName).addClass('red');
      setConfig();
    } else if (valueInfo.typeName == undefined) {
      $(idName).addClass('red').removeClass('green');
    } else {
      $(idName).text(valueInfo.signalName);
      $(idName).attr({
        "val": valueInfo.id,
        "title": valueInfo.signalName
      });
      $(idName).next().text(valueInfo.signalName);
      $(idName).addClass('green');
    }
    setConfig();
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
  }
  for (var key in moduleConfigs) {
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(moduleConfigs[key], "text/xml");
    var countrys = xmlDoc.getElementsByTagName('root');
    var arr = [];
    for (var i = 0; i < countrys[0].childNodes.length; i++) {
      var keyss = countrys[0].childNodes[i].attributes;
      var obj = new Object();
      for (var j = 0; j < keyss.length; j++) {
        obj[keyss[j].nodeName] = keyss[j].nodeValue;
      }
      arr.push(obj);
    }
    loadConfig(arr);
  }
}