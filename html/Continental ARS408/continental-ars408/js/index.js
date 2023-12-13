var vehicle = [];
$('input[type=number]').on({
  'change': function () {
    change(this);
  },
  'input': function (e) {
    e.which == undefined ? change(this) : setConfig();
  },
  'blur': function () {
    $(this).val(compareVal(this,$(this).val()));
  },
  'keypress': function (e) {
    if (e.charCode == 43) return false;
  }
});

$('input[type=text]').on({
  'keypress': function (e) {
    var value = $(this).val();
    if (e.keyCode >= 48 && e.keyCode <= 57) {
      $(this).attr('value', value);
    } else {
      return false;
    }
  },
  'input': function () {
    $(this).val($(this).val().replace(/\D/g, ''));
    setConfig();
  }
});
$('.container [name]').change(function () {
  setConfig();
});
function biOnInitEx(config, moduleConfigs) {
  biQueryGlobalVariable('Subject.VehicleWidth', '1.6');
  biQueryGlobalVariable('Subject.VehicleHeight', '1.9');
  $('[language]').each(function () {
    var value = $(this).attr('language');
    $(this).html(biGetLanguage() == 1 ? en[value] : cn[value])
  });
  for (var key in moduleConfigs) {
    if (moduleConfigs[key] != "") {
      var parser = new DOMParser();
      var xmlDoc = parser.parseFromString(moduleConfigs[key], "text/xml");
      var countrys = xmlDoc.getElementsByTagName('root');
      var keys = countrys[0].attributes;
      var obj = new Object();
      for (var i = 0; i < keys.length; i++) {
        obj[keys[i].nodeName] = keys[i].nodeValue;
      };
      loadConfig(obj);
    }
  }
}
function loadConfig(config) {
  if (config == null) return;
  $('.container>div:not(:first-of-type)').each(function (i, v) {
    $(this).find('[name]').each(function () {
      var value = $(this).attr('name') + (i + 1);
      var type = $(this).attr('type');
      if (type == "checkbox") {
        if (config[value] == "yes") $(this).attr('checked', true);
      } else if (type == "number") {
        $(this).val(compareVal(this,config[value]));
      } else {
        var v = config[value] == "null" ? "" : config[value];
        $(this).val(v);
      }
    });
  })
  $('.container>div:not(:first-of-type)').each(function () {
    draw($(this));
  });
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
function change(obj) {
  var parent = $(obj).parent().parent().parent().parent().parent().parent().parent();
  if ($(obj).attr('name') == "yaw_offset") {
    parent = $(obj).parent().parent().parent().parent().parent().parent();
  }
  draw($(parent));
}
function draw(obj) {
  if (vehicle.length < 2) return;
  var canvas = $(obj).find(".canvas").children('canvas')[0];
  var ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  var h = canvas.height / 4
  var p1 = new BIPoint(0, h),
    p2 = new BIPoint(canvas.width, h),
    p3 = new BIPoint(canvas.width / 2, 0),
    p4 = new BIPoint(canvas.width / 2, canvas.height),
    p5 = new BIPoint(canvas.width / 2 - Number(vehicle[0]) * 10, h),
    p6 = new BIPoint(canvas.width / 2, h),
    p7 = new BIPoint(canvas.width / 2 - Number(vehicle[0]) * 10, Number(vehicle[1]) * 15 + 35),
    p8 = new BIPoint(canvas.width / 2 + Number(vehicle[0]) * 10, Number(vehicle[1]) * 15 + 35),
    s = new BISize(Number(vehicle[0]) * 20, Number(vehicle[1]) * 50);
  drawLine(p1, p2, 1, "#e9e9e9", ctx);
  drawLine(p3, p4, 1, "#e9e9e9", ctx);
  drawRect(p5, s, "black", ctx);
  var arr = [p6, p7, p8];
  drawPolygon(arr, "black", ctx);
  var x = numberCheck($(obj).find('[name=offset_x]'));
  var y = numberCheck($(obj).find('[name=offset_y]'));
  var yaw = numberCheck($(obj).find('[name=yaw_offset]'));
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
function drawPolygon(arr, color, ctx) {
  ctx.beginPath();
  ctx.moveTo(arr[0].x, arr[0].y);
  ctx.lineTo(arr[1].x, arr[1].y);
  ctx.lineTo(arr[2].x, arr[2].y);
  ctx.strokeStyle = color;
  ctx.closePath();
  ctx.stroke();
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
  ctx.rect(p.x, p.y, s.width, s.height);
  ctx.strokeStyle = color;
  ctx.stroke();
}
function drawCircle(p, radius, color, width, ctx) {
  ctx.beginPath();
  ctx.lineWidth = width;
  ctx.strokeStyle = color;
  ctx.arc(p.x, p.y, radius, 0, Math.PI * 2, false);
  ctx.stroke();
}
function setConfig() {
  var text = "<?xml version=\"1.0\" encoding=\"utf-8\"?><root";
  $('.container>div:not(:first-of-type)').each(function (i, v) {
    $(this).find('[name]').each(function () {
      var key = $(this).attr('name') + (i + 1);
      var type = $(this).attr('type');
      if (type == "checkbox") {
        text += " " + key + "=\"" + ($(this).get(0).checked ? "yes" : "no") + "\"";
      } else if (type == "number") {
        text += " " + key + "=\"" +$(this).val() + "\"";
      } else {
        var v = $(this).val() == "" ? null : $(this).val();
        text += " " + key + "=\"" + v + "\"";
      }
    });
  });
  text += " />";
  biSetModuleConfig("continental-ars408.plugincontiradars", text);
}
function biOnQueriedGlobalVariable(id, value) {
  vehicle.push(value);
  $('.container>div:not(:first-of-type)').each(function () {
    draw($(this));
  });
}
