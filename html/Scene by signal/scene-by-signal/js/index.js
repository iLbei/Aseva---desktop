var boxIndex = -1; //记录box下标
var opt = ["=", "<", ">=", ">", "<=", "!="];
var not_config = "";
var dialogConfig = [];
var dialogI = 0;
var dialogType = "";
var unknownscene = [];
var busChannelKeyArr = [];
var signal_condition = "";
var edit_scene = "";
var config_property = "";



class Box {
  constructor(name, id, enabled, trigger_condition, end_condition, cancel_condition, begin_offset, end_offset, cancel_timeout, arr) {
    this.name = name;
    this.id = id;
    this.enabled = enabled;
    this.trigger_condition = trigger_condition;
    this.end_condition = end_condition;
    this.cancel_condition = cancel_condition;
    this.begin_offset = begin_offset;
    this.end_offset = end_offset;
    this.cancel_timeout = cancel_timeout;
    this.arr = arr;
  }
}

class Property {
  constructor(key, value) {
    this.key = key;
    this.value = value;
  }
}

$('input[type=number]').on({
  "change": function () {
    $(this).val(compareVal(this, $(this).val())).attr("value", compareVal(this, $(this).val()));
  },
  'input': function (e) {
    if (e.which == undefined) {
      $(this).attr("value", $(this).val());
    } else {
      $(this).attr("value", compareVal(this, $(this).val()))
    }
    changeVal(this);
  },
  'keypress': function (e) {
    if (!(e.charCode >= 48 && e.charCode <= 57) && !(e.charCode == 45 || e.charCode == 46)) {
      return false;
    }
  }
})

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

$('[name=enabled]').click(function () {
  changeVal(this);
});

//添加
function add() {
  $box = $('.container>.content>div:nth-of-type(1)').clone(true);
  $('.container>.content').append($box[0]);
  var name = $box.children('p').text();
  var id = $box.find('.id').text();
  unknownscene.push([]);
  for (var i = 0; i < unknownscene.length; i++) {
    if (unknownscene[i] == undefined) unknownscene[i] = [];
    if (unknownscene[i].length == 0) {
      if (i != 0) id = id + "-" + i;
      unknownscene[i].push(i);
      break;
    }
  }

  $box.find('.id').text(id);
  var box = new Box(name, id, "no", "null", "null", "null", 0, 0, "no", []);
  dialogConfig.push(box);
  setConfig();
}

//删除
function remove(obj) {
  var index = $(obj).parent().parent().parent().index() - 1;
  var id = $(obj).parent().parent().parent().find(".id").text();
  if (id.indexOf("unknown-scene") != -1) {
    if (id == "unknown-scene") {
      unknownscene[0].pop();
    } else {
      id = Number(id.split("unknown-scene-")[1]);
      unknownscene[id].pop();
    }
  }
  $(obj).parent().parent().parent().remove();
  dialogConfig.splice(index, 1);
  setConfig();
}

