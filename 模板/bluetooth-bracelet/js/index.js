//2023/9/21 number框多位有效小数精度问题
//2023/10/8 修复语法问题$().on("",function(){});添加初始化时信号查询
//2023/10/17 新添加点击a，选信号，禁用时不可选
//2023/10/23 修复number输入--等错误信息不能正确识别
//2023/10/30 修改布局，enable使用div独占一行;修正number小数位截取问题
var not_config = "";
var reg = /[a-zA-Z]:/; //判断linux或者windows，应该false:/(linux)  true:\(windows)
var ipreg = /^(1\d{2}|2[0-4]\d|25[0-5]|[1-9]\d|[0-9])\.((1\d{2}|2[0-4]\d|25[0-5]|[1-9]\d|\d)\.){2}(1\d{2}|2[0-4]\d|25[0-5]|[1-9]\d|\d)$/; //ip正则
var reg = /[a-zA-Z0-9-]$/im;//id
/*---------------正则验证 ip/port --------------*/
$("[type=text]").on("keyup", function () {
  if ($(this).is(":valid")) {
    $(this).attr("value", $(this).val());
    setConfig()
  }
}).on("blur", function () {
  $(this).val($(this).attr('value'));
})
//选信号
$("a").on("click", function () {
  if (!$(this).hasClass("disabled_a")) {
    var name = $(this).attr("name");
    var id = $(this).attr("id");
    var scale = $(this).attr("scale");
    biSelectSignal(name, id, false, null, true, scale, null);
  }
})

/*---------------input [type=number]--------------*/
// $('.container').on("change", "input[type=number]", function () {
//   $(this).val(compareVal(this, $(this).val()));
// }).on('input', "input[type=number]", function (e) {
//   if (e.which == undefined) {
//     $(this).attr("value", $(this).val());
//   } else {
//     $(this).attr("value", compareVal(this, $(this).val()))
//   }
//   setConfig();
// }).on('keypress', "input[type=number]", function (e) {
//   if (!(e.charCode >= 48 && e.charCode <= 57) && !(e.charCode == 45 || e.charCode == 46)) return false;
// })

// function compareVal(obj, val) {
//   var step = $(obj).attr('step').length > 2 ? $(obj).attr('step').length - 2 : 0;
//   var v = Number(val);
//   var newVal = "";
//   if (isNaN(val) || !Boolean(val)) {
//     newVal = Number($(obj).attr('value'));
//   } else {
//     var min = Number($(obj).attr('min')),
//       max = Number($(obj).attr('max'));
//     v = v < min ? min : v;
//     v = v > max ? max : v;
//     if (step > 0) {
//       newVal = Math.round((Math.abs(v) * Math.pow(10, step)).toFixed(1)) / Math.pow(10, step);
//       if (v < 0) newVal = -newVal;
//     } else {
//       newVal = Math.floor(v);
//     }
//   }
//   return step > 0 ? newVal.toFixed(step) : newVal;
// }
//Enter 键保存数据
$("body").on("keydown", function (e) {
  if (e.keyCode == 13) { }
})


//仅步长=精确位数-1时适用
$("body").on("input", "input[type=number]", function (e) {
  var v = $(this).val();
  if (isNaN(e.which)) {
    $(this).attr("value", compareVal(this, v)).val(compareVal(this, v))
  } else {
    if (v !== 0 && Boolean(v)) $(this).attr("value", v);
  }
  setConfig();
});
$("body").on("blur", "input[type=number]", function () {
  $(this).attr("value", compareVal(this, $(this).val())).val(compareVal(this, $(this).val()));
});

