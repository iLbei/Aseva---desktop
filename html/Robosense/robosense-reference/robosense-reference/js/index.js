var data_path = [],
  session_length = [],
  session_start_utc = [],
  gt_data_path = [],
  dir = [],
  vehicle = [],
  metas = [],
  input_file = [],
  output_file = [],
  not_config = "";
var reg = /^[a-zA-Z]:/;
$('input[type=number]').on({
  'change': function () {
    draw();
    $(this).val(compareVal(this, $(this).val()));
  },
  'blur': function () {
    draw();
  },
  'input': function (e) {
    if (e.which == undefined) {
      draw();
    }
    setConfig();
  },
  'keypress': function (e) {
    if (e.charCode == 101 || e.charCode == 43) {
      return false;
    }
  }
})
$('[name]').change(function () {
  setConfig()
})
$('a').click(function () {
  biSelectPath('gt_data_path', BISelectPathType.Directory, 'null');
})

function biOnSelectedPath(key, path) {
  if (path == null) return;
  if (key == "gt_data_path") $('[name=gt_data_path]').text(path).attr('title', path);
  biQueryDirsInDirectory(path);
  if (input_file == '') {
    biAlert('There is no session for the current path,Please choose right Data path!', '');
  }
  setConfig();
}
$('button').click(function () {
  if (input_file == '') {
    biAlert('There is no session for the current path,Please choose right Data path!', '');
  }
  var config = '';
  config = "<?xml version=\"1.0\" encoding=\"utf-8\"?><root>";
  config += "<type time_type=\"" + $('[name=time_type]').val() + "\"/>";
  for (var i in input_file) {
    config += "<Session data_path=\"" + input_file[i] + "\"";
    config += " session_length=\"" + (session_length[i] ? session_length[i] : '') + "\"";
    config += " session_start_utc=\"" + (session_start_utc[i] ? session_start_utc[i] : '') + "\"";
    config += "/>";
  }
  output_file.sort((a, b) => a.localeCompare(b));
  for (var i in output_file) {
    config += "<reference_session gt_data_path=\"" + output_file[i] + "\"/>";
  }
  config += "</root>";
  biSetViewConfig(config);
  biRunStandaloneTask('RobosenseReference', 'robosense-reference-task.pluginrobosense', config);
})

function biOnQueriedDirsInDirectory(dirs, path) {
  dir = [], output_file = [];
  dir = dirs[0].split('\n');
  for (var i in dir) {
    biQueryDirectoryExist(dir[i] + (reg.test(dir[i]) ? "\\" : '/') + 'result');
  }
}

function biOnQueriedDirectoryExist(exist, path) {
  if (exist) {
    output_file.push(path);
  }
}

function biOnResultOfStandaloneTask(key, result, returnValue) {
  if (result == 1) {
    biAlert('Import reference data success!', '')
  } else {
    biAlert('Failed', '')
  }
}

function biOnQueriedFileText(text, path) {
  if (!path) return;
  var parser = new DOMParser();
  var xmlDoc = parser.parseFromString(text, "text/xml");
  var countrys = xmlDoc.getElementsByTagName('root')
  var keys = countrys[0].attributes;
  var obj = new Object();
  for (var n = 0; n < keys.length; n++) {
    obj[keys[n].nodeName] = keys[n].nodeValue;
  }
  session_length.push(obj.length);
  if (obj.start_posix_utc != undefined) {
    session_start_utc.push(obj.start_posix_utc);
  } else {
    session_start_utc.push(obj.start_posix_host);
  }
}


function setConfig() {
  var text = "<?xml version=\"1.0\" encoding=\"utf-8\"?><root ";
  $('.container [name]').each(function () {
    var key = $(this).attr('name');
    var type = $(this).attr('type');
    var value = $(this).val();
    if (type == 'checkbox') {
      text += " " + key + "=\"" + ($(this).is(':checked') ? "yes" : "no") + "\"";
    } else if ($(this).is('a')) {
      text += " " + key + "=\"" + ($(this).text().indexOf(not_config) == -1 ? $(this).text() : '') + "\"";
    } else {
      text += " " + key + "=\"" + value + "\"";
    }
  });
  text += " data_path" + "=\"" + biGetDataPath() + "\"";
  text += " session_length" + "=\"" + session_length[session_length.length - 1] + "\"";
  text += " session_start_utc" + "=\"" + session_start_utc[session_start_utc.length - 1] + "\"";
  text += "/>";
  biSetModuleConfig("robosense-reference.pluginrobosense", text);
}

