var not_config = "";
$(function () {
  draw(2, 5);
});

function draw(width, length) {
  var canvas = $('#canvas')[0];
  var ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  var p1 = new BIPoint(canvas.width / 2, 0);
  var p2 = new BIPoint(0, 142);
  var p3 = new BIPoint(canvas.width, 142);
  var p4 = new BIPoint(canvas.width / 2, canvas.height);
  drawLine(p1, p4, 1, "#e9e9e9", ctx);
  drawLine(p3, p2, 1, "#e9e9e9", ctx);
  var size = new BISize(width * 25, length * 25);
  var p = new BIPoint(canvas.width / 2 - width * 25 / 2, 142);
  drawRect(p, size, "black", ctx);
  var vLen = length > 6 ? 48 : length * 8;
  p1 = new BIPoint(canvas.width / 2, 142);
  p2 = new BIPoint(canvas.width / 2 - width * 25 / 2, 142 + vLen);
  p3 = new BIPoint(canvas.width / 2 + width * 25 / 2, 142 + vLen);
  var arr = [p1, p2, p3];
  drawPolygon(arr, "black", ctx);
  var viewWidth = canvas.width;
  var viewHeight = canvas.height;
  var zeroX = viewWidth * 0.5;
  var zeroY = viewHeight * 0.3;
  var k = 25; // pix/m
  var deg2rad = Math.PI / 180;
  $('.container>.left>.bottom>div').each(function (i, v) {
    if (i != 0) {
      var id = i;
      var x = Number($(this).find('[name=origin_x]')[0].value);
      x = x <= -20 ? -20 : x;
      x = x >= 1 ? 1 : x;
      var y = Number($(this).find('[name=origin_y]')[0].value);
      y = y <= -3 ? -3 : y;
      y = y >= 3 ? 3 : y;
      var orient = Number($(this).find('[name=orientation]')[0].value);
      orient = orient <= -180 ? -180 : orient;
      orient = orient >= 180 ? 180 : orient;
      var angleA = Number($(this).find('[name=angle_alpha]')[0].value);
      angleA = angleA <= 60 ? 60 : angleA;
      angleA = angleA >= 150 ? 150 : angleA;
      var angleB = Number($(this).find('[name=angle_beta]')[0].value);
      angleB = angleB <= 0 ? 0 : angleB;
      angleB = angleB >= 30 ? 30 : angleB;
      var radiusA = Number($(this).find('[name=dist_alpha]')[0].value);
      radiusA = radiusA <= 0.1 ? 0.1 : radiusA;
      radiusA = radiusA >= 2.5 ? 2.5 : radiusA;
      var radiusB = Number($(this).find('[name=dist_beta]')[0].value);
      radiusB = radiusB <= 1 ? 1 : radiusB;
      radiusB = radiusB >= 10 ? 10 : radiusB;
      var pos = new BIPoint(0.0, 0.0);
      var distPQ = Math.cos(angleA * 0.5 * deg2rad) * radiusA;
      var halfPQ = Math.sin(angleA * 0.5 * deg2rad) * radiusA;
      var pps = new BIPoint(distPQ, halfPQ);
      var pqs = new BIPoint(distPQ, -halfPQ);
      var po = standardPointToView(pos, zeroX, zeroY, k, x, y, orient);
      var pp = standardPointToView(pps, zeroX, zeroY, k, x, y, orient);
      var pq = standardPointToView(pqs, zeroX, zeroY, k, x, y, orient);
      if (angleB < 0.01) { //APA model
        var prs = new BIPoint(radiusB, halfPQ);
        var pss = new BIPoint(radiusB, -halfPQ);
        var pr = standardPointToView(prs, zeroX, zeroY, k, x, y, orient);
        var ps = standardPointToView(pss, zeroX, zeroY, k, x, y, orient);
        var arr = [po, pp, pr, ps, pq];
        drawPolygon(arr, "#9a79dd", ctx);
      } else {
        var ptList = [];
        ptList.push(pp);
        ptList.push(po);
        ptList.push(pq);
        var intervals = Math.max(Math.round(angleB / 5), 1);
        var step = angleB / intervals;
        var begin = -angleB * 0.5;
        var pzs = new BIPoint(distPQ - halfPQ / Math.tan(angleB * 0.5 * deg2rad), 0);
        var zradius = radiusB - pzs.x;
        for (var n = 0; n <= intervals; n++) {
          var rad = (begin + n * step) * deg2rad;
          var pts = new BIPoint(pzs.x + zradius * Math.cos(rad), zradius * Math.sin(rad));
          var pt = standardPointToView(pts, zeroX, zeroY, k, x, y, orient);
          ptList.push(pt);
        }
        drawPolygon(ptList, "#9a79dd", ctx);
      }
      ctx.font = "9px Courier New";
      ctx.fillStyle = "#32cd32";
      ctx.fillText(id, po.x, po.y + 9);
    }
  });
}

