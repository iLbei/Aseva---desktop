var not_config = "",
  dialogConfig = [],
  language = "";
var currentI = 0;//当前页索引
$('.alias').click(function () {
  $(this).hide();
  $(this).next().show();
  $(this).next().val($(this).text()).select();
});

$('[name=alias]').blur(function () {
  $(this).hide();
  $(this).prev().show();
  if ($(this).val().trim().length == 0) return;
  $(this).prev().text($(this).val());
  changeVal(this);
})

$("body").keydown(function (e) {
  var i = $(".active").index() + 1;
  if (e.keyCode == 13) {
    $(".c" + i).find("[name=alias]").hide();
    $(".c" + i).find(".alias").show();
    if ($(".c" + i).find("[name=alias]").val().trim().length == 0) return;
    $(".c" + i).find(".alias").val($(".c" + i).find("[name=alias]").val());
    setConfig();
  }
})

function draw(obj, scale, w, l) {
  var width = 15 * w,
    length = 15.2 * l;
  var canvas = $(obj).find('.canvas')[0];
  var ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  var p1 = new BIPoint(canvas.width / 2, 0);
  var p2 = new BIPoint(canvas.width / 2, canvas.height);
  var p3 = new BIPoint(0, 48);
  var p4 = new BIPoint(canvas.width, 48);
  drawLine(p1, p2, 1, "#e9e9e9", ctx);
  drawLine(p3, p4, 1, "#e9e9e9", ctx);
  var size = new BISize(width * scale, length * scale);
  var p5 = new BIPoint(canvas.width / 2 - width / 2 * scale, 48);
  drawRect(p5, size, "black", ctx);
  var p6 = new BIPoint(canvas.width / 2, 48);
  var p7 = new BIPoint(canvas.width / 2 - width / 2 * scale, 48 + length / 4 * scale);
  var p8 = new BIPoint(canvas.width / 2 + width / 2 * scale, 48 + length / 4 * scale);
  var arr = [p6, p7, p8];
  drawPolygon(arr, "black", ctx);
  var x = $(obj).find('.coor').find('[name=camera_offset_x]').val();
  var y = $(obj).find('.coor').find('[name=camera_offset_y]').val();
  var yaw = $(obj).find('.coor').find('[name=camera_offset_yaw]').val();
  p8 = new BIPoint(canvas.width / 2 - y * 15 * scale, 48 - (24 + x * 24 / 1.5) * scale);
  var p9 = new BIPoint(canvas.width / 2 - y * 15 * scale, 48 - x * 24 / 1.5 * scale);
  var p10 = new BIPoint(canvas.width / 2 - (15 + y * 15) * scale, 48 - x * 24 / 1.5 * scale);
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

$('[name]').change(function () {
  if ($(this).attr("name") != "alias") {
    changeVal(this);
  }
});

//正则判断是否是数字
function NumberCheck(num) {
  var re = /^\d*\.{0,1}\d*$/;
  if (num == "") return null;
  return re.exec(num) != null ? num : null;
}

$("[type=text]").on("keyup", function () {
  if ($(this).is(":valid")) {
    $(this).attr("value", $(this).val());
    changeVal(this);
  }
}).on("blur", function () {
  $(this).val($(this).attr('value'));
})

function changeInput(obj) {
  var max = Number($(obj).attr('max'));
  var min = Number($(obj).attr('min'));
  var v = $(obj).val();
  if (v < min || v > max) return;
  var par = $(obj).parent().parent().parent().parent().parent().parent().parent();
  var scale = $(par).find('.scale_change').attr("scale") == "large" ? 1 : 0.3;
  draw(par, scale, subject_width, subject_length);
}

function changeYawInput(obj) {
  var max = Number($(obj).attr('max'));
  var min = Number($(obj).attr('min'));
  var v = $(obj).val();
  if (v < min || v > max) return;
  var par = $(obj).parent().parent().parent().parent().parent().parent();
  var scale = $(par).find('.scale_change').attr("scale") == "large" ? 1 : 0.3;
  draw(par, scale, subject_width, subject_length);
}

function change(obj) {
  var par = $(obj).parent().parent().parent().parent().parent().parent().parent();
  var scale = $(par).find('.scale_change').attr("scale") == "large" ? 1 : 0.3;
  draw(par, scale, subject_width, subject_length);
}

function changeYaw(obj) {
  var par = $(obj).parent().parent().parent().parent().parent().parent();
  var scale = $(par).find('.scale_change').attr("scale") == "large" ? 1 : 0.3;
  draw(par, scale, subject_width, subject_length);
}

function compareVal(obj, val) {
  var step = $(obj).attr('step').length > 2 ? $(obj).attr('step').length - 2 : 0,
    v = Number(val);
  if (isNaN(val) || !Boolean(val)) {
    newVal = Number($(obj).attr('value'));
  } else {
    var v = Number(val);
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

//车子变大变小
function scaleCanvas(obj) {
  var type = $(obj).attr("scale");
  var lang = biGetLanguage();
  var text = "";
  var scale = 0;
  if (type == "large") {
    text = lang == 1 ? "Scale: Large" : "比例: 大范围";
    $(obj).attr("scale", "small");
    scale = 0.3;
  } else {
    text = lang == 1 ? "Scale: Small" : "比例: 小范围";
    $(obj).attr("scale", "large");
    scale = 1;
  }
  $(obj).text(text);
  draw($(obj).parent().parent().parent(), scale, subject_width, subject_length);
}

function openChildDialog(obj) {
  var name = $(obj).prev().attr("language");
  var title = "";
  switch (name) {
    case "line_type_v": {
      title = language ? "Other line types" : "其他类型";
      biOpenChildDialog("lane-sensor-by-can.line_type.html", title, new BISize(426, 170), currentI);
      break;
    }
    case "line_color_v": {
      title = language ? "Other color types" : "其他颜色";
      biOpenChildDialog("lane-sensor-by-can.line_color.html", title, new BISize(320, 97), currentI);
      break;
    }
  }
}

function headMode(obj) {
  $(obj).parent().parent().parent().parent().parent().parent().next().find('.box').each(function () {
    var type = biGetLanguage();
    var text = $(obj).val() == "Clothoid" ? (type == 1 ? "Heading Angle [rad]:" : "航向角[rad]:") : (type == 1 ? "First order parameter:" : "一阶参数:");
    $(this).children('.right').children('.first').text(text);
  });
}

function curvMode(obj) {
  $(obj).parent().parent().parent().parent().parent().parent().next().find('.box').each(function () {
    var type = biGetLanguage();
    var text = $(obj).val() == "Clothoid" ? (type == 1 ? "Curvature [1/m]:" : "曲率[1/m]:") : (type == 1 ? "Second order parameter:" : "二阶参数:");
    $(this).children('.right').children('.second').text(text);
  });
}

function diffMode(obj) {
  $(obj).parent().parent().parent().parent().parent().parent().next().find('.box').each(function () {
    var type = biGetLanguage();
    var text = $(obj).val() == "Clothoid" ? (type == 1 ? "Differential of Curvature [1/m2]:" : "曲率微分[1/m2]:") : (type == 1 ? "Third order parameter:" : "三阶参数:");
    $(this).children('.right').children('.third').text(text);
  });
}
//导入
function importFile(obj) {
  var filter = {
    ".asmc": "ASEva Module Configuration (*.asmc)"
  };
  biSelectPath("OpenFilePath", BISelectPathType.OpenFile, filter);
}

function biOnSelectedPath(key, path) {
  if (path == null) {
    return;
  }

  if (key == "CreateFilePath") {
    var text = "<?xml version=\"1.0\" encoding=\"utf-8\"?><root ";
    for (var j in dialogConfig[currentI]) {
      if (j != "typesLanes") {
        text += j + "=\"" + dialogConfig[currentI][j] + "\" ";
      }
    }
    text += ">"
    for (var j in dialogConfig[currentI]["typesLanes"]) {
      for (var k in dialogConfig[currentI]["typesLanes"][j]) {
        text += "<" + j + " ";
        for (var m in dialogConfig[currentI]["typesLanes"][j][k]) {
          text += m + "=\"" + dialogConfig[currentI]["typesLanes"][j][k][m] + "\" ";
        }
        text += "/>"
      }
    }
    text += "</root>";
    var xml = "<?xml version=\"1.0\" encoding=\"utf-8\"?><root type=\"lane-sensor-config-v2\">";
    xml += getEncode64(text);
    xml += "</root>";
    biWriteFileText(path, xml);
  } else if (key == "OpenFilePath") {
    biQueryFileText(path);
  }
}

function biOnQueriedFileText(textInfo, path) {
  var txt = language ? "The file is not for lane sensor configuration" : "该文件不是用于车道传感器配置的";
  var title = language ? "Error" : "错误";
  if (textInfo != "") {
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(textInfo, "text/xml");
    var country = xmlDoc.getElementsByTagName('root');
    var type = $(country).attr('type');
    if (type != "lane-sensor-config-v2") {
      biAlert(txt, title);
      return;
    } else {
      var text = getDecode(country[0].textContent);
      xmlDoc = parser.parseFromString(text, "text/xml");
      country = xmlDoc.getElementsByTagName('root');
      var obj = {},
        line = [],
        color_sv = [],
        class_sv = [];
      var keys = country[0].attributes;
      for (var j = 0; j < keys.length; j++) {
        obj[keys[j].nodeName] = keys[j].nodeValue;
      }
      for (var k = 0; k < country[0].childNodes.length; k++) {
        var eKeys = country[0].childNodes[k].attributes;
        var nodeName = country[0].childNodes[k].nodeName;
        var eObj = {};
        for (var n = 0; n < eKeys.length; n++) {
          eObj[eKeys[n].nodeName] = eKeys[n].nodeValue;
        }
        if (nodeName == "class_sv") {
          class_sv.push(eObj);
        } else if (nodeName == "color_sv") {
          color_sv.push(eObj);
        } else {
          line.push(eObj);
        }
      }
      if (class_sv.length == 0) {
        class_sv.push({
          type: "2",
          values: "null"
        }, {
          type: "3",
          values: "null"
        })
      }
      if (color_sv.length == 0) {
        color_sv.push({
          type: "2",
          values: "null"
        }, {
          type: "3",
          values: "null"
        })
      }
      obj["typesLanes"] = { color_sv, class_sv, line };
      dialogConfig[currentI] = obj;
      loadSingle(currentI);
    }
    setConfig();
  } else {
    biAlert(txt, title);
  }
}

//导出
function exportFile(obj) {
  var filter = {
    ".asmc": "ASEva Module Configuration (*.asmc)"
  };
  biSelectPath("CreateFilePath", BISelectPathType.CreateFile, filter);
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
  ctx.arc(origin.x, origin.y, radius, e, s, false);
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

function addBox(obj) {
  $box = $('.box').clone(true);
  $(obj).parent().next().append($box[0]);
  dialogConfig[$(".active").index()]["typesLanes"]["line"].push({
    class_signal: "null", coef_1st_scale: "1", coef_1st_signal: "null", coef_2nd_scale: "1", coef_2nd_signal: "null", coef_3rd_scale: "1", coef_3rd_signal: "null", coef_4th_scale: "1", coef_4th_signal: "null", color_signal: "null", confidence_scale: "1", confidence_signal: "null", detected_signal: "null", detected_values: "0", front_end_scale: "1", front_end_signal: "null", id_signal: "null", rear_end_scale: "1", rear_end_signal: "null", width_scale: "1", width_signal: "null"
  })
  setConfig();
}

function remove(obj) {
  var i = $(obj).parent().parent().parent().index() - 1;
  $(obj).parent().parent().parent().remove();
  dialogConfig[$(".active").index()]["typesLanes"]["line"].splice(i, 1);
  setConfig();
}

function textChange(obj) {
  var val = $(obj).val().replace(/\s+/g, "");
  if (NumberCheck(val) != null) {
    $(obj).attr('val', val);
  }
}
//选择报文

function selectBus(obj) {
  var originID = $(obj).text().lastIndexOf('(') != -1 ? null : $(obj).attr('val');
  biSelectBusMessage($(obj).attr("name"), originID);
}

function biOnSelectedBusMessage(key, info) {
  if (info == null) {
    $("[name=" + key + "]").removeAttr("val");
    $("[name=" + key + "]").text(not_config);
    $("[name=" + key + "]").addClass("red").removeClass("green");
  } else {
    $("[name=" + key + "]").attr({ "val": info.id, "title": info.name });
    $("[name=" + key + "]").text(info.name);
    $("[name=" + key + "]").addClass("green").removeClass("red");
  }
  changeVal($("[name=" + key + "]"));
}

//选择信号

function selectSignal(obj, flag) {
  if ($(obj).css("color").indexOf("169") != -1) return;
  var originID = null;
  if ($(obj).text().lastIndexOf('(') == -1) originID = $(obj).attr('val');
  var scale = 1;
  var scaleName = $(obj).attr('type');
  if (scaleName != undefined) {
    scale = $(obj).attr(scaleName);
  }
  var name = $(obj).attr("name") + "," + $(obj).parents(".box").index();
  var unit = $(obj).attr("unit");
  biSelectSignal(name, originID, false, null, flag, scale, "[" + unit + "]");
}

function biOnSelectedSignal(key, valueInfo, signBitInfo, scale) {
  var name = key.split(",")[0];
  var index = key.split(",")[1];
  var type = $("[name=" + name + "]").attr("type");
  if (valueInfo == null) {
    $(".lines>.box").eq(index).find("[name=" + name + "]").text(not_config).removeAttr('val').removeClass('green').attr(type, "null");
    $(".lines>.box").eq(index).find("[name=" + name + "]").parent().removeAttr("title");
  } else if (valueInfo.typeName == undefined) {
    $(".lines>.box").eq(index).find("[name=" + name + "]").addClass('red').removeClass('green').text(valueInfo.id);
  } else {
    var arr = valueInfo.id.split(":");
    $(".lines>.box").eq(index).find("[name=" + name + "]").text(valueInfo.signalName).attr("val", valueInfo.id);
    $(".lines>.box").eq(index).find("[name=" + name + "]").parent().attr("title", arr[1] + ":" + arr[2]);
    if (type != undefined) {
      $(".lines>.box").eq(index).find("[name=" + name + "]").attr(type, ["null", ""].includes(scale) ? 1 : scale);
    }
    $(".lines>.box").eq(index).find("[name=" + name + "]").addClass('green');
  }
  changeVal($(".lines>.box").eq(index).find("[name=" + name + "]"));
}

function biOnQueriedBusMessageInfo(key, info) {
  var arr = key.split(":");
  var a = $('.container>.content').find('.sampling_msg_id');
  if (arr[0] == "TargetMessage") {
    if (info == null) {
      $(a).text($(a).attr('val')).addClass("red").removeClass("green");
    } else {
      $(a).attr({"val": info.id,"title":info.name}).text(info.name).addClass("green").removeClass("red");
    }
  }
}
/**
 * 加载配置
 */
function loadConfig(arr) {
  if (arr == null) return;
  loadSingle(0);
  //获取本车width,length
  biQueryGlobalVariable("Subject.VehicleWidth", null);
  biQueryGlobalVariable("Subject.VehicleLength", null);
}

var subject_width = -1,
  subject_length = -1;
function loadSingle(i) {
  var obj = dialogConfig[i];
  $(".content").find("[language=lane_line]").siblings(".lines").children("div:not(:first-child)").remove();
  $(".content").find('.alias').text(obj['alias'].trim().length == 0 ? "Lane Sensor" : obj['alias']);
  $(".content").children('.left').find('[name]').each(function () {
    var name = $(this).attr('name');
    if (["solid", "dash", "white", "yellow"].includes(name)) {
      var cls = $(this).parent().parent().attr("class").split(" ")[1];
      var i = $(this).parent().index();
      var v = obj["typesLanes"][cls][i]["values"] == "null" ? "" : obj["typesLanes"][cls][i]["values"];
      $(this).val(v).attr("value", v);
    } else {
      var type = $(this).attr('type');
      var v = obj[name];
      if (v !== 0 && (!v || v == "null")) { v = "" }
      if (type == "checkbox") {
        $(this).prop('checked', v == "yes");
      } else if (type == "number") {
        $(this).val(compareVal(this, v));
      } else if ($(this).is("a")) {
        $(".content").find('.sampling_msg_id').attr('val', v);
        if (v == "" || v == "null" || !v) {
          $(this).text(not_config).removeClass("green").addClass("red");
        } else {
          biQueryBusMessageInfo("TargetMessage:" + i, v);
        }
      } else {
        $(this).val(v);
      }
    }
  });
  headMode($(".content").find('[name=heading_mode]'));
  curvMode($(".content").find('[name=curvature_mode]'));
  diffMode($(".content").find('[name=curvature_diff_mode]'));
  draw($(".container>.content"), 1, subject_width, subject_length);
  var class_p = "",
    color_p = "";
  for (var j = 2; j < obj["typesLanes"]["class_sv"].length; j++) {
    class_p += obj["typesLanes"]["class_sv"]["values"][j] + ":";
  }
  $(".content").children('.bottom').children('.type').text(class_p);
  for (var j = 2; j < obj["typesLanes"]["color_sv"].length; j++) {
    color_p += obj["typesLanes"]["color_sv"][j]["values"] + ":";
  }
  $(".content").children('.bottom').children('.color').text(color_p);
  for (var n = 0; n < obj["typesLanes"]["line"].length; n++) {
    var line = obj["typesLanes"]["line"][n];
    $box = $(".content").children('.right').children('.lines').children('div:first-of-type').clone(true);
    $box.find('a').each(function () {
      var className = $(this).attr('name');
      if (Boolean(line[className]) && className != "right" && line[className] != "null" && line[className] != "undefined") {
        $(this).attr('val', line[className]);
        biQuerySignalInfo(i + "|" + n + "|" + className, line[className]);
        var tt = $(this).attr('type');
        if (tt != undefined) $(this).attr(tt, line[tt]);
      }
    });
    $box.find("[name=detected_values]").attr("value", line["detected_values"]).val(line["detected_values"]);
    $(".content").children('.right').children('.lines').append($box[0]);
  }
  checkRearFront($(".content").find('[name=rear_bound]'), $(".content").find('[name=front_bound]'));
}

function biOnQueriedGlobalVariable(id, value) {
  if (id == "Subject.VehicleWidth") subject_width = Number(value);
  if (id == "Subject.VehicleLength") subject_length = Number(value);
  if (subject_length != -1 && subject_width != -1) {
    $('.container>.content>div').each(function (i, v) {
      draw($(this), 1, subject_width, subject_length);
    });
  }
}

function biOnQueriedSignalInfo(key, signalID) {
  if (key.indexOf("|") != -1) {
    var arr = key.split("|");
    var content = $('.container>.content').children('.right').children('.lines');
    var n = parseInt(arr[1]) + 1;
    if (signalID != null) {
      $(content).children('div:eq(' + n + ')').find('.' + arr[2]).text(signalID.signalName).
        addClass('green');
      $(content).children('div:eq(' + n + ')').find('.' + arr[2]).parent().attr("title", signalID.typeName + ":" + signalID.signalName);
    } else {
      var val = $(content).children('div:eq(' + n + ')').find('.' + arr[2]).attr("val");
      $(content).children('div:eq(' + n + ')').find('.' + arr[2]).text(val).addClass('red').attr("title", val);
    }
  }
}

function checkRearFront(obj1, obj2) {
  var b2 = Number($(obj2).val()),
    b1 = Number($(obj1).val());
  if (b2 > b1) {
    $(obj2).prev().removeClass('red');
    $(obj1).prev().removeClass('red');
  } else {
    $(obj2).prev().addClass('red');
    $(obj1).prev().addClass('red');
  }
}

function checkRear(obj) {
  var f = $(obj).parent().next().find('[name=front_bound]');
  checkRearFront(obj, f);
}

function checkFront(obj) {
  var r = $(obj).parent().prev().find('[name=rear_bound]');
  checkRearFront(r, obj);
}

function changeVal(obj) {
  var name = $(obj).attr('name');
  if ($(obj).parents().is($(".content>.left"))) {
    if (!["solid", "dash", "white", "yellow"].includes(name)) {
      var val = $(obj).val();
      var type = $(obj).attr('type');
      if (type == 'checkbox') {
        val = $(obj).is(':checked') ? "yes" : "no";
      } else if (type == "number") {
        val = compareVal(obj, val);
      } else if ($(obj).is("a")) {
        if ($(obj).hasClass("sampling_msg_id")) {
          val = Boolean($(obj).attr('val')) ? $(obj).attr('val') : "null";
        }
      } else if (name == "alias") {
        val = $(obj).prev().text();
      }
      dialogConfig[currentI][name] = val;
    } else {
      var pClass = $(obj).parent().parent().attr("class").split(" ")[1];
      var index = $(obj).parent().index();
      dialogConfig[currentI]["typesLanes"][pClass][index] = { "type": $(obj).attr("num"), "values": $(obj).val() };
    }
  } else if ($(obj).parents().hasClass("lines")) {
    var boxI = $(obj).parents(".box").index() - 1;
    var lane = dialogConfig[currentI]["typesLanes"]["line"][boxI];
    if ($(obj).is("a")) {
      var className = $(obj).attr('name');
      if (className != undefined) {
        var val = $(obj).attr('val') == undefined ? null : $(obj).attr('val');
        if (className != "right") lane[className] = val;
        var type = $(obj).attr('type');
        if (type != undefined) {
          lane[type] = $(obj).attr(type);
        }
      }
    } else if ($(obj).attr("name") == "detected_values") {
      lane["detected_values"] = $(obj).attr('value');
    }
  }
  setConfig();
}
/**
 * 写配置
 */
function setConfig() {
  var text = "<?xml version=\"1.0\" encoding=\"utf-8\"?><root>";
  for (var i in dialogConfig) {
    text += "<c" + (Number(i) + 1) + " ";
    for (var j in dialogConfig[i]) {
      if (j != "typesLanes") {
        text += j + "=\"" + dialogConfig[i][j] + "\" ";
      }
    }
    text += ">"
    for (var j in dialogConfig[i]["typesLanes"]) {
      for (var k in dialogConfig[i]["typesLanes"][j]) {
        text += "<" + j + " ";
        for (var m in dialogConfig[i]["typesLanes"][j][k]) {
          text += m + "=\"" + dialogConfig[i]["typesLanes"][j][k][m] + "\" ";
        }
        text += "/>"
      }
    }
    text += "</c" + (Number(i) + 1) + ">";
  }
  text += "</root>";
  biSetModuleConfig("lane-sensor-by-can.pluginsensor", text);
}

function biOnInitEx(config, moduleConfigs) {
  language = biGetLanguage() == 1;
  var lang = language ? en : cn;
  $('[language]').each(function () {
    var value = $(this).attr('language');
    $(this).text(lang[value]);
  });
  not_config = lang["not_cfg"];
  for (var key in moduleConfigs) {
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(moduleConfigs[key], "text/xml");
    var countrys = xmlDoc.getElementsByTagName('root');
    for (var i = 0; i < countrys[0].childNodes.length; i++) {
      var nodeName = countrys[0].childNodes[i].nodeName;
      var conu = xmlDoc.getElementsByTagName(nodeName);
      var keyss = conu[0].attributes;
      var obj = {},
        line = [],
        color_sv = [],
        class_sv = [];
      for (var j = 0; j < keyss.length; j++) {
        obj[keyss[j].nodeName] = keyss[j].nodeValue;
      }
      for (var k = 0; k < conu[0].childNodes.length; k++) {
        var eKeys = conu[0].childNodes[k].attributes;
        var nodeName = conu[0].childNodes[k].nodeName;
        var eObj = new Object();
        for (var n = 0; n < eKeys.length; n++) {
          eObj[eKeys[n].nodeName] = eKeys[n].nodeValue;
        }
        if (nodeName == "class_sv") {
          class_sv.push(eObj);
        } else if (nodeName == "color_sv") {
          color_sv.push(eObj);
        } else {
          line.push(eObj);
        }
      }
      if (class_sv.length == 0) {
        class_sv.push({
          type: "2",
          values: "null"
        }, {
          type: "3",
          values: "null"
        })
      }
      if (color_sv.length == 0) {
        color_sv.push({
          type: "2",
          values: "null"
        }, {
          type: "3",
          values: "null"
        })
      }
      obj["typesLanes"] = { color_sv, class_sv, line };
      dialogConfig.push(obj);
    }
  }
  loadConfig(dialogConfig);
}

function biOnClosedChildDialog() {
  var v = JSON.parse(biGetLocalVariable("lane_sensor_by_can_dialog"));
  if (v) {
    dialogConfig = v;
  }
  setConfig();
}

$('input[type=number]').on({
  "change": function () {
    $(this).val(compareVal(this, $(this).val()));
  },
  'input': function (e) {
    if (e.which == undefined) {
      var step = $(this).attr("step").length - 2;
      var val = Number($(this).val());
      $(this).val(step > 0 ? val.toFixed(step) : val);
    }
    changeVal(this);
  },
  'keypress': function (e) {
    if (!(e.charCode >= 48 && e.charCode <= 57) && !(e.charCode == 45 || e.charCode == 46)) {
      return false;
    }
  }
})

//tab分页
$(".item>li").on("click", function () {
  $(this).addClass("active").siblings().removeClass("active");
  currentI = $(".active").index();
  loadSingle(currentI);
})
