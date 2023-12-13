var dialogConfig = {},
  boxIndex = "";
function biOnInitEx(config, moduleConfigs) {
  boxIndex = config;
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
  if (boxIndex != "") {
    var box = dialogConfig.arr[boxIndex];
    var text = box.condition;
    var index = text.indexOf("|");
    var last = text.lastIndexOf("|");
    var m = Number(text.substring(index + 1, last));
    var s = Number(text.substring(last + 1));
    var am = m >= 12 ? "pm" : "am";
    var s1 = am == "pm" ? m - 12 : m;
    $(".schedule>.content").find("button").removeAttr("disabled").removeClass("disabled_background");
    $(".schedule>.content").find("[name=name]").val(box.name);
    $(".schedule>.content").find("[name=am]").val(am);
    $(".schedule>.content").find("[name=s1]").val(s1);
    $(".schedule>.content").find("[name=s2]").val(s);
  }
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
$(".schedule [type=text]").bind("input propertychange", function () {
  var text = $(this).val(),
    flag = false;
  var arrBox = dialogConfig.arr;
  for (var i = 0; i < arrBox.length; i++) {
    if (text == arrBox[i].name) {
      flag = true;
      break;
    }
  }
  if (!flag) {
    $(".schedule>.content").find("button").removeAttr("disabled").removeClass("disabled_background");
  } else {
    $(".schedule>.content").find("button").attr("disabled", true).addClass("disabled_background");
  }
  if (text == "") $(".schedule>.content").find("button").attr("disabled", true).addClass("disabled_background");
});

$(".schedule [name=am]").change(function () {
  if ($(this).val() == "pm") {
    $(this).next().find("option:first-child").text(12);
  } else {
    $(this).next().find("option:first-child").text(0);
  }
});

function schedule_ok() {
  var name = $(".schedule>.content").find("[name=name]").val();
  var type = $(".schedule>.content").find("[name=am]").val();
  var s1 = Number($(".schedule>.content").find("[name=s1]").val());
  var s2 = Number($(".schedule>.content").find("[name=s2]").val());
  var num = type == "pm" ? 12 : 0;
  if (s1 != 12 && num != 0) {
    s1 = s1 + num;
  }
  var obj;
  if (boxIndex == "") {
    obj = new Box(name, "no", "no", "", "", "", "no", "0", "0", "", [], []);
    dialogConfig.arr.push(obj);
  } else {
    obj = dialogConfig.arr[boxIndex];
    obj.name = name;
  }
  dialogConfig.arr[boxIndex == "" ? dialogConfig.arr.length - 1 : boxIndex].condition =
    "1|" + s1 + "|" + s2;
  setConfig();
  biSetLocalVariable("event_configuration", JSON.stringify(dialogConfig));
  biCloseChildDialog();
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
}

function isDisabled(o) {
  var obj = $(o).parent().parent().next();
  var name = $(o).parent().parent().parent().prev().text();
  var box = findBoxByName(name);
  if (!$(obj).prev().find("[type=checkbox]").get(0).checked) {
    $(obj).find("p").css("opacity", 0.3);
    $(obj).find("span").css("opacity", 0.3);
    $(obj).find(".a").addClass("not_a1");
    $(obj).find("a").addClass("not_a1");
    $(obj).find("a").removeClass("qing");
    $(obj).find("select").attr("disabled", true).addClass("disabled_background");
    $(obj).find("[type=number]").attr("disabled", true).addClass("disabled_background");
    $(obj).find("[type=checkbox]").attr("disabled", true).addClass("disabled_background");
    if (box != undefined) box.enabled = "no";
  } else {
    if (box != undefined) box.enabled = "yes";
    $(obj).find("p").css("opacity", 1);
    $(obj).find("span").css("opacity", 1);
    $(obj).find(".a").removeClass("not_a1");
    $(obj).find("a").removeClass("not_a1");
    $(obj).find("select").removeAttr("disabled").removeClass("disabled_background");
    $(obj).find("[type=number]").removeAttr("disabled").removeClass("disabled_background");
    $(obj).find("[type=checkbox]").removeAttr("disabled").removeClass("disabled_background");
  }
  setConfig();
}
