var object, index, signalIndex, dialogConfig = [],
  not_config = "";

$("input").on("input", function () {
  setConfig()
});
$("select").change(function () {
  setConfig()
});
//选报文
var bus;

function selectBus(obj) {
  if ($(obj).hasClass('not_a')) return;
  var originID = $(obj).text().indexOf(not_config) != -1 ? null : $(obj).attr('val');
  bus = obj;
  biSelectBusMessage("TargetMessage", originID);
}

function biOnSelectedBusMessage(key, info) {
  var type = biGetLanguage();
  if (key == "TargetMessage") {
    if (info == null) {
      $(bus).removeAttr("val");
      $(bus).text(not_config);
      $(bus).removeClass("green");
    } else {
      $(bus).attr("val", info.id);
      $(bus).text(info.name);
      $(bus).addClass("green");
    }
  }
  dialogConfig[index]["childAttr"]["object"][signalIndex]["ed"] = info == null ? "null" : info.id;
  setConfig();
}

function biOnQueriedBusMessageInfo(key, busMessageInfo) {
  if (key.indexOf(":") != -1) {
    var arr = key.split(":");
    if (busMessageInfo != null) {
      if (arr.length == 2) {
        $('.c' + arr[1]).find('.sampling_msg').attr("val", busMessageInfo.id);
        $('.c' + arr[1]).find('.sampling_msg').text(busMessageInfo.name);
        $('.c' + arr[1]).find('.sampling_msg').addClass("green");
      } else {
        $('.detail').find('#ed').attr("val", busMessageInfo.id);
        $('.detail').find('#ed').text(busMessageInfo.name);
        $('.detail').find('#ed').addClass("green");
      }
    }
  }
}

/**
 * 选择信号
 * @param {} obj
 */
var signalObj = null; //选择的元素的id名
function selectSignal(obj, type, index) {
  if ($(obj).hasClass('not_a') || $(obj).hasClass('a')) return;
  var originID = null;
  if ($(obj).text().lastIndexOf(not_config) == -1) originID = $(obj).attr('val');
  var scale = $(obj).attr('scale');
  scale = Number(scale);
  signalObj = obj;
  var n = index == undefined ? "" : index;
  var unit = $(obj).attr("unit");
  biSelectSignal("TargetSignal" + n, originID, false, null, type, scale, "[" + unit + "]");
}

function biOnSelectedSignal(key, valueInfo, signBitInfo, scale) {
  if (valueInfo == null) {
    $(signalObj).attr('scale', "1").removeClass('green').removeAttr("val").text(not_config);
    if ($(signalObj).hasClass('dx_s')) {
      dialogConfig[index]["childAttr"]["object"][signalIndex]["dx_s"] = "null";
      dialogConfig[index]["childAttr"]["object"][signalIndex]["dx_l"] = "1";
    }
    if ($(signalObj).hasClass('dy_s')) {
      dialogConfig[index]["childAttr"]["object"][signalIndex]["dy_s"] = "null";
      dialogConfig[index]["childAttr"]["object"][signalIndex]["dy_l"] = "1";
    }
    $(signalObj).removeClass("red");
  } else if (valueInfo.typeName == undefined) {
    $(signalObj).text(valueInfo.id).addClass('red').removeClass('green').parent().attr("title", "");
  } else {
    if (key == "TargetSignal") {
      $(signalObj).text(valueInfo.signalName);
    } else {
      $(signalObj).text(valueInfo.typeName + ":" + valueInfo.signalName);
      $(signalObj).parent().attr("title", valueInfo.typeName + ":" + valueInfo.signalName);
    }
    $(signalObj).attr("val", valueInfo.id);
    $(signalObj).attr('scale', scale);
    $(signalObj).addClass('green');
    if ($(signalObj).hasClass('dx_s')) {
      dialogConfig[index]["childAttr"]["object"][signalIndex]["dx_s"] = valueInfo.id;
      dialogConfig[index]["childAttr"]["object"][signalIndex]["dx_l"] = scale;
    }
    if ($(signalObj).hasClass('dy_s')) {
      dialogConfig[index]["childAttr"]["object"][signalIndex]["dy_s"] = valueInfo.id;
      dialogConfig[index]["childAttr"]["object"][signalIndex]["dy_l"] = scale;
    }
  }
  setConfig();
}

/**
 * 判断中英文
 */
