// 2023/11/24 v2.1.0 增加时间类型TAI
var not_config = "";
var base = new Base64();

$('button').click(function () {
  if ($(this).attr('name') == undefined) return;
  $(this).addClass('white').siblings().removeClass('white');
  var num = $(this).index();
  $('.container>.content>div:eq(' + num + ')').show().siblings().hide();
  setConfig();
});

var index = -1;
$('.alias').click(function () {
  index = $(this).parent().parent().parent().index();
  $(this).next().show();
  $(this).hide();
  if ($(this).text() == "") return;
  $(this).next().val($(this).text()).select();
});

$('[name=alias]').blur(function () {
  $(this).prev().show();
  $(this).hide();
  if ($(this).val().trim().length == 0) return;
  $(this).prev().text($(this).val());
  setConfig();
});
$("body").keydown(function (e) {
  var i = $(".white").index() + 1;
  if (e.keyCode == 13 && $(".c" + i).find(".alias").attr("style") == "display: none;") {
    $(".c" + i).find("[name=alias]").hide();
    $(".c" + i).find("[name=alias]").prev().show();
    if ($(".c" + i).find("[name=alias]").val().trim().length == 0) return;
    $(".c" + i).find("[name=alias]").prev().text($(".c" + i).find("[name=alias]").val());
  }
})

function draw(x, y, scale, obj, w, l) {
  var width = 15 * w,
    length = 15.2 * l;
  var canvas = $(obj)[0];
  var ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  var p1 = new BIPoint(canvas.width / 2, 0);
  var p2 = new BIPoint(canvas.width / 2, canvas.height);
  var p3 = new BIPoint(0, 42);
  var p4 = new BIPoint(canvas.width, 42);
  drawLine(p1, p2, 1, "#e9e9e9", ctx);
  drawLine(p3, p4, 1, "#e9e9e9", ctx);
  var size = new BISize(width * scale, length * scale);
  var p5 = new BIPoint(canvas.width / 2 - width / 2 * scale, 42);
  drawRect(p5, size, "black", ctx);
  var p6 = new BIPoint(canvas.width / 2, 42);
  var p7 = new BIPoint(canvas.width / 2 - width / 2 * scale, 42 + length / 4 * scale);
  var p8 = new BIPoint(canvas.width / 2 + width / 2 * scale, 42 + length / 4 * scale);
  var arr = [p6, p7, p8];
  drawPolygon(arr, "black", ctx);
  p8 = new BIPoint(canvas.width / 2 - y * 15 * scale, 42 - (24 + x * 24 / 1.5) * scale);
  var p9 = new BIPoint(canvas.width / 2 - y * 15 * scale, 42 - x * 24 / 1.5 * scale);
  var p10 = new BIPoint(canvas.width / 2 - (15 + y * 15) * scale, 42 - x * 24 / 1.5 * scale);
  ctx.beginPath();
  ctx.moveTo(p8.x, p8.y);
  ctx.lineTo(p9.x, p9.y);
  ctx.lineTo(p10.x, p10.y);
  ctx.strokeStyle = "#32cd32";
  ctx.stroke();
  ctx.restore();
}
//车子变大变小
function scaleCanvas(obj) {
  var type = $(obj).attr("scale");
  var lang = biGetLanguage();
  var text = "";
  var scale = 0;
  if (type == "large") {
    text = lang == 1 ? "Scale: Large" : "比例: 大范围";
    $(obj).attr("scale", "small");
    scale = 0.3;
  } else {
    text = lang == 1 ? "Scale: Small" : "比例: 小范围";
    $(obj).attr("scale", "large");
    scale = 1;
  }
  $(obj).text(text);
  var x = Number($(obj).parent().prev().find('[name=antenna_x]').val());
  var y = Number($(obj).parent().prev().find('[name=antenna_y]').val());
  draw(x, y, scale, $(obj).prev(), subject_width, subject_length);
}

function changeAntenna(obj) {
  var x = Number($(obj).parent().parent().find('[name=antenna_x]').val());
  var y = Number($(obj).parent().parent().find('[name=antenna_y]').val());
  var type = $(obj).parent().parent().find('a').attr("scale");
  var scale = type == "large" ? 0.3 : 1;
  draw(x, y, scale, $(obj).parent().parent().next().find('canvas'), subject_width, subject_length);
}
/**
 * 画多边形
 * @param {} arr 点
 * @param {*} color 颜色 
 * @param {*} ctx 上下文
 */
