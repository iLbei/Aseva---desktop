var vehicle = [], dialogConfig = [], title = "";
$('button').click(function () {
  $(this).addClass('white').siblings().removeClass('white');
  var num = $(this).index();
  $('.container>.center>div:eq(' + num + ')').show().siblings().hide();
});

$('.container [name]').change(function () {
  setConfig();
});
$('[type=number]').on({
  'change': function () {
    $(this).val(compareVal(this, $(this).val()));
    setConfig();
    if ($(this).attr('name').indexOf('port') != -1) return;
    xChange(this);
  },
  'blur': function () {
    $(this).val(compareVal(this, $(this).val()));
    if ($(this).attr('name').indexOf('port') != -1) return;
    xChange(this);
  },
  'input': function (e) {
    if (e.which == undefined) {
      var step = $(this).attr('step');
      $(this).val(Number($(this).val()).toFixed(step.length - 2));
      if ($(this).attr('name').indexOf('port') != -1) return;
      xInput(this);
    }
    $(this).attr('value', numberCheck(this))
    setConfig();
  },
  'keypress': function (e) {
    if (e.charCode == 43) return false;
  }
});
$('input[type=text]').on('input', function () {
  setConfig();
})
$('body').keyup(function (event) {
  var e = event || window.event;
  if (e.keyCode == 8) {
    $('input').each(function () {
      $(this).attr('value', $(this).val())
    })
    setConfig();
  }
})
function loadConfig(config) {
  if (config == null) return;
  $('.container>.center>div').each(function (i, v) {
    $(this).find('[name]').each(function () {
      var key = $(this).attr('name');
      var type = $(this).attr('type');
      if (i != 0) key += i;
      if (type == "checkbox") {
        $(this).attr('checked', config[key] == "yes");
      } else if (type == "number") {
        $(this).val(compareVal(this, config[key]));
      } else if (type == "radio") {
        $(this).attr("checked", config[key] == $(this).val());
      } else {
        if (config[key] == '' || config[key] == 'null' || config[key] == undefined) return;
        $(this).val(config[key]);
      }
    });
    draw($(this));
  });
}
function biOnInitEx(cig, moduleConfigs) {
  $('[language]').each(function () {
    var value = $(this).attr('language');
    if (biGetLanguage() == 1) {
      $(this).html(en[value]);
      title = "Horizon Matrix";
    } else {
      $(this).html(cn[value]);
      title = "地平线 Matrix";
    }
  });
  biQueryGlobalVariable('Subject.VehicleWidth', '1.6');
  biQueryGlobalVariable('Subject.VehicleHeight', '1.9');
  for (var key in moduleConfigs) {
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(moduleConfigs[key], "text/xml");
    var obj = new Object();
    var root = xmlDoc.getElementsByTagName('root');
    var keys = root[0].attributes;
    for (var i = 0; i < keys.length; i++) {
      //获取root自身字节的属性
      obj[keys[i].nodeName] = keys[i].nodeValue;
    }
    dialogConfig.push(obj)
    if (root[0].childNodes.length > 0) {
      dialogConfig.push([[], [], [], []]);
      var child = root[0].childNodes;
      for (var i of child) {
        var keys = i.attributes;
        var obj = {}; for (var j of keys) {
          obj[j.nodeName] = j.nodeValue;
        }
        switch (i.nodeName) {
          case "line_bound": {
            dialogConfig[1][0].push(obj);
            break;
          }
          case "line_bound1": {
            dialogConfig[1][1].push(obj);
            break;
          }
          case "line_bound2": {
            dialogConfig[1][2].push(obj);
            break;
          }
          case "line_bound3": {
            dialogConfig[1][3].push(obj);
            break;
          }
          default:
            break;
        }
      }
    }
    loadConfig(dialogConfig[0]);
  }
}

