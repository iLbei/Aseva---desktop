var not_config = "";
$("input[type=text]").on("input", function () {
  setConfig();
})
$('[name]').change(function () {
  setConfig();
});

$('[type=number]').bind('input propertychange', function () {
  setConfig();
}).blur(function () {
  $(this).val(compareVal(this, $(this).val()))
});

$('[name=title]').bind('input propertychange', function () {
  var t = $(this).val();
  if (t.length != 0) $(this).attr('value', $(this).val());
  setConfig();
}).blur(function () {
  var t = $(this).val();
  if (t.length == 0) $(this).val($(this).attr('value'));
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
var bus;
/**
 * 选择报文
 */
function selectBus(obj) {
  if ($(obj).hasClass('c4')) return;
  var originID = null;
  if ($(obj).text().indexOf(not_config) == -1) originID = $(obj).attr('val');
  bus = obj;
  biSelectBusMessage("TargetMessage", originID);
}

function biOnSelectedBusMessage(key, info) {
  if (key == "TargetMessage") {
    if (bus != undefined) {
      if (info == null) {
        $(bus).removeAttr("val title");
        $(bus).text(not_config);
        $(bus).removeClass('green');
      } else {
        $(bus).attr({
          "val": info.id,
          "title": info.name
        });
        $(bus).text(info.name);
        $(bus).addClass('green');
      }
    }
  } else if (key == "TargetMessage1") {
    if (busObj != undefined) {
      if (info != null) biQuerySignalsInBusMessage(info.id, info.id);
    }
  }
  setConfig();
}
var busObj;

function biOnQueriedSignalsInBusMessage(key, signalIDList) {
  if (signalIDList.length != 0) {
    for (var i = 0; i < signalIDList.length; i++) {
      biQuerySignalInfo("selectSignal",  signalIDList[i]);
    }
  }
  setConfig();
}

var busChannelKeyArr = [];
/**
 * 加载配置
 */
function loadConfig(object) {
  if (object == null) return;
  var arr = object.arr;
  $('[name=add_name_prefix]').val(object.add_name_prefix);
  object.add_name_with_msgname == "yes" ? $('[name=add_name_with_msgname]').attr('checked', true) : $('[name=add_name_with_msgname]').attr('checked', false);
  for (var i = 0; i < arr.length; i++) {
    var obj = arr[i];
    $box = $('.box').clone(true);
    if (obj.enabled == "yes") $box.find('[name=enabled]').attr('checked', true);
    var txt = obj.protocol == "null" ? "" : obj.protocol;
    $box.find('[name=protocol]').val(txt);
    $box.find('[name=sampling_rate]').val(compareVal($box.find('[name=sampling_rate]'), obj.sampling_rate));
    $box.find('[name=interpolation]').each(function () {
      if ($(this).val() == obj.interpolation) {
        $(this).attr("checked", true);
        changeRadio(this);
      }
    });
    if (obj.sampling_msg_id != "null") {
      $box.find('.sampling_msg_id').attr({
        'val': obj.sampling_msg_id,
        "title": obj.sampling_msg_id
      })
      biQueryBusMessageInfo(i + "", obj.sampling_msg_id);
    }
    for (var j = 0; j < obj.arr.length; j++) {
      var o = obj.arr[j];
      $son = $('.son').clone(true);
      var txt = "";
      if (o.id != "null") {
        var array = o.id.split(":");
        $son.find('a').attr('id', 'box' + j + $son.find('a').length);
        var id = 'box' + j + $son.find('a').length;
        biQuerySignalInfo(id, o.id)
        if (o.id.indexOf(".dbc") == -1) {
          txt = array[array.length - 1];
          $son.find('a').text(txt).attr("title", txt);
          $son.find('a').addClass('green');
        } else if (o.id.indexOf(".dbc") != -1) {
          biQueryBusProtocolFileChannel(array[0]);
          busChannelKeyArr.push(i + "|" + j + "|" + o.id);
          biQuerySignalInfo(i + "|" + j, o.id);
        }
        $son.find('a').attr('val', o.id);
        $son.find('a').attr('scale', o.scale);
        $son.find('a').attr('sbid', o.sbid);
      }
      $son.find('[name=title]').val(o.title);
      $son.find('[name=nearest]').val(o.nearest);
      if (obj.interpolation == "no") {
        $son.find('[name=nearest]').attr('disabled', true);
      }
      $son.find('[name=timeout]').val(compareVal($('[name=timeout]'), o.timeout));
      $box.children('.bottom').append($son[0]);
    }
    $('.content').append($box[0]);
  }
}


var num = 0;
//获取总线协议文件绑定的通道
function biOnQueriedBusProtocolFileChannel(busFileProtocolID, busChannel) {
  if (busChannel == 0) {
    var s = busChannelKeyArr[num];
    var arr = s.split("|");
    $('.container>.content>div:eq(' + (Number(arr[0]) + 1) + ')').children('.bottom').children('div:eq(' + (Number(arr[1]) + 1) + ')').find('.id').text(arr[2]).addClass('red').removeClass('green').next().text(arr[2]).attr("title",arr[2]);
  }
  num++;
}
//获取信号信息
function biOnQueriedSignalInfo(key, signalID) {
  if (key == "selectSignal") {
    if (signalID != null) {
      var add_name_prefix = $('[name=add_name_prefix]').val();
      var name2 = "";
      if (add_name_prefix != "") name2 += add_name_prefix + ".";
      if ($('[name=add_name_with_msgname]').get(0).checked) name2 += signalID.typeName + ".";
      name2 += signalID.signalName;
      addSignal(busObj, name2, signalID.id, signalID.signalName);
    }
  } else {
    if (signalID != null) {
      var arr = key.split("|");
      $('.container>.content>div:eq(' + (Number(arr[0]) + 1) + ')').children('.bottom').children('div:eq(' + (Number(arr[1]) + 1) + ')').find('.id').addClass('green').text(signalID.signalName).attr("title",signalID.signalName);
    }
  }
  setConfig();
}

function biOnQueriedBusMessageInfo(key, busMessageInfo) {
  // var type = biGetLanguage();
  var indexBus = Number(key);
  // if (busMessageInfo == null) {
  //     var text = type == 1 ? "(Not configured)" : "(无配置)";
  //     $('.content>div:eq(' + (indexBus + 1) + ')').find('.sampling_msg_id').removeAttr("val");
  //     $('.content>div:eq(' + (indexBus + 1) + ')').find('.sampling_msg_id').text(text);
  //     $('.content>div:eq(' + (indexBus + 1) + ')').find('.sampling_msg_id').removeClass('green');
  // } else {
  //     $('.content>div:eq(' + (indexBus + 1) + ')').find('.sampling_msg_id').attr("val", busMessageInfo.id);
  //     $('.content>div:eq(' + (indexBus + 1) + ')').find('.sampling_msg_id').text(busMessageInfo.name);
  //     $('.content>div:eq(' + (indexBus + 1) + ')').find('.sampling_msg_id').addClass('green');
  // }

  if (busMessageInfo == null) {
    $('.content>div:eq(' + (indexBus + 1) + ')').find('.sampling_msg_id').text($('.content>div:eq(' + (indexBus + 1) + ')').find('.sampling_msg_id').attr('val'));
    $('.content>div:eq(' + (indexBus + 1) + ')').find('.sampling_msg_id').removeClass('green').addClass('red');
  } else {
    $('.content>div:eq(' + (indexBus + 1) + ')').find('.sampling_msg_id').attr("val", busMessageInfo.id);
    $('.content>div:eq(' + (indexBus + 1) + ')').find('.sampling_msg_id').text(busMessageInfo.name).attr("title",busMessageInfo.name);
    $('.content>div:eq(' + (indexBus + 1) + ')').find('.sampling_msg_id').addClass('green');
    $('.content>div:eq(' + (indexBus + 1) + ')').find('.sampling_msg_id').parent().attr('title', busMessageInfo.id)
  }

  setConfig();
}

function addPark() {
  $box = $('.box').clone(true);
  $('.content').append($box[0]);
  setConfig();
}

function removePark(obj) {
  $(obj).parent().parent().remove();
  setConfig();
}
var signalObj;

function openSignal(obj) {
  signalObj = obj;
  var bottom = $(obj).parent().next();
  var arr = null;
  if ($(bottom).children('div').length > 1) arr = [];
  $(bottom).children('div').each(function (i, v) {
    if (i != 0) {
      var val = $(this).find('a').attr("val");
      arr.push(val);
    }
  });
  biSelectSignals("selectSignals", arr, 99);
}

//多个信号选择
function biOnSelectedSignals(key, signalsInfo) {
  if (signalsInfo != null) {
    for (var i = 0; i < signalsInfo.length; i++) {
      var arr = signalsInfo[i].split(":");
      var name2 = "";
      var add_name_prefix = $('[name=add_name_prefix]').val();
      if (add_name_prefix != "") name2 += add_name_prefix + ".";
      name2 += arr[2];
      addSignal(signalObj, name2, signalsInfo[i], arr[2]);
    }
  }
}

function openBus(obj) {
  busObj = obj;
  biSelectBusMessage("TargetMessage1", null);
}

function addSignal(obj, name2, id, name) {
  $son = $('.son').clone(true);
  var y = $(obj).parent().prev().find('input[name=interpolation]:checked').val();
  y == "no" ? $son.find('select').attr('disabled', true) : $son.find('select').removeAttr('disabled');
  if (name != undefined) {
    $son.find('[name=title]').val(name2);
    $son.find('a').text(name);
    $son.find('a').removeClass('red');
    $son.find('a').attr({
      'val': id,
      'title': name
    });
    $son.find('a').addClass('green');
  }
  $(obj).parent().next().append($son[0]);
  setConfig();
}

function removeSon(obj) {
  $(obj).parent().remove();
  setConfig();
}

function changeYes(obj) {
  $(obj).prev().attr("checked", true);
  setConfig();
}

function changeNo(obj) {
  $(obj).prev().children().attr("checked", true);
  setConfig();
}

function changeRadio(obj) {
  var val = $(obj).val();
  var o = $(obj).parent().parent().parent().parent().parent().parent().next().next();
  if (val == "yes") {
    $(o).find('select').removeAttr('disabled');
    $(obj).parent().parent().parent().find('a').removeClass('red');
    $(obj).parent().parent().parent().find('a').addClass('c4');
    $(obj).parent().parent().parent().find('[name=sampling_rate]').removeAttr('disabled');
    $(obj).parent().parent().parent().find('[name=sampling_rate]').next().show();
  } else {
    $(o).find('select').attr('disabled', true);
    $(obj).parent().parent().parent().find('a').removeClass('c4');
    $(obj).parent().parent().parent().find('a').addClass('red');
    $(obj).parent().parent().parent().find('[name=sampling_rate]').attr('disabled', true);
    $(obj).parent().parent().parent().find('[name=sampling_rate]').next().hide();
  }
  setConfig();
}
/**
 * 写配置
 */

function setConfig() {
  var add_name_prefix = $('[name=add_name_prefix]').val();
  var add_name_with_msgname = $('[name=add_name_with_msgname]').get(0).checked ? "yes" : "no";
  var text = "<?xml version=\"1.0\" encoding=\"utf-8\"?><root add_name_prefix=\"" + add_name_prefix + "\" add_name_with_msgname=\"" + add_name_with_msgname + "\">";
  $('.content>div:not(:first-of-type)').each(function () {
    text += "<c";
    $(this).children('div:not(:last-of-type)').find('[name]').each(function () {
      var type = $(this).attr('type');
      var name = $(this).attr('name');
      if (type == "checkbox") {
        text += " " + name + "=\"" + ($(this).get(0).checked ? "yes" : "no") + "\"";
      } else if (type == "number") {
        text += " " + name + "=\"" + compareVal(this, $(this).val()) + "\"";
      } else if (type != "radio") {
        text += " " + name + "=\"" + $(this).val() + "\"";
      }
    });
    var model = $(this).find('input[name=interpolation]:checked').val();
    text += " interpolation=\"" + model + "\"";
    text += " sampling_msg_id=\"" + ($(this).find('.sampling_msg_id').attr('val') == undefined ? null : $(this).find('.sampling_msg_id').attr('val')) + "\"";
    var len = $(this).children('.bottom').children('.son').length;
    len > 1 ? text += ">" : text += " />";
    $(this).children('.bottom').children('div:not(:first-of-type)').each(function () {
      text += "<s";
      text += " title=\"" + ($(this).find('[name=title]').length != 0 ? $(this).find('[name=title]').val() : $(this).find('[name=title]').attr('value')) + "\"";
      text += " id=\"" + ($(this).find('.id').attr('val') == undefined ? null : $(this).find('.id').attr('val')) + "\"";
      text += " sbid=\"" + $(this).find('.id').attr('sbid') + "\"";
      text += " scale=\"" + $(this).find('.id').attr('scale') + "\"";
      text += " timeout=\"" + compareVal($(this).find('[name=timeout]'), $(this).find('[name=timeout]').val()) + "\"";
      text += " nearest=\"" + $(this).find('[name=nearest]').val() + "\"";
      text += " />"
    })
    if (len > 1) text += "</c>";
  });
  text += "</root>";
  biSetModuleConfig("signal-packing.system", text);
}

/**
 * 选择信号
 * @param {} obj 
 */
var idName = null;

function onClick(obj) {
  var originID = null;
  if ($(obj).text().indexOf(not_config) == -1) originID = $(obj).attr('val');
  idName = obj;
  var scale = $(obj).attr("scale");
  scale = parseInt(scale);
  var sbid = $(obj).attr('sbid') == "null" ? null : $(obj).attr('sbid');
  biSelectSignal("TargetSignal", originID, true, sbid, true, scale, "");
}

function biOnSelectedSignal(key, valueInfo, signBitInfo, scale) {
  var add_name_prefix = $('[name=add_name_prefix]').val();
  if (key == "TargetSignal") {
    if (valueInfo == null) {
      $(idName).removeClass('green').addClass('red');
      $(idName).text(not_config);
      $(idName).removeAttr("val title");
      $(idName).attr('scale', "1");
      $(idName).attr("sbid", "null");
    } else if (valueInfo.typeName == undefined) {
      $(idName).addClass('red').removeClass('green');
    } else {
      var arr = valueInfo.id.split(":");
      var name2 = "";
      if (add_name_prefix != "") name2 += add_name_prefix + ".";
      if (arr[0].indexOf(".dbc") != -1) {
        if ($('[name=add_name_with_msgname]').get(0).checked) name2 += valueInfo.typeName + ".";
      }
      name2 += valueInfo.signalName;
      $(idName).text(valueInfo.signalName);
      $(idName).parent().parent().parent().find('[name=title]').val(name2);
      $(idName).attr({
        "val": valueInfo.id,
        'scale': scale,
        'title': valueInfo.signalName
      });
      $(idName).addClass('green');
      if (signBitInfo != null) $(idName).attr("sbid", signBitInfo.id);
    }
  } else if (key == "TargetSignal1") {
    if (valueInfo != null) {
      var arr = valueInfo.id.split(":");
      var name2 = "";
      if (add_name_prefix != "") name2 += add_name_prefix + ".";
      if (arr[0].indexOf(".dbc") != -1) {
        if ($('[name=add_name_with_msgname]').get(0).checked) name2 += valueInfo.typeName + ".";
      }
      name2 += valueInfo.signalName;
      addSignal(signalObj, name2, valueInfo.id, valueInfo.signalName);
    }
  }
  setConfig();
}

function biOnInitEx(config, moduleConfigs) {
  if (biGetLanguage() == 1) {
    $('[language]').each(function () {
      var value = $(this).attr('language');
      $(this).text(en[value]);
    });
    not_config = en["not_config"];
  } else {
    $('[language]').each(function () {
      var value = $(this).attr('language');
      $(this).text(cn[value]);
    });
    not_config = cn["not_config"];
  }
  for (var key in moduleConfigs) {
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(moduleConfigs[key], "text/xml");
    var countrys = xmlDoc.getElementsByTagName('root');
    var object = new Object();
    var keys = countrys[0].attributes;
    for (var i = 0; i < keys.length; i++) {
      object[keys[i].nodeName] = keys[i].nodeValue;
    }
    var arr = [];
    for (var i = 0; i < countrys[0].childNodes.length; i++) {
      var keyss = countrys[0].childNodes[i].attributes;
      var obj = new Object();
      for (var j = 0; j < keyss.length; j++) {
        obj[keyss[j].nodeName] = keyss[j].nodeValue;
      }
      var a = [];
      for (var n = 0; n < countrys[0].childNodes[i].childNodes.length; n++) {
        var keys = countrys[0].childNodes[i].childNodes[n].attributes;
        var o = new Object();
        for (var h = 0; h < keys.length; h++) {
          o[keys[h].nodeName] = keys[h].nodeValue;
        }
        a.push(o);
      }
      obj.arr = a;
      arr.push(obj);
    }
    object.arr = arr;
    loadConfig(object);
  }
}