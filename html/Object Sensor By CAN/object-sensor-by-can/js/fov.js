var childIndex = 0, boxIndex = 0, dialogConfig = [], fov = [];
$("button").click(function () {
  if ($(this).attr("language") == "ok") {
    changeVal();
    setConfig();
    biSetLocalVariable("object_sensor_by_can", JSON.stringify(dialogConfig));
  }
  biCloseChildDialog();
})

function biOnInitEx(config, moduleConfigs) {
  boxIndex = config.split(",")[0];
  childIndex = config.split(",")[1];
  $('[language]').each(function () {
    var value = $(this).attr('language');
    $(this).text(biGetLanguage() == 1 ? en[value] : cn[value])
  });
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
      var child = { "fov": [], "class_signal_value": [], object: []};
      for (var j = 0; j < childKeys.length; j++) {
        var name = childKeys[j].nodeName;
        var childKeysAttrs = childKeys[j].attributes;
        var childAttr = {}
        for (var k = 0; k < childKeysAttrs.length; k++) {
          childAttr[childKeysAttrs[k].nodeName] = childKeysAttrs[k].nodeValue;
        }
        if (name == "fov") {
          if (i == childIndex) {
            fov.push(childAttr);
          } else {
            child.fov.push(childAttr)
          }
        } else if (name == "class_signal_value") {
          child.class_signal_value.push(childAttr);
        } else if (name == "object") {
          child.object.push(childAttr);
        }
      }
      dialogConfig.push({ "attr": obj, "childAttr": child });
    }
    loadConfig(fov);
  }
}

function loadConfig(arr) {
  if (boxIndex !== "") {
    $(".fov [name]").each(function () {
      var name = $(this).attr("name");
      name = (["x", "y"].includes(name) ? "pos" : "") + name;
      $(this).val(compareVal(this, arr[boxIndex][name]));
    })
  } else {
    fov.push({});
  }
  changeFov();
}

function changeVal() {
  var obj = {};
  $("input").each(function () {
    var name = $(this).attr("name");
    name = (["x", "y"].includes(name) ? "pos" : "") + name;
    obj[name] = $(this).val();
  })
  if (boxIndex === "") {
    fov[fov.length - 1] = obj;
  } else {
    fov[boxIndex] = obj;
  }
  dialogConfig[childIndex]["childAttr"]["fov"] = fov;
}

function setConfig() {
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

$('input[type=number]').on({
  "change": function () {
    $(this).val(compareVal(this, $(this).val()));
    changeFov();
  },
  'input': function (e) {
    if (e.which == undefined) {
      var step = $(this).attr("step").length - 2;
      var val = Number($(this).val());
      $(this).val(step > 0 ? val.toFixed(step) : val);
      changeFov();
    }
  },
  'keypress': function (e) {
    if (!(e.charCode >= 48 && e.charCode <= 57) && !(e.charCode == 45 || e.charCode == 46)) {
      return false;
    }
  }
})
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


function changeFov() {
  var pox = Number($('.fov').find('[name=x]').val());
  var poy = Number($('.fov').find('[name=y]').val());
  var orient = Number($('.fov').find('[name=orient]').val());
  var angle = Number($('.fov').find('[name=angle_range]').val());
  drawFov(pox, poy, orient, angle);
}

function drawFov(pox, poy, orient, angle) {
  var canvas = $('.fov').find('canvas')[0];
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
  var size = new BISize(30, 70);
  var p5 = new BIPoint(canvas.width / 2 - 15, h);
  drawRect(p5, size, "black", ctx);
  var p6 = new BIPoint(canvas.width / 2, h);
  var p7 = new BIPoint(canvas.width / 2 - 15, h + 25);
  var p8 = new BIPoint(canvas.width / 2 + 15, h + 25);
  var array = [p6, p7, p8];
  drawPolygon(array, "black", ctx);
  p8 = new BIPoint(canvas.width / 2, h - 24);
  //2023.4.21 fov界面不需要绿色目标物
  // var p9 = new BIPoint(canvas.width / 2, h);
  // var p10 = new BIPoint(canvas.width / 2 - 15, h);
  // drawLine(p8, p9, 1, "#32cd32", ctx);
  // drawLine(p9, p10, 1, "#32cd32", ctx);
  var distPQ = Math.cos(deg2rad * angle * 0.5) * zeroY;
  var halfPQ = Math.sin(deg2rad * angle * 0.5) * zeroY;
  var p13 = new BIPoint(0, 0);
  var p11 = new BIPoint(distPQ, halfPQ);
  var p12 = new BIPoint(distPQ, -halfPQ);
  var po = standardPointToView(p13, zeroX, zeroY, k, pox, poy, orient);
  var ps = standardPointToView(p11, zeroX, zeroY, k, pox, poy, orient);
  var pb = standardPointToView(p12, zeroX, zeroY, k, pox, poy, orient);
  drawArc(po, "#9a79dd", ctx, 10, Math.PI * (1.5 + angle * 0.5 / 180 - orient / 180), Math.PI * (1.5 - angle * 0.5 / 180 - orient / 180));
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


function standardPointToView(src, zeroX, zeroY, k, sensorX, sensorY, orient) {
  var deg2rad = Math.PI / 180;
  var orientCos = Math.cos(orient * deg2rad);
  var orientSin = Math.sin(orient * deg2rad);
  var x = src.x * orientCos - src.y * orientSin;
  var y = src.x * orientSin + src.y * orientCos;
  return new BIPoint(Number(zeroX - k * (sensorY + y)), Number(zeroY - k * (sensorX + x)));
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