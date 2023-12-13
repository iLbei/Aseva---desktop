var other_settings = "",
  configure_can_output = "",
  not_config = "",
  dialogConfig = {};
$(function () {
  $('[language]').each(function () {
    var value = $(this).attr('language');
    $(this).text(biGetLanguage() == 1 ? en[value] : cn[value])
  });
})

function uuid() {
  var s = [];
  var hexDigits = "0123456789abcdef";
  for (var i = 0; i < 32; i++) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
  }
  s[14] = "4";
  s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
  s[8] = s[13] = s[18] = s[23];
  var uuid = s.join("");
  return uuid;
}

function checkImuChannel() {
  var options = $("[name=imu_channel] option:selected");
  if (options.val() > -1 && options.text().indexOf("(") != -1) {
    $('[language=imu_channel]').addClass('red');
  } else {
    $('[language=imu_channel]').removeClass('red');
  }
}

function openChildDialog(obj) {
  var name = $(obj).attr("class");
  switch (name) {
    case "otherBtn": {
      biOpenChildDialog("vehicle.other_settings.html", other_settings, new BISize(715, 620), "");
      break;
    }
    case "configBtn": {
      biOpenChildDialog("vehicle.can_box.html", configure_can_output, new BISize(504, 245), "")
      break;
    }
  }
}

function biOnClosedChildDialog(htmlName, result) {
  dialogConfig = JSON.parse(biGetLocalVariable("vehicle"));
}
$('[name]').change(function () {
  setData();
  setConfig();
});

$('[type=number]').blur(function () {
  var v = $(this).val();
  $(this).val(compareVal(this, v)).attr('value', v);
  setData();
}).change(function () {
  if (["vehicle_width", "vehicle_length"].includes($(this).attr("name"))) {
    var vehicle_width = $('[name=vehicle_width]').val();
    var vehicle_length = $('[name=vehicle_length]').val();
    biSetGlobalVariable("Subject.VehicleWidth", vehicle_width);
    biSetGlobalVariable("Subject.VehicleLength", vehicle_length);
  }
});

var idNameArr = [];
/**
 *  页面加载时,读取本地配置
 */
function loadConfig(val) {
  if (val == null) return;
  $('.container').find('[name]').each(function () {
    var name = $(this).attr("name");
    var type = $(this).attr("type");
    var value = val[name];
    if (!Boolean(value)) return;
    if (type == "checkbox") {
      $(this).prop("checked", value == "yes");
    } else if (type == "number") {
      $(this).val(compareVal(this, value));
    } else if (type != "number") {
      var t = value == "null" ? "0" : value;
      $(this).val(t);
    }
  });
  $('.container').find('a').each(function () {
    var id = $(this).attr('id');
    var scaleName = $(this).attr('scaleName');
    var sign = $(this).attr('sign');
    if (id != undefined) {
      var signal = val[id];
      if (signal != "null") {
        var arr = signal.split(":");
        if (arr[0].indexOf(".dbc") != -1) {
          biQueryBusProtocolFileChannel(arr[0]);
          idNameArr.push(id + "|" + signal);
        } else {
          $(this).addClass('green').text(arr[2]);
          $(this).attr("title", arr[1] + ":" + arr[2]);
        }
        if (val[scaleName] != "null") $(this).attr("scale", val[scaleName]);
        if (val[sign] != "null") $(this).attr("signVal", val[sign]);
        $(this).attr('val', signal);
      } else {
        $(this).removeAttr('title');
        $(this).removeClass('green').removeAttr("val").removeAttr("signVal");
        if (scaleName != undefined) $(this).attr("scale", "1");
        $(this).text(not_config);
      }
    }
  });
  biQueryChannelNames("1", "gnssimu-sample-v7", 6);
}
var channelArr = ["A", "B", "C", "D", "E", "F"]

function biOnQueriedChannelNames(key, channelNames) {
  var arr = [];
  for (var k in channelNames) {
    arr.push(channelNames[k]);
  }
  $('[name=imu_channel]').children('option').each(function (i) {
    if (i != 0 && arr[i - 1] != "") $(this).text(channelArr[i - 1] + ": " + arr[i - 1]);
  });
  checkImuChannel();
}