function drawPolygon(arr, color, ctx) {
  ctx.beginPath();
  ctx.moveTo(arr[0].x, arr[0].y);
  ctx.lineTo(arr[1].x, arr[1].y);
  ctx.lineTo(arr[2].x, arr[2].y);
  ctx.strokeStyle = color;
  ctx.closePath();
  ctx.stroke();
}

function getGpsTimeMode(obj) {
  var change = $(obj).find('option:selected').val();
  var i = $(obj).parents(".c").index();
  if (change == "Disabled") {
    $(obj).parent().parent().find('a').addClass('disabled_a');
  } else if (change == "Absolute") {
    $(obj).parent().parent().find('a').each(function () {
      var signalName = $(this).attr("signalName");
      if (signalName == "gps_time_week") {
        $(this).addClass('disabled_a').removeClass("red blue");
      } else {
        $(this).removeClass('disabled_a');
        if ($(this).text().indexOf(not_config) == -1) {
          biQuerySignalInfo(i + "|" + signalName, $(this).attr("val"));
        } else {
          $(this).addClass("red").removeClass("green blue");
        }
      }
    });
  } else if (change == "Posix") {
    $(obj).parent().parent().find('a').each(function () {
      var signalName = $(this).attr("signalName");
      if (signalName == "gps_time_year" || signalName == "gps_time_month") {
        $(this).addClass('disabled_a');
      } else {
        $(this).removeClass('disabled_a');
        if ($(this).text().indexOf(not_config) == -1) {
          biQuerySignalInfo(i + "|" + signalName, $(this).attr("val"));
        } else {
          $(this).removeClass('red green');
        }
      }
    });
  } else if (change == "InDay") {
    $(obj).parent().parent().find('a').each(function () {
      var signalName = $(this).attr("signalName");
      if (signalName == "gps_time_year" || signalName == "gps_time_month" || signalName == "gps_time_day" || signalName == "gps_time_week") {
        $(this).addClass('disabled_a');
      } else {
        $(this).removeClass('disabled_a');
        if ($(this).text().indexOf(not_config) == -1) {
          biQuerySignalInfo(i + "|" + signalName, $(this).attr("val"));
        } else {
          $(this).removeClass('red green');
        }
      }
    });
  }
  setConfig();
}

function displayInput(obj) {
  $(obj).css("display", "none");
  $(obj).next().css("display", "block");
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
      $(obj).addClass('green').attr('value', v);
    } else if (str != "") { //red
      $(obj).addClass('red').removeClass('green');
    } else if (str == "" && $(obj).hasClass('bar')) {
      $(obj).attr('value', "");
    }
  }

}

$('[type=text]').bind("input propertychange", function () {
  if ($(this).attr('name') == "alias") return
  checkTextValue($(this));
  setConfig();
}).blur(function () {
  if ($(this).attr('class') == "alias") return
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
  setConfig();
});

$('input[type=number]').on({
  "change": function () {
    $(this).val(compareVal(this, $(this).val()));
  },
  'input': function (e) {
    if (e.which == undefined) {
      var step = $(this).attr("step").length - 2;
      var val = Number($(this).val());
      $(this).val(step > 0 ? val.toFixed(step) : val);
    }
    setConfig();
  },
  'keypress': function (e) {
    if (!(e.charCode >= 48 && e.charCode <= 57) && !(e.charCode == 45 || e.charCode == 46)) {
      return false;
    }
  }
})

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

$('[name]').change(function () {
  if ($(this).attr("name") != "alias") setConfig();
});

function checkNumber(obj) {
  var step = $(obj).attr('step').length - 2;
  var v = Number($(obj).val());
  var value;
  if (!isNaN(v) && $(obj).val() != "") {
    var min = parseFloat($(obj).attr('min')),
      max = parseFloat($(obj).attr('max'));
    v = v < min ? min : v;
    v = v > max ? max : v;
    if (step <= -1) {
      value = v.toFixed(0);
    } else {
      value = v.toFixed(step);
    }
  } else {
    value = $(obj).attr('value');
  }
  return Number(value);
}

