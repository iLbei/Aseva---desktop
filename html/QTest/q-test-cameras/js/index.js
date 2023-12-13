var vehicle = [];
$('button').click(function () {
  $(this).addClass('white').siblings().removeClass('white');
  var num = $(this).index();
  $('.container:eq(' + num + ')').show().siblings().hide();
});

$('.container [name]').change(function () {
  changeVal();
});
$('[type=number]').on({
  'change': function () {
    $(this).val(compareVal(this, $(this).val()));
    changeVal();
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
    changeVal();
  },
  'keypress': function (e) {
    if (e.charCode == 43) return false;
  }
});
$('input[type=text]').on('input', function () {
  changeVal();
})
$('body').keyup(function (event) {
  var e = event || window.event;
  if (e.keyCode == 8) {
    $('input').each(function () {
      $(this).attr('value', $(this).val())
    })
    changeVal();
  }
})
function changeVal() {
  $('.container [name]').each(function () {
    var key = $(this).attr('name');
    var type = $(this).attr('type');
    if (type == "checkbox") {
      var n = $(this).is(":checked") ? "yes" : "no";
      dialogConfig[0][key] = n;
    } else if (type == "radio" && $(this).get(0).checked) {
      dialogConfig[0][key] = $(this).val();
    } else if (type == "number") {
      dialogConfig[0][key] = compareVal(this, $(this).val());
    } else if (type != "radio") {
      dialogConfig[0][key] = $(this).val();
    }
  });
  setConfig();
}
function loadConfig() {
  if (dialogConfig[0] == null) return;
  $('.container [name]').each(function () {
    var key = $(this).attr('name');
    var type = $(this).attr('type');
    if (type == "checkbox") {
      $(this).attr('checked', dialogConfig[0][key] == "yes");
    } else if (type == "number") {
      $(this).val(compareVal(this, dialogConfig[0][key]));
    } else if (type == "radio") {
      $(this).attr("checked", dialogConfig[0][key] == $(this).val());
    } else {
      if (dialogConfig[0][key] == '' || dialogConfig[0][key] == 'null' || dialogConfig[0][key] == undefined) return;
      $(this).val(dialogConfig[0][key]);
    }
  });
  biQueryGlobalVariable('Subject.VehicleWidth', '1.6');
  biQueryGlobalVariable('Subject.VehicleHeight', '1.9');
}

function onForword(obj) {
  biOpenChildDialog("q-test-cameras.table.html", "QTest", new BISize(480, 193), $(obj).parents(".c0").index());
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
  $('.container').each(function () {
    draw($(this));
  });
}
function biOnClosedChildDialog(htmlName, result) {
  if (htmlName == "q-test-cameras.table.html") {
    if (biGetLocalVariable("q-test-cameras-table") != "null") {
      dialogConfig = JSON.parse(biGetLocalVariable("q-test-cameras-table"));
      setConfig();
    }
  }
}
