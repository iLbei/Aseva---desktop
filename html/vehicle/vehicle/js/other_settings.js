var canvas, ctx;
var circleArr = []; //存放circle
var circleIndex = -1; //记录每个circle下标
var flag = false;
var leftLocal = 0,
  topLocal = 0;
var oldLeft = 0,
  oldTop = 0;
var oldX = 0,
  oldY = 0;
var center = new BIPoint(150, 52);
var scaleA = 1;
var not_config = "",
  dialogConfig = {};
var idNameArr = [];

//获取总线协议文件绑定的通道
function biOnQueriedBusProtocolFileChannel(busFileProtocolID, busChannel) {
  if (busChannel == 0) {
    for (var i = 0; i < idNameArr.length; i++) {
      var arr = idNameArr[i].split("|");
      $('.other_settings').find('#' + arr[0]).text(arr[1]).addClass('red').removeClass('green');
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
    $(signalObj).parent().attr("title", signalID.typeName + ":" + signalID.signalName);
  } else {
    $('.other_settings').find('#' + key)
      .text(signalID.signalName)
      .removeClass('red')
      .addClass('green')
      .parent().attr("title", signalID.typeName + ":" + signalID.signalName);
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
  if ($(obj).hasClass('red')) key += "2";
  var unit = $(obj).attr("unit");
  biSelectSignal(key, originID, signFlag, signVal, flag, scale, "[" + unit + "]");
}

function biOnSelectedSignal(key, valueInfo, signBitInfo, scale) {
  if (valueInfo == null) {
    $(signalObj).removeClass('green');
    $(signalObj).text(not_config);
    $(signalObj).removeAttr("val");
    $(signalObj).parent().removeAttr("title");
  } else if (key == "TargetSignal") {
    var arr = valueInfo.id.split(":");
    $(signalObj).attr("val", valueInfo.id).attr('scale', scale).addClass('green').text(arr[2]);
    $(signalObj).parent().attr("title", arr[1] + ":" + arr[2]);
    if (signBitInfo != null) $(signalObj).attr('signVal', signBitInfo.id);
  }
  setConfig();
}
/**
 * 确认
 */
function setConfig() {
  $('.other_settings').find('[name]').each(function () {
    var name = $(this).attr("name");
    if (!["x", "y"].includes(name)) {
      var type = $(this).attr("type");
      var vv = $(this).val();
      if (type == "checkbox") {
        dialogConfig[name] = $(this).is(":checked") ? "yes" : "no";
      } else if (type == "number") {
        dialogConfig[name] = compareVal(this, vv);
      } else {
        dialogConfig[name] = $(this).val();
      }
    };
  });
  $('.other_settings').find('a').each(function () {
    if (!$(this).hasClass("scale_change")) {
      var id = $(this).attr("id");
      if (Boolean(id) && id != "undefined") {
        var signal = $(this).attr('val') == undefined ? "null" : $(this).attr('val');
        var scaleName = $(this).attr("scaleName");
        dialogConfig[id] = signal;
        if (Boolean(scaleName) && scaleName != "undefined") {
          var scale = $(this).attr('scale');
          dialogConfig[scaleName] = scale;
        }
      }
    }
  });
  var w = Number(dialogConfig.vehicle_width),
    l = Number(dialogConfig.vehicle_length),
    circles = "";
  var text = "<?xml version=\"1.0\" encoding=\"utf-8\"?><root ";
  dialogConfig["arr"] = [];
  for (var i = 1; i < circleArr.length - 1; i++) {
    var v1 = circleArr[i];
    var x = v1.vy / l;
    var y = v1.vx / w;
    if (v1.flag) {
      dialogConfig.contour_control = x;
    } else {
      circles += "<" + v1.position + " x=\"" + x + "\"" + " y=\"" + y + "\"/>";
      dialogConfig["arr"].push({
        "name": v1.position,
        "x": x,
        "y": y
      })
    }
  }
  for (j in dialogConfig) {
    text += j + "=\"" + dialogConfig[j] + "\" ";
  }
  text += circles == "" ? "/>" : ">" + circles + "</root>";
  biSetModuleConfig("vehicle.pluginplatform", text);
  biSetLocalVariable("vehicle", JSON.stringify(dialogConfig));
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
      newArr = [];;
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

function biOnInitEx(config, moduleConfigs) {
  canvas = $('#myCanvas')[0];
  ctx = canvas.getContext('2d');
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
  biSetLocalVariable("vehicle", dialogConfig);
  loadConfig(dialogConfig);
  reset(dialogConfig.vehicle_width, dialogConfig.vehicle_length, arr);
}

function loadConfig(val) {
  if (val == null) return;
  $('.other_settings [name]').each(function () {
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
  $('.other_settings').find('a').each(function () {
    var id = $(this).attr('id');
    var scaleName = $(this).attr('scaleName');
    var sign = $(this).attr('sign');
    if (id != undefined && id.indexOf('scale_') == -1) {
      var signal = val[id];
      if (signal != "null" && signal != null) {
        var arr = signal.split(":");
        if (arr[0].indexOf(".dbc") != -1) {
          biQueryBusProtocolFileChannel(arr[0]);
          idNameArr.push(id + "|" + signal);
        } else {
          $(this).addClass('green').text(arr[2]);
          $(this).parent().attr("title", arr[1] + ":" + arr[2]);
          if (val[scaleName] != "null") $(this).attr("scale", val[scaleName]);
          if (val[sign] != "null") $(this).attr("signVal", val[sign]);
        }
        $(this).attr('val', signal);
      } else {
        $(this).parent().removeAttr('title');
        $(this).removeClass('green').removeAttr("val").removeAttr("signVal");
        if (scaleName != undefined) $(this).attr("scale", "1");
        $(this).text(not_config);
      }
    }
  });
}

function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}
$("[name]").change(function () {
  setConfig();
})
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
    if (!(e.charCode >= 48 && e.charCode <= 57) && !(e.charCode == 45 || e.charCode == 46)) return false;
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
class Circle {
  constructor(vx, vy, color, flag, position) {
    this.vx = vx;
    this.vy = vy;
    this.color = color;
    this.flag = flag;
    this.position = position
  }
}

$('#myCanvas').mousemove(function (e) {
  e = e || window.event;
  var width = Number(dialogConfig.vehicle_width);
  var length = Number(dialogConfig.vehicle_length);
  if (circleArr.length == 0) return;
  for (var i = 1; i < circleArr.length - 1; i++) {
    var c = circleArr[i];
    if (c.color == "red") continue;
    c.color = "rgb(188, 214, 223)";
  }
  for (var i = 1; i < circleArr.length - 1; i++) {
    var c = circleArr[i];
    var x = center.x + c.vx * 100,
      y = center.y + c.vy * 100;
    if (e.offsetX >= (x - 5) && e.offsetX <= (x + 5) && e.offsetY >= (y - 5) && e.offsetY <= (y + 5)) {
      if (c.color == "red") continue;
      c.color = "rgba(188, 214, 223,.5)";
      break;
    }
  }
  if (flag) {
    var c = findByColor();
    if (c == null) return;
    if ($('#scale_change').attr('scale') == 'small') {
      x = oldX + Number(((e.offsetX - leftLocal) / 30).toFixed(2));
      y = oldY + Number(((e.offsetY - topLocal) / 30).toFixed(2));
    } else {
      x = oldX + Number(((e.offsetX - leftLocal) / 100).toFixed(2));
      y = oldY + Number(((e.offsetY - topLocal) / 100).toFixed(2));
    }
    x = x <= 0 ? 0 : x;
    x = x >= width / 2 ? width / 2 : x;
    y = y <= 0 ? 0 : y;
    y = y >= length ? length : y;
    if (c.flag) x = width / 2;
    c.vx = x;
    c.vy = y;
    change(c);
  }
  draw();
}).mouseleave(function () {
  flag = false;
}).mousedown(function (e) {
  e = e || window.event;
  flag = true;
  leftLocal = e.offsetX;
  topLocal = e.offsetY;
  var isFlag = false;
  for (var i = 1; i < circleArr.length - 1; i++) {
    var c = circleArr[i];
    c.color = "rgb(188, 214, 223)";
  }
  for (var i = 1; i < circleArr.length - 1; i++) {
    var c = circleArr[i];
    var x = center.x + c.vx * 100 * scaleA,
      y = center.y + c.vy * 100 * scaleA;
    if (e.offsetX >= (x - 5) && e.offsetX <= (x + 5) && e.offsetY >= (y - 5) && e.offsetY <= (y + 5)) {
      c.color = "red";
      if (c.flag) {
        $('[name=x]').val((c.vx * 2).toFixed(3));
      } else {
        $('[name=x]').val(c.vx.toFixed(3));
      }
      $('[name=y]').val(c.vy.toFixed(3));
      oldTop = y;
      oldLeft = x;
      oldX = c.vx;
      oldY = c.vy;
      isFlag = true;
      change(c);
      $('[language=add_prev]').removeClass("not_a");
      $('[language=add_next]').removeClass("not_a");
      if (c.flag) {
        $('[language=remove]').addClass("not_a");
      } else {
        $('[language=remove]').removeClass("not_a");
      };
      break;
    }
  }
  if (!isFlag) {
    for (var i = 1; i < circleArr.length - 1; i++) {
      var c = circleArr[i];
      c.color = "rgb(188, 214, 223)";
      $('[language=add_prev]').addClass("not_a");
      $('[language=add_next]').addClass("not_a");
      if (!c.flag) $('[language=remove]').addClass("not_a");
    }
  }
  draw();
}).mouseup(function () {
  setConfig();
  flag = false;
});

function createCircle(c) {
  var p = new BIPoint(center.x + c.vx * 100 * scaleA, center.y + c.vy * 100 * scaleA);
  drawCircle(p, 4, c.color, 2, ctx);
  if (c.color != "rgb(188, 214, 223)") {
    var text = "(" + c.vx.toFixed(3) + "," + c.vy.toFixed(3) + ")";
    drawText(ctx, text, new BIPoint(p.x - 65, p.y + 10));
  }
}

function findByColor() {
  var c = null;
  for (var i = 0; i < circleArr.length; i++) {
    var a = circleArr[i];
    if (a.color == "red") {
      c = a;
      break;
    }
  }
  return c;
}

function draw() {
  if ($('[name=output_sample_version]').val() == "3") return;
  init();
  var scale = 100;
  for (var i = 0; i < circleArr.length - 1; i++) {
    var c = circleArr[i];
    var c2 = circleArr[i + 1];
    if (i != 0) createCircle(c);
    if (i == 0) {
      var a1 = new BIPoint(center.x + c.vx * scale, center.y + c.vy * scale);
      var a2 = new BIPoint(center.x + c2.vx * scale * scaleA, center.y + c2.vy * scale * scaleA);
      var a3 = new BIPoint(center.x - c2.vx * scale * scaleA, center.y + c2.vy * scale * scaleA);
      drawLine(a1, a2, 1, "black", ctx);
      drawLine(a1, a3, 1, "black", ctx);
    } else if (i > 0 && i < circleArr.length - 2) {
      var a1 = new BIPoint(center.x + c.vx * scale * scaleA, center.y + c.vy * scale * scaleA);
      var a2 = new BIPoint(center.x + c2.vx * scale * scaleA, center.y + c2.vy * scale * scaleA);
      var a3 = new BIPoint(center.x - c.vx * scale * scaleA, center.y + c.vy * scale * scaleA);
      var a4 = new BIPoint(center.x - c2.vx * scale * scaleA, center.y + c2.vy * scale * scaleA);
      drawLine(a1, a2, 1, "black", ctx);
      drawLine(a3, a4, 1, "black", ctx);
    } else {
      var a1 = new BIPoint(center.x + c2.vx * scale, center.y + c2.vy * scale * scaleA);
      var a2 = new BIPoint(center.x + c.vx * scale * scaleA, center.y + c.vy * scale * scaleA);
      var a3 = new BIPoint(center.x - c.vx * scale * scaleA, center.y + c.vy * scale * scaleA);
      drawLine(a1, a2, 1, "black", ctx);
      drawLine(a1, a3, 1, "black", ctx);
    }
  }
  var n = findByColor();
  if (n != null) {
    if (n.flag) {
      $('[name=x]').val((n.vx * 2).toFixed(3));
    } else {
      $('[name=x]').val(n.vx.toFixed(3));
    }

    $('[name=y]').val(n.vy.toFixed(3));
  }
}

function init() {
  clearCanvas();
  var p1 = new BIPoint(0, 52),
    p2 = new BIPoint(canvas.width, 52),
    p3 = new BIPoint(canvas.width / 2, 0),
    p4 = new BIPoint(canvas.width / 2, canvas.height);
  drawLine(p1, p2, 1, "#e9e9e9", ctx);
  drawLine(p3, p4, 1, "#e9e9e9", ctx);
  var x1 = new BIPoint(canvas.width / 2 + 15 * scaleA, 52 - 5);
  var x2 = new BIPoint(canvas.width / 2 + 20 * scaleA, 52);
  var x3 = new BIPoint(canvas.width / 2 + 15 * scaleA, 52 + 5);
  drawLine(x1, x2, 1, "#e9e9e9", ctx);
  drawLine(x2, x3, 1, "#e9e9e9", ctx);
  var y1 = new BIPoint(canvas.width / 2 - 5, 52 + 15 * scaleA);
  var y2 = new BIPoint(canvas.width / 2, 52 + 20 * scaleA);
  var y3 = new BIPoint(canvas.width / 2 + 5, 52 + 15 * scaleA);
  drawLine(y1, y2, 1, "#e9e9e9", ctx);
  drawLine(y2, y3, 1, "#e9e9e9", ctx);
  ctx.font = "10px Arial";
  ctx.fillText("X", x2.x, x2.y - 5);
  ctx.fillText("Y", y2.x - 15, y2.y + 5);
}

//根据某个值排序
function compare(property) {
  return function (a, b) {
    var value1 = a[property];
    var value2 = b[property];
    return value1 - value2;
  }
}

function change(c) {
  var width = Number(dialogConfig.vehicle_width);
  var length = Number(dialogConfig.vehicle_length);
  if (c.vx == width / 2) $('[name=x]').next().attr("disabled", true).addClass("disabled_background").next().removeAttr('disabled').removeClass("disabled_background");
  if (c.vx == 0) $('[name=x]').next().removeAttr('disabled').removeClass("disabled_background").next().attr('disabled', true).addClass("disabled_background");
  if (c.vx < width / 2 && c.vx > 0) {
    if (!c.flag) $('[name=x]').siblings("input").removeAttr('disabled').removeClass("disabled_background");
  }
  if (c.flag) $('[name=x]').siblings("input").attr('disabled', true).addClass("disabled_background");
  if (c.vy == 0) $('[name=y]').next().removeAttr('disabled').removeClass("disabled_background").next().attr('disabled', true).addClass("disabled_background");
  if (c.vy >= length) $('[name=y]').next().attr('disabled', true).addClass("disabled_background").next().removeAttr('disabled').removeClass("disabled_background");
  if (c.vy < length && c.vy > 0) {
    $('[name=y]').siblings("input").removeAttr('disabled').removeClass("disabled_background");
  }
}

function xAdd(obj) {
  var width = Number($('[name=vehicle_width]').val());
  var x = Number($('[name=x]').val());
  x += 0.001;
  if (x >= width / 2) x = width / 2;
  $('[name=x]').val(x.toFixed(3));
  var c = findByColor();
  c.vx = x;
  change(c);
  draw();
}

function xSubtract(obj) {
  var x = Number($('[name=x]').val());
  x -= 0.001;
  if (x <= 0) x = 0;
  $('[name=x]').val(x.toFixed(3));
  var c = findByColor();
  c.vx = x;
  change(c);
  draw();
}

function yAdd(obj) {
  var length = Number($('[name=vehicle_length]').val());
  var y = Number($('[name=y]').val());
  y += 0.001;
  if (y >= length) y = length;
  $('[name=y]').val(y.toFixed(3));
  var c = findByColor();
  c.vy = y;
  change(c);
  draw();
}

function ySubtract(obj) {
  var y = Number($('[name=y]').val());
  y -= 0.001;
  if (y <= 0) y = 0;
  $('[name=y]').val(y.toFixed(3));
  var c = findByColor();
  c.vy = y;
  change(c);
  draw();
}

//操作画图
function reset(w, len, arr) {
  circleArr = [];
  var width = Number(w); //1.9
  var length = Number(len); //3.6
  var first = new Circle(0, 0, null, false, "contour_before"); //第一个点
  circleArr.push(first);
  for (var i = 0; i < arr.length; i++) {
    if (arr[i].name == "contour_before") {
      var c = new Circle(arr[i].y * width, arr[i].x * length, "rgb(188, 214, 223)", false, "contour_before");
      circleArr.push(c);
    }
  }
  var center = new Circle(width / 2, dialogConfig.contour_control * length, "rgb(188, 214, 223)", true, ""); //中心点
  circleArr.push(center);
  for (var i = 0; i < arr.length; i++) {
    if (arr[i].name == "contour_after") {
      var c = new Circle(arr[i].y * width, arr[i].x * length, "rgb(188, 214, 223)", false, "contour_after");
      circleArr.push(c);
    }
  }
  var last = new Circle(0, length, null, false, "contour_after"); //最后的点
  circleArr.push(last);
  $('[name=x],[name=y]').val("").siblings("input").attr('disabled', true).addClass("disabled_background");
  draw();
}

function reset2() {
  var arr = [];
  var a1 = {
    name: "contour_before",
    x: "0",
    y: "0.5"
  }
  var a2 = {
    name: "contour_after",
    x: "1",
    y: "0.5"
  }
  arr.push(a1);
  arr.push(a2);
  dialogConfig.contour_control = 0.5;
  reset(dialogConfig.vehicle_width, dialogConfig.vehicle_length, arr);
  setConfig();
}

function addPrev(obj) {
  if ($(obj).hasClass('not_a')) return;
  var c = findByColor();
  var index = -1;
  for (var i = 0; i < circleArr.length; i++) {
    var a = circleArr[i];
    if (c.vx == a.vx && c.vy == a.vy) {
      index = i;
      break;
    }
  }
  var prev = circleArr[index - 1];
  var x = c.vx - (c.vx - prev.vx) / 2;
  var y = c.vy - (c.vy - prev.vy) / 2;
  c.color = "rgb(188, 214, 223)";
  var position = "contour_before";
  if (c.position == "contour_after") position = "contour_after";
  var newCircle = new Circle(x, y, "red", false, position);
  circleArr.splice(index, 0, newCircle);
  draw();
  setConfig();
}

function addNext(obj) {
  if ($(obj).hasClass('not_a')) return;
  var c = findByColor();
  var index = -1;
  for (var i = 0; i < circleArr.length; i++) {
    var a = circleArr[i];
    if (c.vx == a.vx && c.vy == a.vy) {
      index = i;
      break;
    }
  }
  var next = circleArr[index + 1];
  var x = c.vx - (c.vx - next.vx) / 2;
  var y = c.vy - (c.vy - next.vy) / 2;
  c.color = "rgb(188, 214, 223)";
  var position = "contour_after";
  if (c.position == "contour_before") position = "contour_before";
  var newCircle = new Circle(x, y, "red", false, position);
  circleArr.splice(index + 1, 0, newCircle);
  draw();
  setConfig();
}

function remove(obj) {
  if ($(obj).hasClass('not_a')) return;
  var c = findByColor();
  var index = -1;
  for (var i = 0; i < circleArr.length; i++) {
    var a = circleArr[i];
    if (c.vx == a.vx && c.vy == a.vy) {
      index = i;
      break;
    }
  }
  if (index != -1) circleArr.splice(index, 1);
  draw();
  setConfig();
  $("[language=add_prev],[language=add_next],[language=remove]").addClass("not_a");
}

$('#myCanvas').click(function (e) {
  e = e || window.event;
  var flag = false;
  for (var i = 0; i < circleArr.length; i++) {
    var c = circleArr[i];
    var x = center.x + c.vx * 100,
      y = center.y + c.vy * 100;
    if (e.offsetX >= (x - 5) && e.offsetX <= (x + 5) && e.offsetY >= (y - 5) && e.offsetY <= (y + 5)) {
      flag = true;
      break;
    }
  }
  var c = findByColor();
  if (!flag && c == null) {
    $('[name=x],[name=y]').val("").next().attr('disabled', true).addClass("disabled_background");
    $('[name=x],[name=y]').val("").next().next().attr('disabled', true).addClass("disabled_background");
  }
});

//车子变大变小
function scaleCanvas(obj) {
  var type = $(obj).attr("scale");
  var lang = biGetLanguage();
  var text = "";
  if (type == "large") {
    text = lang == 1 ? "Scale:Large" : "比例:大范围";
    $(obj).attr("scale", "small");
    scaleA = 0.3;
  } else {
    text = lang == 1 ? "Scale:Small" : "比例:小范围";
    $(obj).attr("scale", "large");
    scaleA = 1;
  }
  $(obj).text(text);
  draw();
}

/**
 * 画文本
 * @param {*} ctx 
 * @param {*} text 
 * @param {*} p 
 */
function drawText(ctx, text, p) {
  ctx.font = "10px Arial";
  ctx.fillText(text, p.x, p.y);
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
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
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