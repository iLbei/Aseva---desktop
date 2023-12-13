var vehicle = [],
  conf = [];
$(".content").on("input", "input[type=number]", function (e) {
  var v = $(this).val();
  if (isNaN(e.which)) {
    $(this).attr("value", compareVal(this, v)).val(compareVal(this, v));
    draw($(".white").index());
  } else {
    $(this).attr("value", v);
  }
  setVal($(".white").index());
});
$(".content").on("blur", "input[type=number]", function () {
  $(this).attr("value", compareVal(this, $(this).val())).val(compareVal(this, $(this).val()));
  setVal($(".white").index());
  draw($(".white").index());
});
$('input[type=text]').on('input', function () {
  isNaN($(this).val()) ? $(this).addClass("red").removeClass("green") : $(this).addClass("green").removeClass("red");
  if (!$(this).hasClass("red")) setVal($(".white").index());
})
$('.container>ul>li').click(function () {
  $(this).addClass('white');
  $(this).siblings().removeClass('white');
  $('.container').find('div.' + $(this).attr('id')).show().siblings('div').hide();
  getVal($(".white").index());
  draw($(".white").index());
})
$('[name]').change(function () {
  setVal($(".white").index())
})

function draw(index) {
  if (vehicle.length < 2) return;
  var val = conf[index];
  var canvas = $('.container').find(".myCanvas")[0];
  var ctx = canvas.getContext('2d');
  var x = val["origin_x"];
  var y = val["origin_y"];
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
    } else if (type == "checkbox" && val == "yes") {
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
  var text = "<?xml version=\"1.0\" encoding=\"utf-8\"?><root>";
  for (var i in conf) {
    text += "<c" + Number(i);
    for (var j in conf[i]) {
      text += " " + j + "=\"" + conf[i][j] + "\"";
    }
    text += " />"
  };
  text += "</root>";
  biSetModuleConfig("whst-radar.aspluginwhstradar", text);
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
    var rootChild = xmlDoc.getElementsByTagName('root')[0].childNodes;
    for (var i = 0; i < rootChild.length; i++) {
      var obj = new Object();
      var keys = rootChild[i].attributes;
      for (var j = 0; j < keys.length; j++) {
        //获取root自身字节的属性
        obj[keys[j].nodeName] = keys[j].nodeValue;
      }
      conf.push(obj);
    }
  }
  getVal($(".white").index());
}

function biOnQueriedGlobalVariable(id, value) {
  vehicle.push(value);
  draw($(".white").index());
}

function getVal(i) {
  $("input[type =checkbox]").attr("checked", false);
  $("select").val(-1);
  $("input[type =number]").val(0.000);
  $('.container [name]').each(function () {
    var name = $(this).attr('name');
    var type = $(this).attr('type');
    var val = conf[i][name];
    if (Boolean(val)) {
      if (type == 'checkbox') {
        $(this).prop('checked', val == "yes");
      } else if (type == "number") {
        $(this).attr("value", compareVal(this, val)).val(compareVal(this, val));
      } else {
        $(this).val(val)
      }
    }
    if ($(this).is("input[type=text]")) isNaN($(this).val()) ? $(this).addClass("red").removeClass("green") : $(this).addClass("green").removeClass("red");
  });
}

function setVal(i) {
  $('.container [name]').each(function () {
    var name = $(this).attr('name');
    var val = $(this).val();
    var type = $(this).attr('type');
    if (type == 'checkbox') {
      val = $(this).is(':checked') ? "yes" : "no";
    }
    conf[i][name] = val;
  });
  setConfig()
}