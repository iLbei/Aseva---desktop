var not_config = "",
  areU = "",
  confirm = "",
  fov_cfg = "",
  dialogConfig = [];

function ObjectSignal() {
  this.ed = null,
    this.vl_s = null,
    this.vl_v = "0",
    this.conf_s = null,
    this.conf_l = "1",
    this.id_s = null,
    this.ag_s = null,
    this.dx_s = null,
    this.dx_l = "1",
    this.dy_s = null,
    this.dy_l = "1",
    this.dz_s = null,
    this.dz_l = "1",
    this.dxs_s = null,
    this.dxs_l = "1",
    this.dys_s = null,
    this.dys_l = "1",
    this.dzs_s = null,
    this.dzs_l = "1",
    this.vx_s = null,
    this.vx_l = "1",
    this.vy_s = null,
    this.vy_l = "1",
    this.ax_s = null,
    this.ax_l = "1",
    this.ay_s = null,
    this.ay_l = "1",
    this.hd_s = null,
    this.hd_l = "1",
    this.wi_s = null,
    this.wi_l = "1",
    this.le_s = null,
    this.le_l = "1",
    this.hei_s = null,
    this.hei_l = "1",
    this.cl_s = null,
    this.clc_s = null,
    this.clc_l = "1",
    this.fc = "1",
    this.kof_s = null,
    this.kof_v = "0",
    this.kol_s = null,
    this.kol_v = "0",
    this.kor_s = null,
    this.kor_v = "0",
    this.rcs_s = null,
    this.rcs_l = "1"
}

$(function () {
  $('.container>.c1').show().siblings('.c').hide();
});

function draw(obj, pox, poy, pyaw, arr, w, l) {
  var width = 15 * w,
    length = 15.2 * l;
  var canvas = $(obj)[0];
  var ctx = canvas.getContext('2d');
  var zeroX = canvas.width * 0.5;
  var zeroY = canvas.height * 0.3;
  var k = 15;
  var deg2rad = Math.PI / 180;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  var h = canvas.height * 0.3;
  var p1 = new BIPoint(canvas.width / 2, 0);
  var p2 = new BIPoint(canvas.width / 2, canvas.height);
  var p3 = new BIPoint(0, h);
  var p4 = new BIPoint(canvas.width, h);
  drawLine(p1, p2, 1, "#e9e9e9", ctx);
  drawLine(p3, p4, 1, "#e9e9e9", ctx);
  var size = new BISize(width, length);
  var p5 = new BIPoint(canvas.width / 2 - width / 2, h);
  drawRect(p5, size, "black", ctx);
  var p6 = new BIPoint(canvas.width / 2, h);
  var p7 = new BIPoint(canvas.width / 2 - width / 2, h + length / 4);
  var p8 = new BIPoint(canvas.width / 2 + width / 2, h + length / 4);
  var array = [p6, p7, p8];
  drawPolygon(array, "black", ctx);
  p8 = new BIPoint(canvas.width / 2 - poy * 15, h - (24 + pox * 24 / 1.5));
  var p9 = new BIPoint(canvas.width / 2 - poy * 15, h - pox * 24 / 1.5);
  var p10 = new BIPoint(canvas.width / 2 - (15 + poy * 15), h - pox * 24 / 1.5);
  ctx.save();
  ctx.translate(p9.x, p9.y);
  ctx.rotate(Math.PI / 180 * (0 - pyaw));
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
  if (arr == undefined) return
  for (var j = 0; j < arr.length; j++) {
    var angle = Number(arr[j].angle_range);
    var x = Number(arr[j].posx);
    var y = Number(arr[j].posy);
    var yaw = Number(arr[j].orient);
    var distPQ = Math.cos(deg2rad * angle * 0.5) * zeroY;
    var halfPQ = Math.sin(deg2rad * angle * 0.5) * zeroY;
    var p13 = new BIPoint(0, 0);
    var p11 = new BIPoint(distPQ, halfPQ);
    var p12 = new BIPoint(distPQ, -halfPQ);
    var po = standardPointToView(p13, zeroX, zeroY, k, x, y, yaw);
    var ps = standardPointToView(p11, zeroX, zeroY, k, x, y, yaw);
    var pb = standardPointToView(p12, zeroX, zeroY, k, x, y, yaw);
    drawArc(po, "#9a79dd", ctx, 10, Math.PI * (1.5 + angle * 0.5 / 180 - yaw / 180), Math.PI * (1.5 - angle * 0.5 / 180 - yaw / 180));
    if (angle == 360) {
      var p1 = new BIPoint(po.x - 10, po.y);
      var p2 = new BIPoint(po.x + 10, po.y);
      var p3 = new BIPoint(po.x, po.y - 10);
      var p4 = new BIPoint(po.x, po.y + 10);
      drawLine(p1, p2, 1, "#9a79dd", ctx);
      drawLine(p3, p4, 1, "#9a79dd", ctx);
    } else {
      drawLine(po, ps, 1, "#9a79dd", ctx);
      drawLine(po, pb, 1, "#9a79dd", ctx);
    }
  }
}

function standardPointToView(src, zeroX, zeroY, k, sensorX, sensorY, orient) {
  var deg2rad = Math.PI / 180;
  var orientCos = Math.cos(orient * deg2rad);
  var orientSin = Math.sin(orient * deg2rad);
  var x = src.x * orientCos - src.y * orientSin;
  var y = src.x * orientSin + src.y * orientCos;
  return new BIPoint(Number(zeroX - k * (sensorY + y)), Number(zeroY - k * (sensorX + x)));
}

$('.container [name]').change(function () {
  if ($(this).attr("name") != "alias") setConfig();
});

$('[type=number]').blur(function () {
  var max = Number($(this).attr('max'));
  var min = Number($(this).attr('min'));
  var v = Number($(this).val());
  v = v < min ? min : v;
  v = v > max ? max : v;
  var step = $(this).attr('step').length - 2;
  if (step <= -1) {
    $(this).val(v.toFixed(0)).attr('value', v);
  } else {
    $(this).val(v.toFixed(step)).attr('value', v);
  }
});

/**
 * 
 * @param {*} origin 原点
 * @param {*} color 颜色
 * @param {*} ctx 画图上下文
 * @param {*} radius 半径
 */
