var index = 0,
  vehicle = [],
  general_settings = {},
  channelList = [],
  deviceList = [],
  param_type = [],
  videoCodec = [],
  error = "",
  reset = "",
  confirm = "",
  device = [],
  deviceListOrder = [],
  intrinsics = false,
  points = [], language = 1, dialogIndex = 0, old_param_name = "";


//close 关闭时保存数据
$('button.ok').click(function () {
  var param_name = $('.switch [name=param_type]:checked').val();
  channelList[dialogIndex][0]["param_type"] = param_name;
  if (old_param_name != param_name) channelList[dialogIndex][1] = {}
  setConfig();
  biSetLocalVariable("video", JSON.stringify(channelList));
  biCloseChildDialog();
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
    $('[language]').each(function () {
      var value = $(this).attr('language');
      if (biGetLanguage() == 1) {
        $(this).html(en[value])
      } else {
        $(this).html(cn[value])
      }
    });
  }
  loadConfig();
}
function loadConfig() {
  var param_name = channelList[dialogIndex][0]["param_type"];
  old_param_name = channelList[dialogIndex][0]["param_type"];
  $("input[value=" + param_name + "]").prop("checked", true)
}