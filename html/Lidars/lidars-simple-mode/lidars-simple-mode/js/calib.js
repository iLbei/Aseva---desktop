var vehicle = [],
  index = -1,
  createFileHandle = null,
  signalScale = 1,
  pitch_angles = [[], [], [], [], [], []],
  yaw_offsets = [[], [], [], [], [], []],
  pitch_angles2 = [[], [], [], [], [], []],
  yaw_offsets2 = [[], [], [], [], [], []],
  dist_offsets = [[], [], [], [], [], []],
  dist_offsets_temperature = [[], [], [], [], [], []];

function Temperature(t, v) {
  this.t = t;
  this.v = v;
}

function loadConfig(config) {
  if (config == null) return;
  $('.container>.lidar').each(function (i, v) {
    var obj = config[i];
    $(this).find('[name]').each(function () {
      var key = $(this).attr('name');
      var type = $(this).attr('type');
      if (type == "number") {
        $(this).val(compareVal(this, obj[key]));
      } else if (type == "radio") {
        if (obj[key] == $(this).val()) {
          $(this).attr('checked', true);
        } else {
          $(this).removeAttr('checked');
        }
        if (obj[key] == 13 || obj[key] == 14 || obj[key] == 17 || obj[key] == 21) {
          $(this).parents('.lidar').find('[name="utc_time_sync"]').attr('disabled', false);
          if (obj['utc_time_sync'] == 'yes') {
            $(this).parents('.lidar').find('[name="utc_time_sync"]').attr('checked', true);
          } else {
            $(this).parents('.lidar').find('[name="utc_time_sync"]').attr('checked', false);
          }
        } else {
          $(this).parents('.lidar').find('[name="utc_time_sync"]').attr({ 'disabled': true, 'checked': false })
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
        $(this).val(obj[key]).attr("value", obj[key]);
      }
    });
    if (obj.dist_offsets != "null") {
      dist_offsets[i] = (obj.dist_offsets.split(",")).slice();
      pitch_angles[i] = (obj.pitch_angles.split(",")).slice();
      yaw_offsets[i] = (obj.yaw_offsets.split(",")).slice();
    } else if (obj.yaw_offsets != "null") {
      pitch_angles2[i] = obj.pitch_angles.split(",").slice();
      yaw_offsets2[i] = obj.yaw_offsets.split(",").slice();
    }
  });
}
function setConfig() {
  var text = "<?xml version=\"1.0\" encoding=\"utf-8\"?><root>";
  $('.container>.lidar').each(function (i, v) {
    text += "<lidar" + (i + 1);
    $(this).find('[name]').each(function () {
      var key = $(this).attr('name');
      var type = $(this).attr('type');
      var value = $(this).val();
      if (type == "number" || $(this).is("select")) {
        text += " " + key + "=\"" + value + "\"";
      } else if (type == "text") {
        if ($(this).hasClass('red') || value == "") {
          value = $(this).attr('value');
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
function calibShow(obj) {
  $('.calib').show();
  $('.container').hide();
  index = $(obj).parent().parent().parent().parent().parent().parent().parent().index() - 4;
  yaw_offsets2[index - 1] = [];
  pitch_angles2[index - 1] = [];
  dist_offsets_temperature[index - 1] = [];
  var pitch = pitch_angles[index - 1],
    yaw = yaw_offsets[index - 1],
    dist = dist_offsets[index - 1];
  if (pitch.length != 0) loadXml(pitch, yaw, dist);
}

function closeCalib() {
  var pitch = [],
    dist = [],
    yaw = [];
  $('.calib>div table tr').each(function (i, v) {
    if (i >= 32) $(this).remove();
  });
  for (var i = 0; i < 32; i++) {
    pitch.push(0.00);
    yaw.push(0.00);
    dist.push(0.00);
  }
  loadXml(pitch, yaw, dist);
  $('.calib').hide();
  $('.container').show();
}
function importCalib() {
  var filter = { ".xml": "Velodyne 64L calibration file (*.xml)" };
  biSelectPath("OpenFilePath1", BISelectPathType.OpenFile, filter);
}

function biOnSelectedPath(key, path) {
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
}
function loadXml(pitch, yaw, dist) {
  $('.calib>div table tr').each(function (i, v) {
    $(this).children('td:nth-of-type(2)').html(Number(pitch[i]).toFixed(2));
    $(this).children('td:nth-of-type(3)').html(Number(yaw[i]).toFixed(2));
    $(this).children('td:nth-of-type(4)').html(Number(dist[i] * 100).toFixed(1));
  });
  for (var i = 64; i < pitch.length; i++) {
    var d = Number(dist[i] * 100);
    var text = "<tr><td>" + i + "</td><td>" + Number(pitch[i]).toFixed(2) + "</td><td>" + Number(yaw[i]).toFixed(2) + "</td><td>" + d.toFixed(1) + "</td></tr>";
    $('.calib>div table>tbody').append(text);
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