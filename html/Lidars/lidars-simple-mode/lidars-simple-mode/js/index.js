// 2023/10/18 v2.7.0 新增设备类型：LeishenC32
// 2023/10/18 v2.8.0 帧分割角由select改为手动输入，输入范围[0,360];

var vehicle = [],
  index = -1,
  createFileHandle = null,
  signalScale = 1,
  pitch_angles = [
    [],
    [],
    [],
    [],
    [],
    []
  ],
  yaw_offsets = [
    [],
    [],
    [],
    [],
    [],
    []
  ],
  pitch_angles2 = [
    [],
    [],
    [],
    [],
    [],
    []
  ],
  yaw_offsets2 = [
    [],
    [],
    [],
    [],
    [],
    []
  ],
  dist_offsets = [
    [],
    [],
    [],
    [],
    [],
    []
  ],
  dist_offsets_temperature = [
    [],
    [],
    [],
    [],
    [],
    []
  ];
$('.lidar input[type=radio]').on('change', function () {
  radioChange(this);
})
$('input[type=number],input[type=text]').on({
  'blur': function () {
    var v = compareVal(this, $(this).val());
    $(this).attr("value", v).val(v);
    if (["offset_x", "offset_y", "yaw"].includes($(this).attr("name"))) {
      changeDraw(this);
    }
  },
  'input': function (e) {
    var v = $(this).val();
    if (isNaN(e.which)) {
      $(this).attr("value", compareVal(this, v)).val(compareVal(this, v));
      changeDraw(this);
    } else {
      if (Number($(this).val())) $(this).attr("value", v);
    }
    setConfig();
  },
  'keypress': function (e) {
    if (e.charCode == 101 || e.charCode == 43) {
      return false;
    }
  }
})
$('.bottom').find('input[type=checkbox]').on('click', function () {
  if ($(this).is(':checked')) {
    $(this).parents('.bottom').find('input[type=checkbox]').prop('checked', false);
    $(this).prop('checked', true)
  } else {
    $(this).parents('.bottom').find('input[type=checkbox]').prop('checked', true);
    $(this).prop('checked', false);
  }
})
$('input[name="bus_msgid"]').bind("input propertychange", function () {
  var val = Number($(this).val());
  $(this).removeClass('red');
  if (!isNaN(val)) {
    var init = String(val).substr(0, 1);
    if (init <= 3) {
      String(val).length <= 10 ? $(this).attr('value', val) : $(this).addClass('red');
    } else if (init == 4) {
      if (String(val).substr(1, 1) <= 2) {
        String(val).length <= 10 ? $(this).attr('value', val) : $(this).addClass('red');
      } else {
        String(val).length <= 9 ? $(this).attr('value', val) : $(this).addClass('red');
      }
    } else if (init >= 5) {
      String(val).length <= 9 ? $(this).attr('value', val) : $(this).addClass('red');
    }
  } else {
    $(this).addClass('red');
  }
  setConfig();
}).blur(function () {
  var v = $(this).attr('value');
  if ($(this).hasClass('red')) {
    $(this).val(v).removeClass('red');
  } else if ($(this).val() == "") {
    $(this).val(v);
  }
})
$('[name]').change(function () {
  setConfig()
})

function Temperature(t, v) {
  this.t = t;
  this.v = v;
}

function scaleCanvas(obj) {
  var type = $(obj).attr("scale");
  var lang = biGetLanguage();
  var text = "";
  var scale = 0;
  if (type == "large") {
    text = lang == 1 ? "Scale: Large" : "比例: 放大";
    $(obj).attr("scale", "small");
    scale = 0.3;
  } else {
    text = lang == 1 ? "Scale: Small" : "比例: 缩小";
    $(obj).attr("scale", "large");
    scale = 1;
  }
  $(obj).html(text);
  var parent = $(obj).parent().parent();
  draw(parent, scale);
}

