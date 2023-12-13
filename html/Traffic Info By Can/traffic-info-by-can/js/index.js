var not_config = "",
  bus_obj_index1 = [],
  bus_obj_index2 = [];
$(function () {
  $('.container>.content:eq(0)').show();
});

$('button').click(function () {
  $(this).addClass('white').siblings().removeClass('white');
  var num = $(this).index();
  $('.container>.content:eq(' + num + ')').show().siblings('.content').hide();
});

$(document).keydown(function (e) {
  if (e.keyCode == 13) {
    var boxIndex = $(".white").index();
    var alias = $('.container').children("div:eq(" + (boxIndex + 1) + ")").find('[name=alias]');
    $(alias).hide().prev().show();
    if ($(alias).val().trim().length != 0) {
      $(alias).prev().text($(alias).val());
      setConfig()
    }
  }
});

function draw(obj, scale, w, l) {
  var width = 15 * w,
    length = 15.2 * l;
  var canvas = $(obj).find('.canvas1')[0];
  var ctx1 = canvas.getContext('2d');
  ctx1.clearRect(0, 0, 150, 184);
  var p1 = new BIPoint(150 / 2, 0);
  var p2 = new BIPoint(0, 45);
  var p3 = new BIPoint(150, 45);
  var p4 = new BIPoint(150 / 2, 184);
  drawLine(p1, p4, 1, "#e9e9e9", ctx1);
  drawLine(p3, p2, 1, "#e9e9e9", ctx1);
  //画本车
  var p = new BIPoint(150 / 2 - width / 2 * scale, 45);
  var size = new BISize(width * scale, length * scale);
  drawRect(p, size, "black", ctx1); //方框
  var p5 = new BIPoint(150 / 2, 45);
  var p6 = new BIPoint(150 / 2 - width / 2 * scale, 45 + length / 4 * scale);
  var p7 = new BIPoint(150 / 2 + width / 2 * scale, 45 + length / 4 * scale);
  var arr = [p5, p6, p7];
  drawPolygon(arr, "black", ctx1); //车头三角形
  var x = $($(obj).find('[name=camera_offset_x]')[0]).val();
  var y = $($(obj).find('[name=camera_offset_y]')[0]).val();
  var yaw = $($(obj).find('[name=camera_offset_yaw]')[0]).val();
  var p8 = new BIPoint(150 / 2 - y * 15 * scale, 45 - (24 + x * 24 / 1.5) * scale);
  var p9 = new BIPoint(150 / 2 - y * 15 * scale, 45 - x * 24 / 1.5 * scale);
  var p10 = new BIPoint(150 / 2 - (15 + y * 15) * scale, 45 - x * 24 / 1.5 * scale);
  ctx1.save();
  ctx1.translate(p9.x, p9.y);
  ctx1.rotate(Math.PI / 180 * (0 - yaw));
  p1 = new BIPoint(p8.x - p9.x, p8.y - p9.y);
  p2 = new BIPoint(p9.x - p9.x, p9.y - p9.y);
  p3 = new BIPoint(p10.x - p9.x, p10.y - p9.y);
  ctx1.beginPath();
  ctx1.moveTo(p1.x, p1.y);
  ctx1.lineTo(p2.x, p2.y);
  ctx1.lineTo(p3.x, p3.y);
  ctx1.strokeStyle = "#32cd32";
  ctx1.stroke();
  ctx1.restore();
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
      $(obj).removeClass("red").addClass('green').attr('value', newArr.join());
    }
  } else {
    var v = Number(str);
    if (!isNaN(v) && str != "") { //green
      $(obj).removeClass("red").addClass('green').attr('value', v);
    } else if (str != "") { //red
      $(obj).addClass('red').removeClass('green');
    } else if (str == "" && $(obj).hasClass('bar')) {
      $(obj).attr('value', "");
    }
  }

}

