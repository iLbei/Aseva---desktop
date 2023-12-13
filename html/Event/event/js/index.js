// 2023/11/23 v2.2.0 判断事件触发是否选中，如果没有选中，rec_bus_enabled变为橙色，弹出对话框提示，可切换采集模式
// 2023/12/6 v2.2.1 修改采集范围最大值为60
var dialogConfig = {},
  boxIndex = 0,
  session_alert,
  sessionAlertFlag = false,//标记是否弹出过对话框
  confirmAlert;
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
class Tablesig {
  constructor(name, signal, scale) {
    this.name = name;
    this.signal = signal;
    this.scale = scale;
  }
}
class Transmsg {
  constructor(ch, id, data) {
    this.ch = ch;
    this.id = id;
    this.data = data;
  }
}

var operationalArr = ["=", "<", ">=", ">", "<=", "!="];
var idNameArr = [];
/**
 *
 * 加载配置
 */
function loadConfig() {
  var arr = dialogConfig.arr;
  var type = biGetLanguage();
  $("[name=location_source]").val(dialogConfig.location_source);
  for (var i = 0; i < arr.length; i++) {
    var box = arr[i];
    $box = $(".container>.content>.box").clone(true);
    if (box.enabled == "yes") $box.find("[name=enabled]").prop("checked", true);
    if (box.send_mail == "yes")
      $box.find("[name=send_mail]").prop("checked", true);
    if (box.rec_bus_enabled == "yes")
      $box.find("[name=rec_bus_enabled]").prop("checked", true);
    $box.find("[name=rec_bus_positive]").val(box.rec_bus_positive);
    $box.find("[name=rec_bus_negative]").val(box.rec_bus_negative);
    var bindVideo = box.binding_video == "null" ? "" : box.binding_video,
      bindLane =
        box.binding_lane_sensor == "null" ? "" : box.binding_lane_sensor,
      bindSensor =
        box.binding_obj_sensor == "null" ? "" : box.binding_obj_sensor;
    $box.find("[name=binding_video]").val(bindVideo);
    $box.find("[name=binding_obj_sensor]").val(bindSensor);
    $box.find("[name=binding_lane_sensor]").val(bindLane);
    $box.children(".name").text(box.name);
    var condition = box.condition;
    var condArr = condition.split("|");
    if (condArr[0] == "1") {
      $box
        .find(".cond")
        .text(
          "Schedule at " +
          (condArr[1].length == 1 ? "0" + condArr[1] : condArr[1]) +
          ":" +
          (condArr[2].length == 1 ? "0" + condArr[2] : condArr[2])
        );
    } else {
      var t = condArr[1].split(":");
      var tt = condArr.length == 4 ? Number(condArr[2]) : 0;
      if (t[0].indexOf(".dbc") != -1) {
        biQueryBusProtocolFileChannel(t[0]);
        if (condArr[0] == "2") {
          idNameArr.push(
            i + "|" + condArr[1] + "|" + operationalArr[tt] + "|" + condArr[2]
          );
        } else {
          idNameArr.push(
            i + "|" + condArr[1] + "|" + operationalArr[tt] + "|" + condArr[3]
          );
        }
      } else {
        if (condArr[0] == "2") {
          $box
            .find(".cond")
            .text(t[t.length - 1] + " " + operationalArr[tt] + " " + condArr[2])
            .addClass("green");
        } else {
          $box
            .find(".cond")
            .text(t[t.length - 1] + " " + operationalArr[tt] + " " + condArr[3])
            .addClass("green");
        }
      }
    }
    if (box.tablesigArr.length != 0) {
      var text = box.tablesigArr.length > 1 ? " signals" : " signal";
      text =
        type == 2
          ? box.tablesigArr.length + "个消息"
          : box.tablesigArr.length + text;
      $box.find("[language=no_data]").text(text).addClass("green");
    }
    if (box.transmsgArr.length != 0) {
      var text = box.transmsgArr.length > 1 ? " messages" : " message";
      text =
        type == 2
          ? "发送" + box.transmsgArr.length + "个报文"
          : "Transmit " + box.transmsgArr.length + text;
      $box.find("[language=not_tran]").text(text).addClass("green");
    }
    $box.find(".cond").attr("type", condArr[0]);
    isDisabled(
      $box
        .children("div")
        .children("div:nth-of-type(1)")
        .find("[type=checkbox]")
    );
    $(".container>.content").append($box[0]);
  }
  biQueryChannelNames("1", "video", 24);
}

