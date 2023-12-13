// 2023/12/8 v2.2.0 修改惯导时间类型为时区
var vehicle = [];
$("body").keydown(function (e) {
  if (e.keyCode == 13) {
    $("#displayLabel").show().text($("[name=alias]").val());
    $("[name=alias]").hide();
    setConfig();
  }
})
$("[name=alias]").blur(function () {
  $("#displayLabel").show().text($("[name=alias]").val());
  $("[name=alias]").hide();
  setConfig();
})
$('input[type=number]').on({
  'change': function () {
    $(this).val(compareVal(this, $(this).val()));
    if (["antenna_x", "antenna_y", "orientation_offset"].includes($(this).attr('name'))) draw();
  },
  'blur': function () {
    $(this).val(compareVal(this, $(this).val()));
    if (["antenna_x", "antenna_y", "orientation_offset"].includes($(this).attr('name'))) draw();
  },
  'input': function (e) {
    if (e.which == undefined) draw();
    setConfig();
  }
})

$('[name]').change(function () {
  setConfig();
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

function setConfig() {
  var text = "<?xml version=\"1.0\" encoding=\"utf-8\"?><root";
  $('.container [name]').each(function () {
    var key = $(this).attr('name');
    if ($(this).attr('type') == "checkbox") {
      var val = $(this).get(0).checked == true ? "yes" : "no";
      text += " " + key + "=\"" + val + "\"";
    } else if ($(this).attr('type') == 'radio' && $(this).is(":checked")) {
      text += " " + key + "=\"" + $(this).val() + "\"";
    } else {
      text += " " + key + "=\"" + $(this).val() + "\"";
    }
  });
  text += " />";
  biSetModuleConfig("com--nmea-0183-.pluginnmea", text);
}

function draw() {
  if (vehicle.length < 2) return;
  var canvas = $('#myCanvas')[0];
  var ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  var h = canvas.height / 4
  var p1 = new BIPoint(0, h),
    p2 = new BIPoint(canvas.width, h),
    p3 = new BIPoint(canvas.width / 2, 0),
    p4 = new BIPoint(canvas.width / 2, canvas.height),
    p5 = new BIPoint(canvas.width / 2 - Number(vehicle[0]) * 8, h),
    p6 = new BIPoint(canvas.width / 2, h),
    p7 = new BIPoint(canvas.width / 2 - Number(vehicle[0]) * 8, Number(vehicle[1]) * 15 + 35),
    p8 = new BIPoint(canvas.width / 2 + Number(vehicle[0]) * 8, Number(vehicle[1]) * 15 + 35),
    s = new BISize(Number(vehicle[0]) * 16, Number(vehicle[1]) * 46);
  drawLine(p1, p2, 1, "#e9e9e9", ctx);
  drawLine(p3, p4, 1, "#e9e9e9", ctx);
  drawRect(p5, s, "black", ctx);
  var arr = [p6, p7, p8];
  drawPolygon(arr, "black", ctx);
  var x = Number($('[name=antenna_x]').val());
  var y = Number($('[name=antenna_y]').val());
  var yaw = Number($('[name=orientation_offset]').val());
  p8 = new BIPoint(canvas.width / 2 - y * 15, h - (24 + x * 24 / 1.5));
  var p9 = new BIPoint(canvas.width / 2 - y * 15, h - x * 24 / 1.5);
  var p10 = new BIPoint(canvas.width / 2 - (15 + y * 15), h - x * 24 / 1.5);
  ctx.save();
  ctx.translate(p9.x, p9.y);
  ctx.rotate(Math.PI / 180 * (0 - yaw));
  p1 = new BIPoint(p8.x - p9.x, p8.y - p9.y);
  p2 = new BIPoint(p9.x - p9.x, p9.y - p9.y);
  p3 = new BIPoint(p10.x - p9.x, p10.y - p9.y);
  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.lineTo(p3.x, p3.y);
  ctx.strokeStyle = "#32cd32";
  ctx.stroke();
  ctx.restore();
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

function displayInput() {
  $("#displayLabel").hide();
  $("[name=alias]").show().focus().select();
}

function biOnInitEx(config, moduleConfigs) {
  biQueryGlobalVariable('Subject.VehicleWidth', '1.6');
  biQueryGlobalVariable('Subject.VehicleHeight', '1.9');
  var lang = biGetLanguage() == 1 ? en : cn;
  $('[language]').each(function () {
    var value = $(this).attr('language');
    $(this).html(lang[value]);
  });
  for (var key in moduleConfigs) {
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(moduleConfigs[key], "text/xml");
    var obj = new Object();
    var root = xmlDoc.getElementsByTagName('root');
    var keys = root[0].attributes;
    for (var i = 0; i < keys.length; i++) {
      obj[keys[i].nodeName] = keys[i].nodeValue == "null" ? "" : keys[i].nodeValue;
    }
    loadConfig(obj);
  }
}

function loadConfig(config) {
  if (config == null) return;
  $('[name]').each(function () {
    var type = $(this).attr('type');
    var value = config[$(this).attr('name')];
    if (type == 'checkbox') {
      $(this).prop('checked', value == "yes");
    } else if (type == 'radio') {
      $(this).prop("checked", value == $(this).val());
    } else if (type == 'number') {
      $(this).val(compareVal(this, value))
    } else {
      $(this).val(value);
    }
  });
  $('#displayLabel').html(config['alias']);
}

function biOnQueriedGlobalVariable(id, value) {
  vehicle.push(value);
  draw();
}