function checkBur(obj) {
  if ($(obj).hasClass('green')) {
    var str = $(obj).val();
    if (str.indexOf(",") != -1) {
      var arr = str.split(','),
        newArr = [];
      for (var i = 0; i < arr.length; i++) {
        var v = Number(arr[i]);
        newArr.push(v);
      }
      $(obj).val(newArr.join()).attr('value', newArr.join());
    } else {
      if (str != "") {
        var v = Number(str);
        $(obj).val(v).attr('value', v);
      } else {
        var v = $(obj).attr('value');
        $(obj).val(v).attr('value', v);
      }
    }
  } else if ($(obj).hasClass('final_msg')) {
    var v = $(obj).attr('value');
    $(obj).val(v).removeClass('red').addClass('green');
  }
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
$('[type=text]').bind("input propertychange", function () {
  var name = $(this).attr('name');
  if (name == "alias") return
  checkTextValue($(this));
  setConfig();
}).blur(function () {
  var name = $(this).attr('name');
  if (name == "alias") return
  checkBur($(this));
});
$('[name=alias]').blur(function () {
  if ($(this).val().trim().length != 0) {
    $(this).prev().text($(this).val());
    setConfig();
  }
  $(this).hide().prev().show();
})
$('.alias').click(function () {
  $(this).hide();
  $(this).next().show();
  $(this).next().val($(this).text()).attr('value', $(this).text()).select();
});

$('.container').on("change", "[name]", function () {
  if ($(this).attr("name") != "alias") setConfig();
});
$('[type=number]').blur(function () {
  $(this).val(compareVal(this, $(this).val()));
});

var bus = undefined;
//选择报文
function selectBus(obj) {
  var originID = $(obj).text().lastIndexOf('(') != -1 ? null : $(obj).attr('val');
  bus = obj;
  biSelectBusMessage("TargetMessage", originID);
}

function biOnSelectedBusMessage(key, info) {
  var type = biGetLanguage();
  if (key == "TargetMessage") {
    if (info == null) {
      $(bus).removeAttr("val");
      $(bus).text(not_config);
      $(bus).css("color", "red");
    } else {
      $(bus).attr("val", info.id);
      $(bus).text(info.name);
      $(bus).removeClass("red").addClass("green");
    }
  }
  setConfig();
}

//选择信号
var signal = undefined; //选择的当前元素

function selectSignal(obj, type) {
  if ($(obj).css("color").indexOf("169") != -1) return;
  var originID = null;
  if ($(obj).text().lastIndexOf('(') == -1) originID = $(obj).attr('val');
  var className = $(obj).attr('class');
  var scaleName;
  if (className.indexOf('final_msg') != -1) {
    var arr = className.split(" ");
    scaleName = arr[0].split("_")[0] + "_scale";
  } else {
    scaleName = className.split("_")[0] + "_scale";
  }
  var scale = $(obj).attr(scaleName) == undefined ? 1 : $(obj).attr(scaleName);
  signal = obj;
  scale = Number(scale);
  var unit = $(obj).attr("unit");
  biSelectSignal("TargetSignal", originID, false, null, type, scale, "[" + unit + "]");
}

function biOnSelectedSignal(key, valueInfo, signBitInfo, scale) {
  if (key == "TargetSignal") {
    if (valueInfo == null) {
      $(signal).text(not_config);
      if ($(signal).hasClass('final_msg')) {
        $(signal).addClass("red");
      } else {
        $(signal).removeClass('green');
      }
      $(signal).attr("title", "");
    } else if (valueInfo.typeName == undefined) {
      $(signal).text(valueInfo.id).css('color', "red").removeAttr("title");
    } else {
      var className = $(signal).attr("class");
      var arr = className.split(" ");
      var scaleName = arr[0].split("_")[0] + "_scale";
      $(signal).text(valueInfo.signalName);
      $(signal).attr("val", valueInfo.id);
      $(signal).attr(scaleName, scale);
      $(signal).removeClass("red").addClass("green");
      $(signal).attr("title", valueInfo.typeName + ":" + valueInfo.signalName);
    }
  }
  setConfig();
}
//添加
$('.element li').click(function () {
  var index = $(this).index();
  $getParagraph = $(this).parent().next().children('.box' + (index + 1)).clone(true);
  $(this).parent().next().append($getParagraph[0]);
  $(this).parent().next().children('div:last-of-type').addClass('border').siblings().removeClass('border');
  $(this).parent().next().next().removeClass('disabled');
  setConfig();
});

$('.bottom>div').click(function () {
  $(this).addClass('border').siblings().removeClass('border');
  // setConfig();
});

//移除
$('.remove').click(function () {
  if ($(this).hasClass("disabled")) return;
  $(this).prev().find('.border').remove();
  $(this).prev().children('div:last-of-type').addClass('border');
  if ($(this).prev().children('div').length == 9)
    $(this).addClass("disabled");
  setConfig();
});

function xChange(obj) {
  $(obj).val(compareVal(obj, $(obj).val()));
  var par = $(obj).parent().parent().parent().parent();
  var scale = $(par).find('.scale_change').attr("scale") == "large" ? 1 : 0.3;
  draw(par, scale, subject_width, subject_length);
}

function xChangeInput(obj) {
  var max = Number($(obj).attr('max'));
  var min = Number($(obj).attr('min'));
  var v = Number($(obj).val());
  if (v < min || v > max) return
  var par = $(obj).parent().parent().parent().parent();
  var scale = $(par).find('.scale_change').attr("scale") == "large" ? 1 : 0.3;
  draw(par, scale, subject_width, subject_length);
}

function yawChangeInput(obj) {
  var max = Number($(obj).attr('max'));
  var min = Number($(obj).attr('min'));
  var v = Number($(obj).val());
  if (v < min || v > max) return
  var par = $(obj).parent().parent().parent().parent();
  var scale = $(par).find('.scale_change').attr("scale") == "large" ? 1 : 0.3;
  draw(par, scale, subject_width, subject_length);
}

function yawChange(obj) {
  $(obj).val(compareVal(obj, $(obj).val()));
  var par = $(obj).parent().parent().parent().parent();
  var scale = $(par).find('.scale_change').attr("scale") == "large" ? 1 : 0.3;
  draw(par, scale, subject_width, subject_length);
}

$('[name=output_sample_version]').change(function () {
  if ($(this).val() == "1") {
    $('.id_sig').css({
      'text-decoration': 'none',
      'color': 'darkgray'
    });
    $('.posz_sig').css({
      'text-decoration': 'none',
      'color': 'darkgray'
    });
    $('.box3').find('[name=stop_flash_val]').attr('disabled', true);
    $('.box3').find('[name=allow_flash_val]').attr('disabled', true);
  } else {
    $('.id_sig').css({
      'text-decoration': 'underline',
      'color': 'blue'
    });
    $('.posz_sig').css({
      'text-decoration': 'underline',
      'color': 'blue'
    });
    $('.box3').find('[name=stop_flash_val]').removeAttr('disabled');
    $('.box3').find('[name=allow_flash_val]').removeAttr('disabled');
  }
  setConfig();
})

//车子变大变小
function scaleCanvas(obj) {
  var type = $(obj).attr("scale");
  var lang = biGetLanguage();
  var text = "";
  var scale = 0;
  if (type == "large") {
    text = lang == 1 ? "Scale:Large" : "比例:大范围";
    $(obj).attr("scale", "small");
    scale = 0.3;
  } else {
    text = lang == 1 ? "Scale:Small" : "比例:小范围";
    $(obj).attr("scale", "large");
    scale = 1;
  }
  $(obj).text(text);
  draw($(obj).parent().parent().parent(), scale, subject_width, subject_length);
}

function biOnQueriedBusMessageInfo(key, info) {
  if (bus_obj_index1.length != 0 && key.indexOf(":") == -1) {
    var index = parseInt(key);
    var a = $('.container>.content:eq(' + index + ')').children('div:nth-of-type(2)').find('.red');
    if (info == null) {
      $(a).text($(a).attr("val")).addClass("red");
    } else {
      $(a).attr("val", info.id);
      $(a).text(info.name);
      $(a).removeClass("red").addClass("green");
    }
    bus_obj_index1.shift();
  } else if (bus_obj_index2.length != 0 && key.indexOf(":") != -1) {
    var arr = key.split(":");
    var d = parseInt(arr[1]);
    var a = $('.container>.content:eq(' + arr[0] + ')').find('.bottom').children('div:nth-of-type(' + (d + 9) + ')').find('.final_msg');
    if (info == null) {
      $(a).text($(a).attr("val")).addClass("red");
    } else {
      $(a).attr("val", info.id);
      $(a).text(info.name);
      $(a).removeClass("red").addClass("green");
    }
    bus_obj_index2.shift();
  }
  setConfig();
}
/**
 * 加载配置
 */
function loadConfig(json) {
  if (json == null) return;
  bus_obj_index1 = [];
  bus_obj_index2 = [];
  var version = json["output_sample_version"];
  $('[name=output_sample_version]').val(version);
  var vals = json["arr"];
  var typeArr = ["speed-limit", "stop-sign", "traffic-light", "stop-line", "speed-bump", "arrow-mark", "prohibition-zone", "parking-slot", "zebra-crossing"];
  $('.content').each(function (k) {
    var val = vals[k];
    var originID = val["final_msg"] == "null" ? null : val["final_msg"];
    if (originID != null) {
      var bus = {
        id: k,
        origin: originID
      }
      $(this).find('.final_msg').attr("val", originID);
      bus_obj_index1.push(bus);
    }
    $(this).find('.alias').text(val["alias"].trim().length == 0 ? "Traffic Info" : val["alias"]);
    $(this).children('div:nth-of-type(2)').find('[name]').each(function () {
      var value = $(this).attr("name");
      var type = $(this).attr("type");
      if (type == "checkbox") {
        $(this).attr("checked", val[value] == "yes");
      } else if (type == "number") {
        $(this).val(compareVal(this, val[value]));
      } else if (type != "number") {
        var t = val[value] == "null" ? "" : val[value];
        $(this).val(t);
      }
    });
    if (val['eArr'].length != 0) {
      for (var i = 0; i < val['eArr'].length; i++) {
        var e = val["eArr"][i];
        var ty = e.type;
        var index = typeArr.indexOf(ty);
        $getParagraph = $(this).find('.box' + (index + 1)).clone(true);
        $getParagraph.find('a').each(function () {
          var classNameArr = $(this).attr("class").split(" ");
          var className = classNameArr[0];
          if (className == "final_msg") {
            var originID = e["final_msg"] == "null" ? null : e["final_msg"];
            if (originID != null) {
              var bus = {
                id: k,
                index: i + 1,
                origin: originID
              }
              $(this).attr('val', originID);
              bus_obj_index2.push(bus);
            }
          }
          var scaleName = className.split("_")[0] + "_scale";
          if ($(this).attr(scaleName) == undefined) {
            var va = e[className];
            if (va != "null" && va != undefined) {
              biQuerySignalInfo(k + "|" + i + "|" + className, va);
              $(this).attr("val", va);
            }
          } else {
            if (e[className] != undefined && e[className] != "null") {
              var va = e[className];
              if (va != "null" && va != undefined) {
                biQuerySignalInfo(k + "|" + i + "|" + className, va);
                $(this).attr(scaleName, e[scaleName]);
                $(this).attr("val", e[className]);
              }
            }
          }
        });
        $getParagraph.find('[name]').each(function () {
          var value = $(this).attr('name');
          if (e[value] != undefined) {
            var t = e[value] == "null" ? "" : e[value];
            $(this).val(t);
          }
        });
        $(this).find('.bottom').append($getParagraph[0]);
      }
      $(this).find('.remove').removeClass('disabled');
    }
  });
  if (version == "1") { //v1
    $('.id_sig').css({
      'text-decoration': 'none',
      'color': 'darkgray'
    });
    $('.posz_sig').css({
      'text-decoration': 'none',
      'color': 'darkgray'
    });
    $('.box3').find('[name=stop_flash_val]').attr('disabled', true);
    $('.box3').find('[name=allow_flash_val]').attr('disabled', true);
  }
  for (var i = 0; i < bus_obj_index1.length; i++) {
    var v = bus_obj_index1[i];
    biQueryBusMessageInfo(v.id + "", v.origin);
  }
  for (var i = 0; i < bus_obj_index2.length; i++) {
    var v = bus_obj_index2[i];
    biQueryBusMessageInfo(v.id + ":" + v.index, v.origin);
  }
  //获取本车width,length
  biQueryGlobalVariable("Subject.VehicleWidth", 1.6);
  biQueryGlobalVariable("Subject.VehicleLength", 4.9);
}
var subject_width = -1,
  subject_length = -1;

function biOnQueriedGlobalVariable(id, value) {
  if (id == "Subject.VehicleWidth") subject_width = Number(value);
  if (id == "Subject.VehicleLength") subject_length = Number(value);
  if (subject_length != -1 && subject_width != -1) {
    $('.content').each(function () {
      draw($(this).children('div:nth-of-type(2)'), 1, subject_width, subject_length);
    });
  }
}

function biOnQueriedSignalInfo(key, signalInfo) {
  var arr = key.split("|");
  var c = Number(arr[0]) + 2;
  var b = Number(arr[1]) + 10;
  if (signalInfo != null) {
    $('.container>div:nth-of-type(' + c + ')').find(".bottom").children('div:nth-of-type(' + b + ')')
      .find("." + arr[2]).text(signalInfo.signalName).removeClass("red").addClass("green").attr("title", signalInfo.typeName + ":" + signalInfo.signalName);
  } else {
    var box = $('.container>div:nth-of-type(' + c + ')').find(".bottom").children('div:nth-of-type(' + b + ')').find("." + arr[2]);
    var val = $(box).attr('val');
    $(box).text(val).attr("title", "").addClass("red");
  }
  setConfig();
}

/**
 * 写配置
 */

function setConfig() {
  var text = "<?xml version=\"1.0\" encoding=\"utf-8\"?><root>";
  $('.content').each(function () {
    var idName = $(this).attr('id');
    text += "<" + idName;
    text += " alias=\"" + $(this).find('.alias').text() + "\" ";
    $(this).children('div:nth-of-type(2)').find('[name]').each(function () {
      var name = $(this).attr("name");
      var type = $(this).attr('type');
      if (type == "checkbox") {
        var f = $(this).get(0).checked ? "yes" : "no";
        text += name + "=\"" + f + "\" ";
      } else if (type == "number") {
        text += " " + name + "=\"" + compareVal(this, $(this).val()) + "\"";
      } else if (type != "number") {
        text += name + "=\"" + $(this).val() + "\" ";
      }
    });
    var bus = $(this).children('div:nth-of-type(2)').find('a').attr("val") != undefined ? $(this).children('div:nth-of-type(2)').find('a').attr("val") : null;
    text += " final_msg" + "=\"" + bus + "\"";
    var len = $(this).find('.bottom>div').length;
    if (len < 10) {
      text += " />";
    } else {
      text += " >";
      $(this).find('.bottom>div').each(function (i, v) {
        if (i >= 9) {
          var ty = $(this).attr('type');
          text += "<e ";
          $(this).find('[name]').each(function () {
            var value = $(this).attr("name");
            var type = $(this).attr('type');
            if (type == " checkbox") {
              var f = $(this).get(0).checked ? "yes" : "no";
              text += value + "=\"" + f + "\" ";
            } else if (type != "number") {
              text += value + "=\"" + $(this).val() + "\" ";
            }
          });
          $(this).find('a').each(function () {
            var classNameArr = $(this).attr("class").split(" ");
            var className = classNameArr[0];
            var val = $(this).text().indexOf(not_config) != -1 ? null : $(this).attr("val");
            text += className + "=\"" + val + "\" ";
            var scaleName = className.split("_")[0] + "_scale";
            if ($(this).attr(scaleName) != undefined)
              text += scaleName + "=\"" + $(this).attr(scaleName) + "\" ";
          });
          text += "type" + "=\"" + ty + "\" />";
        }
      });
      text += "</" + idName + ">";
    }
  });
  text += "</root>";
  biSetModuleConfig("traffic-info-by-can.pluginsensor", text);
}

function biOnInitEx(config, moduleConfigs) {
  var lang = biGetLanguage() == 1 ? en : cn;
  $('[language]').each(function () {
    var value = $(this).attr('language');
    $(this).text(lang[value])
  });
  not_config = lang["not_config"];
  for (var key in moduleConfigs) {
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(moduleConfigs[key], "text/xml");
    var countrys = xmlDoc.getElementsByTagName('root');
    var o = new Object();
    var arr = [];
    for (var i = 0; i < countrys[0].childNodes.length; i++) {
      var nodeName = countrys[0].childNodes[i].nodeName;
      var conu = xmlDoc.getElementsByTagName(nodeName);
      var keyss = conu[0].attributes;
      var obj = new Object();
      for (var j = 0; j < keyss.length; j++) {
        obj[keyss[j].nodeName] = keyss[j].nodeValue;
      }
      var cArr = [];
      for (var k = 0; k < conu[0].childNodes.length; k++) {
        var eKeys = conu[0].childNodes[k].attributes;
        var eObj = new Object();
        for (var n = 0; n < eKeys.length; n++) {
          eObj[eKeys[n].nodeName] = eKeys[n].nodeValue;
        }
        cArr.push(eObj);
      }
      obj["eArr"] = cArr;
      arr.push(obj);
    }
    o["arr"] = arr;
    loadConfig(o);
  }
}