function biOnQueriedGlobalParameter(id, value) {
  if (value == "no") {
    $("[name=rec_bus_enabled]").addClass("continuousRecording");
    $(".continuousRecording:checked").next().addClass("orange");
  } else if (value == "yes") {
    $("[name=rec_bus_enabled]")
      .removeClass("continuousRecording")
      .next()
      .removeClass("orange");
  }
}

function biOnResultOfConfirm(key, result) {
  if (result) {
    biSetGlobalParameter("System.OnlineRecordOnlyByEvents", "yes");
    biQueryGlobalParameter("System.OnlineRecordOnlyByEvents", "yes");
  }
}

//获取总线协议文件绑定的通道
function biOnQueriedBusProtocolFileChannel(busFileProtocolID, busChannel) {
  if (busChannel == 0) {
    for (var i = 0; i < idNameArr.length; i++) {
      var arr = idNameArr[i].split("|");
      var index = Number(arr[0]);
      var text = arr[1] + " " + arr[2] + " " + arr[3];
      $(".container>.content")
        .children("div:eq(" + (index + 1) + ")")
        .find(".cond")
        .text(text)
        .removeClass("green")
        .addClass("red");
      disabled(
        $(".container>.content")
          .children("div:eq(" + (index + 1) + ")")
          .find(".cond")
      );
    }
  } else {
    for (var i = 0; i < idNameArr.length; i++) {
      var arr = idNameArr[i].split("|");
      var index = Number(arr[0]);
      var arr2 = arr[1].split(":");
      var text = arr2[2] + " " + arr[2] + " " + arr[3];
      $(".container>.content")
        .children("div:eq(" + (index + 1) + ")")
        .find(".cond")
        .text(text)
        .addClass("green");
    }
  }
}

function biOnQueriedChannelNames(key, channelNames) {
  var arr = [];
  for (var key in channelNames) {
    arr.push(channelNames[key]);
  }
  for (var n = 0; n < $("[name=binding_video]").length; n++) {
    var nn = $("[name=binding_video]")[n];
    $(nn)
      .children()
      .each(function (i, v) {
        if (i != 0) $(this).text(arr[i - 1]);
      });
  }
}

$("[name=binding_video]").change(function () {
  var name = $(this).parent().parent().parent().parent().prev().text();
  for (var i = 0; i < dialogConfig.arr.length; i++) {
    var box = dialogConfig.arr[i];
    if (name == box.name) {
      box.binding_video = $(this).val();
      break;
    }
  }
  setConfig();
});
$("[name=binding_obj_sensor]").change(function () {
  var name = $(this).parent().parent().parent().parent().prev().text();
  for (var i = 0; i < dialogConfig.arr.length; i++) {
    var box = dialogConfig.arr[i];
    if (name == box.name) {
      box.binding_obj_sensor = $(this).val();
      break;
    }
  }
  setConfig();
});
$("[name=binding_lane_sensor]").change(function () {
  var name = $(this).parent().parent().parent().parent().prev().text();
  for (var i = 0; i < dialogConfig.arr.length; i++) {
    var box = dialogConfig.arr[i];
    if (name == box.name) {
      box.binding_lane_sensor = $(this).val();
      break;
    }
  }
  setConfig();
});
$("[name=location_source]").change(function () {
  dialogConfig.location_source = $(this).val();
  setConfig();
});

function findBoxByName(name) {
  var arrBox = dialogConfig.arr;
  var index = -1;
  for (var i = 0; i < arrBox.length; i++) {
    var box = arrBox[i];
    if (name == box.name) {
      index = i;
      break;
    }
  }
  return arrBox[index];
}
/**
 * 写配置
 */

function setConfig() {
  dialogConfig.location_source = $("[name=location_source]").val();
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
  biSetLocalVariable("event_configuration", JSON.stringify(dialogConfig));
  biSetModuleConfig("event.system", textInfo);
}