function numberCheck(obj) {
  var min = Number($(obj).attr("min"));
  var max = Number($(obj).attr('max'));
  var value = Number($(obj).val());
  if (value < min) {
    return min;
  } else if (value > max) {
    return max;
  }
  return value;
}

var idNameArr = [];
/**
 *  页面加载时,读取本地配置
 */
function loadConfig(arr) {
  if (arr == null) return;
  $('.container>.content>.c').each(function (i, v) {
    var obj = arr[i];
    $(this).find("[name]").each(function () {
      var name = $(this).attr('name');
      var val = obj[name];
      var type = $(this).attr('type');
      if (!Boolean(val)) return;
      if (type == "checkbox") {
        $(this).prop('checked', val == "yes");
      } else if (type == "number") {
        $(this).val(compareVal(this, val));
      } else if (type == "text") {
        if (val != "null" && name != "alias") {
          $(this).val(val).addClass("green");
        }
      } else if ($(this).is("select")) {
        $(this).val(val);
      }
    });
    $(this).find('a').each(function () {
      var signalName = $(this).attr('signalName');
      var scaleVal = $(this).attr('scaleVal');
      var signVal = $(this).attr('signVal');
      var name = $(this).attr("class");
      if (signalName != undefined) {
        if (obj[signalName] != "null") {
          $(this).attr('val', obj[signalName]);
          if (signalName == "sampling_msg") {
            biQueryBusMessageInfo(i + "|" + signalName, obj[signalName]);
          } else {
            biQuerySignalInfo(i + "|" + signalName, obj[signalName]);
          }
        }
        if (scaleVal != undefined && obj[scaleVal] != "null") {
          $(this).attr('scale', obj[scaleVal]);
        }
        if (signVal != undefined && obj[signVal] != "null") {
          $(this).attr('sign', obj[signVal]);
        }
      } else if (name == "alias") {
        $(this).text(["", "null"].includes(obj[name]) ? "GNSS-IMU Device" : obj[name]);
      }
    });
    getGpsTimeMode($(this).find('[name=gps_time_mode]'));
  });
  //获取本车width,length
  biQueryGlobalVariable("Subject.VehicleWidth", null);
  biQueryGlobalVariable("Subject.VehicleLength", null);
}

var subject_width = -1,
  subject_length = -1;

function biOnQueriedGlobalVariable(id, value) {
  if (id == "Subject.VehicleWidth") subject_width = Number(value);
  if (id == "Subject.VehicleLength") subject_length = Number(value);
  if (subject_length != -1 && subject_width != -1) {
    $('.container>.content>.c').each(function () {
      var x = Number($(this).find('[name=antenna_x]').val());
      var y = Number($(this).find('[name=antenna_y]').val());
      draw(x, y, 1, $(this).find('canvas'), subject_width, subject_length);
    });
  }
}

function biOnQueriedSignalInfo(key, signalInfo) {
  var arr = key.split("|");
  var i = Number(arr[0]) + 1;
  if (signalInfo == null) {
    var val = $('.container>.content>.c' + i + '').find("[signalName=" + arr[1] + "]").attr('val');
    $('.container>.content>.c' + i + '').find("[signalName=" + arr[1] + "]").removeClass('green').addClass("red").text(val);
    $('.container>.content>.c' + i + '').find("[signalName=" + arr[1] + "]").removeAttr("title");
  } else {
    $('.container>.content>.c' + i + '').find("[signalName=" + arr[1] + "]").
      addClass('green').removeClass("red").attr('title', signalInfo.typeName + ":" + signalInfo.signalName).text(signalInfo.signalName);
  }
}

function biOnQueriedBusMessageInfo(key, busMessageInfo) {
  var arr = key.split("|");
  var i = Number(arr[0]) + 1;
  if (busMessageInfo == null) {
    var val = $('.container>.content>.c' + i + '').find("[signalName=" + arr[1] + "]").attr("val")
    $('.container>.content>.c' + i + '').find("[signalName=" + arr[1] + "]").addClass('red').text(val);
  } else {
    $('.container>.content>.c' + i + '').find("[signalName=" + arr[1] + "]").
      addClass('green').
      removeClass('red').text(busMessageInfo.name).attr("title",busMessageInfo.name);
  }
}

