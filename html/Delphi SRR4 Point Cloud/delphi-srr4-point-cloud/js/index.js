var vehicle = [];
var scale = 1;
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
  setConfig();
})

$('[name]').change(function () {
  setConfig()
})

$('.device').click(function () {
  $(this).hide().next().css('display', 'block').val($(this).html());
})

$('.deviceText').blur(function () {
  $(this).hide();
  $('.device').show().html($('.deviceText').val())
})

$('[name=FrameNumer]').keypress(function (e) {
  if (e.charCode > 57 || e.charCode < 48) {
    $(this).attr('readonly', 'readonly')
  } else {
    $(this).removeAttr('readonly')
  }
})

$('[name=device_type]').click(function () {
  $(this).next().show();
  $(this).hide();
  if ($(this).text() == "") return;
  $(this).next().val($(this).text()).select();
});

$('.device_type').blur(function () {
  $(this).prev().show();
  $(this).hide();
  if ($(this).val().trim().length == 0) return;
  $(this).prev().text($(this).val());
  setConfig();
});

$("body").keydown(function (e) {
  if (e.keyCode == 13 && $("[name=device_type]").attr("style") == "display: none;") {
    $(".device_type").hide();
    $(".device_type").prev().show();
    if ($(".device_type").val().trim().length == 0) return;
    $(".device_type").prev().text($(".device_type").val());
  }
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
  var canvas = $(obj).parents('.processing').find(".myCanvas")[0];
  var ctx = canvas.getContext('2d');
  var x = $(obj).parents('.processing').find('[name^=offset_x]').val();
  var y = $(obj).parents('.processing').find('[name^=offset_y]').val();
  var yaw = $(obj).parents('.container').find('[name=yaw]').val();
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
  ctx.save();
  ctx.stroke();
  ctx.translate(p9.x, p9.y);
  p1 = new BIPoint(p8.x - p9.x, p8.y - p9.y);
  p2 = new BIPoint(p9.x - p9.x, p9.y - p9.y);
  p3 = new BIPoint(p10.x - p9.x, p10.y - p9.y);
  ctx.rotate(Math.PI / 180 * (0 - yaw));
  ctx.stroke();
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
    } else {
      $(this).val(val);
    }
  })
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
    if (type == "number" || type == "text" || $(this).is('select')) {
      text += " " + key + "=\"" + value + "\"";
    } else if (type == 'checkbox') {
      text += " " + key + "=\"" + ($(this).is(':checked') ? "yes" : "no") + "\"";
    } else if ($(this).is("a")) {
      text += " " + key + "=\"" + $(this).text() + "\"";
    }
  });
  text += "/>";
  biSetModuleConfig("delphi-srr4-point-cloud.delphisrr4", text);
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

function biOnQueriedGlobalVariable(id, value) {
  vehicle.push(value);
  draw($(".container").find('input[name^=offset_x]')[0], 1);
}