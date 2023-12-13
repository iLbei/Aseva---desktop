var vehicle = [];
var scale = 1;
var ipReg = /^(1\d{2}|2[0-4]\d|25[0-5]|[1-9]\d|[0-9])\.((1\d{2}|2[0-4]\d|25[0-5]|[1-9]\d|\d)\.){2}(1\d{2}|2[0-4]\d|25[0-5]|[1-9]\d|\d)$/; //ip正则
$('input[type=number]').on({
  'change': function () {
    if (!["bus_channel", "FrameNumer"].includes($(this).attr('name'))) {
      draw(this, $("[language=scale]").attr("scale") == "small" ? 0.3 : 1);
    }
    $(this).val(compareVal(this, $(this).val()));
    setConfig();
  },
  'blur': function () {
    $(this).val(compareVal(this, $(this).val()));
    if (!["bus_channel", "FrameNumer"].includes($(this).attr('name'))) {
      draw(this, $("[language=scale]").attr("scale") == "small" ? 0.3 : 1);
    }
  },
  'input': function (e) {
    if (e.which == undefined && !["bus_channel", "FrameNumer"].includes($(this).attr('name'))) {
      draw(this, $("[language=scale]").attr("scale") == "small" ? 0.3 : 1);
    }
    setConfig();
  },
  'keypress': function (e) {
    if (e.charCode == 101 || e.charCode == 43) {
      return false;
    }
  }
})
$('input[type=text]').on('input', function () {
  if (ipReg.test($(this).val())) {
    $(this).addClass("green").removeClass("red").attr("value", $(this).val());
  } else {
    $(this).addClass("red").removeClass("green");
  }
  setConfig();
}).blur(function () {
  if ($(this).hasClass("red")) {
    $(this).val($(this).attr("value")).removeClass("red").addClass("green");
  }
})

$('[name]').change(function () {
  setConfig()
})

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
  draw(obj, scale);
}

function draw(obj, scale) {
  if (vehicle.length < 2) return;
  var canvas = $(obj).parents('.container').find(".myCanvas")[0];
  var ctx = canvas.getContext('2d');
  var x = $(obj).parents('.container').find('[name=OriginX]').val();
  var y = $(obj).parents('.container').find('[name=OriginY]').val();
  var yaw = $(obj).parents('.container').find('[name=YawOffset]').val();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  var p1 = new BIPoint(canvas.width / 2, 0);
  var p2 = new BIPoint(canvas.width / 2, canvas.height);
  var p3 = new BIPoint(0, 50);
  var p4 = new BIPoint(canvas.width, 50);
  drawLine(p1, p2, 1, "#e9e9e9", ctx);
  drawLine(p3, p4, 1, "#e9e9e9", ctx);
  var p5 = new BIPoint(canvas.width / 2 - Number(vehicle[0]) * 10 * scale, 50);
  var size = new BIPoint(Number(vehicle[0]) * 20 * scale, Number(vehicle[1]) * 50 * scale);
  drawRect(p5, size, "black", ctx);
  var p6 = new BIPoint(canvas.width / 2, 50);
  var p7 = new BIPoint(canvas.width / 2 - Number(vehicle[0]) * 10 * scale, 50 + Number(vehicle[1]) * 15 * scale);
  var p8 = new BIPoint(canvas.width / 2 + Number(vehicle[0]) * 10 * scale, 50 + Number(vehicle[1]) * 15 * scale);
  var arr = [p6, p7, p8];
  drawPolygon(arr, "black", ctx);
  p8 = new BIPoint(canvas.width / 2 - y * 15 * scale, 50 - (24 + x * 24 / 1.5) * scale);
  var p9 = new BIPoint(canvas.width / 2 - y * 15 * scale, 50 - x * 24 / 1.5 * scale);
  var p10 = new BIPoint(canvas.width / 2 - (15 + y * 15) * scale, 50 - x * 24 / 1.5 * scale);
  p1 = new BIPoint(p8.x - p9.x, p8.y - p9.y);
  p2 = new BIPoint(p9.x - p9.x, p9.y - p9.y);
  p3 = new BIPoint(p10.x - p9.x, p10.y - p9.y);
  ctx.save();
  ctx.translate(p9.x, p9.y);
  ctx.stroke();
  //紫色圆
  ctx.beginPath();
  ctx.moveTo(p3.y * 0.7, p3.x * 0.7)
  ctx.lineTo(p3.y * 0.7, -p3.x * 0.7);
  ctx.moveTo(p3.x * 0.7, p3.y * 0.7)
  ctx.lineTo(-p3.x * 0.7, p3.y * 0.7);
  ctx.strokeStyle = "#A487E1";
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(p2.x, p2.y, Math.abs(p3.x) * 0.7, 0, 2 * Math.PI);
  ctx.rotate(Math.PI / 180 * (0 - yaw));
  ctx.stroke();
  //绿色直角
  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.lineTo(p3.x, p3.y);
  // ctx.save();
  ctx.strokeStyle = "#32cd32";
  ctx.stroke();
  ctx.restore();
}

