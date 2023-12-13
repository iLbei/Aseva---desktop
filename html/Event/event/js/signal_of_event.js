var dialogConfig = {},
  not_config = "";
var openFlag = true;
class Box {
  constructor(name, enabled, send_mail,
    binding_video, binding_obj_sensor,
    binding_lane_sensor, rec_bus_enabled,
    rec_bus_positive, rec_bus_negative,
    condition, tablesigArr, transmsgArr
  ) {
    this.name = name;
    this.enabled = enabled;
    this.send_mail = send_mail;
    this.binding_video = binding_video;
    this.binding_obj_sensor = binding_obj_sensor;
    this.binding_lane_sensor = binding_lane_sensor;
    this.rec_bus_enabled = rec_bus_enabled;
    this.rec_bus_positive = rec_bus_positive;
    this.rec_bus_negative = rec_bus_negative;
    this.condition = condition;
    this.tablesigArr = tablesigArr;
    this.transmsgArr = transmsgArr;
  }
}
class Tablesig {
  constructor(name, signal, scale) {
    this.name = name;
    this.signal = signal;
    this.scale = scale;
  }
}
//7
function add_of_signal(name, id) {
  $box = $('.signal_of_event>.content>.bottom>.box').clone(true);
  $('.signal_of_event>.content>.bottom').append($box[0]);
}

function remove_signal_event(obj) {
  $(obj).parent().remove();
}
var idName;
/**
 * 选择信号
 * @param {} obj 
 */
function selectSignal(obj) {
  openFlag = false;
  idName = obj;
  var originID = $(obj).attr('val') != undefined ? $(obj).attr('val') : null;
  var scale = $(obj).attr('scale');
  scale = parseInt(scale);
  biSelectSignal("TargetSignal", originID, false, null, true, scale);
}

function biOnSelectedSignal(key, valueInfo, signBitInfo, scale) {
  if (valueInfo != null && valueInfo.typeName != undefined) {
    $(idName).prev().prev().val(valueInfo.signalName);
    $(idName).text(valueInfo.typeName + ":" + valueInfo.signalName);
    $(idName).attr({
      "val": valueInfo.id,
      "scale": scale,
      "title": valueInfo.typeName + ":" + valueInfo.signalName
    }).removeClass('red');
  } else if (valueInfo == null) {
    $(idName).removeAttr('val title').text(not_config).removeClass("red").siblings("[name=name]").val("Unknown");
  }
}

//获取信号信息
function biOnQueriedSignalInfo(key, signalInfo) {
  var i = Number(key);
  if (!Boolean(signalInfo) || signalInfo == "null") {
    var id = $(".content>.bottom>.box").eq(i).find("a").attr("val");
    $(".content>.bottom>.box").eq(i).find("a").text(id).addClass("red").attr("title", id);
  } else {
    if (Boolean(i) || i === 0) {
      $(".content>.bottom>.box").eq(i).find("a").text(signalInfo.typeName + ":" + signalInfo.signalName).removeClass("red").attr({
        "val": signalInfo.id,
        "title": signalInfo.typeName + ":" + signalInfo.signalName
      });
      if (!openFlag) $(".content>.bottom>.box").eq(i).find('[name=name]').val(signalInfo.signalName);
    } else if (key == "signals") {
      var $box = $('.bottom>div:first-child').clone(true);
      $box.find('[name=name]').val(signalInfo.signalName);
      $box.find('a').attr({
        "val": signalInfo.id,
        "title": signalInfo.typeName + ":" + signalInfo.signalName
      }).text(signalInfo.typeName + ":" + signalInfo.signalName);
      $('.bottom').append($box[0]);
    }
  }
}

function add_msg_signal() {
  openFlag = false;
  biSelectBusMessage("TargetMessage", null);
}
//bus
function biOnSelectedBusMessage(key, info) {
  if (key == "TargetMessage") {
    if (info != null) {
      biQuerySignalsInBusMessage("TargetMessage", info.id);
    }
  }
}

function biOnQueriedSignalsInBusMessage(key, signalIDList) {
  if (signalIDList.length != 0) {
    for (var i = 0; i < signalIDList.length; i++) {
      add_of_signal();
      biQuerySignalInfo($(".content>.bottom>.box").length - 1, signalIDList[i]);
    }
  }
}
function add_signals() {
  biSelectSignals("selectsignals", [], 100);
}

function biOnSelectedSignals(key, signalsInfo) {
  for (var i of signalsInfo) {
    biQuerySignalInfo("signals", i);
  }
}
function changeVal() {
  var box = dialogConfig.arr[boxIndex];
  var arr = [];
  $('.signal_of_event>.content>.bottom>div:not(:first-child)').each(function () {
    var id = $(this).find('a').attr('val');
    var name = $(this).find('[name=name]').val();
    var scale = $(this).find('a').attr('scale');
    if (id != undefined) {
      var tablesig = new Tablesig(name, id, scale);
      var count = 0;
      for (var j of arr) {
        if (j.signal == id) {
          count++;
          return;
        }
      }
      if (count == 0) arr.push(tablesig);
    }
  });
  box.tablesigArr = arr;
  biSetLocalVariable("event_configuration", JSON.stringify(dialogConfig));
  setConfig();
  biCloseChildDialog();
}

