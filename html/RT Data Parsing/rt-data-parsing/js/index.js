var text,
  vehicle = [], rt_data_parsing = "", dialogConfig = [];
$('input[type=number]').on({
  'change': function () {
    $(this).val(compareVal(this, $(this).val()));
    if ($(this).attr('step').length > 2) changeDraw($(this).parent().parent().siblings())

  },
  'blur': function () {
    if ($(this).attr('step').length > 2) changeDraw($(this).parent().parent().siblings())
  },
  'input': function (e) {
    if (e.which == undefined && $(this).attr('step').length > 2) changeDraw($(this).parent().parent().siblings())
    setConfig();
  },
  'keypress': function (e) {
    if (e.charCode == 101 || e.charCode == 43) {
      return false;
    }
  }
})
$('[type=text]').on({
  'keypress': function (e) {
    if (e.charCode < 48 || e.charCode > 57) {
      return false;
    }
  },
  'keyup': function () {
    setConfig();
  }
})
$('[name]').change(function () {
  var type = $(this).attr('type');
  var name = $(this).attr('name');
  var value = $(this).val();
  if (type == "checkbox") {
    value = $(this).is(':checked') ? "yes" : "no";
  } else if (type == "number") {
    value = compareVal(this, value);
  }
  dialogConfig[0][name] = value;
  setConfig()
})

$('.openPage').click(function () {
  biOpenChildDialog("rt-data-parsing.layer.html", rt_data_parsing, new BISize(1006, 465), "")
})
function scaleCanvas(obj) {
  var type = $(obj).attr("scale");
  var lang = biGetLanguage();
  var text = "";
  var scale = 0;
  if (type == "small") {
    text = lang == 1 ? "Scale: Small" : "比例: 缩小";
    $(obj).attr("scale", "large");
    scale = 1;
  } else {
    text = lang == 1 ? "Scale: Large" : "比例: 放大";
    $(obj).attr("scale", "small");
    scale = 0.3;
  }
  $(obj).html(text);
  draw($(obj).parent(), scale);
}
function draw(obj, scale) {
  var canvas = $(obj).find('.myCanvas')[0];
  var ctx = canvas.getContext('2d');
  var x = $(obj).siblings().find("[name$='PosX']").val();
  var y = $(obj).siblings().find("[name$='PosY']").val();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  var p1 = new BIPoint(canvas.width / 2, 0);
  var p2 = new BIPoint(canvas.width / 2, canvas.height);
  var p3 = new BIPoint(0, 30);
  var p4 = new BIPoint(canvas.width, 30);
  drawLine(p1, p2, 1, "#e9e9e9", ctx);
  drawLine(p3, p4, 1, "#e9e9e9", ctx);
  var size = new BISize(Number(vehicle[0]) * 20 * scale, Number(vehicle[1]) * 50 * scale);
  var p5 = new BIPoint(canvas.width / 2 - Number(vehicle[0]) * 10 * scale, 30);
  drawRect(p5, size, "black", ctx);
  var p6 = new BIPoint(canvas.width / 2, 30);
  var p7 = new BIPoint(canvas.width / 2 - Number(vehicle[0]) * 10 * scale, 30 + Number(vehicle[1]) * 15 * scale);
  var p8 = new BIPoint(canvas.width / 2 + Number(vehicle[0]) * 10 * scale, 30 + Number(vehicle[1]) * 15 * scale);
  var arr = [p6, p7, p8];
  drawPolygon(arr, "black", ctx);
  p8 = new BIPoint(canvas.width / 2 - y * 15 * scale, 30 - (24 + x * 24 / 1.5) * scale);
  var p9 = new BIPoint(canvas.width / 2 - y * 15 * scale, 30 - x * 24 / 1.5 * scale);
  var p10 = new BIPoint(canvas.width / 2 - (15 + y * 15) * scale, 30 - x * 24 / 1.5 * scale);
  ctx.save();
  ctx.translate(p9.x, p9.y);
  // ctx.rotate(Math.PI / 180 * (0 - yaw));
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
function changeDraw(obj) {
  var type = $(obj).find('.scale_change').attr("scale");
  var scale = type == "large" ? 1 : 0.3;
  draw(obj, scale);
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
  if (config == null) return;
  $('.container [name]').each(function () {
    var name = $(this).attr('name');
    var type = $(this).attr('type');
    var val = config[0][name];
    if (type == 'checkbox' && val == 'yes') {
      $(this).prop('checked', true);
    } else if (type == "number") {
      $(this).val(compareVal(this, val));
    } else {
      $(this).val(val);
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
  // $('.container>div:not(:nth-child(3)) [name]').each(function (i, v) {
  //   var type = $(this).attr('type');
  //   var name = $(this).attr('name');
  //   var value = $(this).val();
  //   if ($(this).is('input') || $(this).is('select')) {
  //     if (type == "checkbox") {
  //       text += ' ' + name + '=\"' + ($(this).is(':checked') ? "yes" : "no") + '"';
  //     } else {
  //       if (name == "angle") return;
  //       text += ' ' + name + '=\"' + value + '"';
  //     }
  //   }
  // })
  // $('.layer>div').each(function (i) {
  //   text += "<TargetParameterConfig ";
  //   text += "ID=\"Target" + (i + 1) + " Parameters\" ";
  //   $(this).find('[name]').each(function () {
  //     text += ' ' + $(this).attr('name') + '=\"' + $(this).val() + '"';
  //   })
  //   text += "/>";
  // })
  text = "<?xml version=\"1.0\" encoding=\"utf-8\"?><root";
  for (var i in dialogConfig[0]) {
    text += " " + i + "=\"" + dialogConfig[0][i] + "\"";
  }
  text += ">";
  for (var i = 1; i < dialogConfig.length; i++) {
    text += "<TargetParameterConfig ";
    for (var j in dialogConfig[i]) {
      text += " " + j + "=\"" + dialogConfig[i][j] + "\"";
    }
    text += "/>";
  }
  text += "</root>";

  biSetModuleConfig("rt-data-parsing.rtdataparsing", text);
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
function biOnInitEx(config, moduleConfigs) {
  biQueryGlobalVariable('Subject.VehicleWidth', '1.6');
  biQueryGlobalVariable('Subject.VehicleHeight', '1.9');
  $('[language]').each(function () {
    var value = $(this).attr('language');
    if (biGetLanguage() == 1) {
      $(this).html(en[value]);
      rt_data_parsing = "RT Data Parsing";
    } else {
      $(this).html(cn[value]);
      rt_data_parsing = "RT惯导数据解析";
    }

  });
  for (var key in moduleConfigs) {
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(moduleConfigs[key], "text/xml");
    var countrys = xmlDoc.getElementsByTagName('root');
    var obj = {};
    var keys = countrys[0].attributes;
    for (var n = 0; n < keys.length; n++) {
      obj[keys[n].nodeName] = keys[n].nodeValue;
    }
    dialogConfig.push(obj);
    for (var j = 0; j < countrys[0].childNodes.length; j++) {
      obj = {};
      var keyss = countrys[0].childNodes[j].attributes;
      for (var i in keyss) {
        obj[keyss[i].nodeName] = keyss[i].nodeValue;
      }
      dialogConfig.push(obj);
    }
    loadConfig(dialogConfig);
  }
}
function biOnQueriedGlobalVariable(id, value) {
  vehicle.push(value);
  $('canvas').each(function () {
    scaleCanvas($(this).next())
  })
}