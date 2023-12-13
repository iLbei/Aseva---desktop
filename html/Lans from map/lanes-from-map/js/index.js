var not_config = "", empty = "";

function numberCheck(obj) {
  var min = Number($(obj).attr("min"));
  var max = Number($(obj).attr('max'));
  var value = Number($(obj).val());
  if (value < min) {
    return min;
  } else if (value > max) {
    return max;
  }
  return value;
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
function draw(w, l) {
  var width = 15 * w,
    length = 15.2 * l;
  var canvas1 = document.getElementById('canvas1');
  var ctx1 = canvas1.getContext('2d');
  ctx1.clearRect(0, 0, 107, 143);
  var p1 = new BIPoint(54, 0),
    p2 = new BIPoint(54, 143),
    p3 = new BIPoint(0, 35),
    p4 = new BIPoint(107, 35),

    p5 = new BIPoint(54 - width / 2, 35),
    size = new BISize(width, length),
    p6 = new BIPoint(54, 35),
    p7 = new BIPoint(54 - width / 2, 35 + length / 4),
    p8 = new BIPoint(54 + width / 2, 35 + length / 4);
  drawLine(p1, p2, 1, "#e9e9e9", ctx1);
  drawLine(p3, p4, 1, "#e9e9e9", ctx1);

  drawRect(p5, size, "black", ctx1);
  var arr = [p6, p7, p8]
  drawPolygon(arr, "black", ctx1);
  var x = numberCheck($('[name=PositionX]'));
  var y = numberCheck($('[name=PositionY]'));
  var xScale = x * 24 / 1.5,
    yScale = 15 * y;
  var p9 = new BIPoint(107 / 2 - yScale, 35 - 24 - xScale),
    p10 = new BIPoint(107 / 2 - yScale, 35 - xScale),
    p11 = new BIPoint(107 / 2 - 15 - yScale, 35 - xScale);
  ctx1.beginPath();
  ctx1.moveTo(p9.x, p9.y);
  ctx1.lineTo(p10.x, p10.y);
  ctx1.lineTo(p11.x, p11.y);
  ctx1.strokeStyle = "#32cd32";
  ctx1.stroke();
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
$('[name]').change(function () {
  if ($(this).attr("type") != "number") {
    setConfig();
  }
});

$('.container').on("input", "[type=number],[type=text]", function () {
  setConfig();
}).on("blur", "[type=number]", function () {
  $(this).val(compareVal(this, $(this).val()));
});

function checkNumber(obj) {
  var step = $(obj).attr('step').length - 2;
  var v = Number($(obj).val());
  var value;
  if (!isNaN(v) && $(obj).val() != "") {
    var min = parseFloat($(obj).attr('min')),
      max = parseFloat($(obj).attr('max'));
    v = v < min ? min : v;
    v = v > max ? max : v;
    if (step <= -1) {
      value = v.toFixed(0);
    } else {
      value = v.toFixed(step);
    }
  } else {
    value = $(obj).attr('value');
  }
  return value;
}

function changeLane() {
  setConfig();
}

function laneBlur(obj) {
  $(obj).val(compareVal(obj, $(obj).val()));
}

function changeX(obj) {
  $(obj).val(compareVal(obj, $(obj).val()));
  draw(subject_width, subject_length);
}

function changeY(obj) {
  $(obj).val(compareVal(obj, $(obj).val()));
  draw(subject_width, subject_length);
  setConfig();
}

function changeInputX(obj) {
  var min = $(obj).attr('min'),
    max = $(obj).attr('max');
  var v = $(obj).val();
  if (v < min || v > max) return
  draw(subject_width, subject_length);
}

function changeInputY(obj) {
  var min = $(obj).attr('min'),
    max = $(obj).attr('max');
  var v = $(obj).val();
  if (v < min || v > max) return
  draw(subject_width, subject_length);
}

$('[language=add]').click(function () {
  $getParagraph = $(".box").clone(true);
  $('.content').append($getParagraph[0]);
  setConfig();
});
$('[language=clear]').click(function () {
  var i = 1;
  while (i < $('.box').length) {
    $('.box')[i].remove()
    i = 1;
  }
  setConfig();
});

/**
 * 写配置
 */
function setConfig() {
  var text = "<?xml version=\"1.0\" encoding=\"utf-8\"?><root";
  var path1 = $('#ExternalShpFilesPath').text().indexOf(empty) != -1 ? "" : $('#ExternalShpFilesPath').text();
  var path2 = $('#ExternalXodrMapPath').text().indexOf(empty) != -1 ? "" : $('#ExternalXodrMapPath').text();
  text += " ExternalShpFilesPath=\"" + path1 + "\"" +
    " ExternalXodrMapPath=\"" + path2 + "\"";
  $('#bottom [name]').each(function () {
    var key = $(this).attr('name');
    text += " " + key + "=\"" + $(this).val() + "\"";
  });
  text += " HDMapSource=\"" + $('input[name=HDMapSource]:checked').val() + "\"";
  text += " UsingFilterMethod=\"no\" DistanceConfigItems=\"";
  var len = $('#content>div').length - 1;
  $('#content>div').each(function (i, v) {
    if (i != 0) {
      var val = $(this).find('a').attr('val');
      var scale = $(this).find('a').attr('scale')
      text += $(this).find('[name=lane]').val() + "," + (val == undefined ? "" : val) + "," + scale + ",";
      if (i < len) {
        text += ";";
      }
    }
  });
  text += "\"" + " />";
  biSetModuleConfig("lanes-from-map.aspluginmaplaneconverter", text);
}
/**
 *  页面加载时,读取本地配置
 */
function loadConfig(val) {
  if (val.ExternalShpFilesPath != "") $('#ExternalShpFilesPath').text(val.ExternalShpFilesPath).attr("title",val.ExternalShpFilesPath);
  if (val.ExternalXodrMapPath != "") $('#ExternalXodrMapPath').text(val.ExternalXodrMapPath).attr("title",val.ExternalXodrMapPath);
  $('[type=radio]').each(function () {
    var v = $(this).val();
    if (v == val.HDMapSource) $(this).attr("checked", true);
  });
  $('.bottom [name]').each(function () {
    var value = $(this).attr('name');
    var type = $(this).attr('type');
    if (type == "number") {
      $(this).val(compareVal(this, val[value]));
    } else {
      $(this).val(val[value]);
    }
  });
  if (val.DistanceConfigItems != "") {
    var arr = val.DistanceConfigItems.split(';');
    for (var i = 0; i < arr.length; i++) {
      var arrT = arr[i].split(',');
      $getParagraph = $(".box").clone();
      $getParagraph.find('[type=number]').val(arrT[0]);
      if (arrT[1] != "") {
        $getParagraph.find('a').attr('id', 'a' + i);
        var id = $getParagraph.find('a').attr('id');
        biQuerySignalInfo(id, arrT[1]);
        $getParagraph.find('a').attr('val', arrT[1]);
        if ($getParagraph.find('a').hasClass('red')) {
          $getParagraph.find('a').text(arrT[1]);
        } else {
          $getParagraph.find('a').addClass('green');
          $getParagraph.find('a').text(arrT[1].substring(arrT[1].lastIndexOf(":") + 1));
        }
        $getParagraph.find('a').attr('val', arrT[1]);
        $getParagraph.find('a').attr('scale', arrT[2]);
      }
      $('.content').append($getParagraph[0]);
    }
  }
  //获取本车width,length
  biQueryGlobalVariable("Subject.VehicleWidth", null);
  biQueryGlobalVariable("Subject.VehicleLength", null);
}

var subject_width = 2,
  subject_length = 8;

function biOnQueriedGlobalVariable(id, value) {
  if (id == "Subject.VehicleWidth") subject_width = Number(value);
  if (id == "Subject.VehicleLength") subject_length = Number(value);
  if (subject_length != -1 && subject_width != -1) {
    draw(subject_width, subject_length);
  }
}

function biOnQueriedSignalInfo(key, signalInfo) {
  if (signalInfo != null) {
    $('#' + key).addClass('green').removeClass('red');
    $('#' + key).parent().attr('title', signalInfo.typeName + ':' + signalInfo.signalName);
  } else {
    $('#' + key).addClass('red').removeClass('green').text($('#' + key).attr('val'));
  }
}
/**
 * 点击删除
 * @param {} obj 
 */
function onClick(obj) {
  $(obj).parent().remove();
  setConfig();
}


var signal;
/**
 * 选择信号
 * @param {} obj 
 */
function selectSignal(obj) {
  var originID = null;
  if ($(obj).text().lastIndexOf(not_config) == -1) originID = $(obj).attr('val');
  index = $(obj).parent().parent().parent().parent().index();
  var scale = parseInt($(obj).attr('scale'));
  signal = obj;
  biSelectSignal("TargetSignal", originID, false, null, true, scale, "[m]");
}

function biOnSelectedSignal(key, valueInfo, signBitInfo, scale) {
  if (key == "TargetSignal") {
    if (valueInfo == null) {
      $(signal).text(not_config);
      $(signal).removeAttr("val");
      $(signal).removeClass('green red');
      $(signal).parent().removeAttr("title");
    } else if (valueInfo.typeName == undefined) {
      $(signal).addClass('red').removeClass('green');
    } else {
      $(signal).text(valueInfo.signalName);
      $(signal).attr("val", valueInfo.id);
      $(signal).attr("scale", scale);
      $(signal).addClass('green').removeClass('red');
      $(signal).parent().attr("title", valueInfo.typeName + ':' + valueInfo.signalName);
    }

  }
  setConfig();
}

/**
 * 打开文件夹和文件
 */
$('#ExternalShpFilesPath').click(function () {
  biSelectPath("OpenFilePath:1", BISelectPathType.Directory, null);
});
$('#ExternalXodrMapPath').click(function () {
  var filter = { ".xodr": "xodr (*.xodr)" };
  biSelectPath("OpenFilePath:2", BISelectPathType.OpenFile, filter);
});

function biOnSelectedPath(key, path) {
  if (path == null) {
    return;
  }
  if (key == "CreateFilePath") {

  } else if (key.indexOf("OpenFilePath") != -1) {
    var strs = key.split(":");
    if (strs[1] == 1) {
      $('#ExternalShpFilesPath').text(path).attr("title",path);
    } else if (strs[1] == 2) {
      $('#ExternalXodrMapPath').text(path).attr("title",path);
    }
  }
  setConfig();
}

function biOnInitEx(config, moduleConfigs) {
  if (biGetLanguage() == 1) {
    $('[language]').each(function () {
      var value = $(this).attr('language');
      $(this).text(en[value])
    });
    not_config = en["not_config"];
    empty = en["empty"];
  } else {
    $('[language]').each(function () {
      var value = $(this).attr('language');
      $(this).text(cn[value])
    });
    not_config = cn["not_config"];
    empty = cn["empty"];
  }
  for (var key in moduleConfigs) {
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(moduleConfigs[key], "text/xml");
    var countrys = xmlDoc.getElementsByTagName('root');
    var keys = countrys[0].attributes;
    var obj = new Object();
    for (var i = 0; i < keys.length; i++) {
      obj[keys[i].nodeName] = keys[i].nodeValue;
    };
    loadConfig(obj);
  }
}