function biOnInitEx(config, moduleConfigs) {
  boxIndex = config;
  var lang = biGetLanguage() == 1 ? en : cn;
  $("[language]").each(function () {
    var value = $(this).attr("language");
    $(this).text(lang[value]);
  });
  not_config = lang["not_config"];
  for (var key in moduleConfigs) {
    xmlParse(moduleConfigs[key]);
  }
}

function xmlParse(text) {
  if (text == null) return;
  var parser = new DOMParser();
  var xmlDoc = parser.parseFromString(text, "text/xml");
  var countrys = xmlDoc.getElementsByTagName("root");
  var object = new Object();
  object.location_source = $(countrys).attr("location_source");
  var arr = [];
  for (var i = 0; i < countrys[0].children.length; i++) {
    var keyss = countrys[0].children[i].attributes;
    var obj = new Object();
    for (var j = 0; j < keyss.length; j++) {
      obj[keyss[j].nodeName] = keyss[j].nodeValue;
    }
    var arr2 = [],
      arr3 = [];
    for (var n = 0; n < countrys[0].children[i].children.length; n++) {
      var o = new Object();
      var keysss = countrys[0].children[i].children[n].attributes;
      for (var m = 0; m < keysss.length; m++) {
        o[keysss[m].nodeName] = keysss[m].nodeValue;
      }
      if (o.name != undefined) {
        arr2.push(o);
      } else {
        arr3.push(o);
      }
    }
    if (obj.from == undefined) {
      obj.tablesigArr = arr2;
      obj.transmsgArr = arr3;
      arr.push(obj);
    } else {
      object.mail = obj;
    }
  }
  object.arr = arr;
  dialogConfig = object;
  loadConfig();
}

function loadConfig() {
  var box = dialogConfig.arr[boxIndex];
  var arr = box.tablesigArr;
  for (var n = 0; n < arr.length; n++) {
    var tablesig = arr[n];
    $box = $('.bottom>div:first-child').clone(true);
    $box.find('[name=name]').val(tablesig.name);
    $box.find('a').addClass("red");
    $box.find('a').attr({
      "val": tablesig.signal,
      "scale": tablesig.scale,
      "title": tablesig.signal
    });
    $('.bottom').append($box[0]);
  }
  $(".content>.bottom>.box:not(:first-child)").each(function (i) {
    biQuerySignalInfo(i + 1, $(this).find("a").attr("val"));
  })
}

function setConfig() {
  var arrBox = dialogConfig.arr;
  var textInfo = '<?xml version="1.0" encoding="utf-8"?>';
  textInfo += '<root location_source="' + dialogConfig.location_source + '"' + ">";
  for (var i = 0; i < arrBox.length; i++) {
    var box = arrBox[i];
    textInfo += '<e name="' + box.name + '"';
    textInfo += ' enabled="' + box.enabled + '"';
    textInfo += ' condition="' + box.condition + '"';
    textInfo += ' send_mail="' + box.send_mail + '"';
    textInfo += ' binding_video="' + box.binding_video + '"';
    textInfo += ' binding_obj_sensor="' + box.binding_obj_sensor + '"';
    textInfo += ' binding_lane_sensor="' + box.binding_lane_sensor + '"';
    textInfo += ' rec_bus_enabled="' + box.rec_bus_enabled + '"';
    textInfo += ' rec_bus_positive="' + box.rec_bus_positive + '"';
    textInfo += ' rec_bus_negative="' + box.rec_bus_negative + '"';
    if (box.tablesigArr.length == 0 && box.transmsgArr.length == 0) {
      textInfo += " />";
    } else {
      textInfo += " >";
      for (var j = 0; j < box.tablesigArr.length; j++) {
        var tablesig = box.tablesigArr[j];
        textInfo += '<tablesig name="' + tablesig.name + '"';
        textInfo += ' signal="' + tablesig.signal + '"';
        textInfo += ' scale="' + tablesig.scale + '"/>';
      }
      for (var j = 0; j < box.transmsgArr.length; j++) {
        var transmsg = box.transmsgArr[j];
        textInfo += '<transmsg ch="' + transmsg.ch + '"';
        textInfo += ' id="' + transmsg.id + '"';
        textInfo += ' data="' + transmsg.data + '"/>';
      }
      textInfo += "</e>";
    }
  }
  textInfo += "<mail_config";
  var mail = dialogConfig.mail;
  for (var i in mail) {
    textInfo += " " + i + '="' + mail[i] + '"';
  }
  textInfo += " /></root>";
  biSetModuleConfig("event.system", textInfo);
  biCloseChildDialog();
}