function loadConfig() {
  for (var i = 0; i < dialogConfig.length; i++) {
    var obj = dialogConfig[i];
    $box = $('.container>.content>.box').clone(true).eq(0);
    $('.container>.content').append($box);
    var name = obj.name;
    var id = obj.id
    $box.children('p').text(name).attr("title", name);
    $box.find('.id').text(id).attr("title", id);
    var enabled = obj.enabled;
    $box.find('[name=enabled]').prop('checked', enabled == "yes");
    if (enabled == "yes") {
      $box.find('[name=enabled]').removeAttr('disabled');
    }
    var trigger_condition = obj.trigger_condition;
    if (trigger_condition != "null") {
      var array = trigger_condition.split("|");
      biQuerySignalInfo(i + "|trigger_condition|" + array[0] + "|" + array[2], array[1]);
      $box.find('.trigger_condition').attr("val", array[1]);
    }
    var end_condition = obj.end_condition;
    if (end_condition != "null") {
      var array = end_condition.split("|");
      biQuerySignalInfo(i + "|end_condition|" + array[0] + "|" + array[2], array[1]);
      $box.find('.end_condition').attr("val", array[1]);
    }
    var cancel_condition = obj.cancel_condition;
    if (cancel_condition != "null") {
      var array = cancel_condition.split("|");
      biQuerySignalInfo(i + "|cancel_condition|" + array[0] + "|" + array[2], array[1]);
    }
    var begin_offset = obj.begin_offset;
    $box.find('[name=begin_offset]').val(begin_offset).attr("value", begin_offset);
    var end_offset = obj.end_offset;
    $box.find('[name=end_offset]').val(end_offset).attr("value", end_offset);
    var cancel_timeout = obj.cancel_timeout;
    if (cancel_timeout != "null") {
      $box.find('[name=cancel]').attr('checked', true);
      $box.find('[name=cancel_timeout]').val(cancel_timeout).attr("value", cancel_timeout);
      $box.find('[name=cancel_timeout]').removeAttr('disabled');
      $box.find('[name=cancel_timeout]').next().show();
    }
    var t = "";
    var type = biGetLanguage();
    if (obj.arr.length >= 1) {
      t = type == 1 ? obj.arr.length + " Property Preset" + (obj.arr.length == 1 ? "" : "s") : obj.arr.length + "个属性预设";
    } else {
      t = type == 1 ? "No Property Preset" : "无属性预设";
    }
    $box.find('[language=no_properzty]').text(t);
  }
}
var num = 0;
//获取总线协议文件绑定的通道
function biOnQueriedBusProtocolFileChannel(busFileProtocolID, busChannel) {
  if (busChannel == 0) {
    var s = busChannelKeyArr[num];
    var arr = s.split("|");
    $('.container>.content>div:eq(' + (Number(arr[0]) + 1) + ')').find('.' + arr[1]).text(arr[2]).addClass('red').removeClass('green').next().text(arr[2]);
    $('.container>.content>div:eq(' + (Number(arr[0]) + 1) + ')').find('.' + arr[1]).parent().attr("title", "");
  } else {
    var s = busChannelKeyArr[num];
    var arr = s.split("|");
    $('.container>.content>div:eq(' + (Number(arr[0]) + 1) + ')').find('.' + arr[1]).removeClass('pik');
  }
  num++;
}
//检查trigger
function checkTrigger(obj) {
  var text = $(obj).text();
  if (text.indexOf(not_config) == -1) {
    $(obj).parent().parent().parent().prev().find('[name=enabled]').removeAttr('disabled', true);
    $(obj).parent().parent().parent().prev().find('[language=enabled]').removeClass('pik');
  } else {
    $(obj).parent().parent().parent().prev().find('[name=enabled]').removeAttr('checked').attr('disabled', true);
    $(obj).parent().parent().parent().prev().find('[language=enabled]').addClass('pik');
  }
}
//检查end
function checkEnd(obj) {
  var text = $(obj).text();
  if (text.indexOf(not_config) == -1) {
    $(obj).parent().parent().parent().next().find('[name=cancel]').removeAttr('disabled');
    $(obj).parent().parent().parent().next().find('[language=cancel_timeout]').removeClass('pik');
    $(obj).parent().parent().next().find('.cancel_condition').removeClass('pik');
  } else {
    $(obj).parent().parent().parent().next().find('[name=cancel]').attr('disabled', true).attr('checked', false);
    $(obj).parent().parent().parent().next().find('[language=cancel_timeout]').addClass('pik');
    $(obj).parent().parent().next().find('.cancel_condition').addClass('pik');

  }
  cancelChange($(obj).parent().parent().parent().next().find('[name=cancel]'));
}
//检查cancel
function cancelChange(obj) {
  var i = $(obj).parents(".box").index() - 1;
  if (!$(obj).is(":checked")) {
    $(obj).parent().next().attr('disabled', true).addClass("disabled_background").val(10);
    dialogConfig[i]["cancel_timeout"] = "null";
  } else {
    $(obj).parent().next().removeAttr('disabled').removeClass("disabled_background");
    dialogConfig[i]["cancel_timeout"] = 10;
  }
  setConfig();
}
//获取信号信息
function biOnQueriedSignalInfo(key, signalID) {
  var arr = key.split("|");
  if (signalID != null) {
    if (key == "signal") {
      $('.signal_condition').find('#signal').attr('valtype', signalID.typeID + ":" + signalID.signalName);
    } else {
      var tt = signalID.typeID + ":" + signalID.signalName + " " + opt[Number(arr[2])] + " " + arr[3];
      $('.container>.content>div:eq(' + (Number(arr[0]) + 1) + ')').find('.' + arr[1]).attr({
        "val": signalID.id,
        "title": tt
      }).text(tt).addClass('green');
    }
  } else {
    $('.container>.content>div:eq(' + (Number(arr[0]) + 1) + ')').find('#signal').addClass('red');
  }
  checkTrigger($('.container>.content>div:eq(' + (Number(arr[0]) + 1) + ')').find('.' + arr[1]));
  checkEnd($('.container>.content>div:eq(' + (Number(arr[0]) + 1) + ')').find('.' + arr[1]));
}

