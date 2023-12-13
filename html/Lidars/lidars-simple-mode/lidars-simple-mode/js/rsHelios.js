var dialogConfig = [],
  dialogIndex = 0,
  yaw = [],
  pitch = [],
  dist = [],
  dist_offsets_temperature = [[], [], [], [], [], []];
function Temperature(t, v) {
  this.t = t;
  this.v = v;
}

function loadConfig(index, config) {
  if (config == null) return;
  var obj = config[index];
  if (Boolean(obj.dist_offsets)) {
    dist_offsets = obj.dist_offsets.split(",");
  }
  pitch = obj.pitch_angles.split(",");
  yaw = obj.yaw_offsets.split(",");
  $('.rshelios32 table tr').each(function (i, v) {
    $(this).children('td:nth-of-type(2)').html(isNaN(toFix(pitch[i])) ? "0.000" : toFix(pitch[i]).toFixed(3));
    $(this).children('td:nth-of-type(3)').html(isNaN(toFix(yaw[i])) ? "0.000" : toFix(yaw[i]).toFixed(3));
  });
}

function setConfig() {
  var text = "<?xml version=\"1.0\" encoding=\"utf-8\"?><root>";
  for (var i in dialogConfig) {
    text += "<lidar" + (Number(i) + 1) + " ";
    for (var j in dialogConfig[i]) {
      text += j + "=\"" + dialogConfig[i][j] + "\" ";
    }
    if (dist_offsets_temperature[dialogIndex].length != 0) {
      var channelNum = dist_offsets_temperature[dialogIndex];
      text += ">";
      for (var n = 0; n < channelNum.length; n++) {
        text += "<dist_offsets_temperature";
        text += " t=\"" + channelNum[n].t + "\"";
        text += " v=\"" + channelNum[n].v + "\"/>";
      }
      text += "</lidar" + (Number(i) + 1) + ">";
    } else {
      text += "/>";
    }
  };
  text += "</root>";
  biSetModuleConfig("lidars-simple-mode.pluginlidar", text);
}
function importAngle() {
  var filter = { "angle.csv": "RSLidar32 calibration file (angle.csv)" };
  biSelectPath("OpenFilePath2", BISelectPathType.OpenFile, filter);
}

function biOnSelectedPath(key, path) {
  if (path == null) return;
  biQueryFileText(path);
}

function biOnQueriedFileText(text, path) {
  if (path != null) {
    yaw = [], pitch = [], val = [];
    var num = text.split("\n");
    for (var i = 0; i < num.length; i++) {
      val.push(num[i].split(","));
    }
    if (isNaN(Number(val[0][0])) || isNaN(Number(val[0][1]))) {
      flag = true;
      biAlert("The file is NOT a calibration file for RSLdar32.", "Error");
    } else {
      for (var i in val) {
        pitch.push(toFix(val[Number(i)][0]));
        yaw.push(-(toFix(val[Number(i)][1])));
      }
      dialogConfig[dialogIndex].yaw_offsets = yaw.join(",");
      dialogConfig[dialogIndex].pitch_angles = pitch.join(",");
      loadAngle(pitch, yaw);
    }
  }
  setConfig();
}
function loadAngle(pitch, yaw) {
  $('.rshelios32  table tr').each(function (i, v) {
    $(this).children('td:nth-of-type(2)').html(pitch[i].toFixed(3));
    $(this).children('td:nth-of-type(3)').html(yaw[i].toFixed(3));
  });
}

function biOnInitEx(config, moduleConfigs) {
  dialogIndex = config;
  $('[language]').each(function () {
    var value = $(this).attr('language');
    $(this).html(biGetLanguage() == 1 ? en[value] : cn[value]);
  });
  for (var key in moduleConfigs) {
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(moduleConfigs[key], "text/xml");
    var countrys = xmlDoc.getElementsByTagName('root');
    for (var i = 0; i < countrys[0].childNodes.length; i++) {
      var keys = countrys[0].childNodes[i].attributes;
      var obj = new Object();
      for (var n = 0; n < keys.length; n++) {
        obj[keys[n].nodeName] = keys[n].nodeValue;
      }
      dialogConfig.push(obj);
    }
    loadConfig(config, dialogConfig);
  }
}
function toFix(v) {
  v = Number(v);
  var newVal = Math.round(Math.abs(v) * Math.pow(10, 3)) / Math.pow(10, 3);
  if (v < 0) newVal = -newVal;
  return newVal;
}