function drawInput() {
  draw(subject_width, subject_length);
}

function standardPointToView(src, zeroX, zeroY, k, sensorX, sensorY, orient) {
  var deg2rad = Math.PI / 180;
  var orientCos = Math.cos(orient * deg2rad);
  var orientSin = Math.sin(orient * deg2rad);
  var x = src.x * orientCos - src.y * orientSin;
  var y = src.x * orientSin + src.y * orientCos;
  return new BIPoint(Number(zeroX - k * (sensorY + y)), Number(zeroY - k * (sensorX + x)));
}

$('[name=sensor_alias]').blur(function () {
  $(this).hide();
  $(this).prev().show();
  if ($(this).val().trim().length != 0) {
    $(this).prev().text($(this).val());
    setConfig();
  }
})
$(".sensor_alias").click(function () {
  $(this).hide().next().show().val($(this).text()).select();
})
$('.container').on("input", "[type=number]", function () {
  setConfig();
}).on("blur", "[type=number]", function () {
  var val = compareVal(this, $(this).val());
  $(this).val(val).attr('value', val);
});

$(document).keydown(function (e) {
  if (e.keyCode == 13) {
    $('[name=sensor_alias]').hide();
    $('[name=sensor_alias]').prev().show();
    if ($("[name=sensor_alias]").val().trim().length != 0) {
      $('.sensor_alias').text($('[name=sensor_alias]').val());
      setConfig();
    }
  }
});

/**
 * 画多边形
 * @param {} arr 点
 * @param {*} color 颜色 
 * @param {*} ctx 上下文
 */