function drawArc(origin, color, ctx, radius, e, s) {
  ctx.beginPath();
  ctx.lineWidth = 1;
  ctx.strokeStyle = color;
  ctx.arc(origin.x, origin.y, radius, e, s, true);
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

$('.alias').click(function (e) {
  e.stopPropagation();
  $(this).hide();
  $(this).next().show();
  if ($(this).text() == "") return;
  $(this).next().val($(this).text()).select();
});

$('[name=alias]').blur(function () {
  $(this).hide();
  $(this).prev().show();
  if ($(this).val().trim().length == 0) return;
  $(this).prev().text($(this).val());
  setConfig();
});
$("body").keydown(function (e) {
  var i = $(".white").index() + 1;
  if (e.keyCode == 13) {
    $(".c" + i).find("[name=alias]").hide();
    $(".c" + i).find(".alias").show();
    if ($(".c" + i).find("[name=alias]").val().trim().length == 0) return;
    $(".c" + i).find(".alias").val($(".c" + i).find("[name=alias]").val());
    setConfig();
  }
})

$('[name=rad]').click(function () {
  $(this).addClass('white').siblings().removeClass('white');
  var num = $(this).index();
  $('.container>.c:eq(' + num + ')').show().siblings('.c').hide();
  numFov = -1;
  loadOne($(".white").index() + 1);
});

// $('[name=alias]').click(function (e) {
//   e.stopPropagation();
// });

function changeXY(obj) {
  checkNumber(obj);
  var parent = $(obj).parent().parent().parent().parent().parent().parent().parent().parent();
  var x = Number($(parent).find('[name=offset_x]').val());
  var y = Number($(parent).find('[name=offset_y]').val());
  var yaw = Number($(parent).find('[name=yaw_angle]').val());
  var index = $(parent).index() - 1;
  var fovSetting = dialogConfig[index]["childAttr"]["fov"];;
  draw($(parent).find('canvas'), x, y, yaw, fovSetting, subject_width, subject_length);
  setConfig();
}

function changeXYInput(obj) {
  var max = Number($(obj).attr('max'));
  var min = Number($(obj).attr('min'));
  var v = Number($(obj).val());
  if (v < min || v > max) return
  var parent = $(obj).parent().parent().parent().parent().parent().parent().parent().parent();
  var x = Number($(parent).find('[name=offset_x]').val());
  var y = Number($(parent).find('[name=offset_y]').val());
  var yaw = Number($(parent).find('[name=yaw_angle]').val());
  var index = $(parent).index() - 1;
  var fovSetting = dialogConfig[index]["childAttr"]["fov"];
  draw($(parent).find('canvas'), x, y, yaw, fovSetting, subject_width, subject_length);
}

function checkNumber(obj) {
  var max = Number($(obj).attr('max'));
  var min = Number($(obj).attr('min'));
  var v = Number($(obj).val());
  v = v < min ? min : v;
  v = v > max ? max : v;
  $(obj).val(v).attr('value', v);
}

function changeYaw(obj) {
  checkNumber(obj);
  var parent = $(obj).parent().parent().parent().parent().parent().parent().parent();
  var x = Number($(parent).find('[name=offset_x]').val());
  var y = Number($(parent).find('[name=offset_y]').val());
  var yaw = Number($(parent).find('[name=yaw_angle]').val());
  var index = $(parent).index() - 1;
  var fovSetting = dialogConfig[index]["childAttr"]["fov"];
  draw($(parent).find('canvas'), x, y, yaw, fovSetting, subject_width, subject_length);
  setConfig();
}

function changeYawInput(obj) {
  var max = Number($(obj).attr('max'));
  var min = Number($(obj).attr('min'));
  var v = Number($(obj).val());
  if (v < min || v > max) return
  var parent = $(obj).parent().parent().parent().parent().parent().parent().parent();
  var x = Number($(parent).find('[name=offset_x]').val());
  var y = Number($(parent).find('[name=offset_y]').val());
  var yaw = Number($(parent).find('[name=yaw_angle]').val());
  var index = $(parent).index() - 1;
  var fovSetting = dialogConfig[index]["childAttr"]["fov"];
  draw($(parent).find('canvas'), x, y, yaw, fovSetting, subject_width, subject_length);
}

var indexFov = -1,
  numFov = -1,
  isFovFlag = false;

//删除
function remove(obj) {
  dialogConfig[$(".white").index()].childAttr.fov.splice($(obj).parents(".box"), 1);
  var fovSetting = dialogConfig[$(".white").index()]["childAttr"]["fov"];
  var x = dialogConfig[$(".white").index()]["attr"].offset_x;
  var y = dialogConfig[$(".white").index()]["attr"].offset_y;
  var yaw = dialogConfig[$(".white").index()]["attr"].yaw_angle;
  draw($(obj).parents(".w187").next().find('canvas'), x, y, yaw, fovSetting, subject_width, subject_length);
  $(obj).parents(".box").remove();
  setConfig();
}

//object添加
function addObject(obj) {
  var index = $(obj).parent().parent().parent().parent().parent().index() - 1;
  $box = $(obj).parent().parent().next().children('div:first-of-type').clone(true);
  $box.find('.dx_s').removeClass('green').removeAttr('val').attr('scale', "1").text(not_config);
  $box.find('.dy_s').removeClass('green').removeAttr('val').attr('scale', "1").text(not_config);
  var count = $(obj).parent().parent().next().children().length;
  $box.find('.number').text(count + 1);
  $box.children('.right').removeClass('hide');
  $(obj).parent().parent().next().append($box[0]);
  dialogConfig[$(".white").index()].childAttr.object.push({
    ag_s: "null",
    ax_l: "1",
    ax_s: "null",
    ay_l: "1",
    ay_s: "null",
    cl_s: "null",
    clc_l: "1",
    clc_s: "null",
    conf_l: "1",
    conf_s: "null",
    dx_l: "1",
    dx_s: "null",
    dxs_l: "1",
    dxs_s: "null",
    dy_l: "1",
    dy_s: "null",
    dys_l: "1",
    dys_s: "null",
    dz_l: "1",
    dz_s: "null",
    dzs_l: "1",
    dzs_s: "null",
    ed: "null",
    fc: "1",
    hd_l: "1",
    hd_s: "null",
    hei_l: "1",
    hei_s: "null",
    id_s: "null",
    kof_s: "null",
    kof_v: "0",
    kol_s: "null",
    kol_v: "0",
    kor_s: "null",
    kor_v: "0",
    le_l: "1",
    le_s: "null",
    rcs_l: "1",
    rcs_s: "null",
    vl_s: "null",
    vl_v: "0",
    vx_l: "1",
    vx_s: "null",
    vy_l: "1",
    vy_s: "null",
    wi_l: "1",
    wi_s: "null"
  })
  $(obj).parents(".w373").find(".content .box>div.right").removeClass('hide');
  setConfig();
}

function removeBox(obj) {
  var content = $(obj).parent().parent();
  var index = $(obj).parent().index();
  var indexP = $(obj).parent().parent().parent().parent().parent().index();
  var count = $(content).children().length;
  $(content).children().each(function (i, v) {
    if (i == index) $(this).remove();
    if (i > index) {
      $(this).find('.number').text(i);
    }
  });
  if (count == 2) $(content).children('div:first-of-type').children('.right').addClass('hide');
  dialogConfig[indexP - 1]["childAttr"].object.splice(index, 1);
  setConfig();
}

//下拉框改变
function changeClassMode(obj) {
  var value = $(obj).val();
  if (value == "1") {
    $(obj).parent().parent().find('[type=text]').attr('disabled', true).addClass('disabled_background disabled_a');
    $(obj).parent().parent().find('a').addClass('disabled_a');
  } else {
    $(obj).parent().parent().find('[type=text]').removeAttr('disabled').removeClass('disabled_background disabled_a');
    $(obj).parent().parent().find('a').removeClass('disabled_a');
  }
}

function changeKoFrontMode(obj) {
  var value = $(obj).val();
  switch (value) {
    case "0":
      $(obj).parent().parent().find('[type=number]').attr('disabled', true).addClass("disabled_background");
      $(obj).parent().next().next().next().find('select').attr('disabled', true).addClass("disabled_background");
      $(obj).parent().parent().find('a').addClass('disabled_a');
      break;
    case "1":
      $(obj).parent().parent().find('[type=number]').removeAttr('disabled').removeClass("disabled_background");
      $(obj).parent().next().next().next().find('select').attr('disabled', true).addClass("disabled_background");
      $(obj).parent().parent().find('a').addClass('disabled_a');
      break;
    case "2":
      $(obj).parent().parent().find('[type=number]').attr('disabled', true).addClass("disabled_background");
      $(obj).parent().next().next().next().find('select').removeAttr('disabled', true).removeClass("disabled_background");
      $(obj).parent().parent().find('a').removeClass('disabled_a');
      break;
    case "3":
      $(obj).parent().parent().find('[type=number]').attr('disabled', true).addClass("disabled_background");
      $(obj).parent().next().next().next().find('select').attr('disabled', true).addClass("disabled_background");
      $(obj).parent().parent().find('a').addClass('disabled_a');
      break;
  }
}

function changeDMode(obj) {
  var type = biGetLanguage();
  var value = $(obj).val();
  var dx, dy;
  if (value == "dx_dy") {
    dx = type == 1 ? "DX[m]" : "DX[米]";
    dy = type == 1 ? "DY[m]" : "DY[米]";
  } else if (value == "rng_azm") {
    dx = type == 1 ? "Rng[m]" : "Rng[米]";
    dy = type == 1 ? "Azm[deg]" : "Azm[度]";
  }
  $(obj).parent().parent().parent().next().children('.content').find('[language=dx]').text(dx);
  $(obj).parent().parent().parent().next().children('.content').find('[language=dy]').text(dy);
  setConfig();
}

function wipeBlue(obj) {
  $(obj).parent().parent().children('div:first-of-type').removeClass('blue2');
  $(obj).parent().parent().children('div:nth-of-type(2)').children().removeClass('blue1');
  $(obj).parent().parent().children('div:nth-of-type(3)').children().removeClass('blue1');
}

function selectAll() {
  $('.duplicate>.content .table>.body>div').each(function () {
    $(this).children('div:first-of-type').addClass('blue2');
    $(this).find('input').addClass('blue1');
  });
  $('.duplicate>.content .table>.top>div:first-of-type').addClass('all');
}

var obj_signal

function removeAll(obj) {
  biConfirm("removeAll", areU, confirm);
  obj_signal = obj;
}

function biOnResultOfConfirm(key, result) {
  if (key == "removeAll" && result) yes();
}

function yes() {
  var content = $(obj_signal).parent().parent().next();
  $(content).children().each(function (i, v) {
    if (i != 0) $(this).remove();
  });
  $(content).children("div:first-of-type").children('.right').addClass('hide');
  $(content).children("div:first-of-type").find('.dx_s').parent().removeAttr('title');
  $(content).children("div:first-of-type").find('.dy_s').parent().removeAttr('title');
  $(content).children("div:first-of-type").find('.dx_s').attr('scale', "1").addClass('red').removeAttr('val').removeClass('green').text(not_config);
  $(content).children("div:first-of-type").find('.dy_s').attr('scale', "1").addClass('red').removeAttr('val').removeClass('green').text(not_config);
  var index = $(content).parent().parent().parent().index() - 1;
  dialogConfig[index]["childAttr"].object = [{
    ag_s: "null",
    ax_l: "1",
    ax_s: "null",
    ay_l: "1",
    ay_s: "null",
    cl_s: "null",
    clc_l: "1",
    clc_s: "null",
    conf_l: "1",
    conf_s: "null",
    dx_l: "1",
    dx_s: "null",
    dxs_l: "1",
    dxs_s: "null",
    dy_l: "1",
    dy_s: "null",
    dys_l: "1",
    dys_s: "null",
    dz_l: "1",
    dz_s: "null",
    dzs_l: "1",
    dzs_s: "null",
    ed: "null",
    fc: "1",
    hd_l: "1",
    hd_s: "null",
    hei_l: "1",
    hei_s: "null",
    id_s: "null",
    kof_s: "null",
    kof_v: "0",
    kol_s: "null",
    kol_v: "0",
    kor_s: "null",
    kor_v: "0",
    le_l: "1",
    le_s: "null",
    rcs_l: "1",
    rcs_s: "null",
    vl_s: "null",
    vl_v: "0",
    vx_l: "1",
    vx_s: "null",
    vy_l: "1",
    vy_s: "null",
    wi_l: "1",
    wi_s: "null"
  }]
  setConfig();
}

//Signal
class Signal {
  constructor(name, signal, title) {
    this.name = name;
    this.signal = signal;
    this.title = title;
  }
}

function replaceMessage(messageID, iDOffset, type) {
  if (messageID == null) return null;
  var comps = messageID.split(':');
  if (comps.length != 2) return null;
  var id = Number(comps[1]);
  var ret = comps[0] + ":" + (id + iDOffset);
  biQueryBusMessageInfo(ret + ":" + type, ret);
  return null;
}

function replaceSignal(signalID, signBitSignalID, replaceText, idOffset, replaceWithText, type) {
  if (signalID != null) {
    var comps = signalID.split(':');
    if (comps.length == 3) {
      var id = Number(comps[1]);
      if (!isNaN(id)) {
        if (replaceText.length > 0 && replaceWithText.length > 0) comps[2] = comps[2].replace(replaceText, replaceWithText);
        var signalID2 = comps[0] + ":" + (id + idOffset) + ":" + comps[2];
        biQuerySignalInfo(signalID2 + ":" + type, signalID2);
      }
    }
  }
  if (signBitSignalID != null) {
    var comps = signBitSignalID.split(':');
    if (comps.length == 3) {
      var id = Number(comps[1]);
      if (!isNaN(id)) {
        if (replaceText.length > 0 && replaceWithText.length > 0) comps[2] = comps[2].replace(replaceText, replaceWithText);
        var signBitSignalID2 = comps[0] + ":" + (id + item.IDOffset) + ":" + comps[2];
        biQuerySignalInfo(signBitSignalID2 + ":" + type, signBitSignalID2);
      }
    }
  }
  return null;
}

function SignalConfig() {
  this.scale;
  this.signalID;
  this.signBitSignalID;
}

function arrayMin(nums) {
  var min = 2147483647;
  for (var item in nums) {
    if (min > item) {
      min = item;
    }
  }
  return min;
}

function levenshtein(str1, str2) {
  var char1 = str1.split("");
  var char2 = str2.split("");
  var len1 = char1.length;
  var len2 = char2.length;
  var dif = new Array();
  for (var i = 0; i < len1 + 1; i++) {
    dif[i] = new Array();
    for (var j = 0; j < len2 + 1; j++) {
      dif[i][j] = i + j;
    }
  }
  for (var a = 0; a <= len1; a++) {
    dif[a][0] = a;
  }
  for (var a = 0; a <= len2; a++) {
    dif[0][a] = a;
  }
  var temp;
  for (var i = 1; i <= len1; i++) {
    for (var j = 1; j <= len2; j++) {
      if (char1[i - 1] == char2[j - 1]) {
        temp = 0;
      } else {
        temp = 1;
      }
      dif[i][j] = arrayMin([dif[i - 1][j - 1] + temp, dif[i][j - 1] + 1, dif[i - 1][j] + 1]);
    }
  }
  var similarity = 1 - parseFloat(dif[len1][len2]) / Math.max(len1, len2);
  return similarity;
}

function fuzzyMatch(messageGlobalID, signalName, refNames) {
  if (refNames == null || refNames.length == 0) return null;
  if (refNames.indexOf(signalName) != -1) return messageGlobalID + ":" + signalName;
  var targetName = null;
  var targetSim = 0;
  for (var i = 0; i < refNames.length; i++) {
    var sim = levenshtein(signalName, refNames[i]);
    if (sim > targetSim) {
      targetSim = sim;
      targetName = refNames[i];
    }
  }
  if (targetSim >= 0.6) return messageGlobalID + ":" + targetName;
  else return messageGlobalID + ":" + signalName;
}

var signalID = [];

function biOnQueriedSignalsInBusMessage(key, signalIDList) {
  if (key == "key1") {
    if (signalIDList != null) {
      var arr = [];
      for (var i = 0; i < signalIDList.length; i++) {
        var array = signalIDList[i].split(":");
        arr.push(array[2]);
      }
      signalID.push(arr);
    }
  } else if (key.indexOf("|") != -1) {
    var arr = key.split("|");
    $('.c' + arr[0]).find('.sampling_msg').text(info.signalName);
  }
}

//选报文
var bus;

function selectBus(obj) {
  if ($(obj).hasClass('disabled_a')) return;
  var originID = $(obj).text().lastIndexOf('(') != -1 ? null : $(obj).attr('val');
  bus = obj;
  var key = "TargetMessage";
  biSelectBusMessage(key, originID);
}

function biOnSelectedBusMessage(key, info) {
  if (info == null) {
    $(bus).removeAttr("val title");
    $(bus).text(not_config);
    $(bus).removeClass("green").addClass("red");
  } else {
    $(bus).attr({
      "val": info.id,
      "title": info.id
    });
    $(bus).text(info.name);
    $(bus).addClass("green");
  }
  setConfig();
}

function biOnQueriedBusMessageInfo(key, busMessageInfo) {
  if (key.indexOf(":") != -1) {
    var arr = key.split(":");
    if (busMessageInfo != null) {
      if (arr.length == 2) {
        $('.c' + arr[1]).find('.sampling_msg').attr("val", busMessageInfo.id);
        $('.c' + arr[1]).find('.sampling_msg').text(busMessageInfo.name);
        $('.c' + arr[1]).find('.sampling_msg').addClass("green");
      } else {
        validateNum++;
        var type = key.substring(key.lastIndexOf(":") + 1, key.length);
        c[type] = busMessageInfo.id;
      }
    } else {
      if (arr.length == 2) {
        var val = $('.c' + arr[1]).find('.sampling_msg').attr("val");
        $('.c' + arr[1]).find('.sampling_msg').text(val);
        $('.c' + arr[1]).find('.sampling_msg').removeClass("green");
      } else {
        validateNum++;
        var bus = key.substring(0, key.lastIndexOf(":"));
        var text = biGetLanguage() == 1 ? "Can't find message '" + bus + "'." : "找不到报文" + bus + ".";
        errorText.push(text);
        $('.duplicate').find('textarea').val(errorText.join("\n"));
      }
    }
  }
  setConfig();
}

/**
 * 选择信号
 * @param {} obj
 */
var signalObj = null; //选择的元素的id名
function selectSignal(obj, type, index) {
  if ($(obj).hasClass('disabled_a')) return;
  var originID = null;
  if ($(obj).text().lastIndexOf('(') == -1) originID = $(obj).attr('val');
  var scale = $(obj).attr('scale');
  scale = Number(scale);
  signalObj = obj;
  biSelectSignal("TargetSignal", originID, false, null, type, scale, "[m]");
}

function biOnSelectedSignal(key, valueInfo, signBitInfo, scale) {
  var boxI = $(".white").index();
  if (valueInfo == null) {
    $(signalObj).removeClass('green').addClass("red");
    $(signalObj).text(not_config).parent().removeAttr("title");
    $(signalObj).removeAttr("val");
    $(signalObj).attr("scale", "1");
    if ($(signalObj).hasClass('dx_s')) {
      var index = $(signalObj).parent().parent().parent().parent().index();
      dialogConfig[boxI]["childAttr"].object[index]["dx_s"] = "null";
      dialogConfig[boxI]["childAttr"].object[index]["dx_l"] = "1";
    } else if ($(signalObj).hasClass('dy_s')) {
      var index = $(signalObj).parent().parent().parent().parent().index();
      dialogConfig[boxI]["childAttr"].object[index]["dy_s"] = "null";
      dialogConfig[boxI]["childAttr"].object[index]["dy_l"] = "1";
    } else if ($(signalObj).hasClass('ko_front_index_signal') || $(signalObj).hasClass('ko_left_index_signal') || $(signalObj).hasClass('ko_right_index_signal')) {
      $(signalObj).removeClass("red");
    }
  } else if (valueInfo.typeName == undefined) {
    $(signalObj).text(valueInfo.id).parent().attr("title", "").removeClass("green").addClass('red');
  } else {
    $(signalObj).text(valueInfo.signalName).parent().attr("title", valueInfo.typeName + ":" + valueInfo.signalName);
    $(signalObj).attr("val", valueInfo.id);
    $(signalObj).attr('scale', scale);
    $(signalObj).addClass('green');
    if ($(signalObj).hasClass('dx_s')) {
      var index = $(signalObj).parent().parent().parent().parent().index();
      dialogConfig[boxI]["childAttr"].object[index]["dx_s"] = valueInfo.id;
      dialogConfig[boxI]["childAttr"].object[index]["dx_l"] = scale;
    }
    if ($(signalObj).hasClass('dy_s')) {
      var index = $(signalObj).parent().parent().parent().parent().index();
      dialogConfig[boxI]["childAttr"].object[index]["dy_s"] = valueInfo.id;
      dialogConfig[boxI]["childAttr"].object[index]["dy_l"] = scale;
    }
  }
  setConfig();
}
//检查文本框的值
function checkTextValue(obj) {
  var str = $(obj).val();
  if (str.indexOf(',') != -1) {
    var flag = false;
    var arr = str.split(","),
      newArr = [];;
    for (var i = 0; i < arr.length; i++) {
      if (arr[i] == "") {
        flag = true;
        break;
      }
      var v = Number(arr[i]);
      if (arr[i] != "") {
        if (isNaN(v)) {
          flag = true;
          break;
        }
      }
      newArr.push(v);
    }
    if (flag) {
      $(obj).addClass('red').removeClass('green');
    } else {
      $(obj).addClass('green').attr('value', newArr.join());
    }
  } else {
    var v = Number(str);
    if (!isNaN(v) && str != "") { //green
      $(obj).addClass('green').attr('value', v);
    } else if (str != "") { //red
      $(obj).addClass('red').removeClass('green');
    } else if (str == "" && $(obj).hasClass('class_signal_value')) {
      $(obj).attr('value', "");
      $(obj).val("");
    }
  }
}
$('[type=text]').bind("input propertychange", function () {
  var name = $(this).attr('name');
  if (name == "alias" || name == "input" || name == "output") return
  if (!$(this).hasClass('text')) {
    checkTextValue($(this));
  }
  if (name == "msg") {
    var val = $(this).parent().parent().parent().find('[language=validate]');
    $(this).hasClass('green') ? $(val).removeAttr('disabled').removeClass("disabled_background") : $(val).attr('disabled', true).addClass("disabled_background");
  }
  setConfig();
}).blur(function () {
  var name = $(this).attr('name');
  if (name == "alias" || name == "msg") return
  if (!$(this).hasClass('text')) {
    if ($(this).hasClass('green')) {
      var str = $(this).val();
      if (str.indexOf(",") != -1) {
        var arr = str.split(','),
          newArr = [];
        for (var i = 0; i < arr.length; i++) {
          var v = Number(arr[i]);
          newArr.push(v);
        }
        $(this).val(newArr.join()).attr('value', newArr.join());
      } else {
        if (str != "") {
          var v = Number(str);
          $(this).val(v).attr('value', v);
        } else {
          var v = $(this).attr('value');
          $(this).val(v).attr('value', v);
        }
      }
    } else if ($(this).hasClass('red')) {
      var v = $(this).attr('value');
      $(this).val(v).removeClass('red').addClass('green');
    }
  }
});

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
 * 画圆
 * @param {*} p 圆心
 * @param {*} radius 半径 
 * @param {*} color 颜色
 * @param {*} width 线宽
 * @param {*} ctx 画图上下文
 */
function drawCircle(p, radius, color, width, ctx) {
  ctx.beginPath();
  ctx.lineWidth = width;
  ctx.strokeStyle = color;
  ctx.arc(p.x, p.y, radius, 0, Math.PI * 2, false);
  ctx.stroke();
}

/**
 * 写配置
 */
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

function changeVal() {
  var index = $(".white").index();
  //name
  $('.c' + (index + 1)).find('[name]').each(function () {
    var name = $(this).attr('name');
    var type = $(this).attr('type');
    if (type == "checkbox") {
      dialogConfig[index]["attr"][name] = $(this).is(":checked") ? "yes" : "no";
    } else if (type == "number") {
      dialogConfig[index]["attr"][name] = compareVal(this, $(this).val());
    } else if ($(this).is('select')) {
      dialogConfig[index]["attr"][name] = $(this).val();
    }
  })
  // alias/报文
  dialogConfig[index]["attr"]["alias"] = $('.c' + (index + 1)).find('[name=alias]').val();
  dialogConfig[index]["attr"]["sampling_msg"] = ($('.c' + (index + 1)).find('.sampling_msg').attr('val') == undefined ? null : $('.c' + (index + 1)).find('.sampling_msg').attr('val'));
  //  关键目标(3个div) a
  $('.c' + (index + 1) + ">div:nth-child(4)>div:not(:first-child) a").each(function () {
    var name = $(this).attr("class").split(" ")[0];
    var val = $(this).attr("val") == undefined ? "null" : $(this).attr('val');
    dialogConfig[index]["attr"][name] = val;
  })
  // 目标物分类 text
  var class_signal_value = dialogConfig[index]["childAttr"]["class_signal_value"];
  if (class_signal_value.length > 0) {
    for (var i = 0; i < 4; i++) {
      var val = $('.c' + (index + 1)).find("[name=" + class_signal_value[i]["type"] + "]").val();
      class_signal_value[i].values = val == "" ? "null" : val;
    }
  }
}

function setConfig() {
  changeVal();
  var text = "<?xml version=\"1.0\" encoding=\"utf-8\"?><root>";
  for (var i = 0; i < dialogConfig.length; i++) {
    text += "<c" + (i + 1) + " ";
    for (var j in dialogConfig[i]["attr"]) {
      text += j + "=\"" + dialogConfig[i]["attr"][j] + "\" ";
    }
    if (dialogConfig[i]["childAttr"].length == 0) {
      text += "/>";
    } else {
      text += ">";
      for (var j in dialogConfig[i]["childAttr"]) {
        for (var k in dialogConfig[i]["childAttr"][j]) {
          text += "<" + j + " ";
          for (var l in dialogConfig[i]["childAttr"][j][k]) {
            text += l + "=\"" + dialogConfig[i]["childAttr"][j][k][l] + "\" ";
          }
          text += "/>"
        }
      }
      text += "</c" + (i + 1) + ">";
    }
  }
  text += "</root>";
  biSetModuleConfig("object-sensor-by-can.pluginsensor", text)
}

function loadConfig(config) {
  if (config == null) return;
  loadOne($(".white").index() + 1);
  //获取本车width,length
  biQueryGlobalVariable("Subject.VehicleWidth", "1.9");
  biQueryGlobalVariable("Subject.VehicleLength", "4.6");
}
var busArr = [];

function loadOne(i) {
  var obj = dialogConfig[i - 1];
  $(".c" + i).find('[name]').each(function () {
    var name = $(this).attr('name');
    var type = $(this).attr('type');
    if (type == "checkbox") {
      obj["attr"][name] == "yes" ? $(this).prop('checked', true) : $(this).removeAttr('checked');
    } else if (type == "number") {
      $(this).val(compareVal(this, obj["attr"][name]));
    } else if ($(this).is('select')) {
      $(this).val(obj["attr"][name]);
    }
  });
  changeClassMode($(".c" + i).find('[name=class_mode]'));
  changeKoFrontMode($(".c" + i).find('[name=ko_front_mode]'));
  changeKoFrontMode($(".c" + i).find('[name=ko_left_mode]'));
  changeKoFrontMode($(".c" + i).find('[name=ko_right_mode]'));
  // $(".c" + i).find('[name=alias]').val(obj["attr"]['alias']);
  $(".c" + i).find('.alias').text(obj["attr"]['alias'].trim().length == 0 ? "Lane Sensor" : obj["attr"]['alias']);
  if (obj["attr"]["sampling_msg"] != "null") {
    $(".c" + i).find('.sampling_msg').attr('val', obj["attr"]["sampling_msg"]);
    biQueryBusMessageInfo("TargetMessage:" + i, obj["attr"]["sampling_msg"]);
  }
  if (obj["attr"]["ko_front_index_signal"] != "null") {
    var a = obj["attr"]["ko_front_index_signal"].split(":");
    biQuerySignalInfo(i + "|ko_front_index_signal", obj["attr"]["ko_front_index_signal"]);
  }
  if (obj["attr"]["ko_left_index_signal"] != "null") {
    var a = obj["attr"]["ko_left_index_signal"].split(":");
    biQuerySignalInfo(i + "|ko_left_index_signal", obj["attr"]["ko_left_index_signal"]);
    $(".c" + i).find('.ko_left_index_signal').attr("val", obj["attr"]["ko_left_index_signal"])
  }
  if (obj["attr"]["ko_right_index_signal"] != "null") {
    var a = obj["attr"]["ko_right_index_signal"].split(":");
    biQuerySignalInfo(i + "|ko_right_index_signal", obj["attr"]["ko_right_index_signal"]);
  }
  var fovArr = obj["childAttr"]["fov"];
  if (Boolean(fovArr)) {
    $('.c' + i).children('div:nth-of-type(3)').find('.con').children().each(function (i, v) {
      if (i != 0) $(this).remove();
    });
    for (var n = 0; n < fovArr.length; n++) {
      var conf = fovArr[n];
      var p1 = "Pos [m]:(" + conf.posx + "0," + conf.posy + "0)";
      var p2 = "Angle [°]:-" + (conf.angle_range / 2 - Math.abs(conf.orient)).toFixed(2) + "~" + (conf.angle_range / 2 + Math.abs(conf.orient)).toFixed(2);
      var p3 = "Dist [m]:0.00~" + conf.dist_range + "0";
      $fov = $('.c' + i).children('div:nth-of-type(3)').find('.con>div:first-of-type').clone(true);
      $fov.children('p:nth-of-type(1)').text(p1);
      $fov.children('p:nth-of-type(2)').text(p2);
      $fov.children('p:nth-of-type(3)').text(p3);
      $('.c' + i).children('div:nth-of-type(3)').find('.con').append($fov[0]);
    }
    draw($('.c' + i).find('canvas'), obj["attr"]["offset_x"], obj["attr"]["offset_y"], obj["attr"]["yaw_angle"], fovArr, subject_width, subject_length);
  }
  var classArr = obj["childAttr"]["class_signal_value"];
  if (Boolean(classArr)) {
    for (var k = 0; k < classArr.length; k++) {
      var clazz = classArr[k];
      var v = clazz.values == "null" || !Boolean(clazz.values) ? "" : clazz.values;
      if (clazz.type == "2") $(".c" + i).find('[name=2]').val(v).attr('value', v).addClass('green');
      if (clazz.type == "3") $(".c" + i).find('[name=3]').val(v).attr('value', v).addClass('green');
      if (clazz.type == "4") $(".c" + i).find('[name=4]').val(v).attr('value', v).addClass('green');
      if (clazz.type == "5") $(".c" + i).find('[name=5]').val(v).attr('value', v).addClass('green');
    }
  }
  var objectArr = obj["childAttr"]["object"];
  if (Boolean(objectArr)) {
    var content = $('.c' + i).children('div:nth-of-type(3)').children('div:nth-of-type(3)').children('.content');
    $(content).children().each(function (i, v) {
      if (i != 0) $(this).remove();
    });
    if (objectArr.length > 1) $(content).children('div:first-of-type').children('.right').removeClass('hide');
    for (var n = 0; n < objectArr.length; n++) {
      var t = objectArr[n];
      if (n == 0) {
        if (t.dx_s != "null" && t.dx_s != null) {
          var a = t.dx_s.split(":");
          biQuerySignalInfo(i + "+" + n + "+dx_s" + "+" + t.dx_s, t.dx_s);
          $(content).children('div:first-of-type').find('.dx_s').attr("val", t.dx_s).attr("scale", t.dx_l);
        }
        if (t.dy_s != "null" && t.dy_s != null) {
          var a = t.dy_s.split(":");
          biQuerySignalInfo(i + "+" + n + "+dy_s" + "+" + t.dy_s, t.dy_s);
          $(content).children('div:first-of-type').find('.dy_s').attr("val", t.dy_s).attr("scale", t.dy_l);
        }
      } else {
        $box = $(content).children('div:first-of-type').clone(true);
        $box.find('.dx_s').removeClass('green').removeAttr('val').attr('scale', "1").text(not_config);
        $box.find('.dy_s').removeClass('green').removeAttr('val').attr('scale', "1").text(not_config);
        $box.find('.dx_s').parent().removeAttr("title");
        $box.find('.dy_s').parent().removeAttr("title");
        if (t.dx_s != "null" && t.dx_s != null) {
          var a = t.dx_s.split(":");
          biQuerySignalInfo(i + "+" + n + "+dx_s" + "+" + t.dx_s, t.dx_s);
          $box.find('.dx_s').attr("val", t.dx_s);
        }
        if (t.dy_s != "null" && t.dy_s != null) {
          var a = t.dy_s.split(":");
          biQuerySignalInfo(i + "+" + n + "+dy_s" + "+" + t.dy_s, t.dy_s);
          $box.find('.dy_s').attr("val", t.dy_s)
        }
        $box.find('.number').text(n + 1);
        $box.children('.right').removeClass('hide');
        $(content).append($box[0]);
      }
    }
  }
}

var subject_width = -1,
  subject_length = -1;

function biOnQueriedGlobalVariable(id, value) {
  if (id == "Subject.VehicleWidth") subject_width = Number(value);
  if (id == "Subject.VehicleLength") subject_length = Number(value);
  if (subject_length != -1 && subject_width != -1) {
    var i = $(".white").index();
    var obj = dialogConfig[i]["attr"];
    draw($(".c" + (i + 1)).find('canvas'), obj["offset_x"], obj["offset_y"], obj["yaw_angle"], dialogConfig[i]["childAttr"]["fov"], subject_width, subject_length);
  }
}


function biOnQueriedSignalInfo(key, info) {
  if (info != null) {
    if (key.indexOf("+") != -1) {
      var arr = key.split("+");
      var content = $('.c' + arr[0]).children('div:nth-of-type(3)').children('div:nth-of-type(3)').children('.content');
      var index = Number(arr[1]) + 1;
      $(content).children('div:nth-of-type(' + index + ')').find('.' + arr[2]).text(info.signalName).addClass('green').removeClass('red')
        .parent().attr("title", info.typeName + ":" + info.signalName);
    } else if (key.indexOf("|") != -1) {
      var arr = key.split("|");
      $('.c' + arr[0]).find('.' + arr[1]).text(info.signalName).addClass('green').removeClass('red')
        .parent().attr("title", info.typeName + ":" + info.signalName);
    } else if (key.indexOf(":") != -1) {
      var type = key.substring(key.lastIndexOf(":") + 1, key.length);
      var n = validateCount / duplicateConfigArray.length;
      //倍数
      var s = Math.floor(validateNum / n);
      validateNum++;
      var c = duplicateConfigArray[s];
      c[type] = info.id;
      //记录dx,dy信号信息
      if (type == "dx_s") {
        var signal = new Signal();
        signal.name = info.signalName;
        signal.title = info.typeName + ":" + info.signalName;
        signal.signal = info.id;
        dxAndDySignalArray[s].dx_s = signal;
      }
      if (type == "dy_s") {
        var signal = new Signal();
        signal.name = info.signalName;
        signal.title = info.typeName + ":" + info.signalName;
        signal.signal = info.id;
        dxAndDySignalArray[s].dy_s = signal;
      }
      //认证完毕
      if (validateCount == validateNum) {
        //全部认证通过
        if (errorText.length == 0) {
          var text = biGetLanguage() == 1 ? "Validation OK." : "验证OK.";
          $('.duplicate').find('textarea').val(text);
          $(".duplicate").find('[language=duplicate]').removeAttr("disabled").removeClass("disabled_background");
        }
      }
    } else {
      $('#' + key).text(info.typeName + ":" + info.signalName).addClass('green').attr("val", info.id);
      $('#' + key).next().text(info.typeName + ":" + info.signalName);
    }
  } else {
    if (key.indexOf("+") != -1) {
      var arr = key.split("+");
      var index = Number(arr[1]) + 1;
      var content = $('.c' + arr[0]).children('div:nth-of-type(3)').children('div:nth-of-type(3)').children('.content');
      $(content).children('div:nth-of-type(' + index + ')').find('.' + arr[2]).text(arr[3]).removeClass('green').addClass('red');
      $(content).children('div:nth-of-type(' + index + ')').find('.' + arr[2]).parent().attr("title", "");
    } else if (key.indexOf("|") != -1) {
      var arr = key.split("|");
      $('.c' + arr[0]).find('.' + arr[1]).text($('.c' + arr[0]).find('.' + arr[1]).attr('val')).addClass('red').removeClass('green')
        .parent().attr("title", "");
    } else if (key.indexOf(":") != -1) {
      validateNum++;
      var signal = key.substring(0, key.lastIndexOf(":"));
      var text = biGetLanguage() == 1 ? "Can't find signal '" + signal + "'." : "找不到信号" + signal + ".";
      errorText.push(text);
      $('.duplicate').find('textarea').val(errorText.join("\n"));
    }
  }

}

function importAsmc(obj) {
  indexFov = $(obj).parent().parent().parent().parent().index();
  var filter = {
    ".asmc": "ASEva Module Configuration (*.asmc)"
  };
  biSelectPath("OpenFilePath", BISelectPathType.OpenFile, filter);
}

function exportAsmc(obj) {
  indexFov = $(obj).parent().parent().parent().parent().index();
  var filter = {
    ".asmc": "ASEva Module Configuration (*.asmc)"
  };
  biSelectPath("CreateFilePath", BISelectPathType.CreateFile, filter);
}

function biOnSelectedPath(key, path) {
  if (path == null) {
    return;
  }
  if (key == "CreateFilePath") {
    indexFov = $(".white").index();
    var text = "<?xml version=\"1.0\" encoding=\"utf-8\"?><root ";
    for (var j in dialogConfig[indexFov]["attr"]) {
      text += j + "=\"" + dialogConfig[indexFov]["attr"][j] + "\" ";
    }
    if (dialogConfig[indexFov]["childAttr"].length == 0) {
      text += "/>";
    } else {
      text += ">";
      for (var j in dialogConfig[indexFov]["childAttr"]) {
        for (var k in dialogConfig[indexFov]["childAttr"][j]) {
          text += "<" + j + " ";
          for (var l in dialogConfig[indexFov]["childAttr"][j][k]) {
            text += l + "=\"" + dialogConfig[indexFov]["childAttr"][j][k][l] + "\" ";
          }
          text += "/>"
        }
      }
      text += "</root>";
    }
    var xml = "";
    xml += "<?xml version=\"1.0\" encoding=\"utf-8\"?><root type=\"obj-sensor-config-v2\">";
    xml += getEncode64(text);
    xml += "</root>";
    biWriteFileText(path, xml);
  } else if (key == "OpenFilePath") {
    biQueryFileText(path);
  }
}

function biOnQueriedFileText(text, path) {
  var parser = new DOMParser();
  var xmlDoc = parser.parseFromString(text, "text/xml");
  var type = xmlDoc.getElementsByTagName("root")[0].attributes["type"].nodeValue;
  if (type != "obj-sensor-config-v2") {
    var txt = language == 1 ? "The file is not for object sensor configuration" : "该文件不是用于目标传感器配置的";
    var title = language == 1 ? "Error" : "错误";
    biAlert(txt, title);
    return;
  } else if (type == "obj-sensor-config-v2") {
    dialogConfig[$(".white").index()] = {};
    var root = getDecode(xmlDoc.getElementsByTagName('root')[0].innerHTML);
    var xmlDoc2 = parser.parseFromString(root, "text/xml");
    var childNodes = xmlDoc2.childNodes;
    for (var i = 0; i < childNodes.length; i++) {
      var keys = childNodes[i].attributes;
      var obj = {};
      for (var j = 0; j < keys.length; j++) {
        // 获取root自身字节的属性
        obj[keys[j].nodeName] = keys[j].nodeValue;
      }
      var childKeys = childNodes[i].childNodes;
      var child = {
        "fov": [],
        "class_signal_value": [],
        "object": []
      };
      for (var j = 0; j < childKeys.length; j++) {
        var name = childKeys[j].nodeName;
        var childKeysAttrs = childKeys[j].attributes;
        var childAttr = {}
        for (var k = 0; k < childKeysAttrs.length; k++) {
          childAttr[childKeysAttrs[k].nodeName] = childKeysAttrs[k].nodeValue;
        }
        if (name == "fov") {
          child.fov.push(childAttr)
        } else if (name == "class_signal_value") {
          child.class_signal_value.push(childAttr);
        } else if (name == "object") {
          child.object.push(childAttr);
        }
      }
      dialogConfig[$(".white").index()] = {
        "attr": obj,
        "childAttr": child
      };
    }
    loadConfig(dialogConfig[$(".white").index()]);
    setConfig();
  }
}

function biOnInitEx(config, moduleConfigs) {
  if (biGetLanguage() == 1) {
    $('[language]').each(function () {
      var value = $(this).attr('language');
      $(this).text(en[value]);
    });
    not_config = en["not_config"];
    areU = "Are you sure to remove all object settings?";
    confirm = en["confirm"];
    fov_cfg = en["fov_cfg"];
    other_classes = en["other_classes"];
    detail_obj = en["detail_obj"];
    duplicate_object_settings = en["duplicate_object_settings"];
  } else {
    $('[language]').each(function () {
      var value = $(this).attr('language');
      $(this).text(cn[value]);
    });
    not_config = cn["not_config"];
    areU = "确定要删除所有目标物配置吗?";
    confirm = cn["confirm"];
    fov_cfg = cn["fov_cfg"];
    other_classes = cn["other_classes"];
    detail_obj = cn["detail_obj"];
    duplicate_object_settings = cn["duplicate_object_settings"];
  }
  for (var key in moduleConfigs) {
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(moduleConfigs[key], "text/xml");
    var root = xmlDoc.getElementsByTagName('root');
    var childNodes = root[0].childNodes;
    for (var i = 0; i < childNodes.length; i++) {
      var keys = childNodes[i].attributes;
      var obj = {};
      for (var j = 0; j < keys.length; j++) {
        // 获取root自身字节的属性
        obj[keys[j].nodeName] = keys[j].nodeValue;
      }
      var childKeys = childNodes[i].childNodes;
      var child = {
        "fov": [],
        "class_signal_value": [],
        "object": []
      };
      for (var j = 0; j < childKeys.length; j++) {
        var name = childKeys[j].nodeName;
        var childKeysAttrs = childKeys[j].attributes;
        var childAttr = {}
        for (var k = 0; k < childKeysAttrs.length; k++) {
          childAttr[childKeysAttrs[k].nodeName] = childKeysAttrs[k].nodeValue;
        }
        if (name == "fov") {
          child.fov.push(childAttr)
        } else if (name == "class_signal_value") {
          child.class_signal_value.push(childAttr);
        } else if (name == "object") {
          child.object.push(childAttr);
        }
      }
      dialogConfig.push({
        "attr": obj,
        "childAttr": child
      });
      if (dialogConfig[i]["childAttr"]["class_signal_value"].length == 0) {
        dialogConfig[i]["childAttr"]["class_signal_value"] = [{
          type: '2',
          values: "null"
        }, {
          type: '3',
          values: "null"
        }, {
          type: '4',
          values: "null"
        }, {
          type: '5',
          values: "null"
        }, {
          type: '11',
          values: 'null'
        }, {
          type: '12',
          values: 'null'
        }, {
          type: '13',
          values: 'null'
        }, {
          type: '21',
          values: 'null'
        }, {
          type: '22',
          values: 'null'
        }, {
          type: '23',
          values: 'null'
        }, {
          type: '24',
          values: 'null'
        }, {
          type: '25',
          values: 'null'
        }, {
          type: '26',
          values: 'null'
        }, {
          type: '31',
          values: 'null'
        }, {
          type: '32',
          values: 'null'
        }, {
          type: '33',
          values: 'null'
        }, {
          type: '34',
          values: 'null'
        }, {
          type: '41',
          values: 'null'
        }, {
          type: '42',
          values: 'null'
        }, {
          type: '43',
          values: 'null'
        }, {
          type: '44',
          values: 'null'
        }, {
          type: '51',
          values: 'null'
        }, {
          type: '52',
          values: 'null'
        }, {
          type: '53',
          values: 'null'
        }, {
          type: '54',
          values: 'null'
        }, {
          type: '6',
          values: 'null'
        }, {
          type: '61',
          values: 'null'
        }, {
          type: '62',
          values: 'null'
        }, {
          type: '7',
          values: 'null'
        }, {
          type: '71',
          values: 'null'
        }, {
          type: '72',
          values: 'null'
        }, {
          type: '73',
          values: 'null'
        }, {
          type: '8',
          values: 'null'
        }, {
          type: '81',
          values: 'null'
        }, {
          type: '82',
          values: 'null'
        }, {
          type: '83',
          values: 'null'
        }, {
          type: '84',
          values: 'null'
        }, {
          type: '9',
          values: 'null'
        }, {
          type: '91',
          values: 'null'
        }, {
          type: '92',
          values: 'null'
        }, {
          type: '93',
          values: 'null'
        }, {
          type: '94',
          values: 'null'
        }];

      }
    }
    loadConfig(dialogConfig[$(".white").index()]);
  }
}


function parseXml(config) {
  if (config == null || config == "null") return;
  var parser = new DOMParser();
  var xmlDoc = parser.parseFromString(config, "text/xml");
  var countrys = xmlDoc.getElementsByTagName('root');
  var parent = new Object();
  var arr = [];
  for (var i = 0; i < countrys[0].childNodes.length; i++) {
    var keyss = countrys[0].childNodes[i].getAttributeNames();
    var obj = new Object();
    var fovSetting = [];
    var objectSetting = [];
    var clasSignal = [];
    for (var j = 0; j < keyss.length; j++) {
      obj[keyss[j]] = countrys[0].childNodes[i].getAttribute(keyss[j]);
    }
    for (var n = 0; n < countrys[0].childNodes[i].childNodes.length; n++) {
      var nodeName = countrys[0].childNodes[i].childNodes[n].nodeName;
      if (nodeName == "fov") {
        var config = {
          posx: 0,
          posy: 0,
          orient: 0,
          angle_range: 0,
          dist_range: 0,
        }
        config.posx = countrys[0].childNodes[i].childNodes[n].getAttribute("posx");
        config.posy = countrys[0].childNodes[i].childNodes[n].getAttribute("posy");
        config.orient = countrys[0].childNodes[i].childNodes[n].getAttribute("orient");
        config.angle_range = countrys[0].childNodes[i].childNodes[n].getAttribute("angle_range");
        config.dist_range = countrys[0].childNodes[i].childNodes[n].getAttribute("dist_range");
        fovSetting.push(config);
      }
      if (nodeName == "class_signal_value") {
        var classSignal = countrys[0].childNodes[i].childNodes[n].getAttributeNames();
        var clazz = {
          type: countrys[0].childNodes[i].childNodes[n].getAttribute(classSignal[0]),
          value: countrys[0].childNodes[i].childNodes[n].getAttribute(classSignal[1]),
        }
        clasSignal.push(clazz);
      }
      if (nodeName == "object") {
        var objectKey = countrys[0].childNodes[i].childNodes[n].getAttributeNames();
        var object = new ObjectSignal();
        for (var k = 0; k < objectKey.length; k++) {
          var vv = countrys[0].childNodes[i].childNodes[n].getAttribute(objectKey[k]);
          object[objectKey[k]] = vv;
        }
        objectSetting.push(object);
      }
    }
    obj.fovSetting = fovSetting;
    obj.objectSetting = objectSetting;
    obj.clasSignal = clasSignal;
    arr.push(obj);
  }
  parent.arr = arr;
  return parent;
}

function openChildDialog(obj) {
  var tagI = $(".white").index();
  var name = $(obj).attr("language");
  biSetLocalVariable("object_sensor_by_can", JSON.stringify(dialogConfig));
  switch (name) {
    case "add_fov":
    case "edit": {
      var config = (name == "edit" ? $(obj).parent().parent().index() - 1 : "") + "," + tagI;
      biOpenChildDialog("object-sensor-by-can.fov.html", fov_cfg, new BISize(370, 220), config);
      break;
    }
    case "other_classes": {
      biOpenChildDialog("object-sensor-by-can.signal_values.html", other_classes, new BISize(870, 723), tagI);
      break;
    }
    case "other_signals": {
      var boxI = $(obj).parent().parent().index();
      biOpenChildDialog("object-sensor-by-can.detail.html", detail_obj + (boxI + 1), new BISize(600, 550), boxI + "," + tagI);
      break;
    }
    case "duplicate": {
      //content下box的长度为目标物来源的最大值
      var length = $(".c").eq($(".white").index()).find("div>div.right>div.content>.box").length;
      biOpenChildDialog("object-sensor-by-can.duplicate.html", duplicate_object_settings, new BISize(780, 261), length + "," + tagI);
      break;
    }
  }
}

function biOnClosedChildDialog(htmlName, result) {
  var config = JSON.parse(biGetLocalVariable("object_sensor_by_can"));
  var index = $(".white").index();
  if (Boolean(config)) {
    dialogConfig = config;
    if (htmlName == "object-sensor-by-can.fov.html") {
      $('.c' + (index + 1)).children('div:nth-of-type(3)').find('.con').children().each(function (i, v) {
        if (i != 0) $(this).remove();
      });
      var fovArr = dialogConfig[index]["childAttr"]["fov"];
      var obj = dialogConfig[index]["attr"];
      for (var n = 0; n < fovArr.length; n++) {
        var conf = fovArr[n];
        var p1 = "Pos [m]:(" + conf.posx + "0," + conf.posy + "0)";
        var p2 = "Angle [°]:-" + (conf.angle_range / 2 - Math.abs(conf.orient)).toFixed(2) + "~" + (conf.angle_range / 2 + Math.abs(conf.orient)).toFixed(2);
        var p3 = "Dist [m]:0.00~" + conf.dist_range + "0";
        $fov = $('.c' + (index + 1)).children('div:nth-of-type(3)').find('.con>div:first-of-type').clone(true);
        $fov.children('p:nth-of-type(1)').text(p1);
        $fov.children('p:nth-of-type(2)').text(p2);
        $fov.children('p:nth-of-type(3)').text(p3);
        $('.c' + (index + 1)).children('div:nth-of-type(3)').find('.con').append($fov[0]);
      }
      draw($('.c' + (index + 1)).find('canvas'), obj["offset_x"], obj["offset_y"], obj["yaw_angle"], fovArr, subject_width, subject_length);
    } else if (htmlName == "object-sensor-by-can.duplicate.html") {
      var objects = dialogConfig[index]["childAttr"]["object"];
      $(".c" + (index + 1) + " .w373>.content>.box:not(:first-child)").remove();
      for (var i = 1; i < objects.length; i++) {
        var a = objects[i]["dx_s"];
        var b = objects[i]["dy_s"];
        var dx_scale = objects[i]["dx_l"];
        var dy_scale = objects[i]["dy_l"];
        $box = $('.c' + (index + 1)).children('div:nth-of-type(3)').children('div:nth-of-type(3)').children('.content').children('div:first-of-type').clone(true);
        $box.find('.dx_s').addClass('green').attr('val', a.signal).attr('scale', dx_scale).text(a.name);
        $box.find('.dy_s').addClass('green').attr('val', b.signal).attr('scale', dy_scale).text(b.name);
        $box.find('.number').text(i + 1);
        $box.children('.right').removeClass('hide');
        $('.c' + (index + 1)).children('div:nth-of-type(3)').children('div:nth-of-type(3)').children('.content').append($box[0]);
        objects[i]["dx_s"] = Boolean(objects[i]["dx_s"]["signal"]) ? objects[i]["dx_s"]["signal"] : objects[i]["dx_s"];
        objects[i]["dy_s"] = Boolean(objects[i]["dy_s"]["signal"]) ? objects[i]["dy_s"]["signal"] : objects[i]["dy_s"];
      }
      if (dialogConfig[index]["childAttr"]["object"].length > 1) {
        $('.c' + (index + 1)).children('div:nth-of-type(3)').children('div:nth-of-type(3)').children('.content').children('div:first-of-type').children('.right').removeClass('hide');
      }
    }
    setConfig();
  }
}