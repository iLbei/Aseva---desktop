var newWindow;
var statu = 1;
var xy = 0;
var subject_width = -1,
  subject_length = -1;
$("#primary").click(function () {
  $(".secondary").hide();
  $(".primary").show();
  $(this).addClass("active").siblings("button").removeClass("active");
  xy = 0;
})
$("#secondary").click(function () {
  $(".secondary").show();
  $(".primary").hide();
  $(this).addClass("active").siblings("button").removeClass("active");
  xy = 1;
})
$('.xy').change(function () {
  changeXy(xy);
}).bind('input propertychange', function (e) {
  if (e.which == undefined) changeXy(xy);
  setConfig();
});

$('[name]').change(function () {
  setConfig();
});

$('[type=text]').bind("input propertychange", function () {
  var value = $(this).val();
  if (isValidIP(value)) {
    $(this).addClass('green').attr('value', value);
    setConfig();
  } else {
    $(this).addClass('red').removeClass('green');
  }
}).blur(function () {
  if ($(this).hasClass('red')) $(this).val($(this).attr('value')).removeClass('red').addClass('green');

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

function changeXy(id) {
  var x = Number($('[name=offset_x_' + id + ']').val());
  var y = Number($('[name=offset_y_' + id + ']').val());
  var yaw = Number($('[name=yaw_' + id + ']').val());
  draw(x, y, yaw, subject_width, subject_length);
}

function openChildDialog() {
  biOpenChildDialog("ibeo-system.img_1.html", "ILV configuration guide(1/5)", new BISize(701, 626));
}

function biOnClosedChildDialog(htmlName, result) {
  switch (htmlName) {
    case "ibeo-system.img_1.html": {
      biOpenChildDialog("ibeo-system.img_2.html", "ILV configuration guide(2/5)", new BISize(478, 127));
      break;
    }
    case "ibeo-system.img_2.html": {
      biOpenChildDialog("ibeo-system.img_3.html", "ILV configuration guide(3/5)", new BISize(708, 378));
      break;
    }
    case "ibeo-system.img_3.html": {
      biOpenChildDialog("ibeo-system.img_4.html", "ILV configuration guide(4/5)", new BISize(708, 378));
      break;
    }
    case "ibeo-system.img_4.html": {
      biOpenChildDialog("ibeo-system.img_5.html", "ILV configuration guide(5/5)", new BISize(707, 377));
      break;
    }
  }
}

function draw(x, y, yaw, w, l) {
  var width = 15 * w,
    length = 15.2 * l;
  var canvas = document.getElementById('myCanvas');
  var ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  var p1 = new BIPoint(0, 28),
    p2 = new BIPoint(canvas.width, 28),
    p3 = new BIPoint(canvas.width / 2, 0),
    p4 = new BIPoint(canvas.width / 2, canvas.height),
    p5 = new BIPoint(canvas.width / 2 - width / 2, 28),
    p6 = new BIPoint(canvas.width / 2, 28),
    p7 = new BIPoint(canvas.width / 2 - width / 2, 28 + length / 4),
    p8 = new BIPoint(canvas.width / 2 + width / 2, 28 + length / 4),
    s = new BISize(width, length);
  drawLine(p1, p2, 1, "#e9e9e9", ctx);
  drawLine(p3, p4, 1, "#e9e9e9", ctx);
  var arr = [p6, p7, p8];
  drawPolygon(arr, "black", ctx);
  drawRect(p5, s, "black", ctx);
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

function biOnInitEx(config, moduleConfigs) {
  var lang = biGetLanguage() == 1 ? en : cn;
  $('[language]').each(function () {
    var value = $(this).attr('language');
    $(this).text(lang[value])
  });
  not_config = lang["not_config"];
  for (var key in moduleConfigs) {
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(moduleConfigs[key], "text/xml");
    var obj = {
      "c0": {},
      "c1": {}
    };
    var x0 = xmlDoc.getElementsByTagName('c0')[0].attributes;
    var x1 = xmlDoc.getElementsByTagName('c1')[0].attributes;
    for (var i = 0; i < x0.length; i++) {
      if (x0[i] == "null") {
        obj["c0"][x0[i].nodeName] = "";
      } else {
        obj["c0"][x0[i].nodeName] = x0[i].nodeValue;
      }
    }
    for (var i = 0; i < x1.length; i++) {
      if (x1[i] == "null") {
        obj["c1"][x1[i].nodeName] = "";
      } else {
        obj["c1"][x1[i].nodeName] = x1[i].nodeValue;
      }
    }
    loadConfig(obj);
  }
}

/**
 *  页面加载时,读取本地配置
 */
function loadConfig(val) {
  $('[name]').each(function () {
    var key = $(this).attr('name').toString().substr(0, $(this).attr('name').toString().lastIndexOf("_"));
    var c = $(this).attr('name').toString().substr($(this).attr('name').toString().lastIndexOf("_") + 1);
    var value;
    if (c == "0") {
      value = val["c0"][key];
    } else if (c == "1") {
      value = val["c1"][key];
    }
    var type = $(this).attr('type');
    if (type == 'checkbox') {
      $(this).attr('checked', value == "yes");
    } else if ($(this).attr('type') == 'radio') {
      if (value == $(this).val()) {
        $(this).prop("checked", true);
      }
    } else if (type == "number") {
      $(this).val(compareVal(this, value));
    } else {
      if (value != "null") {
        $(this).val(value);
      }
    }
  });
  //获取本车width,length
  biQueryGlobalVariable("Subject.VehicleWidth", null);
  biQueryGlobalVariable("Subject.VehicleLength", null);
  draw(0, 0, 0, subject_width, subject_length);
}

function biOnQueriedGlobalVariable(id, value) {
  if (id == "Subject.VehicleWidth") subject_width = Number(value);
  if (id == "Subject.VehicleLength") subject_length = Number(value);
  if (subject_length != -1 && subject_width != -1) {
    var x = Number($('[name=offset_x_' + xy + ']').val());
    var y = Number($('[name=offset_y_' + xy + ']').val());
    var yaw = Number($('[name=yaw_' + xy + ']').val());
    draw(x, y, yaw, subject_width, subject_length);
  }
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

function isValidIP(ip) {
  var reg = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/
  return reg.test(ip);
}

function setConfig() {
  var text = "<?xml version=\"1.0\" encoding=\"utf-8\"?><root>";
  var c0 = "<c0";
  var c1 = "<c1";
  $('[name]').each(function () {
    var type = $(this).attr('type');
    var key = $(this).attr('name').toString().substr(0, $(this).attr('name').toString().lastIndexOf("_"));
    if ($(this).attr('name').toString().substr($(this).attr('name').toString().lastIndexOf("_") + 1) == "0") {
      if (type == "checkbox") {
        var val = $(this).is(":checked") ? "yes" : "no";
        c0 += " " + key + "=\"" + val + "\"";
      } else if (type == 'radio' && $(this).is(":checked")) {
        c0 += " " + key + "=\"" + $(this).val() + "\"";
      } else if (type == "number") {
        c0 += " " + key + "=\"" + compareVal(this, $(this).val()) + "\"";
      } else if (type != 'radio') {
        c0 += " " + key + "=\"" + $(this).val() + "\"";
      }
    } else if (($(this).attr('name').toString().substr($(this).attr('name').toString().lastIndexOf("_") + 1) == "1")) {
      if (type == "checkbox") {
        var val = $(this).is(":checked") ? "yes" : "no";
        c1 += " " + key + "=\"" + val + "\"";
      } else if (type == 'radio' && $(this).is(":checked")) {
        c1 += " " + key + "=\"" + $(this).val() + "\"";
      } else if (type == "number") {
        c1 += " " + key + "=\"" + compareVal(this, $(this).val()) + "\"";
      } else if (type != 'radio') {
        c1 += " " + key + "=\"" + $(this).val() + "\"";
      }
    }
  });
  text += c0 + " />" + c1 + " /></root>";
  biSetModuleConfig("ibeo-system.pluginibeo", text);
}