function compareVal(obj, val) {
  val = val * 1;//解决科学计数法e计数法表示时不能正确识别的问题
  var newVal = 0;
  var name = $(obj).attr("name");
  var step = Number($(obj).attr("step").length) - 1;
  if (val !== 0 && (isNaN(val) || !Boolean(val))) {
    newVal = Number($(obj).attr('value'));
    return newVal.toFixed(step);
  } else {
    var min = 0,
      max = 0;
    switch (name) {
      case "noaEnableTargetValue": {
        max = 100;
        break;
      }
      case "accEnableTargetValue": {
        min = 1;
        max = 100;
        break;
      }
      default:
        break;
    }
    if (val > max) {
      return max.toFixed(step);
    } else if (val < min) {
      return min.toFixed(step);
    } else {
      //解决为负数时末尾输入5不能进行四舍五入
      newVal = Math.round(Math.abs(val) * Math.pow(10, step)) / Math.pow(10, step);
      if (val < 0) newVal = -newVal;
      if (step > 0) {
        var newValString = newVal.toString();
        var index = newValString.indexOf(".");
        var lastNum = newValString.substring(index + 1).length;
        if (index == -1) {
          return newVal.toFixed(step);
        } else {
          if (lastNum == step) {
            return newVal;
          } else {
            return newVal + "0".repeat(step - lastNum);
          }
        }
      } else {
        return newVal;
      }
    }
  }
}

/*---------------canvas--------------*/
var vehicle = [];
//仅绘画基础部分，十字线、长方体、三角形
function draw() {
  if (vehicle.length < 2) return;
  var canvas = $('.canvas')[0];
  var ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  var p1 = new BIPoint(canvas.width / 2, 0);
  var p2 = new BIPoint(canvas.width / 2, canvas.height);
  var p3 = new BIPoint(0, canvas.height / 8);
  var p4 = new BIPoint(canvas.width, canvas.height / 8);
  // 十字线
  drawLine(p1, p2, 1, "#e9e9e9", ctx);
  drawLine(p3, p4, 1, "#e9e9e9", ctx);
  var size = new BISize(Number(vehicle[0]) * 40, Number(vehicle[1]) * 130);
  var p5 = new BIPoint(canvas.width / 2 - Number(vehicle[0]) * 20, canvas.height / 8);
  // 三角形
  drawRect(p5, size, "black", ctx);
  var p6 = new BIPoint(canvas.width / 2, canvas.height / 8);
  var p7 = new BIPoint(canvas.width / 2 - Number(vehicle[0]) * 20, canvas.height / 8 + Number(vehicle[1]) * 40);
  var p8 = new BIPoint(canvas.width / 2 + Number(vehicle[0]) * 20, canvas.height / 8 + Number(vehicle[1]) * 40);
  var arr = [p6, p7, p8];
  // 长方形
  drawPolygon(arr, "black", ctx);
}
/**
 * 画半圆
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
  // ctx.closePath();
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
// 获取本车长宽
function biOnQueriedGlobalVariable(id, value) {
  vehicle.push(value);
  draw();
}

/*----------配置读取与存储-----------*/
$('[name]').on("change", function () {
  if ($(this).attr("name") == "noaEvaluationEnable") {
    checkboxChange(this);
  }
  setConfig();
});


//保存配置
function setConfig() {
  var text = "<?xml version=\"1.0\" encoding=\"utf-8\"?><root><config ";
  $('.container [name]').each(function () {
    var name = $(this).attr('name');
    var val = $(this).val();
    var type = $(this).attr('type');
    if (type == 'checkbox') {
      text += name + "=\"" + ($(this).is(':checked') ? "yes" : "no") + "\" ";
    } else if (type == "number") {
      text += name + "=\"" + compareVal(this, val) + "\" ";
    } else if ($(this).is("a")) {
      var txt = "null";
      var scale = 1;
      if ($(this).text().indexOf(not_config) == -1) {
        txt = $(this).attr("id");
        scale = $(this).attr("scale");
      }
      text += name + "=\"" + txt + "\" ";
      text += name + "_scale=\"" + scale + "\" ";
    } else {
      text += name + "=\"" + val + "\" ";
    }
  });
  text += " /></root>";
  biSetModuleConfig("noa-evaluation.aspluginnoaevaluation", text);
}