function onForword(obj) {
  biOpenChildDialog("horizon-matrix-cameras.table.html", title, new BISize(480, 193), $(obj).parents(".c0").index());
}
function numberCheck(obj) {
  var min = Number($(obj).attr("min"));
  var max = Number($(obj).attr('max'));
  var value = Number($(obj).val());
  if (value < min) {
    return min;
  } else if (value > max) {
    return max;
  } else {
    return value;
  }
}
function draw(obj) {
  if (vehicle.length < 2) return;
  var canvas = $(obj).find('.myCanvas')[0];
  var ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, 143, 180);
  var p1 = new BIPoint(0, 46),
    p2 = new BIPoint(canvas.width, 46),
    p3 = new BIPoint(canvas.width / 2, 0),
    p4 = new BIPoint(canvas.width / 2, canvas.height),
    p5 = new BIPoint(canvas.width / 2 - Number(vehicle[0]) * 10, 46),
    p6 = new BIPoint(canvas.width / 2, 46),
    p7 = new BIPoint(canvas.width / 2 - Number(vehicle[0]) * 10, Number(vehicle[1]) * 15 + 45),
    p8 = new BIPoint(canvas.width / 2 + Number(vehicle[0]) * 10, Number(vehicle[1]) * 15 + 45),
    s = new BISize(Number(vehicle[0]) * 20, Number(vehicle[1]) * 50);
  drawLine(p1, p2, 1, "#e9e9e9", ctx);
  drawLine(p3, p4, 1, "#e9e9e9", ctx);
  var arr = [p6, p7, p8]
  drawPolygon(arr, "black", ctx);
  drawRect(p5, s, "black", ctx);
  var x = numberCheck($(obj).find('[name=pos_x]'));
  var y = numberCheck($(obj).find('[name=pos_y]'));
  var xScale = x * 24 / 1.5,
    yScale = 15 * y;
  var p = new BIPoint(canvas.width / 2 - yScale, 46 - xScale);
  var p10 = new BIPoint(canvas.width / 2 - yScale, 46 - 24 - xScale),
    p11 = new BIPoint(canvas.width / 2 - 15 - yScale, 46 - xScale),
    p12 = new BIPoint(canvas.width / 2 - 10 - yScale, 46 - xScale),
    p13 = new BIPoint(canvas.width / 2 + 10 - yScale, 46 - xScale),
    p14 = new BIPoint(canvas.width / 2 - yScale, 46 - 10 - xScale),
    p15 = new BIPoint(canvas.width / 2 - yScale, 46 + 10 - xScale),
    radius = 10;
  drawCircle(p, radius, '#9a79dd', 1, ctx);
  ctx.beginPath();
  ctx.moveTo(p10.x, p10.y);
  ctx.lineTo(p.x, p.y);
  ctx.lineTo(p11.x, p11.y);
  ctx.strokeStyle = "#32cd32";
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(p12.x, p12.y);
  ctx.lineTo(p13.x, p13.y);
  ctx.strokeStyle = "#9a79dd";
  ctx.stroke();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(p14.x, p14.y);
  ctx.lineTo(p15.x, p15.y);
  ctx.strokeStyle = "#9a79dd";
  ctx.stroke();
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
  var text = "<?xml version=\"1.0\" encoding=\"utf-8\"?><root ";
  $('.container>.center>div').each(function (i, v) {
    var f = i == 0 ? "" : "" + i;
    $(this).find('[name]').each(function () {
      var key = $(this).attr('name');
      var type = $(this).attr('type');
      if (type == "checkbox") {
        var n = $(this).get(0).checked == true ? "yes" : "no";
        text += " " + key + f + "=\"" + n + "\"";
      } else if (type == "radio" && $(this).get(0).checked) {
        text += " " + key + f + "=\"" + $(this).val() + "\"";
      } else if (type == "number") {
        text += " " + key + f + "=\"" + compareVal(this, $(this).val()) + "\"";
      } else if (type != "radio") {
        text += " " + key + f + "=\"" + $(this).val() + "\"";
      }
    });
  });
  if (dialogConfig.length > 1) {
    text += ">"
    for (var i in dialogConfig[1]) {
      for (var j in dialogConfig[1][i]) {
        text += "<line_bound" + (i == 0 ? "" : i) + " ";
        for (var k in dialogConfig[1][i][j]) {
          text += k + "=\"" + dialogConfig[1][i][j][k] + "\" ";
        }
        text += "/>"
      }
    }
    text += "</root>";
  } else {
    text += "/>"
  }
  biSetModuleConfig("horizon-matrix-cameras.horizonmatrix", text);
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
function xChange(obj) {
  var o = $(obj).parent().parent().parent().parent().parent().parent().parent();
  draw(o);
}
function xInput(obj) {
  var v = $(obj).val();
  var min = Number($(obj).attr('min'));
  var max = Number($(obj).attr('max'));
  if (v < min || v > max) return
  var o = $(obj).parent().parent().parent().parent().parent().parent().parent();
  draw(o);
}
function biOnQueriedGlobalVariable(id, value) {
  vehicle.push(value);
  $('.container>.center>div').each(function () {
    draw($(this));
  });
}