/**
 * 写配置
 */

function setConfig() {
  var text = '<?xml version="1.0" encoding="utf-8"?><root>';
  $('.container>.content>.c').each(function (i, v) {
    var className = "c" + (i + 1);
    text += "<" + className;
    $(this).find("[name]").each(function () {
      var name = $(this).attr('name');
      var type = $(this).attr('type');
      if (type == "checkbox") {
        text += " " + name + "=\"" + ($(this).is(":checked") ? "yes" : "no") + "\"";
      } else if (type == "number") {
        text += " " + name + "=\"" + compareVal(this, $(this).val()) + "\"";
      } else if ($(this).is('select')) {
        text += " " + name + "=\"" + $(this).val() + "\"";
      } else if (type == "text") {
        if (name != "alias") {
          text += " " + name + "=\"" + ($(this).val() == "" ? "null" : $(this).val()) + "\"";
        }

      }
    });
    $(this).find('a').each(function () {
      var signalName = $(this).attr('signalName');
      var val = $(this).attr('val') == undefined ? "null" : $(this).attr('val');
      var scale = $(this).attr('scale');
      var scaleVal = $(this).attr('scaleVal');
      var sign = $(this).attr('sign');
      var signVal = $(this).attr('signVal');
      var name = $(this).attr("class");
      if (signalName != undefined) {
        text += " " + signalName + "=\"" + val + "\"";
        if (scaleVal != undefined) {
          text += " " + scaleVal + "=\"" + scale + "\"";
        }
        if (signVal != undefined) {
          text += " " + signVal + "=\"" + (sign == "" ? "null" : sign) + "\"";
        }
      } else if (name == "alias") {
        text += " " + name + "=\"" + $(this).text() + "\"";
      }
    });
    text += "/>";
  });
  text += "</root>";
  biSetModuleConfig("location-by-can.pluginplatform", text);
}

/**
 * 画线-两点一线
 * @param {*} p1 点
 * @param {*} p2 点
 * @param {*} width 线宽度
 * @param {*} color 颜色
 * @param {*} ctx 画图上下文
 */
function drawLine(p1, p2, width, color, ctx) {
  ctx.beginPath();
  ctx.lineWidth = width;
  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.closePath();
  ctx.strokeStyle = color;
  ctx.stroke();
}
/**
 * 画矩形
 * @param {*} p 顶点
 * @param {*} s 大小
 * @param {*} color 颜色
 * @param {*} ctx 画图上下文
 */
function drawRect(p, s, color, ctx) {
  ctx.beginPath();
  ctx.rect(p.x, p.y, s.width, s.height);
  ctx.strokeStyle = color;
  ctx.stroke();
}

/**
 * 画圆
 * @param {*} p 圆心
 * @param {*} radius 半径 
 * @param {*} color 颜色
 * @param {*} width 线宽
 * @param {*} ctx 画图上下文
 */
function drawCircle(p, radius, color, width, ctx) {
  ctx.beginPath();
  ctx.lineWidth = width;
  ctx.strokeStyle = color;
  ctx.arc(p.x, p.y, radius, 0, Math.PI * 2, false);
  ctx.stroke();
}

var createFileHandle = null;
var count = 1;

function importAsmc(obj) {
  count = $(obj).parent().parent().parent().parent().index() + 1;
  var filter = {
    ".asmc": "ASEva Module Configuration (*.asmc)"
  };
  biSelectPath("OpenFilePath", BISelectPathType.OpenFile, filter);
}

