var signalId = "",
  boxIndex = "",
  dialogConfig = {},
  not_config = "";
//获取总线协议文件绑定的通道
function biOnQueriedBusProtocolFileChannel(busFileProtocolID, busChannel) {
  if (busChannel == 0) {
    $('.signal>.content').find('a').text(signalId).addClass('red').removeClass("blue");
    $('.signal>.content').find('button').attr('disabled', true).addClass("disabled_background");
  } else {
    var arr = signalId.split(":");
    $('.signal>.content').find('a').text(arr[2]).addClass('blue').removeClass('red');
  }
}

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
$('.signal').find('[name=name],[name=num]').bind('input propertychange', function () {
  if ($(this).attr("name") == "num") {
    var reg = /^[1-9]\d*$|^0$/;
    if (reg.test($(this).val())) {
      $(this).addClass("green").removeClass("red");
    } else {
      $(this).addClass("red").removeClass("green");
    }
  }
  checkSignal($('.signal'));
});
var idName;
$('.signal').find('a').click(function () {
  idName = $(this);
  var originID = $(this).text().indexOf('(') == -1 ? $(this).attr('val') : null;
  biSelectSignal("TargetSignal1", originID, false, null, false, 1, "[m]");
  checkSignal($('.signal'));
});

function signal_ok() {
  var name = $('.signal>.content').find('[name=name]').val();
  var num = Number($('.signal>.content').find('[name=num]').val());
  var arithmetic = Number($('.signal>.content').find('[name=arithmetic]').val());
  var val = $('.signal>.content').find('a').attr('val');
  var obj;
  if (boxIndex == "") {
    obj = new Box(name, "no", "no", "", "", "", "no", "0", "0", "", [], []);
    dialogConfig.arr.push(obj);
  } else {
    obj = dialogConfig.arr[boxIndex];
    obj.name = name;
  }
  var bb = arithmetic == 0 ? "" : arithmetic + "|";
  var n = arithmetic == 0 ? 2 : 3;
  dialogConfig.arr[boxIndex == "" ? dialogConfig.arr.length - 1 : boxIndex].condition = n + "|" + val + "|" + bb + num;
  biSetLocalVariable("event_configuration", JSON.stringify(dialogConfig));
  setConfig();
  biCloseChildDialog();
}

function biOnSelectedSignal(key, valueInfo, signBitInfo, scale) {
  if (key == "TargetSignal1") {
    if (valueInfo == null) {
      $(idName).removeAttr('val').removeClass('blue').text(not_config).addClass("red");
      $(idName).parent().parent().parent().find('button').attr('disabled', true).addClass("disabled_background");
    } else if (valueInfo.typeName == undefined) {
      $(idName).text(valueInfo.id).attr("val", valueInfo.id).attr("scale", scale).removeClass('blue').addClass("red");
      $(idName).parent().parent().parent().find('button').attr('disabled', true).addClass("disabled_background");
    } else {
      $(idName).prev().prev().val(valueInfo.signalName);
      $(idName).text(valueInfo.signalName).attr("val", valueInfo.id).attr("scale", scale).addClass('blue').removeClass("red");
    }
    checkSignal($('.signal'));
  }
}

function checkSignal(obj) {
  var text = $(obj).find('[name=name]').val(),
    text2 = $(obj).find('[name=num]').val(),
    flag1 = false,
    flag2 = false,
    flag3 = false;
  var arrBox = dialogConfig.arr;
  var index = -1;
  if (boxIndex != null) index = Number(boxIndex) - 1;
  for (var i = 0; i < arrBox.length; i++) {
    if (index == i) continue;
    if (text == arrBox[i].name) {
      flag1 = true;
      break;
    }
  };
  if (!$(obj).find('a').text().indexOf(not_config)) flag2 = true;
  var reg = /^[1-9]\d*$|^0$/;
  if (!reg.test(text2)) flag3 = true;
  if ((!flag1 && !flag2 && !flag3 && text != "" && boxIndex == "") || (boxIndex != "" && text != "" && !flag2 && !flag3)) {
    $('.signal>.content').find('button').removeAttr('disabled').removeClass("disabled_background");
  } else {
    $('.signal>.content').find('button').attr('disabled', true).addClass("disabled_background");
  }
}

function biOnInitEx(config, moduleConfigs) {
  boxIndex = config;
  if (biGetLanguage() == 1) {
    $("[language]").each(function () {
      var value = $(this).attr("language");
      $(this).text(en[value]);
    });
    not_config = en["not_config"];
  } else {
    $("[language]").each(function () {
      var value = $(this).attr("language");
      $(this).text(cn[value]);
    });
    not_config = cn["not_config"];
  }
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
  if (boxIndex != "") {
    var box = dialogConfig.arr[boxIndex];
    var text = box.condition;
    var arr = text.split("|");
    var arithmetic = arr.length == 4 ? arr[2] : "0"
    $('.signal>.content').find('button').removeAttr('disabled').removeClass("disabled_background");
    $('.signal>.content').find('[name=name]').val(box.name);
    $('.signal>.content').find('[name=num]').val(arr[arr.length - 1]);
    $('.signal>.content').find('[name=arithmetic]').val(arithmetic);
    var aa = arr[1].split(":");
    if (aa[0].indexOf(".dbc") != -1) {
      signalId = arr[1];
      biQueryBusProtocolFileChannel(aa[0]);
    } else {
      $('.signal>.content').find('a').text(aa[2]).addClass('blue');
    }
    $('.signal>.content').find('a').attr("val", arr[1])
  }
  checkSignal($('.signal'));
  var reg = /^[1-9]\d*$|^0$/;
  if (reg.test($("[name=num]").val())) {
    $("[name=num]").addClass("green").removeClass("red");
  } else {
    $("[name=num]").addClass("red").removeClass("green");
  }
}

function setConfig() {
  var arrBox = dialogConfig.arr;
  var textInfo = '<?xml version="1.0" encoding="utf-8"?>';
  textInfo +=
    '<root location_source="' + dialogConfig.location_source + '"' + ">";
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
}