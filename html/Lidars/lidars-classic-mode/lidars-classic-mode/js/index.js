var vehicle = [];
$('input[type=number]').on({
  'change': function () {
    $(this).val(compareVal(this, $(this).val()));
    drawPaint(this);
    setConfig();
  },
  'input': function (e) {
    if (e.which == undefined) {
      drawPaint(this);
    }
  },
  'blur': function () {
    if ($(this).val() == '') $(this).val($(this).attr('value'))
    drawPaint(this);
  }
})
$('select').change(function () {
  setConfig()
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
    newVal = Math.round(Math.abs(v) * Math.pow(10, step)) / Math.pow(10, step);
    if (v < 0) newVal = -newVal;
  }
  return newVal.toFixed(step);
}

function biOnInitEx(config, moduleConfigs) {
  biQueryGlobalVariable('Subject.VehicleWidth', '1.6');
  biQueryGlobalVariable('Subject.VehicleHeight', '1.9');
  $('[language]').each(function () {
    var value = $(this).attr('language');
    $(this).html(biGetLanguage() == 1 ? en[value] : cn[value]);
  });
  for (var key in moduleConfigs) {
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(moduleConfigs[key], "text/xml");
    var countrys = xmlDoc.getElementsByTagName('root');
    var o = new Object();
    var arr = [];
    for (var i = 0; i < countrys[0].childNodes.length; i++) {
      var nodeName = countrys[0].childNodes[i].nodeName;
      var coun = xmlDoc.getElementsByTagName(nodeName);
      var keyss = coun[0].attributes;
      var obj = new Object();
      for (var j = 0; j < keyss.length; j++) {
        obj[keyss[j].nodeName] = keyss[j].nodeValue;
      }
      arr.push(obj);
    }
    o["arr"] = arr;
    loadConfig(o);
  }
}
/**
 *  页面加载时,读取本地配置
 */
function loadConfig(config) {
  if (config == null) return;
  var val = config.arr;
  $('.content>div').each(function (i, v) {
    $(this).find('[name]').each(function () {
      var name = $(this).attr("name");
      var type = $(this).attr("type");
      if ($(this).is('select')) {
        $(this).val(val[i][name]);
      }else if (type == "number") {
        $(this).val(compareVal(this, val[i][name]));
      }
    });
  });
}

function setConfig() {
  var text = "<?xml version=\"1.0\" encoding=\"utf-8\"?><root>";
  $('.content>div').each(function () {
    var className = $(this).attr('class');
    text += "<" + className + "";
    $(this).find('[name]').each(function () {
      var name = $(this).attr("name");
      // var type = $(this).attr("type");
      // if ($(this).is('select')) {
      text += " " + name + "=\"" + $(this).val() + "\"";
      // } else if (type == "number") {
      //   text += " " + name + "=\"" + value + "\"";
      // }
    });
    text += "/>"
  });
  text += "</root>";
  biSetModuleConfig("lidars-classic-mode.pluginlidar", text);
}
//画图
function draw(obj, scale) {
  if (vehicle.length < 2) return;
  var canvas = $(obj).find('.canvas')[0];
  var ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  var p1 = new BIPoint(canvas.width / 2, 0);
  var p2 = new BIPoint(canvas.width / 2, canvas.height);
  var p3 = new BIPoint(0, 56);
  var p4 = new BIPoint(canvas.width, 56);
  drawLine(p1, p2, 1, "#e9e9e9", ctx);
  drawLine(p3, p4, 1, "#e9e9e9", ctx);
  var size = new BISize(Number(vehicle[0]) * 20 * scale, Number(vehicle[1]) * 50 * scale);
  var p5 = new BIPoint(canvas.width / 2 - Number(vehicle[0]) * 10 * scale, 56);
  drawRect(p5, size, "black", ctx);
  var p6 = new BIPoint(canvas.width / 2, 56);
  var p7 = new BIPoint(canvas.width / 2 - Number(vehicle[0]) * 10 * scale, 56 + Number(vehicle[1]) * 15 * scale);
  var p8 = new BIPoint(canvas.width / 2 + Number(vehicle[0]) * 10 * scale, 56 + Number(vehicle[1]) * 15 * scale);
  var arr = [p6, p7, p8];
  drawPolygon(arr, "black", ctx);
  var x = Number($(obj).find('[name=offset_x]')[0].value);
  var y = Number($(obj).find('[name=offset_y]')[0].value);
  var yaw = Number($(obj).find('[name=yaw]')[0].value);
  p8 = new BIPoint(canvas.width / 2 - y * 15 * scale, 56 - (24 + x * 24 / 1.5) * scale);
  var p9 = new BIPoint(canvas.width / 2 - y * 15 * scale, 56 - x * 24 / 1.5 * scale);
  var p10 = new BIPoint(canvas.width / 2 - (15 + y * 15) * scale, 56 - x * 24 / 1.5 * scale);
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
//改变事件

function drawPaint(obj) {
  var o = $(obj).parent().parent().parent().parent().parent();
  var scale = $(o).find('.scale_change').attr("scale") == "large" ? 1 : 0.3;
  draw(o, scale);
}
//放大或缩小
function transformation(obj) {
  var type = $(obj).attr("scale");
  var lang = biGetLanguage();
  var text = "";
  var scale = 0;
  if (type == "large") {
    text = lang == 1 ? "Scale: Large" : "比例: 放大";
    $(obj).attr("scale", "small");
    scale = 0.3;
  } else {
    text = lang == 1 ? "Scale: Small" : "比例: 缩小";
    $(obj).attr("scale", "large");
    scale = 1;
  }
  $(obj).html(text);
  draw($(obj).parent().parent(), scale);
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

function biOnQueriedGlobalVariable(id, value) {
  vehicle.push(value);
  $('.content>div').each(function () {
    transformation($(this).find('.scale_change'));
  });
}