var not_config = "",
  areU = "",
  confirm = "",
  fov_cfg = "",
  dialogConfig = [],
  dialog_index = 0,
  signal_length = 1,
  old_obj_signal = [], //Object signal下原有的配置
  new_obj_signal = []; //存放需要复制的配置
var errorText = [],
  //记录认证时,不通过信息
  validateNum = 0,
  //记录认证信号次数
  dxAndDySignalArray = [], //存放dx_s及dy_s信号信息
  validateCount = 0; //需要认证信号次数
//Signal
class Signal {
  constructor(name, signal, title) {
    this.name = name;
    this.signal = signal;
    this.title = title;
  }
}

function ObjectSignal() {
  this.ed = null,
    this.vl_s = null,
    this.vl_v = "0",
    this.conf_s = null,
    this.conf_l = "1",
    this.id_s = null,
    this.ag_s = null,
    this.dx_s = null,
    this.dx_l = "1",
    this.dy_s = null,
    this.dy_l = "1",
    this.dz_s = null,
    this.dz_l = "1",
    this.dxs_s = null,
    this.dxs_l = "1",
    this.dys_s = null,
    this.dys_l = "1",
    this.dzs_s = null,
    this.dzs_l = "1",
    this.vx_s = null,
    this.vx_l = "1",
    this.vy_s = null,
    this.vy_l = "1",
    this.ax_s = null,
    this.ax_l = "1",
    this.ay_s = null,
    this.ay_l = "1",
    this.hd_s = null,
    this.hd_l = "1",
    this.wi_s = null,
    this.wi_l = "1",
    this.le_s = null,
    this.le_l = "1",
    this.hei_s = null,
    this.hei_l = "1",
    this.cl_s = null,
    this.clc_s = null,
    this.clc_l = "1",
    this.fc = "1",
    this.kof_s = null,
    this.kof_v = "0",
    this.kol_s = null,
    this.kol_v = "0",
    this.kor_s = null,
    this.kor_v = "0",
    this.rcs_s = null,
    this.rcs_l = "1"
}

$('[type=number]').blur(function () {
  $(this).val(compareVal(this, $(this).val()));
});

function checkNumber(obj) {
  var max = Number($(obj).attr('max'));
  var min = Number($(obj).attr('min'));
  var v = Number($(obj).val());
  v = v < min ? min : v;
  v = v > max ? max : v;
  $(obj).val(v).attr('value', v);
}

function selectOneRow(obj) {
  $('.duplicate>.content .table>.body>div').each(function () {
    $(this).children('div:first-of-type').removeClass('blue2');
    $(this).find('input').removeClass('blue1');
  });
  $('.duplicate>.content .table>.top>div:first-of-type').removeClass('all');
  $(obj).addClass('blue2');
  $(obj).next().children().addClass('blue1');
  $(obj).next().next().children().addClass('blue1');
}
//监听键盘del键
$('body').keydown(function (event) {
  var e = event || window.event;
  if (e.keyCode == 46) {
    if ($('.duplicate>.content .table>.top>div:first-of-type').hasClass('all')) {
      var i = 1;
      while (i < $('.duplicate>.content .table>.body>div').length - 1) {
        $('.duplicate>.content .table>.body>div')[i].remove();
        i = 1;
      }
    } else {
      if ($('.blue2').parent().next().text() != undefined) {
        $('.blue2').parent().remove();
      }
    }
  }
});

function wipeBlue(obj) {
  $(obj).parent().parent().children('div:first-of-type').removeClass('blue2');
  $(obj).parent().parent().children('div:nth-of-type(2)').children().removeClass('blue1');
  $(obj).parent().parent().children('div:nth-of-type(3)').children().removeClass('blue1');
}

function selectAll() {
  $('.duplicate>.content .table>.body>div').each(function () {
    $(this).children('div:first-of-type').addClass('blue2');
    $(this).find('input').addClass('blue1');
  });
  $('.duplicate>.content .table>.top>div:first-of-type').addClass('all');
}

function keyPress(obj) {
  if ($(obj).parent().parent().next().length == 0) {
    $tableBox = $('.duplicate .table>.body>div:first-of-type').clone(true);
    $('.duplicate .table>.body').append($tableBox[0]);
  }
}
//判断是不是整数
function isInteger(obj) {
  return obj % 1 === 0
}

