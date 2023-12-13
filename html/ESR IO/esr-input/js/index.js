var data = {
  rear: {},
  front: {}
},
  vehicle = [];
$('select').change(function () {
  setData(this);
  setConfig();

});
$('input[type=checkbox]').change(function () {
  setData(this);
  setConfig();
})
$('input[type=number]').on({
  'blur': function () {
    $(this).val(compareVal(this, $(this).val()));
    if ($(this).attr('name') != 'can_channel') {
      changeNumber(this);
    };
    setData(this);
  },
  'input': function () {
    if ($(this).attr('name') == 'can_channel') return;
    changeNumber(this);
    setData(this);
  },
  'keyup': function (e) {
    if (e.which == 13) {
      $(this).val(compareVal(this, $(this).val()));
      if ($(this).attr('name') != 'can_channel') {
        changeNumber(this);
      };
      setData(this);
      setConfig();
    }
  }
})

function changeNumber(obj) {
  var parent = $(obj).parents('.main');
  var X = Number($(parent).find('[name=offset_x]').val());
  var Y = Number($(parent).find('[name=offset_y]').val());
  var maxX = Number($(parent).find('[name=offset_x]').attr('max'));
  var minX = Number($(parent).find('[name=offset_x]').attr('min'));
  var maxY = Number($(parent).find('[name=offset_y]').attr('max'));
  var minY = Number($(parent).find('[name=offset_y]').attr('min'));
  var maxYaw = Number($(parent).find('[name=yaw_offset]').attr('max'));
  var minYaw = Number($(parent).find('[name=yaw_offset]').attr('min'));
  var yaw_offset = Number($(parent).find('[name=yaw_offset]').val());
  if (X < minX || X > maxX || Y < minY || Y > maxY || yaw_offset < minYaw || yaw_offset > maxYaw) return;
  var newX = Y;
  var newY = -X
  draw(newX, newY, yaw_offset);
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

function draw(newX, newY, yaw_offset) {
  if (vehicle.length < 2) return;
  var canvas = $('.content').find('canvas')[0];
  var centerX = canvas.width / 2;//中心点
  var centerY = canvas.height * 0.25;
  var angle2, angle;
  newX = centerX - newX * 15;
  newY = centerY + newY * 14.5;
  if ($("[language='rear']").hasClass('isActive')) {
    angle = { ag1: -260 - yaw_offset, ag2: -280 - yaw_offset };
    angle2 = { ag1: -180 - yaw_offset, ag2: -270 - yaw_offset };
  } else {
    angle = { ag1: 260 - yaw_offset, ag2: 280 - yaw_offset };
    angle2 = { ag1: 180 - yaw_offset, ag2: 270 - yaw_offset };
  }
  var ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  var p1 = new BIPoint(centerX, 0);
  var p2 = new BIPoint(centerX, canvas.height);
  var p3 = new BIPoint(0, centerY);
  var p4 = new BIPoint(canvas.width, centerY);
  //画布的数线
  drawLine(p1, p2, 1, "#e9e9e9", ctx);
  // 画布的横线
  drawLine(p3, p4, 1, "#e9e9e9", ctx);
  var size = new BISize(Number(vehicle[0]) * 20, Number(vehicle[1]) * 50);
  var p5 = new BIPoint(centerX - Number(vehicle[0]) * 10, centerY);
  // 中心的黑长方形
  drawRect(p5, size, "black", ctx);
  var p6 = new BIPoint(centerX, centerY);
  var p7 = new BIPoint(centerX - Number(vehicle[0]) * 10, centerY + 25);
  var p8 = new BIPoint(centerX + Number(vehicle[0]) * 10, centerY + 25);
  var array = [p6, p7, p8];
  // 中心的三角行
  drawPolygon(array, "black", ctx);
  var start = new BIPoint(newX, newY);
  drawAngle("#9A79DD", 1, start, angle, angle2, ctx, canvas.height);
}
/**
 * 画角
 * @param {*} width 宽度
 * @param {*} start 起始点
 * @param {*} angle 角度
 * @param {*} color 颜色
 * @param {*} r 半径
 */
function drawAngle(color, width, start, angle, angle2, ctx, r) {
  var x1, y1, x2, y2;
  // 角的下面的线
  var p11 = new BIPoint(start.x, start.y);//圆心
  if ($("[language='rear']").hasClass('isActive')) {
    x1 = start.x - Math.cos(angle2.ag1 * Math.PI / 180) * 15;
    y1 = start.y - Math.sin(angle2.ag1 * Math.PI / 180) * 15;
    x2 = start.x - Math.cos(angle2.ag2 * Math.PI / 180) * 15;
    y2 = start.y - Math.sin(angle2.ag2 * Math.PI / 180) * 20;
    x2 = start.x + Math.cos(angle2.ag2 * Math.PI / 180) * 15;
    y2 = start.y + Math.sin(angle2.ag2 * Math.PI / 180) * 20;
    drawArc(p11, '#9A79DD', ctx, 10, angle.ag2 * (Math.PI / 180), angle.ag1 * (Math.PI / 180));
  } else {
    x1 = start.x + Math.cos(angle2.ag1 * Math.PI / 180) * 15;
    y1 = start.y + Math.sin(angle2.ag1 * Math.PI / 180) * 15;
    x2 = start.x + Math.cos(angle2.ag2 * Math.PI / 180) * 15;
    y2 = start.y + Math.sin(angle2.ag2 * Math.PI / 180) * 20;
    drawArc(p11, '#9A79DD', ctx, 10, angle.ag1 * (Math.PI / 180), angle.ag2 * (Math.PI / 180));
  }
  var p1 = new BIPoint(x1, y1);
  var p2 = new BIPoint(x2, y2);
  // 直角的竖线
  drawLine(start, p1, 1, "#32cd32", ctx);
  // 直角的横线
  drawLine(start, p2, 1, "#32cd32", ctx);
  var x3 = start.x + Math.cos(angle.ag1 * Math.PI / 180) * r; // 已知半径和角度，求 点的坐标
  var y3 = start.y + Math.sin(angle.ag1 * Math.PI / 180) * r; // 已知半径和角度，求 点的坐标
  var x4 = start.x + Math.cos(angle.ag2 * Math.PI / 180) * r; // 已知半径和角度，求 点的坐标
  var y4 = start.y + Math.sin(angle.ag2 * Math.PI / 180) * r; // 已知半径和角度，求 点的坐标
  var end1 = new BIPoint(x3, y3);
  var end2 = new BIPoint(x4, y4);
  drawLine(start, end1, width, color, ctx)
  drawLine(start, end2, width, color, ctx)
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
 * 画圆弧
 * @param {*} origin 原点
 * @param {*} color 颜色
 * @param {*} ctx 画图上下文
 * @param {*} radius 半径
 */
function drawArc(origin, color, ctx, radius, startAngle, endAngle) {
  ctx.beginPath();
  ctx.lineWidth = 1;
  ctx.strokeStyle = color;
  ctx.arc(origin.x, origin.y, radius, startAngle, endAngle, false);
  ctx.stroke();
}

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

$('.tabs>ul>li').on('click', function () {
  $('.tabs>ul>li').each(function () {
    $(this).removeClass('isActive')
  })
  var id = $(this).attr('id');
  $(this).addClass('isActive');
  $('.content').find('input').each(function () {
    var name = $(this).attr('name');
    if ($(this).attr('type') == 'checkbox') {
      $(this).prop('checked', data[id][name] == 'yes');
    } else if ($(this).attr('type') == 'text') {
      if (data[id][name] == 'null' || undefined) {
        $(this).val('')
      } else {
        $(this).val(data[id][name])
      }
    } else {
      var val = data[id][name] == undefined ? $(this).attr('value') : data[id][name];
      if (name != 'can_channel') {
        $(this).val(Number(val).toFixed(2));
        changeNumber(this)
      } else {
        $(this).val(val)
      }
    }

  })
  $('select').each(function () {
    var name = $(this).attr('name');
    var val = data[id][name] == undefined ? -1 : data[id][name];
    $(this).val(val)
  })
})

// 改变数据时，将数据存放进data中
function setData(obj) {
  var id = '';
  var name = $(obj).attr('name');
  var type = $(obj).attr('type');
  $('.tabs>ul>li').each(function () {
    if ($(this).hasClass('isActive')) {
      id = $(this).attr('id');
    }
  })
  if (type == 'checkbox') {
    data[id][name] = $(obj).is(':checked') ? 'yes' : 'no';
  } else if (type == 'number' && $(obj).attr('name') != 'can_channel') {
    data[id][name] = compareVal(obj, $(obj).val());
  } else {
    data[id][name] = $(obj).val();
  }
}
//正则验证是否为ip
function isValidIP(ip) {
  var reg = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/
  return reg.test(ip);
}

function loadConfig(config) {
  if (config == null) return;
  var val = "";
  data = config;
  var parentName = '';
  $('.tabs>ul>li').each(function () {
    if ($(this).hasClass('isActive')) {
      parentName = $(this).attr('id');
      val = config[parentName];
    }
  })
  $('select').each(function () {
    var name = $(this).attr('name');
    $(this).val(val[name])
  })
  $('input').each(function () {
    var name = $(this).attr('name');
    var type = $(this).attr('type');
    if (type == 'checkbox') {
      val[name] == 'yes' ? $(this).attr('checked', true) : $(this).attr('checked', false);
    } else if (type == 'number') {
      $(this).val(val[name]).attr('value', val[name]);
      if ($(this).attr('name') != 'can_channel') {
        $(this).val(Number($(this).val()).toFixed(2));
      }
    } else {
      $(this).val(val[name] == 'null' ? '' : val[name]);
    }
  })
  biQueryGlobalVariable('Subject.VehicleWidth', '1.6');
  biQueryGlobalVariable('Subject.VehicleHeight', '1.9');
}
/**
 * 写配置
 */
function setConfig() {
  var text = "<?xml version=\"1.0\" encoding=\"utf-8\"?><root>";
  $('.tabs>ul>li').each(function () {
    var id = $(this).attr('id');
    text += "<" + id + " ";
    $('select').each(function () {
      var name = $(this).attr('name');
      var val = data[id][name] == undefined ? -1 : data[id][name];
      text += name + "=\"" + val + "\" ";
    })
    $('input').each(function () {
      var name = $(this).attr('name');
      var type = $(this).attr('type');
      var val = "";
      if (type == 'checkbox') {
        val = data[id][name] == undefined ? 'no' : data[id][name];
      } else {
        val = data[id][name] == undefined ? $(this).attr('value') : data[id][name];
      }
      text += name + "=\"" + val + "\" ";
    })
    text += "/>"
  })
  text += "</root>";
  biSetModuleConfig("esr-input.plugindelphiradars", text);
}
function biOnInitEx(config, moduleConfigs) {
  biQueryGlobalVariable('Subject.VehicleWidth', '1.6');
  biQueryGlobalVariable('Subject.VehicleHeight', '1.9');
  $('[language]').each(function () {
    var value = $(this).attr('language');
    $(this).html(biGetLanguage() == 1 ? en[value] : cn[value])
  });
  for (var key in moduleConfigs) {
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(moduleConfigs[key], "text/xml");
    var root = xmlDoc.getElementsByTagName('root');
    var countrys = root[0].childNodes;
    var obj = new Object();
    for (var i = 0; i < countrys.length; i++) {
      var name = countrys[i].nodeName;
      obj[name] = new Object();
      for (key in countrys[i].attributes) {
        var childName = countrys[i].attributes[key]['nodeName'];
        var childValue = countrys[i].attributes[key]['value'];
        if (childValue != undefined) {
          obj[name][childName] = childValue
        }
      }
    }
    loadConfig(obj);
  }
}
function biOnQueriedGlobalVariable(id, value) {
  vehicle.push(value);
  $('input[name=offset_x]').each(function () {
    changeNumber(this);
  })
}