function drawPolygon(arr, color, ctx) {
  ctx.beginPath();
  ctx.moveTo(arr[0].x, arr[0].y);
  for (var i = 1; i < arr.length; i++) {
    ctx.lineTo(arr[i].x, arr[i].y);
  }
  ctx.strokeStyle = color;
  ctx.closePath();
  ctx.stroke();
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
$('[name]').change(function () {
  if ($(this).attr("name") != "sensor_alias") setConfig();
});

function widthChange() {
  draw(subject_width, subject_length);
}

function lengthChange() {
  draw(subject_width, subject_length);
}

/**
 * 判断中英文
 */
function changeLanguage(type) {
  if (type == 1) {
    $('[language]').each(function () {
      var value = $(this).attr('language');
      $(this).text(en[value])
    });
    not_config = en["not_config"];
  } else {
    $('[language]').each(function () {
      var value = $(this).attr('language');
      $(this).text(cn[value])
    });
    not_config = cn["not_config"];
  }
}
$('.container>.left>.top>a').click(function () {
  $(this).hide();
  $(this).next().show();
  $(this).next().val($(this).text());
});
//选择报文
$('#final_msg').click(function () {
  var originID = $(this).text().lastIndexOf(not_config) != -1 ? null : $(this).attr('val');
  biSelectBusMessage("TargetMessage", originID);
});

function biOnSelectedBusMessage(key, info) {
  var type = biGetLanguage();
  if (key == "TargetMessage") {
    if (info == null) {
      $('#final_msg').removeAttr("val");
      $('#final_msg').text(not_config);
      $('#final_msg').removeClass('green').addClass('red');
    } else {
      $('#final_msg').attr("val", info.id);
      $('#final_msg').text(info.name);
      $('#final_msg').addClass('green');
    }
  }
  setConfig();
}

function biOnQueriedBusMessageInfo(key, info) {
  if (key == "TargetMessage") {
    if (info != null) {
      $('#final_msg').attr("val", info.id);
      $('#final_msg').text(info.name);
      $('#final_msg').addClass('green');
    } else {
      $('#final_msg').text($('#final_msg').attr("val"));
      $('#final_msg').addClass('red').removeClass("green");
    }

  }
  setConfig();
}
var signalObj;
//选择信号
function selectSignal(obj) {
  var scale = $(obj).attr('scaleVal');
  var originID = $(obj).text().lastIndexOf(not_config) != -1 ? null : $(obj).attr('val');
  signalObj = obj;
  scale = Number(scale);
  var unit = $(obj).attr("unit");
  biSelectSignal("TargetSignal", originID, false, originID, true, scale, "[" + unit + "]");
}

function biOnSelectedSignal(key, valueInfo, signBitInfo, scale) {
  if (key == "TargetSignal") {
    if (valueInfo == null) {
      $(signalObj).removeClass('green').addClass('red');
      $(signalObj).text(not_config).removeAttr('val');
    } else if (valueInfo.typeName == undefined) {
      $(signalObj).text($(signalObj).attr('val'));
      $(signalObj).addClass('red').removeClass('green');
    } else {
      $(signalObj).text(valueInfo.typeName + ":" + valueInfo.signalName);
      $(signalObj).attr("val", valueInfo.id);
      $(signalObj).attr('scaleVal', scale);
      $(signalObj).addClass('green');
      $(signalObj).parent().attr('title', valueInfo.typeName + ':' + valueInfo.signalName)
    }
  }
  setConfig();
}

function biOnQueriedSignalInfo(key, info) {
  if (key == "TargetSignal") {
    biAlert(info.id + "\n" + info.category + "\n" + info.typeID + "\n" + info.typeName + "\n" + info.signalName, null);
  }
  if (info != null) {
    $('#' + key).addClass('green').removeClass('red');
    $('#' + key).text(info.typeName + ':' + info.signalName).attr('val', info.id);
    $('#' + key).parent().attr('title', info.typeName + ':' + info.signalName)
  } else {
    $('#' + key).addClass('red').removeClass('green');
    $('#' + key).text($('#' + key).attr('val')).attr('val', $('#' + key).attr('val'))
  }
  setConfig();
}

//添加
$('.add').click(function () {
  var len = $(".box").length;
  $getParagraph = $(".box").clone(true);
  $($getParagraph[0]).find('.identify').text("ID:" + len);
  $('.bottom').append($getParagraph[0]);
  $('.remove_all').removeClass('disabled');
  draw(subject_width, subject_length);
  initBottom();
  setConfig();
});
//移除所有
$('.remove_all').click(function () {
  if ($(this).hasClass('disabled')) return;
  var i = 1;
  while (i < $('.box').length) {
    $('.box')[i].remove();
    i = 1;
  }
  $('.remove_all').addClass('disabled');
  draw(subject_width, subject_length);
  setConfig();
});
//移除
function remove(obj) {
  var index = $(obj).parent().parent().parent().index();
  $('.box')[index].remove();
  $('.bottom>.box').each(function (i, v) {
    if (i > index - 1) {
      var n = Number($(this).find('.identify').text().split(":")[1]);
      n = n - 1;
      $(this).find('.identify').text("ID:" + n);
    }
  });
  initBottom();
  draw(subject_width, subject_length);
  setConfig();
  var len = $('.bottom>.box').length;
  if (len <= 1) $('.remove_all').addClass('disabled');
}

//向上交换数据
function moveUp(obj) {
  if ($(obj).hasClass('disabled')) return;
  var prev = $(obj).parent().parent().parent().prev();
  var scaleVal = $(obj).parent().parent().parent().find('.signal').attr("scaleVal");
  var val = $(obj).parent().parent().parent().find('.signal').attr("val");
  var html = $(obj).parent().parent().parent().find('.signal').text();
  var signal = $(obj).parent().parent().parent().find('.signal');
  var v = $(prev).find('.signal').attr('val');
  $(obj).parent().parent().parent().find('.signal').attr("scaleVal", $(prev).find('.signal').attr('scaleVal'));
  if (v == undefined) {
    $(obj).parent().parent().parent().find('.signal').removeAttr("val");
  } else {
    $(obj).parent().parent().parent().find('.signal').attr("val", v);
  }
  $(obj).parent().parent().parent().find('.signal').text($(prev).find('.signal').text());
  $(prev).find('.signal').attr("scaleVal", scaleVal);
  if (val == undefined) {
    $(prev).find('.signal').removeAttr("val");
  } else {
    $(prev).find('.signal').attr("val", val);
  }
  $(prev).find('.signal').text(html);
  $(obj).parent().parent().parent().find('[name]').each(function (i, v) {
    var val = $(this).val();
    $(this).val($($(prev).find('[name]')[i]).val());
    $($(prev).find('[name]')[i]).val(val);
  });
  if ($(prev).find('.signal').text().lastIndexOf(not_config) == -1) {
    $(prev).find('.signal').removeClass('red').addClass('green')
  } else {
    $(prev).find('.signal').removeClass('green').addClass('red')
  }
  if ($(obj).parent().parent().parent().find('.signal').text().lastIndexOf(not_config) == -1) {
    signal.removeClass('red').addClass('green')
  } else {
    signal.removeClass('green').addClass('red')
  }
  $(prev).find('.signal').removeAttr('style');
  $(obj).parent().parent().parent().find('.signal').removeAttr('style');
  biQuerySignalInfo($(prev).find('.signal').attr('id'), $(prev).find('.signal').attr('val'));
  biQuerySignalInfo($(obj).parent().parent().parent().find('.signal').attr('id'), $(obj).parent().parent().parent().find('.signal').attr('val'))
  draw(subject_width, subject_length);
  setConfig();
}

//向下交换数据
function moveDown(obj) {
  if ($(obj).hasClass('disabled')) return;
  var next = $(obj).parent().parent().parent().next();
  var scaleVal = $(obj).parent().parent().parent().find('.signal').attr("scaleVal");
  var val = $(obj).parent().parent().parent().find('.signal').attr("val");
  var html = $(obj).parent().parent().parent().find('.signal').text();
  var signal = $(obj).parent().parent().parent().find('.signal');
  var v = $(next).find('.signal').attr('val');
  $(obj).parent().parent().parent().find('.signal').attr("scaleVal", $(next).find('.signal').attr('scaleVal'));
  if (v == undefined) {
    $(obj).parent().parent().parent().find('.signal').removeAttr("val");
  } else {
    $(obj).parent().parent().parent().find('.signal').attr("val", v);
  }
  $(obj).parent().parent().parent().find('.signal').text($(next).find('.signal').text());
  $(next).find('.signal').attr("scaleVal", scaleVal);
  if (val == undefined) {
    $(next).find('.signal').removeAttr("val");
  } else {
    $(next).find('.signal').attr("val", val);
  }

  $(next).find('.signal').text(html);
  $(obj).parent().parent().parent().find('[name]').each(function (i, v) {
    var val = $(this).val();
    $(this).val($($(next).find('[name]')[i]).val());
    $($(next).find('[name]')[i]).val(val);
  });
  if ($(next).find('.signal').text().lastIndexOf(not_config) == -1) {
    $(next).find('.signal').removeClass('red').addClass('green')
  } else {
    $(next).find('.signal').removeClass('green').addClass('red')
  }
  if ($(obj).parent().parent().parent().find('.signal').text().lastIndexOf(not_config) == -1) {
    signal.removeClass('red').addClass('green')
  } else {
    signal.removeClass('green').addClass('red')
  }
  $(next).find('.signal').removeAttr('style');
  $(obj).parent().parent().parent().find('.signal').removeAttr('style');
  biQuerySignalInfo($(next).find('.signal').attr('id'), $(next).find('.signal').attr('val'));
  biQuerySignalInfo($(obj).parent().parent().parent().find('.signal').attr('id'), $(obj).parent().parent().parent().find('.signal').attr('val'))
  draw(subject_width, subject_length);
  setConfig();
}

function initBottom() {
  var len = $('.bottom>.box').length;
  if (len == 2) {
    $('.bottom>div:eq(1)').find('[language=move_up]').addClass("disabled");
    $('.bottom>div:eq(1)').find('[language=move_down]').addClass("disabled");
  } else if (len == 3) {
    $('.bottom>div:eq(1)').find('[language=move_down]').removeClass("disabled");
    $('.bottom>div:eq(1)').find('[language=move_up]').addClass("disabled");
    $('.bottom>div:eq(2)').find('[language=move_down]').addClass("disabled");
  } else if (len > 3) {
    $('.bottom>.box').each(function (i, v) {
      if (i > 1 && i < len - 1) {
        $('.bottom>div:eq(' + i + ')').find('[language=move_down]').removeClass("disabled");
      }
    });
    $('.bottom>div:eq(1)').find('[language=move_up]').addClass("disabled");
    $('.bottom>div:eq(' + (len - 1) + ')').find('[language=move_down]').addClass("disabled");
  }
  draw(subject_width, subject_length);
  setConfig();
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
/**
 * 加载配置
 */
function loadConfig(val) {
  if (val == null) return;
  console.log(val);
  if (val["enabled"] == "yes") $('[name=enabled]').attr('checked', true);
  if (val["final_msg"] != "") {
    $('#final_msg').attr('val', val["final_msg"]);
    biQueryBusMessageInfo("TargetMessage", val["final_msg"]);
  }
  console.log(val["sensor_alias"]);
  $('.sensor_alias').text(val["sensor_alias"].trim().length == 0 ? "Ultra-sound data by CAN" : val["sensor_alias"]);
  var arr = val['arr'];
  for (var i = 1; i <= arr.length; i++) {
    var o = arr[i - 1];
    $box = $('.box').clone(true);
    $box.find('.identify').text("ID:" + i);
    $box.find('[name]').each(function () {
      var name = $(this).attr('name');
      var type = $(this).attr('type');
      if (type == "number") {
        $(this).val(compareVal(this, o[name]));
      } else {
        $(this).val(o[name]);
      }
    });
    $('.container>.left>.bottom').append($box[0]);
    if (o["signal"] != "null") {
      $box.find('.signal').attr('id', 'box' + i)
      var id = $box.find('.signal').attr('id');
      $box.find('.signal').attr('scaleVal', o["scale"]).attr('val', o["signal"]);
      biQuerySignalInfo(id, o["signal"]);
    }
    $('.container>.left>.bottom').append($box[0]);
  }
  if (arr.length > 0) $('[language=remove_all]').removeClass('disabled');
  initBottom();
  //获取本车width,length
  biQueryGlobalVariable("Subject.VehicleWidth", null);
  biQueryGlobalVariable("Subject.VehicleLength", null);
}

var subject_width = -1,
  subject_length = -1;

function biOnQueriedGlobalVariable(id, value) {
  if (id == "Subject.VehicleWidth") subject_width = Number(value);
  if (id == "Subject.VehicleLength") subject_length = Number(value);
  if (subject_length != -1 && subject_width != -1) {
    draw(subject_width, subject_length);
  }
}

/**
 * 写配置
 */

function setConfig() {
  var text = "<?xml version=\"1.0\" encoding=\"utf-8\"?>";
  text += "<root enabled=\"" + ($('[name=enabled]').get(0).checked ? "yes" : "no") + "\"";
  text += " final_msg=\"" + ($('#final_msg').attr("val") == undefined ? "" : $('#final_msg').attr("val")) + "\"";
  text += " sensor_alias=\"" + $('.sensor_alias').text() + "\">";
  $('.container>.left>.bottom>div').each(function (i, v) {
    if (i != 0) {
      text += "<sub";
      $(this).find('[name]').each(function () {
        var key = $(this).attr('name');
        if (!$(this).is(':hidden')) {
          var v = Number($(this).val());
          var value;
          if (!isNaN(v) && $(this).val() != "") {
            value = compareVal(this, $(this).val());
          } else {
            value = $(this).attr('value');
          }
          text += " " + key + "=\"" + value + "\"";
        }
      });
      text += " signal" + "=\"" + ($(this).find('.signal').attr('val') == undefined ? null : $(this).find('.signal').attr('val')) + "\"";
      text += " scale" + "=\"" + $(this).find('.signal').attr('scaleVal') + "\"/>";
    }
  });
  text += "</root>";
  biSetModuleConfig("ultrasound-sensor-by-can.pluginsensor", text);
}

function biOnInitEx(config, moduleConfigs) {
  var type = biGetLanguage();
  changeLanguage(type);
  for (var key in moduleConfigs) {
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(moduleConfigs[key], "text/xml");
    var countrys = xmlDoc.getElementsByTagName('root');
    var keys = countrys[0].attributes;
    var obj = new Object();
    for (var i = 0; i < keys.length; i++) {
      obj[keys[i].nodeName] = keys[i].nodeValue;
    };
    var arr = [];
    for (var i = 0; i < countrys[0].childNodes.length; i++) {
      var eKeys = countrys[0].childNodes[i].attributes;
      var eObj = new Object();
      for (var n = 0; n < eKeys.length; n++) {
        eObj[eKeys[n].nodeName] = eKeys[n].nodeValue;
      }
      arr.push(eObj);
    }
    obj["arr"] = arr;
    loadConfig(obj);
  }
}