//点击认证
function validateDuplicate(obj) {
  validateCount = 0;
  validateNum = 0;
  table_len = 0;
  dxAndDySignalArray = [];
  new_obj_signal = [];
  var language = biGetLanguage();
  var duplicateList = [];
  //替换文本
  var offset = $('.duplicate').find('[name=msg]').val() == undefined ? "" : $('.duplicate').find('[name=msg]').val();
  errorText = [];
  //第几个obj
  var source = Number($('.duplicate').find('[name=source]').val()) - 1;
  //信号值
  var dx = dialogConfig[dialog_index]["childAttr"]["object"][source]['dx_s'];
  var dy = dialogConfig[dialog_index]["childAttr"]["object"][source]['dy_s'];
  var dxSpingGreenFlag = dialogConfig[dialog_index]["childAttr"]["object"][0]['dx_s'].indexOf(not_config) == -1;
  var dySpingGreenFlag = dialogConfig[dialog_index]["childAttr"]["object"][0]['dy_s'].indexOf(not_config) == -1;
  //没选信号或者dbc删除了
  if (dx == undefined || dy == undefined || !dxSpingGreenFlag || !dySpingGreenFlag || dx == "null" || dy == "null") {
    var text = language == 1 ? "The source object settings are invalid." : "源对象设置无效.";
    $("textarea").val(text);
    return;
  }
  //body
  var body = $(obj).parent().parent().parent().prev().find('.body');
  var len = $(body).children('div').length;
  for (var i = 1; i < len - 1; i++) {
    var idOffsetText = $(body).children('div:eq(' + i + ')').find('[name=input]').val();
    var replaceWithText = $(body).children('div:eq(' + i + ')').find('[name=output]').val();
    if (idOffsetText == "" && replaceWithText == "") {
      var text2 = language == 1 ? "No available duplicate settings." : "没有可用的重复设置";
      errorText.push(text2);
    } else {
      var idOffset = Number(idOffsetText);
      //第一个
      if (duplicateList.length == 0) {
        //第一个id不是数字，不是0,不是小数
        if (isNaN(idOffsetText) && idOffsetText != "0" || idOffsetText == "" || !isInteger(!idOffsetText)) {
          var text = language == 1 ? "Row " + (i - 1) + ": Invalid id offset." : "行 " + (i - 1) + ": 无效 id offset";
          errorText.push(text);
          var text2 = language == 1 ? "No available duplicate settings." : "没有可用的重复设置";
          errorText.push(text2);
          break;
        }
        //第一个id为0
        if (idOffsetText == "0") {
          if (replaceWithText == "" || offset == "") {
            var text = language == 1 ? "Row " + (i - 1) + ": ID offset is 0 and no replacement." : "行 " + (i - 1) + ": ID offset 是 0 和 没有更换.";
            errorText.push(text);
            var text2 = language == 1 ? "No available duplicate settings." : "没有可用的重复设置";
            errorText.push(text2);
            break;
          }
        }
      } else {
        if (isNaN(idOffsetText) && idOffsetText != "0" || idOffsetText == "" || !isInteger(!idOffsetText)) {
          var text = language == 1 ? "Row " + (i - 1) + ": Invalid id offset." : "行 " + (i - 1) + ": 无效 id offset";
          errorText.push(text);
          break;
        }
        if (idOffsetText == "0") {
          if (replaceWithText == "" || offset == "") {
            var text = language == 1 ? "Row " + (i - 1) + ": ID offset is 0 and no replacement." : "行 " + (i - 1) + ": ID offset 是 0 和 没有更换.";
            errorText.push(text);
            break;
          }
        }
      }
      duplicateList.push({
        idOffset: idOffset,
        replaceWithText: replaceWithText,
      });
    };
  }
  if (errorText.length != 0) {
    $(obj).parent().parent().prev().children().val(errorText.join("\n"));

    return;
  }
  //区分是否是报文信号
  var arr1 = dx.split(":");
  var arr2 = dy.split(":");
  //不是报文信号
  if (isNaN(Number(arr1[1])) || isNaN(Number(arr2[1]))) {
    var text = language == 1 ? "Validation OK." : "验证OK.";
    $(obj).parent().parent().prev().children().val(text);
    $(".duplicate").find('[language=duplicate]').removeAttr("disabled").removeClass("disabled_background disabled_button");
    // return;
  }
  //认证校验
  //获取复制obj
  var object_config = dialogConfig[dialog_index]["childAttr"].object[source];
  table_len = duplicateList.length;
  for (var item in duplicateList) {
    for (var s in object_config) {
      var v = object_config[s];
      if (v != null && v.indexOf(".dbc") != -1) validateCount++;
    }
    var id = duplicateList[item].idOffset,
      replaceWithText = duplicateList[item].replaceWithText;
    var c = duplicate(object_config, offset, id, replaceWithText, item);
    new_obj_signal.push(c);
    var dxAndDy = {
      "dx_s": null,
      "dy_s": null
    };
    dxAndDySignalArray.push(dxAndDy);
  }
}

