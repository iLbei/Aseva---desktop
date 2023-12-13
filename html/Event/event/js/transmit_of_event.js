var dialogConfig = {},
  dialogIndex = 0;
function biOnInitEx(config, moduleConfigs) {
  dialogIndex = config;
  if (biGetLanguage() == 1) {
    $("[language]").each(function () {
      var value = $(this).attr("language");
      $(this).text(en[value]);
    });
  } else {
    $("[language]").each(function () {
      var value = $(this).attr("language");
      $(this).text(cn[value]);
    });
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
  var box = dialogConfig.arr[dialogIndex];
  var arr = box.transmsgArr;
  for (var n = 0; n < arr.length; n++) {
    var transmsg = arr[n];
    $box = $(".transmit_of_event>.content>.bottom>div").clone(true);
    $box.find("[name=ch]").val(transmsg.ch);
    $box.find("[name=id]").val(transmsg.id);
    var data = base.decode(transmsg.data).split("");
    $box.find("[name=dlc]").val(data.length);
    checkDlc($box.find("[name=dlc]"));
    for (var i = 0; i < data.length; i++) {
      var m = data[i].charCodeAt();
      $box.find("[name=d" + i + "]").val(m);
      check10to16($box.find("[name=d" + i + "]"));
    }
    $(".transmit_of_event>.content>.bottom").append($box[0]);
  }
}

function checkDlc(obj) {
  var value = Number($(obj).val());
  var ul = $(obj).parent().parent().parent();
  var num = 8 - value;
  $(ul)
    .children("li")
    .each(function (i, v) {
      var n = i + num;
      if (n >= 11) {
        $(this)
          .find("input")
          .attr("disabled", true)
          .addClass("disabled_background");
      } else {
        $(this)
          .find("input")
          .removeAttr("disabled")
          .removeClass("disabled_background");
      }
    });
}
$(".dd").change(function () {
  check10to16($(this));
});

function add_message() {
  $box = $(".transmit_of_event>.content>.bottom>div:first-of-type").clone(true);
  $(".transmit_of_event>.content>.bottom").append($box[0]);
  dialogConfig.arr[dialogIndex].transmsgArr.push({
    ch: "1",
    data: "",
    id: "100",
  });
  changeVal();
}
$(".transmit_of_event").on("change", "input[type=number]", function () {
  changeVal();
});
$(".transmit_of_event [type=text]")
  .bind("input propertychange", function () {
    var value = $(this).val();
    var reg = /^[0-9a-fA-F]{1,2}$/;
    if (!reg.test(value)) {
      $(this).addClass("red");
    } else {
      changeVal();
    }
  })
  .blur(function () {
    if ($(this).hasClass("red")) {
      $(this).removeClass("red");
      $(this).val($(this).attr("value"));
    } else if ($(this).val().length == 1) {
      $(this).val("0" + $(this).val().toLowerCase());
    } else {
      $(this).val($(this).val().toLowerCase());
    }
  });

function remove_transmit_of_event_box(obj) {
  var box = dialogConfig.arr[dialogIndex];
  var index = $(obj).parent().index() - 1;
  box.transmsgArr.splice(index, 1);
  $(obj).parent().remove();
  changeVal();
}

$("[name=dlc]").change(function () {
  checkDlc($(this));
});

function check10to16(obj) {
  var num = Number($(obj).val());
  var v = num.toString(16);
  if (v.length == 1) v = "0" + v;
  $(obj).parent().next().children("input").val(v);
}

function check16to10(obj) {
  var value = "0x" + $(obj).val();
  var v = eval(value).toString(10);
  $(obj).parent().prev().find("input").val(v);
}

class Box {
  constructor(
    name,
    enabled,
    send_mail,
    binding_video,
    binding_obj_sensor,
    binding_lane_sensor,
    rec_bus_enabled,
    rec_bus_positive,
    rec_bus_negative,
    condition,
    tablesigArr,
    transmsgArr
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
class Transmsg {
  constructor(ch, id, data) {
    this.ch = ch;
    this.id = id;
    this.data = data;
  }
}

function changeVal() {
  var box = dialogConfig.arr[dialogIndex];
  var arr = [];
  $(".transmit_of_event>.content>.bottom>div").each(function (i, v) {
    var ch = $(this).find("[name=ch]").val();
    var id = $(this).find("[name=id]").val();
    if (i != 0) {
      var aaa = "";
      for (var n = 0; n < 8; n++) {
        var d = $(this).find("[name=d" + n + "]");
        if ($(d).attr("disabled") == undefined)
          aaa += String.fromCharCode(Number($(d).val()));
      }
      var transmsg = new Transmsg(ch, id, base.encode(aaa));
      arr.push(transmsg);
    }
  });
  box.transmsgArr = arr;
  biSetLocalVariable("event_configuration", JSON.stringify(dialogConfig));
  setConfig();
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