function changeVal(obj) {
  var i = $(obj).parents(".box").index() - 1;
  var name = $(obj).attr("name");
  var val = $(obj).val();
  if ($(obj).is("a")) {
    dialogConfig[i][name] = $(obj).text().indexOf(not_config) == -1 ? $(obj).text() : "null";
  } else if ($(obj).attr("type") == "checkbox") {
    dialogConfig[i][name] = $(obj).is(":checked") ? "yes" : "no";
  } else if (name == "cancel" || name == "cancel_timeout") {
    if (name == "cancel" && !$(this).is(":checked")) {
      dialogConfig[i]["cancel_timeout"] = "null"
    } else if (name == "cancel_timeout") {
      dialogConfig[i][name] = $(obj).parents(".box").find("[name=cancel_timeout]").val();
    }
  } else {
    dialogConfig[i][name] = val;
  }

  setConfig();
}

/**
 * 写配置
 */
function setConfig() {
  var text = "<?xml version=\"1.0\" encoding=\"utf-8\"?><root>";
  for (var i in dialogConfig) {
    text += "<s "
    for (var j in dialogConfig[i]) {
      if (j != "arr") {
        text += j + "=\"" + dialogConfig[i][j] + "\" ";
      }
    }
    if (dialogConfig[i]["arr"].length > 0) {
      text += ">";
      for (var j in dialogConfig[i]["arr"]) {
        text += "<property key=\"" + dialogConfig[i]["arr"][j].key + "\" value=\"" + dialogConfig[i]["arr"][j].value + "\" />";
      }
      text += "</s>";

    } else {
      text += "/>";
    }
  }
  text += "</root>";
  biSetModuleConfig("scene-by-signal.system", text);
}

function biOnInitEx(config, moduleConfigs) {
  var lang = biGetLanguage() == 1 ? en : cn;
  $('[language]').each(function () {
    var value = $(this).attr('language');
    $(this).text(lang[value])
  });
  not_config = lang["not_config"];
  signal_condition = lang["signal_condition"];
  edit_scene = lang["edit_scene"];
  config_property = lang["config_property"];

  for (var key in moduleConfigs) {
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(moduleConfigs[key], "text/xml");
    var countrys = xmlDoc.getElementsByTagName('root');
    for (var i = 0; i < countrys[0].childNodes.length; i++) {
      var keyss = countrys[0].childNodes[i].attributes;
      var obj = {};
      unknownscene.push([]);
      for (var j = 0; j < keyss.length; j++) {
        obj[keyss[j].nodeName] = keyss[j].nodeValue;
        if (keyss[j].nodeName == "id" && keyss[j].nodeValue.indexOf("unknown-scene") != -1) {
          if (keyss[j].nodeValue == "unknown-scene") {
            unknownscene[0].push(0);
          } else {
            var index = Number(keyss[j].nodeValue.split("unknown-scene-")[1]);
            if (!Boolean(unknownscene[index])) unknownscene[index] = [];
            unknownscene[index].push(index);
          }
        }
      }
      var array = [];
      for (var j = 0; j < countrys[0].childNodes[i].childNodes.length; j++) {
        var keysss = countrys[0].childNodes[i].childNodes[j].attributes;
        var object = new Object();
        for (var k = 0; k < keysss.length; k++) {
          object[keysss[k].nodeName] = keysss[k].nodeValue;
        }
        array.push(object);
      }
      obj.arr = array;
      dialogConfig.push(obj);
    }
    loadConfig();
  }
}