function duplicate(objectSignal, replaceText, idOffset, replaceWithText, item) {
  var c = new ObjectSignal();
  c.ed = replaceMessage(objectSignal.ed, idOffset, "ed", item);
  c.vl_s = replaceSignal(objectSignal.vl_s, null, replaceText, idOffset, replaceWithText, "vl_s");
  c.vl_v = objectSignal.vl_v;
  c.conf_s = replaceSignal(objectSignal.conf_s, null, replaceText, idOffset, replaceWithText, "conf_s");
  c.kof_s = replaceSignal(objectSignal.kof_s, null, replaceText, idOffset, replaceWithText, "kof_s");
  c.kof_v = objectSignal.kof_v;
  c.kol_s = replaceSignal(objectSignal.kol_s, null, replaceText, idOffset, replaceWithText, "kol_s");
  c.kol_v = objectSignal.kol_v;
  c.kor_s = replaceSignal(objectSignal.kor_s, null, replaceText, idOffset, replaceWithText, "kor_s");
  c.kor_v = objectSignal.kor_v;
  c.id_s = replaceSignal(objectSignal.id_s, null, replaceText, idOffset, replaceWithText, "id_s");
  c.ag_s = replaceSignal(objectSignal.ag_s, null, replaceText, idOffset, replaceWithText, "ag_s");
  c.dz_s = replaceSignal(objectSignal.dz_s, null, replaceText, idOffset, replaceWithText, "dz_s");
  c.vx_s = replaceSignal(objectSignal.vx_s, null, replaceText, idOffset, replaceWithText, "vx_s");
  c.vy_s = replaceSignal(objectSignal.vy_s, null, replaceText, idOffset, replaceWithText, "vy_s");
  c.ax_s = replaceSignal(objectSignal.ax_s, null, replaceText, idOffset, replaceWithText, "ax_s");
  c.ay_s = replaceSignal(objectSignal.ay_s, null, replaceText, idOffset, replaceWithText, "ay_s");
  c.hd_s = replaceSignal(objectSignal.hd_s, null, replaceText, idOffset, replaceWithText, "hd_s");
  c.dxs_s = replaceSignal(objectSignal.dxs_s, null, replaceText, idOffset, replaceWithText, "dxs_s");
  c.dys_s = replaceSignal(objectSignal.dys_s, null, replaceText, idOffset, replaceWithText, "dys_s");
  c.dzs_s = replaceSignal(objectSignal.dzs_s, null, replaceText, idOffset, replaceWithText, "dzs_s");
  c.wi_s = replaceSignal(objectSignal.wi_s, null, replaceText, idOffset, replaceWithText, "wi_s");
  c.le_s = replaceSignal(objectSignal.le_s, null, replaceText, idOffset, replaceWithText, "le_s");
  c.hei_s = replaceSignal(objectSignal.hei_s, null, replaceText, idOffset, replaceWithText, "hei_s");
  c.cl_s = replaceSignal(objectSignal.cl_s, null, replaceText, idOffset, replaceWithText, "cl_s");
  c.clc_s = replaceSignal(objectSignal.clc_s, null, replaceText, idOffset, replaceWithText, "clc_s");
  c.dx_s = replaceSignal(objectSignal.dx_s, null, replaceText, idOffset, replaceWithText, "dx_s");
  c.dy_s = replaceSignal(objectSignal.dy_s, null, replaceText, idOffset, replaceWithText, "dy_s");
  c.rcs_s = replaceSignal(objectSignal.rcs_s, null, replaceText, idOffset, replaceWithText, "rcs_s");
  c.rcs_l = objectSignal.rcs_l;
  c.dx_l = objectSignal.dx_l;
  c.dy_l = objectSignal.dy_l;
  c.conf_l = objectSignal.conf_l;
  c.dz_l = objectSignal.dz_l;
  c.vx_l = objectSignal.conf_l;
  c.vy_l = objectSignal.vx_l;
  c.ax_l = objectSignal.ax_l;
  c.ay_l = objectSignal.ay_l;
  c.hd_l = objectSignal.hd_l;
  c.dxs_l = objectSignal.dxs_l;
  c.dys_l = objectSignal.dys_l;
  c.dzs_l = objectSignal.dzs_l;
  c.wi_l = objectSignal.wi_l;
  c.le_l = objectSignal.le_l;
  c.hei_l = objectSignal.hei_l;
  c.hei_l = objectSignal.hei_l;
  c.fc = objectSignal.fc;
  return c;
}

