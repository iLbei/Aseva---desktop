var index = 0,
  vehicle = [],
  channelList = [],
  deviceList = [],
  param_type = "fisheye",
  videoCodec = [],
  error = "",
  reset = "",
  confirm = "",
  device = [],
  deviceListOrder = [],
  intrinsics = false,
  points = [],
  language = 1,
  general_settings = {},
  dialogIndex = "";

// button 导入内外参文件
$('button').click(function () {
  var name = $(this).attr('class');
  if (name.indexOf('normal_import') != -1) {
    biSelectPath("normal_import", BISelectPathType.OpenFile, {
      '.asmc': 'Module Config',
      '.asisp': 'Image Structure Parameters'
    })
  }
})

// 点击导入导出.asmc
function biOnSelectedPath(key, path) {
  if (key == "normal_import") {
    biQueryFileText(path);
  }
}

function biOnQueriedFileText(text, path) {
  var parser = new DOMParser();
  var xmlDoc = parser.parseFromString(text, "text/xml");
  var obj = new Object();
  var root = xmlDoc.getElementsByTagName('root');
  var keys = root[0].attributes;
  var type = root[0].getAttribute('type');
  var param_name = channelList[dialogIndex][0]['param_type'];
  for (var i = 0; i < keys.length; i++) {
    var name = keys[i].nodeName;
    //获取root自身字节的属性
    obj[name.indexOf("based_") == -1 ? name : name.substr(6, keys[i].length)] = keys[i].nodeValue;
  }
  if ((param_name == "fisheye" && (type == "fisheye-front-camera-params-v1" || type == "fisheye-generic-camera-params-v1")) || (param_name == "normal" && (type == "front-camera-params-v1" || type == "generic-camera-params-v1"))) {
    if (param_name == "fisheye") param_name = "normal";
    $("." + param_name + " [name]").each(function () {
      $(this).attr('disabled', false).removeClass("disabled_background");
      var name = $(this).attr('name');
      var inputType = $(this).attr('type');
      if (inputType == "radio") {
        if (type.indexOf("front") != -1) {
          $("[name =" + name + "][value=2]").prop('checked', true);
        } else if (type.indexOf("generic") != -1) {
          $("[name =" + name + "][value=1]").prop('checked', true);
        }
      } else if (inputType == "number") {
        if (name == "ox") name = "pos_x";
        if (name == "oy") name = "pos_y";
        if (name == "oz") name = "pos_z";
        if (obj[name] != undefined) {
          $(this).val(compareVal(this, obj[name]));
        } else {
          $(this).val($(this).attr("value"));
        }
        channelList[dialogIndex][1][$(this).attr("name")] = $(this).val();
        drawNow(index, ["#7189CB59", "#5D6CD859"]);
      } else if (inputType == "text") {
        if (obj[name] != undefined) {
          $(this).val(Number(obj[name]).toFixed(6));
        }
      }
    })
    setContentVal();
  } else {
    biAlert(error, 'Error');
    return;
  }
}

// 保存intrinsics和extrinsics数据
function setContentVal() {
  //更新extrinsics数据
  $('.' + (param_type == 'fisheye' ? 'normal' : param_type) + ' [name]').each(function () {
    var type = $(this).attr('type');
    var name = $(this).attr('name');
    switch (type) {
      case 'radio': {
        if ($(this).is(':checked')) {
          channelList[dialogIndex][1]['special_hint'] = $(this).attr('value');
        }
        break;
      }
      case 'number':
      case 'text': {
        channelList[dialogIndex][1][name] = $(this).val();
        break;
      }
    }
  });
  setConfig();
  biSetLocalVariable("video", JSON.stringify(channelList));
}

// 更新intrinsics和extrinsics数据
function getContentVal(param_name) {
  //更新extrinsics数据
  if (param_name == "fisheye") param_name = "normal";
  $('.' + param_name + ' [name]').each(function () {
    var type = $(this).attr('type');
    var name = $(this).attr('name');
    if (name.indexOf('special_hint') != -1) name = 'special_hint';
    var val = channelList[dialogIndex][1][name];
    switch (type) {
      case 'radio': {
        if ($(this).val() == (val ? val : 0)) {
          $(this).prop('checked', true)
        } else {
          $(this).removeAttr('checked')
        }
        break;
      }
      case 'text': {
        $(this).val(Number(val ? val : ($(this).attr("value") ? $(this).attr("value") : 0)).toFixed(6));
        break;
      }
      case 'number': {
        $(this).val(compareVal(this, val ? val : ($(this).attr("value") ? $(this).attr("value") : 0)));
        break;
      }
    }
  })
}
//extrinsics下normal里radio改变 样式
$('.normal input:radio').on('change', function () {
  var val = $(this).attr('value');
  exChange(val);
})

