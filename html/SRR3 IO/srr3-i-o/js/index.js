var vehicle = [];
$('[class^=label]').click(function () {
  draw('div.' + $(this).attr('language'));
})
$("input[type = number]").blur(function () {
  $(this).val(compareVal(this,$(this).val()));
})
function draw(obj) {
  if (vehicle.length < 2) return;
  var canvas = $(obj).find('.canvas')[0];
  var ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  var p1 = new BIPoint(canvas.width / 2, 0);
  var p2 = new BIPoint(canvas.width / 2, canvas.height);
  var p3 = new BIPoint(0, 67 + 50);
  var p4 = new BIPoint(canvas.width, 67 + 50);
  drawLine(p1, p2, 1, "#e9e9e9", ctx);
  drawLine(p3, p4, 1, "#e9e9e9", ctx);
  var size = new BISize(Number(vehicle[0]) * 20, Number(vehicle[1]) * 50);
  var p5 = new BIPoint(canvas.width / 2 - Number(vehicle[0]) * 10, 67 + 50);
  drawRect(p5, size, "black", ctx);
  var p6 = new BIPoint(canvas.width / 2, 67 + 50);
  var p7 = new BIPoint(canvas.width / 2 - Number(vehicle[0]) * 10, 67 + Number(vehicle[1]) * 15 + 50);
  var p8 = new BIPoint(canvas.width / 2 + Number(vehicle[0]) * 10, 67 + Number(vehicle[1]) * 15 + 50);
  var arr = [p6, p7, p8];
  drawPolygon(arr, "black", ctx);
  var origin_x = $(obj).find('[name=origin_x]').val();
  var origin_y = $(obj).find('[name=origin_y]').val();
  var xScale = origin_x * 24 / 1.5,
    yScale = 15 * origin_y;
  p1 = new BIPoint(canvas.width / 2 - yScale, 67 - xScale - 24 + 50);
  p2 = new BIPoint(canvas.width / 2 - yScale, 67 - xScale + 50);
  p3 = new BIPoint(canvas.width / 2 - 15 - yScale, 67 - xScale + 50);
  ctx.beginPath();
  ctx.lineWidth = 1;
  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.lineTo(p3.x, p3.y);
  ctx.strokeStyle = "#32cd32";
  ctx.stroke();
  ///////////////////////////////////
  var pos_x = Number($(obj).find('[name=pos_x]').val());
  var pos_y = Number($(obj).find('[name=pos_y]').val());
  var yaw = Number($(obj).find('[name=orient]').val());
  var pScale_x = pos_x * 24 / 1.5,
    pScale_y = pos_y * 15;
  var p = new BIPoint(p6.x - pScale_y, p6.y - pScale_x);
  var num1 = p.y - Math.sin(Math.PI / 180 * 15) * p.x,
    num2 = p.y - Math.sin(Math.PI / 180 * 15) * (canvas.width - p.x);
  p1 = new BIPoint(0, num1);
  p2 = new BIPoint(canvas.width, num2);
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(Math.PI / 180 * (0 - yaw));
  p1 = new BIPoint(p1.x - p.x, num1 - p.y);
  p2 = new BIPoint(p2.x - p.x, num2 - p.y);
  p = new BIPoint(p.x - p.x, p.y - p.y);
  drawArc(p, "#9a79dd", ctx, 10, (2 - 1 / 180 * 15) * Math.PI, (1 + 1 / 180 * 15) * Math.PI);
  drawLine(p1, p, 1, "#9a79dd", ctx);
  drawLine(p2, p, 1, "#9a79dd", ctx);
  ctx.restore();
}
/**
 * 画半圆
 * @param {*} origin 原点
 * @param {*} color 颜色
 * @param {*} ctx 画图上下文
 * @param {*} radius 半径
 */