function exportAsmc(obj) {
  count = $(obj).parent().parent().parent().parent().index() + 1;
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
    var text = "<?xml version=\"1.0\" encoding=\"utf-8\"?>";
    text += "<root";
    $('.c' + count).find('[name]').each(function () {
      var name = $(this).attr('name');
      var type = $(this).attr('type');
      if (type == "checkbox") {
        text += " " + name + "=\"" + ($(this).get(0).checked ? "yes" : "no") + "\"";
      } else if (type == "number") {
        var v = Number($(this).val());
        var value;
        if (!isNaN(v) && $(this).val() != "") {
          value = compareVal(this, v);
        } else if (![2, 3, 4, 5].includes(name)) {
          value = $(this).attr('value');
        }
        text += " " + name + "=\"" + value + "\"";
      } else if ($(this).is('select')) {
        text += " " + name + "=\"" + $(this).val() + "\"";
      } else if (type == "text" && name != "alias") {
        text += " " + name + "=\"" + ($(this).val() == "" ? "null" : $(this).val()) + "\"";
      }
    });
    $('.c' + count).find('a').each(function () {
      var signalName = $(this).attr('signalName');
      var val = $(this).attr('val') == undefined ? "null" : $(this).attr('val');
      var scale = $(this).attr('scale');
      var scaleVal = $(this).attr('scaleVal');
      var sign = $(this).attr('sign');
      var signVal = $(this).attr('signVal');
      var name = $(this).attr("class");
      if (signalName != undefined) {
        text += " " + signalName + "=\"" + val + "\"";
        if (scaleVal != undefined) {
          text += " " + scaleVal + "=\"" + scale + "\"";
        }
        if (signVal != undefined) {
          text += " " + signVal + "=\"" + (sign == "" ? "null" : sign) + "\"";
        }
      } else if (name == "alias") {
        text += " " + name + "=\"" + $(this).text() + "\"";
      }
    });
    text += " />";
    biWriteFileText(path, "<?xml version=\"1.0\" encoding=\"utf-8\"?>" + "<root type=\"gnssimu-config-v1\">" + base.encode(text) + "</root>");
  } else if (key == "OpenFilePath") {
    biQueryFileText(path);
  }
}

function biOnQueriedFileText(text, path) {
  var parser = new DOMParser();
  var xmlDoc = parser.parseFromString(text, "text/xml");
  var countrys = xmlDoc.getElementsByTagName('root');
  var type = $(countrys).attr('type');
  if (type != "gnssimu-config-v1") {
    var txt = language == 1 ? "The file is not for gnss sensor configuration" : "该文件不是用于惯导传感器配置的";
    var title = language == 1 ? "Error" : "错误";
    biAlert(txt, title);
    return
  }
  var textInfo = base.decode(countrys[0].textContent);
  if (textInfo != "") {
    parser = new DOMParser();
    xmlDoc = parser.parseFromString(textInfo, "text/xml");
    countrys = xmlDoc.getElementsByTagName('root');
    var obj = new Object();
    var oKeys = countrys[0].getAttributeNames();
    for (var i = 0; i < oKeys.length; i++) {
      obj[oKeys[i]] = countrys[0].getAttribute(oKeys[i]);
    }
    $('.c' + count).find("[name]").each(function () {
      var name = $(this).attr('name');
      var type = $(this).attr('type');
      if (type == "checkbox") {
        $(this).prop('checked', obj[name] == "yes");
      } else {
        $(this).val(obj[name] == "" || obj[name] == "null" ? "" : obj[name]);
      }
    });
    $('.c' + count).find('a').each(function () {
      var signalName = $(this).attr('signalName');
      var scaleVal = $(this).attr('scaleVal');
      var signVal = $(this).attr('signVal');
      var name = $(this).attr("class");
      if (signalName != undefined) {
        if (obj[signalName] != "null") {
          $(this).attr('val', obj[signalName]);
          if (signalName == "sampling_msg") {
            biQueryBusMessageInfo(count - 1 + "|" + signalName, obj[signalName]);
          } else {
            biQuerySignalInfo(count - 1 + "|" + signalName, obj[signalName]);
          }
        }
        if (scaleVal != undefined && obj[scaleVal] != "null") {
          $(this).attr('scale', obj[scaleVal]);
        }
        if (signVal != undefined && obj[signVal] != "null") {
          $(this).attr('sign', obj[signVal]);
        }
      } else if (name == "alias") {
        $(this).text(obj[name] == "" ? "GNSS-IMU Device" : obj[name]);
      }
    });

    var scale = $('.c' + count).find('a[language="scale_small"]').attr("scale") == "small" ? 0.3 : 1;
    draw(obj["antenna_x"], obj["antenna_y"], scale, $('.c' + count).find('canvas'), subject_width, subject_length);
    getGpsTimeMode($('.c' + count).find('[name=gps_time_mode]'));
  }
  setConfig();
}

