var vehicle = [];
$('input[type=number]').on({
  'change': function () {
    if ($(this).attr('name').indexOf("bus_channel")==-1&&$(this).attr('name').indexOf("msgID")==-1&&$(this).attr('name').indexOf("msgID")==-1) {
      draw(this);
    }
    $(this).val(compareVal(this, $(this).val()));
    setConfig();
  },
  'blur': function () {
    $(this).val(compareVal(this, $(this).val()));
    if ($(this).attr('name') != "bus_channel") {
      draw(this);
    }
  },
  'input': function (e) {
    if (e.which == undefined && $(this).attr('name') != "bus_channel") {
      draw(this);
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
$('.container>ul>li').click(function () {
  $(this).addClass('white');
  $(this).siblings().removeClass('white');
  $('.container').find('div.' + $(this).attr('id')).show().siblings('div').hide();
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
$('[name=msgID]').keypress(function (e) {
  if (e.charCode > 57 || e.charCode < 48) {
    $(this).attr('readonly', 'readonly')
  } else {
    $(this).removeAttr('readonly')
  }
})

function draw(obj) {
  if (vehicle.length < 2) return;
  var canvas = $(obj).parents('.processing').find(".myCanvas")[0];
  var ctx = canvas.getContext('2d');
  var x = $(obj).parents('.processing').find('[name^=offset_x]').val();
  var y = $(obj).parents('.processing').find('[name^=offset_y]').val();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  var p1 = new BIPoint(canvas.width / 2, 0);
  var p2 = new BIPoint(canvas.width / 2, canvas.height);
  var p3 = new BIPoint(0, 50);
  var p4 = new BIPoint(canvas.width, 50);
  drawLine(p1, p2, 1, "#e9e9e9", ctx);
  drawLine(p3, p4, 1, "#e9e9e9", ctx);
  var p5 = new BIPoint(canvas.width / 2 - Number(vehicle[0]) * 10, 50);
  var size = new BIPoint(Number(vehicle[0]) * 20, Number(vehicle[1]) * 50);
  drawRect(p5, size, "black", ctx);
  var p6 = new BIPoint(canvas.width / 2, 50);
  var p7 = new BIPoint(canvas.width / 2 - Number(vehicle[0]) * 10, 50 + Number(vehicle[1]) * 15);
  var p8 = new BIPoint(canvas.width / 2 + Number(vehicle[0]) * 10, 50 + Number(vehicle[1]) * 15);
  var arr = [p6, p7, p8];
  drawPolygon(arr, "black", ctx);
  p8 = new BIPoint(canvas.width / 2 - y * 15, 50 - (24 + x * 24 / 1.5));
  var p9 = new BIPoint(canvas.width / 2 - y * 15, 50 - x * 24 / 1.5);
  var p10 = new BIPoint(canvas.width / 2 - (15 + y * 15), 50 - x * 24 / 1.5);
  ctx.save();
  ctx.translate(p9.x, p9.y);
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

function loadConfig(config) {
  if (!config) return;
  $(".container [name]").each(function () {
    var name = $(this).attr('name');
    var type = $(this).attr('type');
    var val = config[name];
    if ($(this).is('select') || type == "number" || type == "text") {
      if (val) {
        $(this).val(val);
        if (type == "number") $(this).val(compareVal(this, val));
      }
    } else if (type == "checkbox" && val == "yes" || type == "radio" && $(this).attr("value") == config[name]) {
      $(this).attr('checked', true)
    }
  })
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

function setConfig() {
  var text = "<?xml version=\"1.0\" encoding=\"utf-8\"?><root ";
  $('.container [name]').each(function () {
    var key = $(this).attr('name');
    var type = $(this).attr('type');
    var value = $(this).val();
    if (type == "number") {
      text += " " + key + "=\"" + value + "\"";
    } else if (type == "text") {
      text += " " + key + "=\"" + value + "\"";
    } else if ($(this).is('select')) {
      text += " " + key + "=\"" + value + "\"";
    } else if (type == 'checkbox') {
      text += " " + key + "=\"" + ($(this).is(':checked') ? "yes" : "no") + "\"";
    } else if (type == "radio" && $(this).is(":checked")) {
      text += " " + key + "=\"" + $(this).attr("value") + "\"";
    }
  });
  text += " Enabled=\"no\"/>";
  biSetModuleConfig("robosense-point-cloud.pluginrobosense", text);
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
  biQueryGlobalVariable('Subject.VehicleWidth', '1.6');
  biQueryGlobalVariable('Subject.VehicleHeight', '1.9');
  $('[language]').each(function () {
    var value = $(this).attr('language');
    $(this).html(biGetLanguage() == 1 ? en[value] : cn[value]);
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
  $('.container>div').each(function () {
    draw($(this).find('input[name^=offset_x]')[0]);
  })
}