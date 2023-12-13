var vehicle = [];
$('input[type=number]').on({
  'change': function () {
    $(this).val(compareVal(this, $(this).val()));
    biQueryGlobalVariable('robosense-ecu', 1);
  },
  'input': function (e) {
    if (e.which == undefined) {
      $(this).val(Number($(this).val()).toFixed($(this).attr("step").length - 2));
      draw();
    };
  },
  'keyup': function (e) {
    if (e.keyCode == 8 && $(this).attr('name') == "port" && $(this).val() == "") return;
    if (e.keyCode < 57 && e.keyCode > 48 || e.keyCode == 8) {
      setConfig();
    }
  }
})
$('[name]').change(function () {
  setConfig()
})
$('[type=text]').on("keyup", function () {
  var reg = /^([1-9]|([1-9][0-9])|(1[0-9][0-9])|(2[0-4][0-9])|(25[0-5]))(\.([0-9]|([1-9][0-9])|(1[0-9][0-9])|(2[0-4][0-9])|(25[0-5]))){3}$/;
  var val = $(this).val();
  reg.test(val) ? $(this).addClass('green').attr('value', val).removeClass('red') : $(this).removeClass('green').addClass('red');
  if (!$(this).hasClass('red')) setConfig();
}).blur(function () {
  if ($(this).val() == "" || $(this).hasClass('red')) {
    $(this).val($(this).attr('value') == 'null' ? '' : $(this).attr('value')).addClass('green').removeClass('red');
  }
  setConfig();
})

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
    if (type == "checkbox") {
      if (val == "yes") $(this).attr('checked', true);
    } else if (type == "radio") {
      if ($(this).attr('value') == val) $(this).attr('checked', true);
    } else if (type == "number" && name != "port") {
      $(this).val(compareVal(this, val))
    } else {
      $(this).val((val == "" || val == "null") ? "" : val);
    }
  })
  $('[name=ip]').attr('value', config['ip']).addClass('green');
}
//有input type=number 情况下比较大小
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

function setConfig() {
  var text = "<?xml version=\"1.0\" encoding=\"utf-8\"?><root ";
  $('.container [name]').each(function () {
    var key = $(this).attr('name');
    var type = $(this).attr('type');
    var value = $(this).val();
    if (type == 'checkbox') {
      text += " " + key + "=\"" + ($(this).is(':checked') ? "yes" : "no") + "\"";
    } else if (key == 'port') {
      text += " " + key + "=\"" + (value) + "\"";
    } else if (type != "radio") {
      text += " " + key + "=\"" + (value == '' ? $(this).attr('value') : value) + "\"";
    }
  });
  text += "/>";
  biSetModuleConfig("objectbyvehicle-ecu.pluginobjectbyvehicle", text);
}
function draw() {
  var canvas = $("#myCanvas")[0];
  var ctx = canvas.getContext('2d');
  var x = $('[name=offset_x]').val();
  var y = $('[name=offset_y]').val();
  var yaw = $('[name=yaw]').val();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  var p1 = new BIPoint(canvas.width / 2, 0);
  var p2 = new BIPoint(canvas.width / 2, canvas.height);
  var p3 = new BIPoint(0, 48);
  var p4 = new BIPoint(canvas.width, 48);
  drawLine(p1, p2, 1, "#e9e9e9", ctx);
  drawLine(p3, p4, 1, "#e9e9e9", ctx);
  var p5 = new BIPoint(canvas.width / 2 - Number(vehicle[0]) * 10, 48);
  var size = new BIPoint(Number(vehicle[0]) * 20, Number(vehicle[1]) * 50);
  drawRect(p5, size, "black", ctx);
  var p6 = new BIPoint(canvas.width / 2, 48);
  var p7 = new BIPoint(canvas.width / 2 - Number(vehicle[0]) * 10, 48 + Number(vehicle[1]) * 15);
  var p8 = new BIPoint(canvas.width / 2 + Number(vehicle[0]) * 10, 48 + Number(vehicle[1]) * 15);
  var arr = [p6, p7, p8];
  drawPolygon(arr, "black", ctx);
  p8 = new BIPoint(canvas.width / 2 - y * 15, 48 - (24 + x * 24 / 1.5));
  var p9 = new BIPoint(canvas.width / 2 - y * 15, 48 - x * 24 / 1.5);
  var p10 = new BIPoint(canvas.width / 2 - (15 + y * 15), 48 - x * 24 / 1.5);
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
  draw();
}