function changeLanguage(type) {
  if (type == 1) {
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
}

function biOnInitEx(config, moduleConfigs) {
  var type = biGetLanguage();
  changeLanguage(type);
  signalIndex = config.split(",")[0];
  index = config.split(",")[1];
  for (var key in moduleConfigs) {
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(moduleConfigs[key], "text/xml");
    var root = xmlDoc.getElementsByTagName('root');
    var childNodes = root[0].childNodes;
    for (var i = 0; i < childNodes.length; i++) {
      var keys = childNodes[i].attributes;
      var obj = {};
      for (var j = 0; j < keys.length; j++) {
        // 获取root自身字节的属性
        obj[keys[j].nodeName] = keys[j].nodeValue;
      }
      var childKeys = childNodes[i].childNodes;
      var child = {
        "fov": [],
        "class_signal_value": [],
        "object": []
      };
      for (var j = 0; j < childKeys.length; j++) {
        var name = childKeys[j].nodeName;
        var childKeysAttrs = childKeys[j].attributes;
        var childAttr = {}
        for (var k = 0; k < childKeysAttrs.length; k++) {
          childAttr[childKeysAttrs[k].nodeName] = childKeysAttrs[k].nodeValue;
        }
        if (name == "fov") {
          child.fov.push(childAttr)
        } else if (name == "class_signal_value") {
          child.class_signal_value.push(childAttr);
        } else if (name == "object") {
          child.object.push(childAttr);
        }
      }
      dialogConfig.push({
        "attr": obj,
        "childAttr": child
      });
    }
    loadConfig();
  }
}

function loadConfig() {
  var object = dialogConfig[index]["childAttr"]["object"][signalIndex];
  $('.detail').find('a').each(function () {
    var idName = $(this).attr('id');
    var scaleName = $(this).attr('scaleName');
    if (scaleName != undefined) $(this).attr('scale', object[scaleName]);
    if (idName != "ed") {
      if (object[idName] != null && object[idName] != "null") {
        biQuerySignalInfo(idName, object[idName]);
        $(this).attr('val', object[idName]);
      }
    }
    if (idName == "ed") {
      if (object[idName] != null && object[idName] != "null") {
        biQueryBusMessageInfo("TargetMessage:ed:" + index, object[idName]);
      }
    }
  });
  $('.detail').find('[name]').each(function () {
    var name = $(this).attr('name');
    $(this).val(object[name]).attr('value', object[name]);
  });
  var m1 = dialogConfig[index]["attr"]["class_mode"];
  var m2 = dialogConfig[index]["attr"]["ko_front_mode"];
  var m3 = dialogConfig[index]["attr"]["ko_left_mode"];
  var m4 = dialogConfig[index]["attr"]["ko_right_mode"];
  var position = dialogConfig[index]["attr"]["pos_mode"];
  if (m1 == "1") {
    $('.detail').find('[name=fc]').removeAttr('disabled').removeClass("disabled_background");
    $('.detail').find('#cl_s').addClass('not_a');
    $('.detail').find('#clc_s').addClass('not_a');
  } else {
    $('.detail').find('[name=fc]').attr('disabled', true).addClass("disabled_background");
    $('.detail').find('#cl_s').removeClass('not_a');
    $('.detail').find('#clc_s').removeClass('not_a');
  }
  if (m2 == "3") {
    $('.detail').find('[name=kof_v]').removeAttr('disabled').removeClass('a disabled_background');
    $('.detail').find('#kof_s').removeClass('not_a');
  } else {
    $('.detail').find('[name=kof_v]').attr('disabled', true).addClass('a disabled_background');
    $('.detail').find('#kof_s').addClass('not_a');
  }
  if (m3 == "3") {
    $('.detail').find('[name=kol_v]').removeAttr('disabled').removeClass('a disabled_background');
    $('.detail').find('#kol_s').removeClass('not_a');
  } else {
    $('.detail').find('[name=kol_v]').attr('disabled', true).addClass('a disabled_background');
    $('.detail').find('#kol_s').addClass('not_a');
  }
  if (m4 == "3") {
    $('.detail').find('[name=kor_v]').removeAttr('disabled').removeClass('a disabled_background');
    $('.detail').find('#kor_s').removeClass('not_a');
  } else {
    $('.detail').find('[name=kor_v]').attr('disabled', true).addClass('a disabled_background');
    $('.detail').find('#kor_s').addClass('not_a');
  }
  if (position == "ClosestPoint") {
    $('.detail').find('#wi_s').addClass('not_a');
    $('.detail').find('#le_s').addClass('not_a');
    $('.detail').find('#hei_s').addClass('not_a');
  } else {
    $('.detail').find('#wi_s').removeClass('not_a');
    $('.detail').find('#le_s').removeClass('not_a');
    $('.detail').find('#hei_s').removeClass('not_a');
  }
}

function biOnQueriedSignalInfo(key, info) {
  if (info != null) {
    $('#' + key).text(info.typeName + ":" + info.signalName).addClass('green');
    $('#' + key).parent().attr("title", info.typeName + ":" + info.signalName);
  } else {
    $('#' + key).text($('#' + key).attr('val')).addClass('red');
    $('#' + key).parent().attr("title", "");
  }
}

function setConfig() {
  changeVal();
  var text = "<?xml version=\"1.0\" encoding=\"utf-8\"?><root>";
  for (var i = 0; i < dialogConfig.length; i++) {
    text += "<c" + (i + 1) + " ";
    for (var j in dialogConfig[i]["attr"]) {
      text += j + "=\"" + dialogConfig[i]["attr"][j] + "\" ";
    }
    if (dialogConfig[i]["childAttr"].length == 0) {
      text += "/>";
    } else {
      text += ">";
      for (var j in dialogConfig[i]["childAttr"]) {
        for (var k in dialogConfig[i]["childAttr"][j]) {
          text += "<" + j + " ";
          for (var l in dialogConfig[i]["childAttr"][j][k]) {
            text += l + "=\"" + dialogConfig[i]["childAttr"][j][k][l] + "\" ";
          }
          text += "/>"
        }
      }
      text += "</c" + (i + 1) + ">";
    }
  }
  text += "</root>";
  biSetModuleConfig("object-sensor-by-can.pluginsensor", text)
}

function changeVal() {
  $('.detail').find('a').each(function () {
    var idName = $(this).attr('id');
    var scaleName = $(this).attr('scaleName');
    var scale = $(this).attr('scale');
    var val = $(this).attr('val') == undefined ? "null" : $(this).attr('val');
    dialogConfig[index]["childAttr"]["object"][signalIndex][idName] = val;
    if (scaleName != undefined) dialogConfig[index]["childAttr"]["object"][signalIndex][scaleName] = scale;
  });
  $('.detail').find('[name]').each(function () {
    var name = $(this).attr('name');
    dialogConfig[index]["childAttr"]["object"][signalIndex][name] = $(this).val();
  });
  biSetLocalVariable("object_sensor_by_can", JSON.stringify(dialogConfig));
}