function drawPolygon(arr, color, ctx) {
  ctx.beginPath();
  ctx.moveTo(arr[0].x, arr[0].y);
  ctx.lineTo(arr[1].x, arr[1].y);
  ctx.lineTo(arr[2].x, arr[2].y);
  ctx.strokeStyle = color;
  ctx.closePath();
  ctx.stroke();
}


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
  var text = "<?xml version=\"1.0\" encoding=\"utf-8\"?><root ";
  $('.container [name]').each(function () {
    var key = $(this).attr('name');
    var type = $(this).attr('type');
    var value = $(this).val();
    if (type == "number" || $(this).is('select')) {
      text += " " + key + "=\"" + value + "\"";
    } else if (type == 'checkbox') {
      text += " " + key + "=\"" + ($(this).is(':checked') ? "yes" : "no") + "\"";
    } else if ($(this).is("a")) {
      text += " " + key + "=\"" + $(this).text() + "\"";
    }else if ( type == "text" ){
      text += " " + key + "=\"" + $(this).attr("value") + "\"";
    }
  });
  text += "/>";
  biSetModuleConfig("delphi-srr4-objects.delphisrr4", text);
}

function drawLine(p1, p2, width, color, ctx) {
  ctx.beginPath();
  ctx.lineWidth = width;
  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.closePath();
  ctx.strokeStyle = color;
  ctx.stroke();
}

function drawRect(p, s, color, ctx) {
  ctx.beginPath();
  ctx.rect(p.x, p.y, s.x, s.y);
  ctx.strokeStyle = color;
  ctx.stroke();
}

function biOnInitEx(config, moduleConfigs) {
  var lang = biGetLanguage() == 1 ? en : cn;
  $('[language]').each(function () {
    var value = $(this).attr('language');
    $(this).html(lang[value]);
  });
  for (var key in moduleConfigs) {
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(moduleConfigs[key], "text/xml");
    var countrys = xmlDoc.getElementsByTagName('root')
    var keys = countrys[0].attributes;
    var obj = new Object();
    for (var n = 0; n < keys.length; n++) {
      obj[keys[n].nodeName] = keys[n].nodeValue;
    }
    loadConfig(obj);
  }
}

function loadConfig(config) {
  biQueryGlobalVariable('Subject.VehicleWidth', '1.6');
  biQueryGlobalVariable('Subject.VehicleHeight', '1.9');
  if (!config) return;
  $(".container [name]").each(function () {
    var name = $(this).attr('name');
    var type = $(this).attr('type');
    var val = config[name];
    if (type == "checkbox") {
      $(this).attr('checked', val == "yes")
    } else if (type == "number") {
      $(this).val(compareVal(this, val))
    } else if ($(this).is("a")) {
      $(this).text(val == "" ? "Delphi SRR4 Device" : val);
    } else if (type == "text") {
      $(this).val(val);
      if (ipReg.test(config[name])) {
        $(this).addClass("green").attr("value", config[name]);
      } else {
        $(this).addClass("red");
      }
    } else {
      $(this).val(val);
    }
  })
}

function biOnQueriedGlobalVariable(id, value) {
  vehicle.push(value);
  draw($(".container").find('input[name=OriginX]')[0], 1);
}