//获取总线协议文件绑定的通道
function biOnQueriedBusProtocolFileChannel(busFileProtocolID, busChannel) {
  if (busChannel == 0) {
    for (var i = 0; i < idNameArr.length; i++) {
      var arr = idNameArr[i].split("|");
      $('.container').find('#' + arr[0]).text(arr[1]).addClass('red').removeClass('green');
    }
  } else {
    for (var i = 0; i < idNameArr.length; i++) {
      var arr = idNameArr[i].split("|");
      biQuerySignalInfo(arr[0], arr[1]);
    }
  }
}
//获取信号信息
function biOnQueriedSignalInfo(key, signalID) {
  if (key == "dbc" && signalID != null) {
    $(signalObj).next().text(signalID.typeName + ":" + signalID.signalName);
    $(signalObj).attr("title", signalID.typeName + ":" + signalID.signalName);
  } else {
    $('.container').find('#' + key)
      .text(signalID.signalName)
      .addClass('green').attr("title", signalID.typeName + ":" + signalID.signalName);
  }
}

//正则判断是否是数字
function NumberCheck(num) {
  var re = /^\d*\.{0,1}\d*$/;
  if (num == "") return null;
  return re.exec(num) != null ? num : null;
}
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
      $(obj).addClass('green').attr('value', v).removeClass('red');
    } else if (str != "") { //red
      $(obj).addClass('red').removeClass('green');
    } else if (str == "" && $(obj).hasClass('bar')) {
      $(obj).attr('value', "");
    }
  }
}

$('[type=text]').bind("input propertychange", function () {
  checkTextValue($(this));
  setData();
  setConfig();
}).blur(function () {
  if ($(this).hasClass('green')) {
    var str = $(this).val();
    if (str.indexOf(",") != -1) {
      var arr = str.split(','),
        newArr = [];
      for (var i = 0; i < arr.length; i++) {
        var v = Number(arr[i]);
        newArr.push(v);
      }
      $(this).val(newArr.join()).attr('value', newArr.join());
    } else {
      if (str != "") {
        var v = Number(str);
        $(this).val(v).attr('value', v);
      } else {
        var v = $(this).attr('value');
        $(this).val(v).attr('value', v);
      }
    }
  } else if ($(this).hasClass('red')) {
    var v = $(this).attr('value');
    $(this).val(v).removeClass('red').addClass('green');
  }
});

/**
 * 写配置
 */
function toXml() {
  var text = "<?xml version=\"1.0\" encoding=\"utf-8\"?><root ";
  var circles = "";
  if (dialogConfig["arr"].length > 0) {
    for (var i = 0; i < dialogConfig["arr"].length; i++) {
      var c = dialogConfig["arr"][i];
      circles += "<" + dialogConfig["arr"][i]["name"] + " x=\"" + c.x + "\"" + " y=\"" + c.y + "\"/>";
    }
  }
  for (j in dialogConfig) {
    text += j + "=\"" + dialogConfig[j] + "\" ";
  }
  text += circles == "" ? "/>" : ">" + circles + "</root>";
  return text;
}

function setConfig() {
  biSetModuleConfig("vehicle.pluginplatform", toXml());
}


function setData() {
  $('.container').find('[name]').each(function () {
    var name = $(this).attr('name');
    var type = $(this).attr('type');
    var vv = $(this).val();
    if (type == "checkbox") {
      dialogConfig[name] = $(this).is(":checked") ? "yes" : "no";
    } else if (type == "number") {
      dialogConfig[name] = compareVal(this, vv);
    } else if ($(this).is('select')) {
      dialogConfig[name] = $(this).val();
    } else if (type == "text" && name != "x" && name != "y") {
      dialogConfig[name] = $(this).val();
    }
  });
  $('.container').find('a').each(function () {
    var id = $(this).attr('id');
    var val = $(this).attr('val');
    if (id != undefined) {
      var signal = val == undefined ? "null" : val;
      var scale = $(this).attr('scale');
      var scaleName = $(this).attr('scaleName');
      var sign = $(this).attr('sign');
      var signVal = $(this).attr('signVal');
      if (sign != undefined) dialogConfig[sign] = (signVal == undefined ? "null" : signVal);
      dialogConfig[id] = signal;
      if (scaleName != undefined) dialogConfig[scaleName] = scale;
    }
  });
}