function biOnInitEx(config, moduleConfigs) {
  var lang = biGetLanguage() == 1 ? en : zh;
  $('[language]').each(function () {
    var value = $(this).attr('language');
    $(this).text(lang[value])
  });
  not_config = lang["not_config"];
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
    loadConfig(obj);
  }
}

function loadConfig(obj) {
  $('.container [name]').each(function () {
    var name = $(this).attr("name");
    var val = obj[name];
    if (!val || val == "null") return;
    var type = $(this).attr('type');
    if (type == 'checkbox') {
      $(this).prop('checked', val == 'yes');
      checkboxChange(this);
    } else if (type == "number") {
      var v = compareVal(this, val);
      $(this).val(v).attr("value", v);
    } else if ($(this).is('a')) {
      val = val == "" || val == "null" ? not_config : val;
      if (val != "") {
        biQuerySignalInfo(name, val);
        $(this).attr({ "title": val, "id": val, "scale": obj[$(this).attr("name") + "_scale"] });
      }
    } else {
      $(this).val(val);
    }
  })
}
//部分界面Enable控制界面是否启用
function checkboxChange(obj) {
  if (!$(obj).is(':checked')) {
    $('ul>li:not(:first-child) [name]').addClass('disabled_background').attr('disabled', true);
    $("ul>li:not(:first-child) [language]").addClass('disabled_a');
  } else {
    $('ul>li:not(:first-child) [name]').removeClass('disabled_background').attr('disabled', false);
    $("ul>li:not(:first-child) [language]").removeClass('disabled_a');
  }
}

/*----------独立任务-----------*/
$("a[name=inputPath]").on("click", function () {
  biSelectPath("inputPath", BISelectPathType.Directory, null);
})

function biOnSelectedPath(key, path) {
  if (path == null) {
    $('[name=' + key + ']').removeAttr('title').html(not_config);
  } else {
    $('[name=' + key + ']').attr('title', path + (reg.test(path) ? '\\' : '\/')).html(path + (reg.test(path) ? '\\' : '\/'));
  };
  setConfig();
}

function biOnSelectedSignal(key, valueSignalInfo, signBitSignalInfo, scale) {
  if (valueSignalInfo == null) {
    $('[name=' + key + ']').removeAttr('title id scale').text(not_config).removeClass("green red");
  } else {
    var id = valueSignalInfo.id;
    if (valueSignalInfo.typeName == null) {
      $('[name=' + key + ']').html(id).addClass("red").removeClass("green");
    } else {
      var signalName = valueSignalInfo.signalName;
      $('[name=' + key + ']').html(signalName).addClass("green").removeClass("red");
    }
    $('[name=' + key + ']').attr({ 'title': id, "scale": scale, "id": id });
  }
  setConfig();
}

//加载界面时判断信号是否存在
function biOnQueriedSignalInfo(key, signalInfo) {
  if (signalInfo) {
    $("[name=" + key + "]").text(signalInfo.signalName).addClass("green");
  } else {
    $("[name=" + key + "]").text($("[name=" + key + "]").attr("id")).addClass("red");
  }
}
$('button').on({
  'click': function () {
    var task_config = "<?xml version=\"1.0\" encoding=\"utf-8\"?><root><config ";
    $('a').each(function () {
      var name = $(this).attr('name');
      var value = $(this).html();
      task_config += name + "=\"" + value + "\" ";
    });
    $('select').each(function () {
      var name = $(this).attr('name');
      task_config += name + "=\"" + $(this).val() + "\" ";
    })
    task_config += "/></root>";
    if ($("[name=pixelFormat]").val() != 0) {
      biRunStandaloneTask("Pixel Format", "pixel-format-convert-task.aspluginpixelformatconvert", task_config)
    }
  }
})

//tab分页
var configs = [];
$(".item>li").on("click", function () {
  $(this).addClass("active").siblings().removeClass("active");
  var i = $(".active").index();
  getContentVal(i);
})

function getContentVal(i) {
  $(".content [name]").each(function () {
    var name = $(this).attr("name");
    var val = configs[i][name];
    $(this).val(val);
  })
}