var signalScale = 1;


/**
 * 选择信号
 * @param {} obj
 */
var signalObj;

function selectSignal(obj) {
  if ($(obj).hasClass('disabled_a')) return;
  var originID = null;
  signalObj = obj;
  if ($(obj).text().indexOf("(") == -1) originID = $(obj).attr('val');
  var scale = $(obj).attr('scale');
  var scaleVal = $(obj).attr('scaleVal');
  var sign = $(obj).attr('sign');
  var signVal = $(obj).attr('signVal');
  var withScale = false;
  var withSignBit = false;
  var originScale = 1;
  var originSignBitID = null;
  var unit = $(obj).attr('unit');
  var name = $(obj).parents(".time").find("[name=gps_time_mode]").val();
  if (scaleVal != undefined) {
    withScale = true;
    originScale = Number(scale);
  }
  if (signVal != undefined) {
    withSignBit = true;
    originSignBitID = sign;
  }
  if (name == "Absolute") {
    biSelectSignal(name, originID, withSignBit, originSignBitID, withScale, originScale, "[" + unit + "]");
  } else {
    biSelectSignal("name", originID, withSignBit, originSignBitID, withScale, originScale, "[" + unit + "]");
  }
}

function biOnSelectedSignal(key, valueInfo, signBitInfo, scale) {
  if (valueInfo == null) {
    $(signalObj).
      removeAttr("val").
      removeClass("green").
      removeAttr("title").
      text(not_config);
    if ($(signalObj).attr('scale') != undefined) $(signalObj).attr('scale', 1);
    if ($(signalObj).attr('sign') != undefined) $(signalObj).attr('sign', "");
    if ($(signalObj).attr('signalName').indexOf("time") == -1) $(signalObj).removeClass('red').addClass("blue");
    if (key == "Absolute") { 
      $(signalObj).addClass("red").removeClass("blue"); 
  }else{
    $(signalObj).addClass("blue").removeClass("red");
  }
  } else if (valueInfo.typeName == undefined) {
    $(signalObj).
      removeClass("green").
      addClass("red").
      removeAttr("title").
      text(valueInfo.id);
  } else {
    $(signalObj).
      attr("val", valueInfo.id).
      text(valueInfo.signalName).
      addClass('green').
      attr('scale', scale).
      attr("title", valueInfo.typeName + ":" + valueInfo.signalName);
    if (signBitInfo != null) {
      $(signalObj).attr("sign", signBitInfo.id);
    }
  }
  setConfig();
}
/**
 * 选择报文
 * @param {*} obj 
 */
var busObj;

function selectBus(obj) {
  var originID = null;
  if ($(obj).text().indexOf("(") == -1) originID = $(obj).attr('val');
  busObj = $(obj);
  biSelectBusMessage("", originID);
}

function biOnSelectedBusMessage(key, busMessageInfo) {
  if (busMessageInfo == null) {
    $(busObj).text(not_config).addClass('red').removeClass('green').removeAttr("val title");
  } else {
    $(busObj).text(busMessageInfo.name).addClass('green').removeClass('red');
    $(busObj).attr({'val': busMessageInfo.id,"title":busMessageInfo.name});
  }
  setConfig();
}


function biOnInitEx(config, moduleConfigs) {
  var lang = biGetLanguage() == 1 ? en : cn;
  $('[language]').each(function () {
    var value = $(this).attr('language');
    $(this).text(lang[value]);
    not_config = lang["not_config"];
  });
  for (var key in moduleConfigs) {
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(moduleConfigs[key], "text/xml");
    var countrys = xmlDoc.getElementsByTagName('root');
    var arr = [];
    for (var i = 0; i < countrys[0].childNodes.length; i++) {
      var keyss = countrys[0].childNodes[i].attributes;
      var obj = new Object();
      for (var j = 0; j < keyss.length; j++) {
        obj[keyss[j].nodeName] = keyss[j].nodeValue;
      }
      arr.push(obj);
    }
    loadConfig(arr);
  }
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
    var c = 0,
      c1 = 0,
      c2 = 0;
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