function replaceMessage(messageID, iDOffset, type, item) {
  if (messageID == null) return null;
  var comps = messageID.split(':');
  if (comps.length != 2) return null;
  var id = Number(comps[1]);
  var ret = comps[0] + ":" + (id + iDOffset);
  biQueryBusMessageInfo(ret + ":" + type + ":" + item, ret);
  return null;
}

function biOnQueriedBusMessageInfo(key, busMessageInfo) {
  if (key.indexOf(":") != -1) {
    if (busMessageInfo != null) {
      validateNum++;
      key = key.split(":");
      var item = key[3];
      var type = key[2];
      new_obj_signal[item][type] = busMessageInfo.id;
      c[type] = busMessageInfo.id;
    } else {
      validateNum++;
      var bus = key.substring(0, key.lastIndexOf(":"));
      var text = biGetLanguage() == 1 ? "Can't find message '" + bus + "'." : "找不到报文" + bus + ".";
      errorText.push(text);
      $('.duplicate').find('textarea').val(errorText.join("\n"));
    }
  }
}

function replaceSignal(signalID, signBitSignalID, replaceText, idOffset, replaceWithText, type) {
  if (signalID != null) {
    var comps = signalID.split(':');
    if (comps.length == 3) {
      var id = Number(comps[1]);
      if (!isNaN(id)) {
        if (replaceText.length > 0 && replaceWithText.length > 0) comps[2] = comps[2].replace(replaceText, replaceWithText);
        var signalID2 = comps[0] + ":" + (id + idOffset) + ":" + comps[2];
        biQuerySignalInfo(signalID2 + ":" + type, signalID2);
      }
    }
  }
  if (signBitSignalID != null) {
    var comps = signBitSignalID.split(':');
    if (comps.length == 3) {
      var id = Number(comps[1]);
      if (!isNaN(id)) {
        if (replaceText.length > 0 && replaceWithText.length > 0) comps[2] = comps[2].replace(replaceText, replaceWithText);
        var signBitSignalID2 = comps[0] + ":" + (id + item.IDOffset) + ":" + comps[2];
        biQuerySignalInfo(signBitSignalID2 + ":" + type, signBitSignalID2);
      }
    }
  }
  return null;
}

function SignalConfig() {
  this.scale;
  this.signalID;
  this.signBitSignalID;
}

function arrayMin(nums) {
  var min = 2147483647;
  for (var item in nums) {
    if (min > item) {
      min = item;
    }
  }
  return min;
}

function levenshtein(str1, str2) {
  var char1 = str1.split("");
  var char2 = str2.split("");
  var len1 = char1.length;
  var len2 = char2.length;
  var dif = new Array();
  for (var i = 0; i < len1 + 1; i++) {
    dif[i] = new Array();
    for (var j = 0; j < len2 + 1; j++) {
      dif[i][j] = i + j;
    }
  }
  for (var a = 0; a <= len1; a++) {
    dif[a][0] = a;
  }
  for (var a = 0; a <= len2; a++) {
    dif[0][a] = a;
  }
  var temp;
  for (var i = 1; i <= len1; i++) {
    for (var j = 1; j <= len2; j++) {
      if (char1[i - 1] == char2[j - 1]) {
        temp = 0;
      } else {
        temp = 1;
      }
      dif[i][j] = arrayMin([dif[i - 1][j - 1] + temp, dif[i][j - 1] + 1, dif[i - 1][j] + 1]);
    }
  }
  var similarity = 1 - parseFloat(dif[len1][len2]) / Math.max(len1, len2);
  return similarity;
}

