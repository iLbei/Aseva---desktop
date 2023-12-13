// v2.0.0 更新
// 2023/11/28 v2.1.0 新增车道线通道
var dialogConfig = {};

$('[name]').change(function () {
  changeVal(this);
})

$('input[type=number]').on({
  "change": function () {
    $(this).val(compareVal(this, $(this).val()));
    draw();
  },
  'input': function (e) {
    if (e.which == undefined) {
      var step = $(this).attr("step").length - 2;
      var val = Number($(this).val());
      $(this).val(step > 0 ? val.toFixed(step) : val);
      draw();
    }
    setConfig();
  },
  'keypress': function (e) {
    if (!(e.charCode >= 48 && e.charCode <= 57) && !(e.charCode == 45 || e.charCode == 46)) {
      return false;
    }
  }
})

function changeVal(obj) {
  var key = $(obj).attr('name');
  var type = $(obj).attr('type');
  var val = $(obj).val();
  if (type == "checkbox") {
    dialogConfig[key] = $(obj).is(":checked") ? "1" : "0";
  } else if (type == 'radio' && $(obj).is(":checked") || type != 'radio') {
    dialogConfig[key] = val;
  }
  setConfig();
}
/**
 * 写配置
 */
function setConfig() {
  var text = "<?xml version=\"1.0\" encoding=\"utf-8\"?><root>";
  text += "<config";
  for (let i in dialogConfig) {
    text += " " + i + "=\"" + dialogConfig[i] + "\"";
  }
  text += " /></root>";
  biSetModuleConfig("ibeo-reference.pluginibeo", text);
}
//画图
function draw() {
  var canvas = $('#myCanvas')[0];
  var ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  var p1 = new BIPoint(0, 28),
    p2 = new BIPoint(canvas.width, 28),
    p3 = new BIPoint(canvas.width / 2, 0),
    p4 = new BIPoint(canvas.width / 2, canvas.height),
    p5 = new BIPoint(canvas.width / 2 - 15, 28),
    p6 = new BIPoint(canvas.width / 2, 28),
    p7 = new BIPoint(canvas.width / 2 - 15, 50),
    p8 = new BIPoint(canvas.width / 2 + 15, 50),
    s = new BISize(30, 70);
  drawLine(p1, p2, 1, "#e9e9e9", ctx);
  drawLine(p3, p4, 1, "#e9e9e9", ctx);
  var arr = [p6, p7, p8];
  drawPolygon(arr, "black", ctx);
  drawRect(p5, s, "black", ctx);
  var x = $('[name=offset_x]').val();
  var y = $('[name=offset_y]').val();
  var yaw = $('[name=yaw_angle]').val();
  var xScale = 91 / 6 * x,
    yScale = 15 * y;
  p1 = new BIPoint(canvas.width / 2 - yScale, 28 - xScale - 24);
  p2 = new BIPoint(canvas.width / 2 - yScale, 28 - xScale);
  p3 = new BIPoint(canvas.width / 2 - 15 - yScale, 28 - xScale);
  ctx.save();
  ctx.translate(p2.x, p2.y);
  ctx.rotate(Math.PI / 180 * (0 - yaw));
  p1 = new BIPoint(p1.x - p2.x, p1.y - p2.y);
  p3 = new BIPoint(p3.x - p2.x, p3.y - p2.y);
  p2 = new BIPoint(p2.x - p2.x, p2.y - p2.y);
  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.lineTo(p3.x, p3.y);
  ctx.strokeStyle = "#32cd32";
  ctx.stroke();
  ctx.restore();
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

function biOnInitEx(config, moduleConfigs) {
  var lang = biGetLanguage() == 1 ? en : cn;
  $('[language]').each(function () {
    var value = $(this).attr('language');
    $(this).text(lang[value])
  });
  var parser = new DOMParser();
  var xmlDoc = parser.parseFromString(moduleConfigs["ibeo-reference.pluginibeo"], "text/xml");
  var conf = xmlDoc.getElementsByTagName('config');
  var keys = conf[0].attributes;
  for (var i = 0; i < keys.length; i++) {
    dialogConfig[keys[i].nodeName] = keys[i].nodeValue == "null" ? "" : keys[i].nodeValue;
  }
  loadConfig();
  biQuerySessionList(true);//获取默认数据列表,仅供session界面使用
}
//获取session列表
var SessionExist = [];
function biOnQueriedSessionList(list, filtered) {
  for (var i in list) {
    biQuerySessionPath(list[i]);
  }
}
var sessionList = [];
var split = "";
function biOnQueriedSessionPath(path, session) {
  if (split == "") split = /[a-zA-Z]:/.test(path) ? "\\" : "/";
  var time = new Date(session);
  var obj = {
    path: path,
    time: formatDate(time.getTime())
  }
  sessionList.push(obj);
  var paths = [path + split + "input" + split + "etc" + split + "raw_channel_primary.idc",
  path + split + "input" + split + "etc" + split + "raw_channel_primary.idcx",
  path + split + "input" + split + "etc" + split + "raw_channel_secondary.idc",
  path + split + "input" + split + "etc" + split + "raw_channel_secondary.idcx",
  path + split + "input" + split + "etc" + split + "processed.idc",
  path + split + "input" + split + "etc" + split + "processed_primary",
  path + split + "input" + split + "etc" + split + "processed_secondary",
  path + split + "input" + split + "raw" + split + "ibeo-ref-at-v1.csv",
  path + split + "input" + split + "raw" + split + "ibeo-ref-at-v2.csv",
  path + split + "input" + split + "etc" + split + "ibeo-ref-ptp-v1.csv",
  path + split + "input" + split + "etc" + split + "ibeo-ref-ptp-v2.csv",
  path + split + "input" + split + "raw" + split + "ibeo-ref-gnss-v1.csv",
  path + split + "input" + split + "raw" + split + "ibeo-ref-gnss-v2.csv",
  path + split + "input" + split + "etc" + split + "parsed_objects.idc",
  path + split + "input" + split + "etc" + split + "parsed_objects.idcx",
  path + split + "input" + split + "etc" + split + "index_objects.txt",
  path + split + "input" + split + "etc" + split + "parsed_groundpts.idc",
  path + split + "input" + split + "etc" + split + "index_groundpts.txt",
  path + split + "input" + split + "etc" + split + "parsed_primary.txt",
  path + split + "input" + split + "etc" + split + "parsed_secondary.txt"];
  for (let k in paths) {
    biQueryFileExist(paths[k]);
  }
}
function biOnQueriedFileExist(exist, path) {
  if (exist) {
    SessionExist.push(true);
  } else {
    SessionExist.push(false);
  }
  biSetLocalVariable("ibeo-reference-processing-SessionExist", JSON.stringify(SessionExist));
  biSetLocalVariable("ibeo-reference-processing-sessionList", JSON.stringify(sessionList));
}
function formatDate(d) {
  var date = new Date(d);
  var YY = date.getFullYear() + '-';
  var MM = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
  var DD = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
  var hh = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':';
  var mm = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) + ':';
  var ss = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();
  return YY + MM + DD + " " + hh + mm + ss;
}
/**
 *  页面加载时,读取本地配置
 */
function loadConfig() {
  $('[name]').each(function () {
    var name = $(this).attr('name');
    var type = $(this).attr('type');
    var value = dialogConfig[name];
    if (type == 'checkbox') {
      $(this).attr('checked', value == "1");
    } else if (type == 'radio') {
      if (value == $(this).attr("value")) {
        $(this).prop("checked", true);
      }
    } else if (type == "number") {
      $(this).val(compareVal(this, value));
    } else {
      $(this).val(value);
    }
  });
  draw();
}

function process() {
  biOpenChildDialog("ibeo-reference.processing.html", "IDC Processing Tool", new BISize(752, 648));
}

function compareVal(obj, val) {
  var step = $(obj).attr('step').length > 2 ? $(obj).attr('step').length - 2 : 0,
    v = Number(val);
  if (isNaN(val) || !Boolean(val)) {
    newVal = Number($(obj).attr('value'));
  } else {
    var v = Number(val);
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

function biOnClosedChildDialog(htmlName) {
  if (biGetLocalVariable("ibeo-reference") != "null") {
    dialogConfig = JSON.parse(biGetLocalVariable("ibeo-reference"));
  }
}