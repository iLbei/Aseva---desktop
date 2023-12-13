var general_settings = {},
  channelList = [],
  deviceList = [],
  dialogConfig = {},
  language = 1,
  dialogIndex = 0, error = "";
// button 导入内外参文件
$('button').click(function () {
  var name = $(this).attr('class');
  if (name.indexOf('intrinsics_import') != -1) {
    biSelectPath("intrinsics_import", BISelectPathType.OpenFile, { '.asmc': 'Module Config', '.ascip': 'Camera Intrinsic Parameter' });
  } else if (name.indexOf('intrinsics_export') != -1) {
    biSelectPath("intrinsics_export", BISelectPathType.CreateFile, { '.asmc': 'Module Config' });
  }
})
// 点击导入导出.asmc
function biOnSelectedPath(key, path) {
  if (key == "intrinsics_export") {
    var text = '<?xml version="1.0" encoding="utf-8"?><root type="'
    text += (channelList[dialogIndex][0]['param_type'] == 'fisheye' ? 'camera-intrinsics-fisheye-v1' : 'camera-intrinsics-v2') + '"';
    $('.intrinsics [name]').each(function () {
      if ($(this).attr('style') == undefined) {
        var name = $(this).attr('name');
        if (name == "hfov_fisheye") name = "ideal-hfov";
        if (name == "aspectratio") name = "ar";
        text += " " + name + "=\"" + $(this).val() + "\"";
      };
    })
    text += "/>"
    biWriteFileText(path, text);
  } else if (key == 'intrinsics_import') {
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
    //获取root自身字节的属性
    var name = keys[i].nodeName;
    obj[name.indexOf("based_") == -1 ? name : name.substr(6, name.length)] = keys[i].nodeValue;
  }
  if (((param_name == 'fisheye' && type.indexOf('fish') != -1) || (param_name != 'fisheye' && type.indexOf('fish') == -1)) && type.indexOf('intrinsics') != -1) {
    obj = {};
    for (var i = 0; i < keys.length; i++) {
      //获取root自身字节的属性
      obj[keys[i].nodeName] = keys[i].nodeValue;
    }
    $('.intrinsics [name]').each(function () {
      var name = $(this).attr('name');
      if (name == "hfov_fisheye") name = 'ideal-hfov';
      if (name == "aspectratio") name = 'ar';
      $(this).val(compareVal(this, obj[name]));
    })
    setContentVal();
  } else {
    biAlert(error, 'Error');
    return;
  }
}

// 保存intrinsics和extrinsics数据
function setContentVal() {
  //更新intrinsics数据
  $('.intrinsics [name]').each(function () {
    var name = $(this).attr("name");
    channelList[dialogIndex][1][name] = $(this).val() == "" ? 0 : $(this).val();
  })
  setConfig();
  biSetLocalVariable("video", JSON.stringify(channelList));
}
// 更新intrinsics和extrinsics数据
function getContentVal(param_name) {
  //更新intrinsics数据
  $('.intrinsics [name]').each(function () {
    var name = $(this).attr('name');
    var val = channelList[dialogIndex][1][name];
    var type = $(this).attr('type');
    if (type == "text") {
      $(this).val(Number(val ? val : ($(this).attr("value") ? $(this).attr("value") : 0)).toFixed(6));
    } else if (type == "number") {
      $('[name=hfov]').attr(param_name == "fisheye" ? { 'min': 90, 'max': 150 } : { 'min': 10, 'max': 160 });
      $(this).val(compareVal(this, val ? val : ($(this).attr("value") ? $(this).attr("value") : 0)));
    }
  })
}

/*------------------Config------------------*/
$('body').on('blur', '[type = number],[type=text]', function () {
  $(this).val(compareVal(this, $(this).val()));
  setContentVal();
}).on('input', '[type = number],[type=text]', function () {
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
      $(this).html(en[value]);
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
  var param_type = channelList[dialogIndex][0]["param_type"];
  if (param_type == 'fisheye') {
    $('.fisheye').next('input').removeClass('fisheye').removeAttr('style').show();
    $('.fisheye').show();
    $('.zhenkong').parent().remove();
  } else {
    $('.fisheye').parent().remove();
    $('.zhenkong').next('input').show()
    $('.zhenkong').show();
  }
  getContentVal(param_type);
}