function fuzzyMatch(messageGlobalID, signalName, refNames) {
  if (refNames == null || refNames.length == 0) return null;
  if (refNames.indexOf(signalName) != -1) return messageGlobalID + ":" + signalName;
  var targetName = null;
  var targetSim = 0;
  for (var i = 0; i < refNames.length; i++) {
    var sim = levenshtein(signalName, refNames[i]);
    if (sim > targetSim) {
      targetSim = sim;
      targetName = refNames[i];
    }
  }
  if (targetSim >= 0.6) return messageGlobalID + ":" + targetName;
  else return messageGlobalID + ":" + signalName;
}
//认证成功
//点击复制
function duplicateDuplicate(o) {
  setConfig();
  biCloseChildDialog();
}

function closeDuplicate() {
  biCloseChildDialog();
}

/**
 * 写配置
 */
function compareVal(obj, val) {
  var step = $(obj).attr('step').length > 2 ? $(obj).attr('step').length - 2 : 0,
    v = Number(val),
    newVal = 0;
  if (isNaN(v)) {
    newVal = Number($(obj).attr('value'));
  } else {
    var min = Number($(obj).attr('min')),
      max = Number($(obj).attr('max'));
    v = v < min ? min : v;
    v = v > max ? max : v;
    if (step > 0) {
      newVal = Math.round(Math.abs(v) * Math.pow(10, step)) / Math.pow(10, step);
      if (v < 0) newVal = -newVal;
    } else {
      newVal = Math.floor(v);
    }
  }
  return step > 0 ? newVal.toFixed(step) : newVal;
}

function changeVal() {
  dialogConfig[dialog_index]["childAttr"]["object"] = old_obj_signal.concat(new_obj_signal);
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
  biSetLocalVariable("object_sensor_by_can", JSON.stringify(dialogConfig));
  biSetModuleConfig("object-sensor-by-can.pluginsensor", text);
}

function biOnInitEx(config, moduleConfigs) {
  signal_length = config.split(",")[0];
  dialog_index = Number(config.split(",")[1]);
  if (biGetLanguage() == 1) {
    $('[language]').each(function () {
      var value = $(this).attr('language');
      $(this).text(en[value]);
    });
    not_config = en["not_config"];
    areU = "Are you sure to remove all object settings?";
    confirm = en["confirm"];
    fov_cfg = en["fov_cfg"];
    other_classes = en["other_classes"];
    detail_obj = en["detail_obj"];
    duplicate_object_settings = en["duplicate_object_settings"];
  } else {
    $('[language]').each(function () {
      var value = $(this).attr('language');
      $(this).text(cn[value]);
    });
    not_config = cn["not_config"];
    areU = "确定要删除所有目标物配置吗?";
    confirm = cn["confirm"];
    fov_cfg = cn["fov_cfg"];
    other_classes = cn["other_classes"];
    detail_obj = cn["detail_obj"];
    duplicate_object_settings = cn["duplicate_object_settings"];
  }
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
    old_obj_signal = dialogConfig[dialog_index]["childAttr"]["object"];
  }
}

function loadConfig() {
  $('.duplicate').find('[name=source]').attr('max', signal_length);
}

function biOnQueriedSignalInfo(key, info) {
  if (info != null) {
    var type = key.substring(key.lastIndexOf(":") + 1, key.length);
    var n = validateCount / new_obj_signal.length;
    //倍数
    var s = Math.floor(validateNum / n);
    validateNum++;
    var c = new_obj_signal[s];
    c[type] = info.id;
    //记录dx,dy信号信息
    var signal = new Signal();
    signal.name = info.signalName;
    signal.title = info.typeName + ":" + info.signalName;
    signal.signal = info.id;
    if (type == "dx_s") {
      dxAndDySignalArray[s].dx_s = signal;
      new_obj_signal[s].dx_s = signal;
    } else if (type == "dy_s") {
      dxAndDySignalArray[s].dy_s = signal;
      new_obj_signal[s].dy_s = signal;
    }
    //认证完毕
    if (validateCount == validateNum) {
      //全部认证通过
      if (errorText.length == 0) {
        var text = biGetLanguage() == 1 ? "Validation OK." : "验证OK.";
        $('.duplicate').find('textarea').val(text);
        $(".duplicate").find('[language=duplicate]').removeAttr("disabled");
      }
    }

  } else {
    validateNum++;
    var signal = key.substring(0, key.lastIndexOf(":"));
    var text = biGetLanguage() == 1 ? "Can't find signal '" + signal + "'." : "找不到信号" + signal + ".";
    errorText.push(text);
    $('.duplicate').find('textarea').val(errorText.join("\n"));
  }
}