function xmlParse2(text) {
  var parser = new DOMParser();
  var xmlDoc = parser.parseFromString(text, "text/xml");
  var countries = xmlDoc.getElementsByTagName("root");
  var object = new Object();
  object.location_source = $(countries).attr("location_source");
  var arr = [];
  for (var i = 0; i < countries[0].children.length; i++) {
    var keys1 = countries[0].children[i].attributes;
    var obj = new Object();
    for (var j = 0; j < keys1.length; j++) {
      obj[keys1[j].nodeName] = keys1[j].nodeValue;
    }
    var arr2 = [],
      arr3 = [];
    for (var n = 0; n < countries[0].children[i].children.length; n++) {
      var o = new Object();
      var keys2 = countries[0].children[i].children[n].attributes;
      for (var m = 0; m < keys2.length; m++) {
        o[keys2[m]] = countries[0].children[i].children[n].getAttribute(
          keys2[m]
        );
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
  return object;
}

////////////各事件//////////////////
function remove(obj) {
  var index = $(obj).parent().parent().parent().index();
  $(obj).parent().parent().parent().remove();
  dialogConfig.arr.splice(index - 1, 1);
  setConfig();
}

function disabled(o) {
  var obj = $(o).parent().parent().next();
  $(obj).find("p").css("opacity", 0.3);
  $(obj).find("span").css("opacity", 0.3);
  $(obj).find(".a").addClass("not_a1");
  $(obj).find("a").addClass("not_a1");
  $(obj).find("a").removeClass("green");
  $(obj).find("select").attr("disabled", true);
  $(obj).find("[type=number]").attr("disabled", true);
  $(obj).find("[type=checkbox]").attr("disabled", true);
}

function isDisabled(o) {
  var cond = $(o).parent().next().next().children(".cond");
  if ($(cond).hasClass("red") && $(cond).text().indexOf("(") == -1) return;
  var obj = $(o).parent().parent().next();
  var name = $(o).parent().parent().parent().prev().text();
  var enabled = "no";
  if (!$(obj).prev().find("[type=checkbox]").get(0).checked) {
    $(obj).find("p").css("opacity", 0.3);
    $(obj).find("span").css("opacity", 0.3);
    $(obj).find(".a").addClass("not_a1");
    $(obj).find("a").addClass("not_a1");
    $(obj).find("a").removeClass("green");
    $(obj).find("select").attr("disabled", true);
    $(obj).find("[type=number]").attr("disabled", true);
    $(obj)
      .find("[type=checkbox]")
      .attr("disabled", true)
      .addClass("disabled_background");
    enabled = "no";
  } else {
    enabled = "yes";
    $(obj).find("p").css("opacity", 1);
    $(obj).find("span").css("opacity", 1);
    $(obj).find(".a").removeClass("not_a1");
    $(obj).find("a").removeClass("not_a1");
    $(obj).find("select").removeAttr("disabled");
    $(obj).find("[type=number]").removeAttr("disabled");
    $(obj).find("[type=checkbox]").removeAttr("disabled").removeClass("disabled_background");
    setTimeout(function () {
      if ($(obj).find(".continuousRecording").is(":checked")) {
        if (!sessionAlertFlag) {
          biConfirm("continuousRecording", session_alert, confirmAlert)
          sessionAlertFlag = true;
        }
      }
    }, 300)
  }
  for (var i = 0; i < dialogConfig.arr.length; i++) {
    var box = dialogConfig.arr[i];
    if (box.name == name) {
      box.enabled = enabled;
      break;
    }
  }
  setConfig();
}

function sendMail(obj) {
  var name = $(obj).parent().parent().parent().parent().parent().prev().text();
  var flag = $(obj).get(0).checked ? "yes" : "no";
  for (var i = 0; i < dialogConfig.arr.length; i++) {
    var box = dialogConfig.arr[i];
    if (box.name == name) {
      box.send_mail = flag;
      break;
    }
  }
  setConfig();
}

function recBusEnabled(obj) {
  var name = $(obj)
    .parent()
    .parent()
    .parent()
    .parent()
    .parent()
    .parent()
    .prev()
    .text();
  var flag = $(obj).get(0).checked ? "yes" : "no";
  for (var i = 0; i < dialogConfig.arr.length; i++) {
    var box = dialogConfig.arr[i];
    if (box.name == name) {
      box.rec_bus_enabled = flag;
      break;
    }
  }
  setConfig();
  if (!$(obj).hasClass("continuousRecording")) return;
  if ($(obj).is(":checked")) {
    $(obj).next().addClass("orange");
    if (!sessionAlertFlag) {
      biConfirm("continuousRecording", session_alert, confirmAlert)
      sessionAlertFlag = true;
    }
  } else {
    $(obj).next().removeClass("orange");
  }
}

$("[name=rec_bus_positive]").blur(function () {
  var value = $(this).val();
  var v = Number(value);
  var min = Number($(this).attr("min"));
  var max = Number($(this).attr("max"));
  var name = $(this).parent().parent().parent().parent().parent().prev().text();
  v = v < min ? min : v;
  v = v > max ? max : v;
  $(this).val(v.toFixed(0));
  for (var i = 0; i < dialogConfig.arr.length; i++) {
    var box = dialogConfig.arr[i];
    if (box.name == name) {
      box.rec_bus_positive = v.toFixed(0);
      break;
    }
  }
  setConfig();
});

$("[name=rec_bus_negative]").blur(function () {
  var value = $(this).val();
  var v = Number(value);
  var min = Number($(this).attr("min"));
  var max = Number($(this).attr("max"));
  var name = $(this).parent().parent().parent().parent().parent().prev().text();
  v = v < min ? min : v;
  v = v > max ? max : v;
  $(this).val(v.toFixed(0));
  for (var i = 0; i < dialogConfig.arr.length; i++) {
    var box = dialogConfig.arr[i];
    if (box.name == name) {
      box.rec_bus_negative = v.toFixed(0);
      break;
    }
  }
  setConfig();
});
var isFlag = false;

function trigger_cond(obj) {
  var type = $(obj).attr("type");
  if (type == 1) {
    openDialog("add_schedule", obj);
  } else {
    openDialog("add_signal", obj);
  }
}

//4导入
function importAsc() {
  var filter = {
    ".asmc": "ASEva Module Configuration (*.asmc)",
  };
  biSelectPath("OpenFilePath", BISelectPathType.OpenFile, filter);
}

function biOnSelectedPath(key, path) {
  if (path == null) {
    return;
  }
  if (key == "CreateFilePath") {
    var textInfo = '<?xml version="1.0" encoding="utf-8"?>';
    textInfo +=
      '<root location_source="' +
      $("[name=location_source]").val() +
      '"' +
      ' type="event-config-v1">';
    var arrBox = dialogConfig.arr;
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
      textInfo +=
        ' rec_bus_positive="' +
        $(".container>.content>div:nth-of-type(" + (i + 2) + ")")
          .find("[name=rec_bus_positive]")
          .val() +
        '"';
      textInfo +=
        ' rec_bus_negative="' +
        $(".container>.content>div:nth-of-type(" + (i + 2) + ")")
          .find("[name=rec_bus_negative]")
          .val() +
        '"';
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
    textInfo += "/></root>";
    biWriteFileText(path, textInfo);
  } else if (key == "OpenFilePath") {
    biQueryFileText(path);
  }
}

function biOnQueriedFileText(text, path) {
  if (text != null) {
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(text, "text/xml");
    var countries = xmlDoc.getElementsByTagName("root");
    var type = $(countries).attr("type");
    if (type != "event-config-v1") {
      var txt =
        language == 1
          ? "The file is not for event configuration"
          : "该文件不是用于事件配置的";
      var title = language == 1 ? "Error" : "错误";
      biAlert(txt, title);
      return;
    } else {
      $(".container>.content>div:not(:first-child)").remove();
      xmlParse(text);
      setConfig();
    }
  }
}

//导出
function exportAsc() {
  var filter = {
    ".asmc": "ASEva Module Configuration (*.asmc)",
  };
  biSelectPath("CreateFilePath", BISelectPathType.CreateFile, filter);
}

function checkMail() {
  var flag = $(".mail>.content").find("[name=enabled]").get(0).checked;
  $(".mail>.content>div:not(:first-of-type)").each(function () {
    $(this)
      .find("[name]")
      .each(function () {
        !flag ? $(this).attr("disabled", true) : $(this).removeAttr("disabled");
      });
    $(this)
      .find("span")
      .each(function () {
        !flag
          ? $(this).addClass("disabled_a")
          : $(this).removeClass("disabled_a");
      });
  });
}
$(".mail>.content")
  .find("[name=enabled]")
  .click(function () {
    checkMail();
  });
$(".mail [type=text],.mail [type=password]").bind(
  "input propertychange",
  function () {
    var name = $(this).attr("name");
    if (name == "from" || name == "to") {
      checkText($(this));
    } else {
      checkTxt($(this));
    }
  }
);
var schedule_event = "",
  signal_event = "",
  manual_tr_event = "",
  mail_send_cfg = "",
  signal_of_event = "",
  tran_msg_for_event = "";
function biOnInitEx(config, moduleConfigs) {
  var lang = biGetLanguage() == 1 ? en : cn;
  $("[language]").each(function () {
    var value = $(this).attr("language");
    $(this).text(lang[value]);
  });
  schedule_event = lang["schedule_event"];
  signal_event = lang["signal_event"];
  manual_tr_event = lang["manual_tr_event"];
  mail_send_cfg = lang["mail_send_cfg"];
  signal_of_event = lang["signal_of_event"];
  tran_msg_for_event = lang["tran_msg_for_event"];
  session_alert = lang["session_alert"];
  confirmAlert = lang["confirmAlert"];
  for (var key in moduleConfigs) {
    xmlParse(moduleConfigs[key]);
  }
  biQueryGlobalParameter("System.OnlineRecordOnlyByEvents", "no");
}
/**
 * 解析xml,回显数据
 * @param {*} text
 */
function xmlParse(text) {
  if (text == null) return;
  var parser = new DOMParser();
  var xmlDoc = parser.parseFromString(text, "text/xml");
  var countries = xmlDoc.getElementsByTagName("root");
  var object = new Object();
  object.location_source = $(countries).attr("location_source");
  var arr = [];
  for (var i = 0; i < countries[0].children.length; i++) {
    var keys1 = countries[0].children[i].attributes;
    var obj = new Object();
    for (var j = 0; j < keys1.length; j++) {
      obj[keys1[j].nodeName] = keys1[j].nodeValue;
    }
    var arr2 = [],
      arr3 = [];
    for (var n = 0; n < countries[0].children[i].children.length; n++) {
      var o = new Object();
      var keys2 = countries[0].children[i].children[n].attributes;
      for (var m = 0; m < keys2.length; m++) {
        o[keys2[m].nodeName] = keys2[m].nodeValue;
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
  if (
    localStorage.getItem("eventMailRemember") !== "true" ||
    !dialogConfig.mail.password
  ) {
    dialogConfig.mail.password = "";
    // localStorage.setItem("eventMailRemember", false)
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
  loadConfig();
}

function openDialog(name, obj) {
  switch (name) {
    case "add_schedule": {
      boxIndex = Boolean(obj) ? $(obj).parents(".box").index() - 1 : "";
      biOpenChildDialog(
        "event.schedule.html",
        schedule_event,
        new BISize(268, 145),
        boxIndex
      );
      break;
    }
    case "add_signal": {
      boxIndex = Boolean(obj) ? $(obj).parents(".box").index() - 1 : "";
      biOpenChildDialog(
        "event.signal.html",
        signal_event,
        new BISize(258, 153),
        (boxIndex = Boolean(obj) ? $(obj).parents(".box").index() - 1 : "")
      );
      break;
    }
    case "add_manual": {
      biOpenChildDialog(
        "event.trigger.html",
        manual_tr_event,
        new BISize(298, 136),
        boxIndex
      );
      break;
    }
    case "mail_set": {
      biOpenChildDialog(
        "event.mail.html",
        mail_send_cfg,
        new BISize(343, 428),
        ""
      );
      break;
    }
    case "no_data": {
      boxIndex = Boolean(obj) ? $(obj).parents(".box").index() - 1 : "";
      biOpenChildDialog(
        "event.signal_of_event.html",
        signal_of_event,
        new BISize(672, 467),
        boxIndex
      );
      break;
    }
    case "transmit": {
      boxIndex = Boolean(obj) ? $(obj).parents(".box").index() - 1 : "";
      biOpenChildDialog(
        "event.transmit_of_event.html",
        tran_msg_for_event,
        new BISize(676, 352),
        boxIndex
      );
      break;
    }
  }
}

function biOnClosedChildDialog(htmlName) {
  if (
    JSON.parse(biGetLocalVariable("event_configuration")) != "null" &&
    Boolean(JSON.parse(biGetLocalVariable("event_configuration")))
  ) {
    dialogConfig = JSON.parse(biGetLocalVariable("event_configuration"));
  }
  switch (htmlName) {
    case "event.schedule.html":
    case "event.signal_of_event.html":
    case "event.trigger.html":
    case "event.signal.html": {
      if (Boolean(dialogConfig)) {
        $(".container>.content>.box:not(:first-child)").remove();
        loadConfig();
      }
      break;
    }
    case "event.transmit_of_event.html": {
      $(".content>.box:not(:first-child)").each(function (i) {
        var arr = dialogConfig.arr[i].transmsgArr;
        var text = "";
        if (arr.length != 0) {
          text =
            biGetLanguage() == 2
              ? "发送" + arr.length + "个报文"
              : "Transmit " +
              arr.length +
              (arr.length > 1 ? " messages" : " message");
          $(this).find("[language=not_tran]").text(text).addClass("green");
        } else {
          text = biGetLanguage() == 1 ? en["not_tran"] : cn["not_tran"];
          $(this).find("[language=not_tran]").text(text).removeClass("green");
        }
      });
      break;
    }
    default:
      break;
  }
  setConfig();
}