function exChange(val) {
  switch (val) {
    case '1':
    case '2':
      $('.normal input[type=number]').removeClass("disabled_background").prop('disabled', false).val();
      drawNow(dialogIndex, ["#7189CB59", "#5D6CD859"]);
      break
    default:
      $(".normal input[type=number]").each(function () {
        var name = $(this).attr("name");
        channelList[dialogIndex][1][name] = $(this).attr("value");
      })
      $('.normal input[type=number]').prop('disabled', true).addClass("disabled_background");
      $('.normal input[type=number]').each(function () {
        $(this).val($(this).attr('value'));
      });
      $('.canvas').eq(Number(dialogIndex) + 1)[0].getContext('2d').clearRect(0, 0, 218, 324);
      $('.canvas').eq(Number(dialogIndex) + 1).css('z-index', 0);
  }
}

/*------------------Config------------------*/
//配置读取与存储 [type=number]值校正
$('body').on('change', '[name]', function () {
  setContentVal();
})
$('body').on('blur', '[type = number]', function () {
  $(this).val(compareVal(this, $(this).val()));
  setContentVal();
}).on('input', '[type = number]', function () {
  setContentVal();
})

function setConfig() {
  var text = "<?xml version=\"1.0\" encoding=\"utf-8\"?>";
  text += "<root ";
  for (var i in general_settings) {
    text += " " + i + "=\"" + (i == "hires_buffer_max_size" ? Number(general_settings[i]) * 1000000 : general_settings[i]) + "\"";
  }
  text += "\>";
  // device
  for (var i in deviceList) {
    text += "<device ";
    for (var j in deviceList[i]) {
      text += j + "=\"" + deviceList[i][j] + "\" ";
    }
    text += " />";
  }
  // channel
  for (var i = 0; i < channelList.length; i++) {
    text += "<ch" + i + " ";
    for (var j in channelList[i][0]) {
      text += j + "=\"" + channelList[i][0][j] + "\" ";
    }
    text += ">";
    text += "<param "
    for (var j in channelList[i][1]) {
      text += j + "=\"1:" + channelList[i][1][j] + "\" ";
    }
    text += "/>"
    text += "</ch" + i + ">";
  }
  text += "</root>";
  biSetModuleConfig("video.system", text);
}