function biOnQueriedGlobalVariable(id, value) {
  vehicle.push(value);
  draw();
}

function biOnInitEx(config, moduleConfigs) {
  biQuerySessionList(true);
  var lang = biGetLanguage() == 1 ? en : cn;
  $('[language]').each(function () {
    var value = $(this).attr('language');
    $(this).text(lang[value]);
  });
  not_config = lang["not_config"]
  biQueryGlobalVariable('Subject.VehicleWidth', '1.6');
  biQueryGlobalVariable('Subject.VehicleHeight', '1.9');
  for (var key in moduleConfigs) {
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(moduleConfigs[key], "text/xml");
    var countrys = xmlDoc.getElementsByTagName('root')
    var keys = countrys[0].attributes;
    var obj = new Object();
    for (var n = 0; n < keys.length; n++) {
      obj[keys[n].nodeName] = keys[n].nodeValue;
    }
    loadConfig(obj);
  }
}

function biOnQueriedSessionList(list, filtered) {
  for (var i in list) {
    biQuerySessionPath(list[i]);
  }
}

function biOnQueriedSessionPath(path, session) {
  input_file.push(path);
  biQueryFileText(path + (reg.test(path) ? "\\" : '/') + 'meta.xml');
}

function loadConfig(config) {
  $(".container [name]").each(function () {
    var name = $(this).attr('name');
    var type = $(this).attr('type');
    var val = config[name];
    if (val == "null" || val == "") return;
    if ($(this).is('select') || type == "number" || type == "text") {
      if (val) {
        if (type == "number") {
          $(this).val(compareVal(this, val));
        } else {
          $(this).val(val);
        }
      }
    } else if (type == "checkbox" && val == "yes") {
      $(this).attr('checked', true)
    } else if ($(this).is('a')) {
      $(this).text(val).attr('title', val)
    }
  })
  biQueryDirsInDirectory(config['gt_data_path']);
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

function draw() {
  var canvas = $(".myCanvas")[0];
  var ctx = canvas.getContext('2d');
  var x = $('[name=offset_x]').val();
  var y = $('[name=offset_y]').val();
  var yaw = $('[name=yaw]').val();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  var p1 = new BIPoint(canvas.width / 2, 0);
  var p2 = new BIPoint(canvas.width / 2, canvas.height);
  var p3 = new BIPoint(0, 50);
  var p4 = new BIPoint(canvas.width, 50);
  drawLine(p1, p2, 1, "#e9e9e9", ctx);
  drawLine(p3, p4, 1, "#e9e9e9", ctx);
  var p5 = new BIPoint(canvas.width / 2 - Number(vehicle[0]) * 10, 50);
  var size = new BISize(Number(vehicle[0]) * 20, Number(vehicle[1]) * 50);
  drawRect(p5, size, "black", ctx);
  var p6 = new BIPoint(canvas.width / 2, 50);
  var p7 = new BIPoint(canvas.width / 2 - Number(vehicle[0]) * 10, 50 + Number(vehicle[1]) * 15);
  var p8 = new BIPoint(canvas.width / 2 + Number(vehicle[0]) * 10, 50 + Number(vehicle[1]) * 15);
  var arr = [p6, p7, p8];
  drawPolygon(arr, "black", ctx);
  p8 = new BIPoint(canvas.width / 2 - y * 15, 50 - (24 + x * 24 / 1.5));
  var p9 = new BIPoint(canvas.width / 2 - y * 15, 50 - x * 24 / 1.5);
  var p10 = new BIPoint(canvas.width / 2 - (15 + y * 15), 50 - x * 24 / 1.5);
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

function drawPolygon(arr, color, ctx) {
  ctx.beginPath();
  ctx.moveTo(arr[0].x, arr[0].y);
  ctx.lineTo(arr[1].x, arr[1].y);
  ctx.lineTo(arr[2].x, arr[2].y);
  ctx.strokeStyle = color;
  ctx.closePath();
  ctx.stroke();
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