function openDialog(name, config) {
  if (String(config).indexOf(",") != -1) {
    var val = config.split(",");
    dialogI = Number(val[0]);
    dialogType = val[1];
  } else {
    dialogI = Number(config);
  }
  switch (name) {
    case "condition": {
      biOpenChildDialog("scene-by-signal.condition.html", signal_condition, new BISize(258, 130), config);
      break;
    }
    case "edit": {
      biOpenChildDialog("scene-by-signal.edit.html", edit_scene, new BISize(246, 120), config);
      break;
    }
    case "config": {
      biOpenChildDialog("scene-by-signal.config.html", config_property, new BISize(426, 269), config);
      break;
    }
  }
}

function biOnClosedChildDialog(htmlName, result) {
  var config = "";
  if (biGetLocalVariable("scene-by-signal") != "" && biGetLocalVariable("scene-by-signal") != "null") {
    var id = dialogConfig[dialogI]["id"];
    if (id.indexOf("unknown-scene") != -1 && htmlName == "scene-by-signal.edit.html") {
      if (id == "unknown-scene") {
        unknownscene[0].pop();
      } else {
        id = Number(id.split("unknown-scene-")[1]);
        unknownscene[id].pop();
      }
    }
    dialogConfig = JSON.parse(biGetLocalVariable("scene-by-signal"));
    config = dialogConfig[dialogI];
  }
  if (config == "") return;
  switch (htmlName) {
    case "scene-by-signal.condition.html": {
      var val = config[dialogType];
      if (val == "") {
        $('.container>.content>div:eq(' + (dialogI + 1) + ')').find('.' + dialogType + '').text(not_config).removeClass("green").addClass("red");
      } else {
        var arr = val.split("|");
        var signal = arr[1].split(":");
        var tt = signal[1] + ":" + signal[2] + " " + opt[arr[0]] + " " + arr[2];
        $('.container>.content>div:eq(' + (dialogI + 1) + ')').find('.' + dialogType + '').attr({
          "val": arr[1],
          "title": tt
        }).text(tt).addClass('green').removeClass("red");
      }
      if (dialogType == "trigger_condition") {
        checkTrigger($('.container>.content>div:eq(' + (dialogI + 1) + ')').find('.' + dialogType));
      } else if (dialogType == "end_condition") {
        checkEnd($('.container>.content>div:eq(' + (dialogI + 1) + ')').find('.' + dialogType));
      }
      break;
    }
    case "scene-by-signal.edit.html": {
      $('.container>.content>div:eq(' + (dialogI + 1) + ')').find('.id').text(config["id"]).attr("title", config["id"]);
      $('.container>.content>div:eq(' + (dialogI + 1) + ')>p').text(config["name"]).attr("title", config["name"]);
      if (config["id"].indexOf("unknown-scene") != -1) {
        if (config["id"] == "unknown-scene") {
          unknownscene[0].push(0);
        } else {
          var index = Number(config["id"].split("unknown-scene-")[1]);
          if (!Boolean(unknownscene[index])) unknownscene[index] = [];
          unknownscene[index].push(index);
        }
      }
      break;
    }
    case "scene-by-signal.config.html": {
      var t = "";
      var type = biGetLanguage();
      if (config.arr.length >= 1) {
        t = type == 1 ? config.arr.length + " Property Preset" + (config.arr.length != 1 ? "s" : "") : config.arr.length + "个属性预设";
      } else {
        t = type == 1 ? "No Property Preset" : "无属性预设";
      }
      $('.container>.content>div:eq(' + (dialogI + 1) + ')>div>div:nth-of-type(1)>div:nth-of-type(3)').children('a').text(t)
      break;
    }
  }
  setConfig();
}