function draw(obj, scale) {
  if (vehicle.length < 2) return;
  var canvas = $(obj).find('canvas')[0];
  var ctx = canvas.getContext('2d');
  var x = $(obj).find('[name=offset_x]').attr("value");
  var y = $(obj).find('[name=offset_y]').attr("value");
  var yaw = $(obj).find('[name=yaw]').attr("value");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  var p1 = new BIPoint(canvas.width / 2, 0);
  var p2 = new BIPoint(canvas.width / 2, canvas.height);
  var p3 = new BIPoint(0, 48);
  var p4 = new BIPoint(canvas.width, 48);
  drawLine(p1, p2, 1, "#e9e9e9", ctx);
  drawLine(p3, p4, 1, "#e9e9e9", ctx);
  var size = new BISize(Number(vehicle[0]) * 20 * scale, Number(vehicle[1]) * 50 * scale);
  var p5 = new BIPoint(canvas.width / 2 - Number(vehicle[0]) * 10 * scale, 48);
  drawRect(p5, size, "black", ctx);
  var p6 = new BIPoint(canvas.width / 2, 48);
  var p7 = new BIPoint(canvas.width / 2 - Number(vehicle[0]) * 10 * scale, 48 + Number(vehicle[1]) * 15 * scale);
  var p8 = new BIPoint(canvas.width / 2 + Number(vehicle[0]) * 10 * scale, 48 + Number(vehicle[1]) * 15 * scale);
  var arr = [p6, p7, p8];
  drawPolygon(arr, "black", ctx);
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

function changeDraw(obj) {
  if (["offset_x", "offset_y", "yaw"].includes($(obj).attr("name"))) {
    var parent = $(obj).parent().parent().parent().parent().parent();
    var type = $(parent).find('.scale_change').attr("scale");
    var scale = type == "large" ? 1 : 0.3;
    draw(parent, scale);
  }
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

//设备禁用UTC Time SYNC
function radioChange(obj) {
  if (["13", "14", "17", "21", "23", "26"].includes($(obj).val())) {
    $(obj).parents('.lidar').find('[name="utc_time_sync"]').attr('disabled', false)
  } else {
    $(obj).parents('.lidar').find('[name="utc_time_sync"]').attr({
      'disabled': true,
      'checked': false
    })
  }
}


function loadConfig(config) {
  if (config == null) return;
  $('.container>.lidar').each(function (i, v) {
    var obj = config[i];
    $(this).find('[name]').each(function () {
      var key = $(this).attr('name');
      var type = $(this).attr('type');
      if (type == "number") {
        if (obj[key]) {
          var v = obj[key].length > 16 ? compareVal(this, obj[key]) * 1 : compareVal(this, obj[key]);
        }
        $(this).val(v).attr("value", v);
      } else if (type == "radio") {
        if (obj[key] == $(this).val()) {
          $(this).attr('checked', true);
        } else {
          $(this).removeAttr('checked');
        }
        if (["13", "14", "17", "21", "23", "26"].includes(obj[key])) {
          $(this).parents('.lidar').find('[name="utc_time_sync"]').attr('disabled', false);
          if (obj['utc_time_sync'] == 'yes') {
            $(this).parents('.lidar').find('[name="utc_time_sync"]').attr('checked', true);
          } else {
            $(this).parents('.lidar').find('[name="utc_time_sync"]').attr('checked', false);
          }
        } else {
          $(this).parents('.lidar').find('[name="utc_time_sync"]').attr({
            'disabled': true,
            'checked': false
          })
        }
      } else if (type == 'checkbox') {
        if (key == 'yaw_lock') {
          if (obj[key] == 'yes') {
            $(this).prop('checked', true);
            $(this).parents('.lidar').find('[name=roll_lock]').removeAttr('checked')
          } else {
            $(this).prop('checked', false);
            $(this).parents('.lidar').find('[name=roll_lock]').prop('checked', true);
          }
        } else {
          $(this).prop('checked', obj[key] == 'yes' ? true : false);
        }
      } else {
        if (["offset_x", "offset_y", "height", "yaw", "pitch", "roll", "fine_yaw", "fine_pitch", "fine_roll"].includes(key)) {
          var v2 = compareVal(this, obj[key]);
          $(this).val(v2).attr("value", v2);
        } else {
          $(this).val(obj[key]).attr("value", obj[key]);
        }
      }
    });
    if (obj.dist_offsets != "null") {
      dist_offsets[i] = obj.dist_offsets.split(",").slice();
      pitch_angles[i] = obj.pitch_angles.split(",").slice();
      yaw_offsets[i] = obj.yaw_offsets.split(",").slice();
    } else if (obj.yaw_offsets != "null") {
      pitch_angles2[i] = obj.pitch_angles.split(",").slice();
      yaw_offsets2[i] = obj.yaw_offsets.split(",").slice();
    }
  });
}

function compareVal(obj, val) {
  val = val * 1;
  var newVal = 0;
  var name = $(obj).attr("name");
  var oldStep = Number($(obj).attr("step").length);
  var step = "";
  if (val !== 0 && (isNaN(val) || !Boolean(val))) {
    newVal = Number($(obj).attr('value')) * 1;
  } else {
    var min = 0,
      max = 0;
    switch (name) {
      case "bus_channel": {
        step = 0;
        min = 1;
        max = 16;
        break;
      }
      case "delta_posix_thresh":
      case "delta_offset_thresh": {
        step = oldStep - 2;
        min = -10000;
        max = 10000;
        break;
      }
      case "delta_angle_thresh": {
        step = oldStep - 2;
        min = -360;
        max = 360;
        break;
      }
      case "frame_timestamp_ratio": {
        step = oldStep - 2;
        min = -360;
        max = 360;
        break;
      }
      case "split": {
        step = oldStep - 1;
        min = 0;
        max = 360;
        break;
      }
      case "clip_min_height":
      case "clip_max_height": {
        step = oldStep - 1;
        min = -200;
        max = 200;
        break;
      }
      case "offset_x": {
        step = oldStep + 13;
        min = -21;
        max = 1;
        break;
      }
      case "offset_y": {
        step = oldStep + 13;
        min = -3;
        max = 3;
        break;
      }
      case "height": {
        step = oldStep + 13;
        min = 0;
        max = 3;
        break;
      }
      case "yaw":
      case "pitch":
      case "roll":
      case "fine_yaw":
      case "fine_pitch":
      case "fine_roll": {
        step = oldStep + 14;
        min = -180;
        max = 180;
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
      var valS = val.toString();
      var absNewIndex = valS.indexOf("-");
      var absNew = Number(val);
      if (absNewIndex != -1) absNew = Number(valS.substring(valS.indexOf("-") + 1));
      newVal = Math.round(absNew * Math.pow(10, step)) / Math.pow(10, step);
      if (val < 0) newVal = -newVal;
      if (step > 0) {
        var newValString = newVal.toString();
        var index = newValString.indexOf(".");
        if (index == -1) {
          return newVal.toFixed(step);
        } else {
          if (newValString.substring(index + 1).length == step) {
            return newVal;
          } else {
            return newVal + "0".repeat(step - (newValString.length - (index + 1)));
          }
        }
      } else {
        return newVal;
      }
    }
  }
  return newVal.toFixed(17);//暂时写死，实际获取的是x,y,z...的步长
}

function setConfig() {
  var text = "<?xml version=\"1.0\" encoding=\"utf-8\"?><root>";
  $('.container>.lidar').each(function (i, v) {
    text += "<lidar" + (i + 1);
    $(this).find('[name]').each(function () {
      var key = $(this).attr('name');
      var type = $(this).attr('type');
      var value = $(this).val();
      if (type == "number") {
        text += " " + key + "=\"" + compareVal(this, $(this).val()) + "\"";
      } else if ($(this).is("select")) {
        text += " " + key + "=\"" + value + "\"";
      } else if (type == "text") {
        if ($(this).hasClass('red') || value == "") {
          value = $(this).attr('value');
        } else if ($(this).attr("pattern")) {
          value = compareVal(this, $(this).val());
        }
        text += " " + key + "=\"" + value + "\"";
      } else if (type == 'checkbox') {
        if (key != "roll_lock") {
          text += " " + key + "=\"" + ($(this).is(':checked') ? "yes" : "no") + "\"";
        }
      }
    });
    text += " model" + "=\"" + $(this).find('input[name=model]:checked').val() + "\"";
    if (pitch_angles[i].length != 0 || pitch_angles2[i].length != 0) {
      text += " pitch_angles" + "=\"" + (pitch_angles[i].length == 0 ? pitch_angles2[i].toString() : pitch_angles[i].toString()) + "\"";
    }
    if (yaw_offsets[i].length != 0 || yaw_offsets2[i].length != 0) {
      text += " yaw_offsets" + "=\"" + (yaw_offsets[i].length == 0 ? yaw_offsets2[i].toString() : yaw_offsets[i].toString()) + "\"";
    }
    if (dist_offsets[i].length != 0) text += " dist_offsets" + "=\"" + dist_offsets[i].toString() + "\"";
    if (dist_offsets_temperature[i].length != 0) {
      var channelNum = dist_offsets_temperature[i];
      text += ">";
      for (var n = 0; n < channelNum.length; n++) {
        text += "<dist_offsets_temperature";
        text += " t=\"" + channelNum[n].t + "\"";
        text += " v=\"" + channelNum[n].v + "\"/>";
      }
      text += "</lidar" + (i + 1) + ">";
    } else {
      text += " />";
    }
  });
  text += "</root>";
  biSetModuleConfig("lidars-simple-mode.pluginlidar", text);
}
$("a").click(function () {
  var name = $(this).attr("class");
  var i = $(this).parents(".process").parent(".lidar").index() - 7;
  switch (name) {
    case "calib": {
      biOpenChildDialog("lidars-simple-mode.calib.html", "Velodyne64L calib", new BISize(379, 376), i);
      break;
    }
    case "rsHelios": {
      biOpenChildDialog("lidars-simple-mode.rsHelios.html", "RSHelios32 calib", new BISize(300, 375), i);
      break;
    }
    case "rsLidarLa": {
      biOpenChildDialog("lidars-simple-mode.rsLidarLa.html", "Velodyne64L calib", new BISize(300, 375), i);
      break;
    }
    case "rsLidarLe": {
      biOpenChildDialog("lidars-simple-mode.rsLidarLe.html", "RSLidar32 calib", new BISize(1096, 373), i);
      break;
    }
  }
})

function biOnSelectedPath(key, path) {
  if (path == null) {
    return;
  }
  if (key == "CreateFilePath") {
    createFileHandle = biWriteFileText(path);
    if (createFileHandle != null) {
      document.getElementById('button-write').disabled = false;
    }
  } else if (key == "OpenFilePath1") {
    var handle = biQueryFileText(path);
    if (handle != null) {
      var text = "";
      while (true) {
        var rowText = biQueryFileText(handle);
        if (rowText == null) break;
        else {
          text += rowText.trim();
        }
      }
      biWriteFileText(handle);
      var parser = new DOMParser();
      var xmlDoc = parser.parseFromString(text, "text/xml");
      var countrys = xmlDoc.getElementsByTagName('points_');
      var arr = [];
      for (var i = 0; i < countrys[0].childNodes.length; i++) {
        var nodeName = countrys[0].childNodes[i].nodeName;
        if (nodeName == "item") {
          var a = [];
          for (var n = 0; n < countrys[0].childNodes[i].childNodes.length; n++) {
            var name = countrys[0].childNodes[i].childNodes[n].nodeName;
            if (name == "px") {
              var pitch = Number(countrys[0].childNodes[i].childNodes[n].childNodes[2].textContent);
              var yaw = Number(countrys[0].childNodes[i].childNodes[n].childNodes[1].textContent);
              var dist = Number(countrys[0].childNodes[i].childNodes[n].childNodes[3].textContent) / 100;
              if (isNaN(pitch) || isNaN(yaw) || isNaN(dist)) {
                biAlert("The file is NOT a calibration file for RSLdar32.", "Error");
                return;
              }
              a.push(pitch.toFixed(2));
              a.push(yaw.toFixed(2));
              a.push(dist);
              arr.push(a);
            }
          }
        }
      }
      arr.sort(function (x, y) {
        return x[0] - y[0];
      });
      var pitch = pitch_angles[index - 1] = [],
        yaw = yaw_offsets[index - 1] = [],
        dist = dist_offsets[index - 1] = [];
      for (var i = 0; i < arr.length; i++) {
        pitch.push(arr[i][0]);
        yaw.push(arr[i][1]);
        dist.push(arr[i][2]);
      }
      loadXml(pitch, yaw, dist);
    }
  } else if (key == "OpenFilePath2") {
    var handle = biQueryFileText(path);
    if (handle != null) {
      var arr = [],
        flag = false;
      while (true) {
        var rowText = biQueryFileText(handle);
        if (rowText == null) break;
        else {
          var a = rowText.split(",");
          if (isNaN(Number(a[0])) || isNaN(Number(a[1]))) {
            flag = true;
            biAlert("The file is NOT a calibration file for RSLdar32.", "Error");
            break;
          }
          var b = [Number(a[0]).toFixed(2), (0 - Number(a[1])).toFixed(2)];
          arr.push(b);
        }
      }
      biWriteFileText(handle);
      if (!flag) {
        arr.sort(function (x, y) {
          return x[0] - y[0];
        });
        var pitch = pitch_angles2[index - 1] = [],
          yaw = yaw_offsets2[index - 1] = [];
        for (var i = 0; i < arr.length; i++) {
          pitch.push(arr[i][0]);
          yaw.push(arr[i][1]);
        }
        loadAngle(pitch, yaw);
      }
    }
  } else if (key == "OpenFilePath3") {
    var handle = biQueryFileText(path);
    if (handle != null) {
      var arr = [];
      while (true) {
        var rowText = biQueryFileText(handle);
        if (rowText == null) break;
        else {
          arr.push(rowText);
        }
      }
      biWriteFileText(handle);
      var aa = dist_offsets_temperature[index - 1] = [];
      var arrayP = [];
      for (var i = 0; i < arr.length; i++) {
        var array = arr[i].split(",");
        arrayP.push(array);
      }
      for (var i = 0; i < arrayP[arrayP.length - 1].length; i++) {
        var tem = new Temperature(arrayP[arrayP.length - 1][i], "");
        var bb = [];
        for (var j = 0; j < arrayP.length - 1; j++) {
          bb.push(0 - arrayP[j][i] / 100);
        }
        tem.v = bb.toString();
        aa.push(tem);
      }
      loadChannelNum(arr);
    }
  }
}

function loadAngle(pitch, yaw) {
  $('.rslidar>div:nth-of-type(2)>.left table tr').each(function (i, v) {
    $(this).children('td:nth-of-type(2)').html(Number(pitch[i]).toFixed(2));
    $(this).children('td:nth-of-type(3)').html(Number(yaw[i]).toFixed(2));
  });
}

function loadChannelNum(arr) {
  var text = "<span>Index</span>";
  if (arr.length == 0) {
    $('.rslidar>div:nth-of-type(2)>.right>div>div:first-of-type').html(text);
    for (var i = 0; i < 32; i++) {
      $('.rslidar>div:nth-of-type(2)>.right>div table tr:eq(' + i + ')').html(i + 1);
    }
  } else {
    var title = arr[arr.length - 1].split(",");
    for (var n = 0; n < title.length; n++) {
      text += "<span>" + title[n] + "℃</span>";
    }
    $('.rslidar>div:nth-of-type(2)>.right>div>div:first-of-type').html(text);
    for (var i = 0; i < arr.length - 1; i++) {
      var tem = arr[i];
      var vArr = tem.split(",");
      var mm = "<td>" + (i + 1) + "</td>";
      for (var j = 0; j < vArr.length; j++) {
        mm += "<td>" + (0 - vArr[j]) + "</td>";
      }
      $('.rslidar>div:nth-of-type(2)>.right>div table tr:eq(' + i + ')').html(mm);
    }
  }
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

function handleButtonSignal(evt) {
  var originID = document.getElementById('signal').innerHTML;
  biSelectSignal("TargetSignal", originID.length == 0 ? null : originID, false, null, true, signalScale, "[m]");
}

function biOnSelectedSignal(key, valueInfo, signBitInfo, scale) {
  if (key == "TargetSignal") {
    document.getElementById('signal').innerHTML = valueInfo == null ? "" : valueInfo.id;
    signalScale = scale;
  }
}

function biOnInitEx(config, moduleConfigs) {
  biQueryGlobalVariable('Subject.VehicleWidth', '1.6');
  biQueryGlobalVariable('Subject.VehicleHeight', '1.9');
  $('[language]').each(function () {
    var value = $(this).attr('language');
    $(this).html(biGetLanguage() == 1 ? en[value] : cn[value]);
  });
  for (var key in moduleConfigs) {
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(moduleConfigs[key], "text/xml");
    var countrys = xmlDoc.getElementsByTagName('root');
    var arr = [];
    for (var i = 0; i < countrys[0].childNodes.length; i++) {
      var keys = countrys[0].childNodes[i].attributes;
      var obj = new Object();
      for (var n = 0; n < keys.length; n++) {
        obj[keys[n].nodeName] = keys[n].nodeValue;
      }
      for (var j = 0; j < countrys[0].childNodes[i].childNodes.length; j++) {
        var keyss = countrys[0].childNodes[i].childNodes[j].attributes;
        var x = countrys[0].childNodes[i].childNodes[j].getAttribute(keyss[0]);
        var y = countrys[0].childNodes[i].childNodes[j].getAttribute(keyss[1]);
        var t = keyss[0].nodeValue;
        var v = keyss[1].nodeValue;
        var tem = new Temperature(t, v);
        dist_offsets_temperature[i].push(tem);
      }
      arr.push(obj);
    }
    loadConfig(arr);
  }
}

function biOnQueriedGlobalVariable(id, value) {
  vehicle.push(value);
  $('.lidar').each(function () {
    scaleCanvas($(this).find('.scale_change'));
  })
}