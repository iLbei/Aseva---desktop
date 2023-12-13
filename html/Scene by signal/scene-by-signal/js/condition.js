var boxIndex = 0; //记录box下标
var opt = ["=", "<", ">=", ">", "<=", "!="];
var not_config = "";
var dialogConfig = [];
var condition = "";

//检查文本框的值
function checkTextValue(obj) {
  var str = $(obj).val();
  if (str.indexOf(',') != -1) {
    var flag = false;
    var arr = str.split(","),
      newArr = [];
    for (var i = 0; i < arr.length; i++) {
      if (arr[i] == "") {
        flag = true;
        break;
      }
      var v = Number(arr[i]);
      if (arr[i] != "") {
        if (isNaN(v)) {
          flag = true;
          break;
        }
      }
      newArr.push(v);
    }
    if (flag) {
      $(obj).addClass('red').removeClass('green');
    } else {
      $(obj).addClass('green').attr('value', newArr.join());
    }
  } else {
    var v = Number(str);
    if (!isNaN(v) && str != "") { //green
      $(obj).addClass('green').attr('value', v);
    } else if (str != "") { //red
      $(obj).addClass('red').removeClass('green');
    } else if (str == "" && $(obj).hasClass('bar')) {
      $(obj).attr('value', "");
    }
  }

}

function checkBur(obj) {
  if ($(obj).hasClass('green')) {
    var str = $(obj).val();
    if (str.indexOf(",") != -1) {
      var arr = str.split(','),
        newArr = [];
      for (var i = 0; i < arr.length; i++) {
        var v = Number(arr[i]);
        newArr.push(v);
      }
      $(obj).val(newArr.join()).attr('value', newArr.join());
    } else {
      if (str != "") {
        var v = Number(str);
        $(obj).val(v).attr('value', v);
      } else {
        var v = $(obj).attr('value');
        $(obj).val(v).attr('value', v);
      }
    }
  } else if ($(obj).hasClass('red')) {
    var v = $(obj).attr('value');
    $(obj).val(v).removeClass('red').addClass('green');
  }
}
//校验文本框
$('[name=input]').bind("input propertychange", function () {
  var t = $(this).val();
  if (t.length == 0) {
    $('button').attr('disabled', true).addClass("disabled_background");
  } else {
    $('button').removeAttr('disabled').removeClass("disabled_background");
  }
  checkTextValue($(this));
}).blur(function () {
  checkBur($(this));
});


function changeVal() {
  var val = $('#signal').attr('val');
  var operation = $('[name=operation]').val();
  var input = $('[name=input]').val();
  var value = "";
  if (val != undefined) {
    value = operation + "|" + val + "|" + input;
  }
  dialogConfig[boxIndex][condition] = value;
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
  biSetLocalVariable("scene-by-signal", JSON.stringify(dialogConfig));
  biSetModuleConfig("scene-by-signal.system", text);
}
//关闭siganlCondition
function closeSignalCondition() {
  changeVal();
  biCloseChildDialog();
}

function loadConfig() {
  var box = dialogConfig[boxIndex];
  var value = box[condition];
  if (value != "null" && value != null) {
    var arr = value.split("|");
    $('.signal_condition').find('[name=input]').val(arr[2]);
    $('.signal_condition').find('[name=operation]').val(arr[0]);
    var signalName = arr[1].split(":")[2];
    $('.signal_condition').find('#signal').attr({
      'val': arr[1],
      "title": signalName
    }).text(signalName);
    biQuerySignalInfo("signal", arr[1]);
  }
}

//获取信号信息
function biOnQueriedSignalInfo(key, signalID) {
  if (signalID != null) {
    if (key == "signal") {
      $('.signal_condition').find('#signal').attr('valtype', signalID.typeName + ":" + signalID.signalName).addClass("green");
    } else {
      $('.signal_condition').addClass("red").text($('.signal_condition').attr("val"));
    }
  }
  setConfig();
}

var idName = null; //选择的元素的id名
function selectSignal(obj) {
  var originID = null;
  if ($(obj).text().lastIndexOf('(') == -1) originID = $(obj).attr('val');
  idName = obj;
  var key = "TargetSignal";
  biSelectSignal(key, originID, false, null, false, 1, "[m]");
}

function biOnSelectedSignal(key, valueInfo, signBitInfo, scale) {
  if (valueInfo == null) {
    $(idName).removeClass('green red').text(not_config).removeAttr("val valtype title");
  } else if (valueInfo.typeName == undefined) {
    $(idName).text(valueInfo.id).addClass('red').removeClass('green');
  } else {
    $(idName).text(valueInfo.signalName).attr({
      "val": valueInfo.id,
      "title": valueInfo.signalName,
      "valtype": valueInfo.typeName + ":" + valueInfo.signalName
    }).addClass('green');
    $(idName).parent().parent().parent().find('button').removeAttr('disabled');
  }
  changeVal();
}

function biOnInitEx(config, moduleConfigs) {
  var configs = config.split(",")
  boxIndex = Number(configs[0]);
  condition = configs[1];
  var lang = biGetLanguage() == 1 ? en : cn;
  $('[language]').each(function () {
    var value = $(this).attr('language');
    $(this).text(lang[value])
  });
  not_config = lang["not_config"];
  for (var key in moduleConfigs) {
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(moduleConfigs[key], "text/xml");
    var countrys = xmlDoc.getElementsByTagName('root');
    for (var i = 0; i < countrys[0].childNodes.length; i++) {
      var keyss = countrys[0].childNodes[i].attributes;
      var obj = new Object();
      for (var j = 0; j < keyss.length; j++) {
        obj[keyss[j].nodeName] = keyss[j].nodeValue;
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