function importAsmc() {
  var filter = {
    ".asmc": "ASEva Module Configuration (*.asmc)"
  };
  biSelectPath("OpenFilePath", BISelectPathType.OpenFile, filter);
}

function exportAsmc() {
  var filter = {
    ".asmc": "ASEva Module Configuration (*.asmc)"
  };
  biSelectPath("CreateFilePath", BISelectPathType.CreateFile, filter);
}

function biOnSelectedPath(key, path) {
  if (path == null) {
    return;
  }
  if (key == "CreateFilePath") {
    var text = "<?xml version=\"1.0\" encoding=\"utf-8\"?><root type=\"vehicle-config-v2\">";
    var base = new Base64();
    text += base.encode(toXml());
    text += "</root>";
    biWriteFileText(path, text);
  } else if (key == "OpenFilePath") {
    biQueryFileText(path);
  }
}

function biOnQueriedFileText(text, path) {
  if (text != null) {
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(text, "text/xml");
    var obj = xmlDoc.getElementsByTagName("root");
    if (obj[0].getAttribute("type") == "vehicle-config-v2") {
      var base = new Base64();
      if (obj[0].firstChild.nodeValue != null) {
        var text = base.decode(obj[0].firstChild.nodeValue);
        xmlDoc = parser.parseFromString(text, "text/xml");
        biSetModuleConfig("vehicle.pluginplatform", text);
        dataPlayBack(xmlDoc);
      }
    }
  }
}

/**
 * 选择信号
 * @param {} obj 当前节点
 */
var signalObj = null; //选择的元素的class名
function selectSignal(obj, flag) {
  if ($(obj).hasClass('not_a')) return;
  var originID = null;
  if ($(obj).text().lastIndexOf('(') == -1) originID = $(obj).attr('val');
  var scale = $(obj).attr('scale');
  scale = Number(scale);
  signalObj = obj;
  var signFlag = $(obj).attr('sign') == undefined ? false : true;
  var signVal = $(obj).attr('signVal') == undefined ? null : $(obj).attr('signVal');
  var key = "TargetSignal";
  var unit = $(obj).attr("unit");
  biSelectSignal(key, originID, signFlag, signVal, flag, scale, "[" + unit + "]");
}

function biOnSelectedSignal(key, valueInfo, signBitInfo, scale) {
  if (valueInfo == null) {
    $(signalObj).removeClass('green');
    $(signalObj).text(not_config);
    $(signalObj).removeAttr("val");
    $(signalObj).removeAttr("title");
    $(signalObj).removeAttr('signVal');
    $(signalObj).attr('scale', "1");
  } else if (valueInfo.typeName == undefined) {
    $(signalObj).addClass('red').removeClass('green').text(valueInfo.id).attr('val', valueInfo.id);
  } else {
    $(signalObj).attr("title", valueInfo.typeName + ":" + valueInfo.signalName);
    $(signalObj).attr("val", valueInfo.id).attr('scale', scale).addClass('green').text(valueInfo.signalName);
    if (signBitInfo != null) $(signalObj).attr('signVal', signBitInfo.id);
  }
  setData();
  setConfig();
}

function biOnInitEx(config, moduleConfigs) {
  if (biGetLanguage() == 1) {
    $('[language]').each(function () {
      var value = $(this).attr('language');
      $(this).text(en[value]);
      other_settings = "Other settings";
      configure_can_output = "Configure CAN output";
      not_config = "<Not configured>";
    });
  } else {
    $('[language]').each(function () {
      var value = $(this).attr('language');
      $(this).text(cn[value]);
      other_settings = "其他配置";
      configure_can_output = "配置CAN报文转发";
      not_config = "<未配置>";
    });
  }
  for (var key in moduleConfigs) {
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(moduleConfigs[key], "text/xml");
    dataPlayBack(xmlDoc);
  }
}