function compareVal(obj, val) {
  var step = $(obj).attr('step').length > 2 ? $(obj).attr('step').length - 2 : 0,
    newVal = 0;
  if (isNaN(val) || !Boolean(val)) {
    newVal = Number($(obj).attr('value'));
  } else {
    var v = Number(val);
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

function biOnInitEx(config, moduleConfigs) {
  dialogIndex = Number(config);
  language = biGetLanguage();
  for (var key in moduleConfigs) {
    channelList = [], deviceList = [];
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(moduleConfigs[key], "text/xml");
    var countrys = xmlDoc.getElementsByTagName('root');
    var rootAttr = countrys[0].attributes;
    //Genaral setting
    for (var i = 0; i < rootAttr.length; i++) {
      general_settings[rootAttr[i].nodeName] = rootAttr[i].nodeValue;
    }
    for (var k = 0; k < countrys[0].childNodes.length; k++) {
      //channel option
      if (countrys[0].childNodes[k].nodeName.indexOf('ch') != -1) {
        var obj = {};
        var arrConfig = [];
        var keys = countrys[0].childNodes[k].attributes;
        for (var n = 0; n < keys.length; n++) {
          obj[keys[n].nodeName] = keys[n].nodeValue;
        }
        arrConfig.push(obj, {});
        var param = countrys[0].childNodes[k].childNodes[0];
        for (var j = 0; j < param.attributes.length; j++) {
          var param_name = param.attributes[j].nodeName;
          var param_val = param.attributes[j].nodeValue;
          arrConfig[1][param_name] = param_val.substr(2, param_val.length - 1);
        }
        channelList.push(arrConfig);
      } else if (countrys[0].childNodes[k].nodeName.indexOf('device') != -1) {
        //video devices
        var obj = {};
        var keys = countrys[0].childNodes[k].attributes;
        for (var n = 0; n < keys.length; n++) {
          obj[keys[n].nodeName] = keys[n].nodeValue;
        }
        deviceList.push(obj);
      }
    }
  }
  if (biGetLanguage() == 1) {
    $('[language]').each(function () {
      var value = $(this).attr('language');
      $(this).html(en[value])
    });
    error = en["error_file"];
  } else {
    $('[language]').each(function () {
      var value = $(this).attr('language');
      $(this).html(cn[value])
    });
    error = cn["error_file"];
  }
  loadConfig();
}

function loadConfig() {
  for (var i = 0; i < 24; i++) {
    $('.normal>div.right').append("<canvas class=\"canvas\" width=\"218\" height=\"324\"></canvas>");
  }
  //绘画其他图形
  for (var i in channelList) {
    if (!(channelList[i][1]["special_hint"] == 0)) {
      drawNow(i, ["#67D767", "#A6E8A673"]);
    }
    $('.canvas').eq(Number(i) + 1).css('z-index', 0);
  }
  if (Number(channelList[dialogIndex][1]["special_hint"])) {
    drawNow(dialogIndex, ["#7189CB59", "#5D6CD859"]);
  }
  biQueryGlobalVariable('Subject.VehicleWidth', '1.9');
  biQueryGlobalVariable('Subject.VehicleHeight', '1.5');
  exChange(channelList[dialogIndex][1]["special_hint"]);
  param_type = channelList[dialogIndex][0]["param_type"];
  getContentVal(param_type);
}

/*------------------canvas画图------------------*/
/** 
 * @param {number} 当前索引
 * @param {array} [边，面] 当前:["#7189CB59", "#5D6CD859"],其他:["#67D767", "#A6E8A6b1"]
 */
// 当前图像
function drawNow(index, color) {
  var val = channelList[index][1];
  var hfov = Number(val["hfov"] == undefined ? 45 : val["hfov"]);
  var x = 25 / parseFloat(Math.tan((90 - hfov / 2) * Math.PI / 180));
  var z = hfov * 0.29 - 6;
  points = [{
      x_3d: x,
      y_3d: -25,
      z_3d: -z
    }, //A
    {
      x_3d: -x,
      y_3d: -25,
      z_3d: -z
    }, //B
    {
      x_3d: -x,
      y_3d: -25,
      z_3d: z
    }, //C
    {
      x_3d: x,
      y_3d: -25,
      z_3d: z
    }, //D
    {
      x_3d: 0,
      y_3d: 0,
      z_3d: 0
    } //E
  ];
  var now = {
    "ox": val["oy"] == undefined ? 0 : val["oy"],
    "oy": val["ox"] == undefined ? 0 : val["ox"],
    "yaw": val["yaw"] == undefined ? 0 : val["yaw"],
    "pitch": val["pitch"] == undefined ? 0 : val["pitch"],
    "roll": val["roll"] == undefined ? 0 : val["roll"]
  };
  for (var j in now) {
    drawTriangle(Number(index) + 1, forRotate(now[j], j), color, {
      x: now["ox"],
      y: now["oy"]
    });
  }
  $('.canvas').eq(Number(index) + 1).css('z-index', 1000);
}
$('.normal input[type=number]').on({
  "change": function (e) {
    var name = $(this).attr('name');
    if (name != "oz") drawNow(dialogIndex, ["#7189CB59", "#5D6CD859"]);
  },
  'input': function (e) {
    var name = $(this).attr('name');
    channelList[dialogIndex][1][name] = $(this).val();
    if (e.which == undefined) {
      if (name != "oz") drawNow(dialogIndex, ["#7189CB59", "#5D6CD859"]);
    }
  },
  'keypress': function (e) {
    if (e.charCode == 101 || e.charCode == 43) {
      return false;
    }
  }
})
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
 * 画四棱锥
 * @param {number} index canvas的索引
 * @param {arr} points2d 所有点的二维坐标 A,B,C,D,E(顶点坐标)
 * @param {arr} color 面及边(顶点同)的颜色; 边:color[0],面:color[1]
 * @param {obj} origin 中心点位置; x:origin[x],y:origin[y]
 * @returns 返回2维坐标 x,y
 */
function drawTriangle(index, points2d, color, origin) {
  var canvas = $('.canvas').eq(index)[0];
  var ctx = canvas.getContext('2d');
  var ox = canvas.width / 2 - Number(origin["x"]) * 40;
  var oy = canvas.height / 8 - Number(origin["y"]) * 60;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.translate(ox, oy); //中心点位置
  //底面
  ctx.beginPath();
  ctx.moveTo(points2d[0].x, points2d[0].y);
  ctx.lineTo(points2d[1].x, points2d[1].y);
  ctx.lineTo(points2d[2].x, points2d[2].y);
  ctx.lineTo(points2d[3].x, points2d[3].y);
  ctx.closePath();

  for (var i = 0; i < points2d.length - 1; i++) {
    ctx.beginPath();
    ctx.moveTo(points2d[i].x, points2d[i].y);
    ctx.lineTo(points2d[4].x, points2d[4].y);
    ctx.strokeStyle = color[0];
    ctx.stroke();
    ctx.closePath();
  }
  // 绘制平面ABE
  ctx.beginPath();
  ctx.moveTo(points2d[0].x, points2d[0].y);
  ctx.lineTo(points2d[1].x, points2d[1].y);
  ctx.lineTo(points2d[4].x, points2d[4].y);
  ctx.fillStyle = color[1];
  ctx.fill();
  ctx.closePath();

  // 绘制平面ADE
  ctx.beginPath();
  ctx.moveTo(points2d[0].x, points2d[0].y);
  ctx.lineTo(points2d[3].x, points2d[3].y);
  ctx.lineTo(points2d[4].x, points2d[4].y);
  ctx.fillStyle = color[1];
  ctx.fill();
  ctx.closePath();

  // 绘制直线BCE
  ctx.beginPath();
  ctx.moveTo(points2d[1].x, points2d[1].y);
  ctx.lineTo(points2d[2].x, points2d[2].y);
  ctx.lineTo(points2d[4].x, points2d[4].y);
  ctx.fillStyle = color[1];
  ctx.fill();
  ctx.closePath();

  // 绘制平面CDE
  ctx.beginPath();
  ctx.moveTo(points2d[2].x, points2d[2].y);
  ctx.lineTo(points2d[3].x, points2d[3].y);
  ctx.lineTo(points2d[4].x, points2d[4].y);
  ctx.fillStyle = color[1];
  ctx.fill();
  ctx.closePath();


  //绘制顶点
  ctx.beginPath();
  ctx.arc(points2d[4].x, points2d[4].y, 2, 0, 2 * Math.PI);
  ctx.fillStyle = color[0];
  ctx.fill();
  ctx.stroke();

  //中心点复原
  ctx.translate(-ox, -oy);
}
/**
 * 某个3D的点转为2D的点
 * @param {number} x 点的x坐标
 * @param {number} y 点的y坐标
 * @param {number} z 点的z坐标
 * @returns 返回2维坐标 x,y
 */
function to2d(x, y, z) {
  //offsetX是容器宽的一半 x的250
  //offsety是容器高的一半 y的250
  //x,y,z是被转换（被观测）的点对应的立体几何坐标
  //view是观察点的坐标对象（根据观察点的变化，2d图形跟随变化）（自定义）
  var view = {
    x: 100,
    y: 0,
    z: -4000
  }
  return {
    x: parseFloat(((x - view.x) * view.z) / (view.z - z) + 100),
    y: parseFloat(((y - view.y) * view.z) / (view.z - z) + 0)
  };
}
/**
 * 获取图形所有点的2D点
 * @param {*} scale x/y/yaw/pitch/roll的值
 * @param {*} which 为x/y/yaw/pitch/roll
 * @returns 返回所有的2D点
 */
function forRotate(scale, which) {
  scale = Number(scale);
  newPoint2D = [];
  sin = parseFloat(Math.sin(scale * Math.PI / 180));
  cos = parseFloat(Math.cos(scale * Math.PI / 180));
  for (var i in points) {
    var x_3d, y_3d, z_3d;
    if (which == "pitch") { //绕X轴旋转
      x_3d = points[i]["x_3d"];
      y_3d = cos * points[i]["y_3d"] - sin * points[i]["z_3d"];
      z_3d = cos * points[i]["z_3d"] + sin * points[i]["y_3d"];
    } else if (which == "roll") { //绕Y轴旋转
      x_3d = cos * points[i]["x_3d"] - sin * points[i]["z_3d"];
      y_3d = points[i]["y_3d"];
      z_3d = cos * points[i]["z_3d"] + sin * points[i]["x_3d"];
    } else if (which == "yaw") { //绕Z轴旋转
      sin = parseFloat(Math.sin(-scale * Math.PI / 180));
      cos = parseFloat(Math.cos(-scale * Math.PI / 180));
      x_3d = cos * points[i]["x_3d"] - sin * points[i]["y_3d"];
      y_3d = cos * points[i]["y_3d"] + sin * points[i]["x_3d"];
      z_3d = points[i]["z_3d"];
    } else if (which == 'ox') {
      x_3d = points[i]['x_3d'] + scale;
      y_3d = points[i]['y_3d'];
      z_3d = points[i]['z_3d'];
    } else if (which == 'oy') {
      x_3d = points[i]['x_3d'];
      y_3d = points[i]['y_3d'] + scale;
      z_3d = points[i]['z_3d'];
    }
    points[i]['x_3d'] = parseFloat(x_3d);
    points[i]['y_3d'] = parseFloat(y_3d);
    points[i]['z_3d'] = parseFloat(z_3d);
    newPoint2D.push(to2d(x_3d, y_3d, z_3d));
  }
  return newPoint2D;
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