function drawArc(origin, color, ctx, radius, e, s) {
  ctx.beginPath();
  ctx.lineWidth = 1;
  ctx.strokeStyle = color;
  ctx.arc(origin.x, origin.y, radius, e, s, true);
  ctx.stroke();
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

$('[name]').change(function () {
  setConfig();
});

function xyChange(obj) {
  $(obj).val(compareVal(obj, $(obj).val()));
  draw($(obj).parent().parent().parent().parent().parent().parent());
}
function xyChangeInput(obj) {
  var max = Number($(obj).attr('max'));
  var min = Number($(obj).attr('min'));
  var v = Number($(obj).val());
  if (v < min || v > max) return
  draw($(obj).parent().parent().parent().parent().parent().parent());
}

function lChange(obj) {
  $(obj).val(compareVal(obj, $(obj).val()));
  draw($(obj).parent().parent().parent().parent());
}
function lChangeInput(obj) {
  var max = Number($(obj).attr('max'));
  var min = Number($(obj).attr('min'));
  var v = Number($(obj).val());
  if (v < min || v > max) return
  draw($(obj).parent().parent().parent().parent());
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
  // ctx.closePath();
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
 * 加载配置
 */
function loadConfig(config) {
  if (config == null) return;
  var vals = config["arr"];
  $('.content>div').each(function (i, v) {
    $(this).find('[name]').each(function () {
      var value = $(this).attr('name'),
        type = $(this).attr("type"),
        val = vals[i][value];
      if (type == "checkbox") {
        $(this).attr('checked', val == "yes");
      } else if (type == "number") {
        $(this).val(compareVal(this, val));
      } else {
        $(this).val(val == "null" ? "" : val);
      }
    });
    draw($(this));
  });
  $('[name=output_raw_vel]').attr("checked", config["output_raw_vel"] == "yes");
}

function setConfig() {
  var text = "<?xml version=\"1.0\" encoding=\"utf-8\"?>";
  var m = $('[name=output_raw_vel]').get(0).checked ? "yes" : "no";
  text += "<root output_raw_vel" + "=\"" + m + "\"" + ">";
  $('.content>div').each(function () {
    var clas = $(this).attr("class");
    text += "<" + clas.replace(/_/,"-") + " ";
    $(this).find('[name]').each(function () {
      var key = $(this).attr('name'),
        type = $(this).attr("type");
      if (type == "checkbox") {
        text += " " + key + "=\"" + ($(this).get(0).checked ? "yes" : "no") + "\"";
      } else if (type == "number") {
        text += " " + key + "=\"" + compareVal(this, $(this).val()) + "\"";
      } else {
        text += " " + key + "=\"" + ($(this).val() == "" ? null : $(this).val()) + "\"";
      }
    });
    text += "/>";
  });
  text += "</root>";
  biSetModuleConfig("srr3-i-o.plugindelphiradars", text);
}

function biOnInitEx(config, moduleConfigs) {
  biQueryGlobalVariable('Subject.VehicleWidth', '1.6');
  biQueryGlobalVariable('Subject.VehicleHeight', '1.9');
  $('[language]').each(function () {
    var value = $(this).attr('language');
    $(this).html(biGetLanguage() == 1 ? en[value] : cn[value])
  });
  for (var key in moduleConfigs) {
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(moduleConfigs[key], "text/xml");
    var countrys = xmlDoc.getElementsByTagName('root');
    var o = new Object();
    var arr = [];
    for (var i = 0; i < countrys[0].childNodes.length; i++) {
      var nodeName = countrys[0].childNodes[i].nodeName;
      var conu = xmlDoc.getElementsByTagName(nodeName);
      var keyss = conu[0].attributes;
      var obj = new Object();
      for (var j = 0; j < keyss.length; j++) {
        obj[keyss[j].nodeName] = keyss[j].nodeValue;
      }
      arr.push(obj);
    }
    o["arr"] = arr;
    var g = countrys[0].attributes;
    o["output_raw_vel"] = g[0].nodeValue;
    loadConfig(o);
  }
}
function biOnQueriedGlobalVariable(id, value) {
  vehicle.push(value);
  draw($('.content'));
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
    newVal = Math.round(Math.abs(v) * Math.pow(10, step)) / Math.pow(10, step);
    if (v < 0) newVal = -newVal;
  }
  return newVal.toFixed(step);
}