function dataPlayBack(xmlDoc) {
  var countrys = xmlDoc.getElementsByTagName('root');
  var oKeys = countrys[0].attributes;
  for (var i = 0; i < oKeys.length; i++) {
    dialogConfig[oKeys[i].nodeName] = oKeys[i].nodeValue;
  }
  var arr = [];
  for (var i = 0; i < countrys[0].childNodes.length; i++) {
    var keyss = countrys[0].childNodes[i].attributes;
    var obj = new Object();
    obj["name"] = countrys[0].childNodes[i].nodeName;
    for (var j = 0; j < keyss.length; j++) {
      obj[keyss[j].nodeName] = keyss[j].nodeValue;
    }
    arr.push(obj);
  }
  dialogConfig["arr"] = arr;
  loadConfig(dialogConfig);
}

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


function Base64() {

  // private property
  _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

  // public method for encoding
  this.encode = function (input) {
    var output = "";
    var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
    var i = 0;
    input = _utf8_encode(input);
    while (i < input.length) {
      chr1 = input.charCodeAt(i++);
      chr2 = input.charCodeAt(i++);
      chr3 = input.charCodeAt(i++);
      enc1 = chr1 >> 2;
      enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
      enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
      enc4 = chr3 & 63;
      if (isNaN(chr2)) {
        enc3 = enc4 = 64;
      } else if (isNaN(chr3)) {
        enc4 = 64;
      }
      output = output +
        _keyStr.charAt(enc1) + _keyStr.charAt(enc2) +
        _keyStr.charAt(enc3) + _keyStr.charAt(enc4);
    }
    return output;
  }

  // public method for decoding
  this.decode = function (input) {
    var output = "";
    var chr1, chr2, chr3;
    var enc1, enc2, enc3, enc4;
    var i = 0;
    input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
    while (i < input.length) {
      enc1 = _keyStr.indexOf(input.charAt(i++));
      enc2 = _keyStr.indexOf(input.charAt(i++));
      enc3 = _keyStr.indexOf(input.charAt(i++));
      enc4 = _keyStr.indexOf(input.charAt(i++));
      chr1 = (enc1 << 2) | (enc2 >> 4);
      chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
      chr3 = ((enc3 & 3) << 6) | enc4;
      output = output + String.fromCharCode(chr1);
      if (enc3 != 64) {
        output = output + String.fromCharCode(chr2);
      }
      if (enc4 != 64) {
        output = output + String.fromCharCode(chr3);
      }
    }
    output = _utf8_decode(output);
    return output;
  }

  // private method for UTF-8 encoding
  _utf8_encode = function (string) {
    string = string.replace(/\r\n/g, "\n");
    var utftext = "";
    for (var n = 0; n < string.length; n++) {
      var c = string.charCodeAt(n);
      if (c < 128) {
        utftext += String.fromCharCode(c);
      } else if ((c > 127) && (c < 2048)) {
        utftext += String.fromCharCode((c >> 6) | 192);
        utftext += String.fromCharCode((c & 63) | 128);
      } else {
        utftext += String.fromCharCode((c >> 12) | 224);
        utftext += String.fromCharCode(((c >> 6) & 63) | 128);
        utftext += String.fromCharCode((c & 63) | 128);
      }

    }
    return utftext;
  }

  // private method for UTF-8 decoding
  _utf8_decode = function (utftext) {
    var string = "";
    var i = 0;
    var c = c1 = c2 = 0;
    while (i < utftext.length) {
      c = utftext.charCodeAt(i);
      if (c < 128) {
        string += String.fromCharCode(c);
        i++;
      } else if ((c > 191) && (c < 224)) {
        c2 = utftext.charCodeAt(i + 1);
        string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
        i += 2;
      } else {
        c2 = utftext.charCodeAt(i + 1);
        c3 = utftext.charCodeAt(i + 2);
        string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
        i += 3;
      }
    }
    return string;
  }
}