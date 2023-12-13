var channelList = [],
  deviceList = [],
  param_type = "",
  videoCodec = [],
  general_settings = {},
  language = 1,
  dialogIndex = 0,
  error = "";
// button 导入内外参文件
$('button').click(function () {
  biSelectPath("line_import", BISelectPathType.OpenFile, {
    '.asmc': 'Module Config',
    '.asisp': 'Image Structure Parameters'
  })
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
  } else if (key == "line_import" || key == "normal_import" || key == "blind_import") {
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
    obj[name.indexOf("based_") == -1 ? name : name.substr(6, name.length)] = keys[i].nodeValue;
  }
  if (param_name == "line" && type.indexOf("lane-line") != -1) {
    var zero = obj['zero'].split(',');
    var meter = obj['meter'].split(',');
    $("." + param_name + " [name]").each(function () {
      var name = $(this).attr('name');
      if (name.indexOf('zero') != -1) {
        $("[name = zero_u]").val(Number(zero[0]).toFixed(6));
        $("[name = zero_v]").val(Number(zero[1]).toFixed(6));
      } else if (name.indexOf('meter') != -1 && name != "meter_scale") {
        $("[name = meter_u]").val(Number(meter[0]).toFixed(6));
        $("[name = meter_v]").val(Number(meter[1]).toFixed(6));
      } else if (name == "fifty") {
        $("[name = fifty]").val(Number(obj["fifty_ratio"]).toFixed(6));
      } else if (name == "special_hint1") {
        $('[name =special_hint1]').eq(Number(obj["position"])).prop('checked', true).siblings().removeAttr('checked');
      } else if (name == "meter_scale") {
        $('[name =meter_scale]').val(Number(obj["scale"]).toFixed(6))
      }
    })
  } else if (param_name == "bs" && type == "blind-spot-camera-params-v1") {
    $("." + param_name + " [name]").each(function () {
      $(this).attr('disabled', false);
      var name = $(this).attr('name');
      var inputType = $(this).attr('type');
      if (inputType == "radio") {
        $("[name =" + name + "][value=" + obj["position"] + "]").prop('checked', true);
      } else if (inputType == "text") {
        if (name.indexOf("_") != -1) {
          var name1 = name.split("_");
          var val = obj[name1[0]].split(",");
          if (obj[name1[0]] != undefined) $(this).val(Number(name1[1] == "u" ? val[0] : val[1]).toFixed(6));
        } else {
          var name1 = name + "_ratio";
          if (obj[name1] != undefined) $(this).val(Number(obj[name1]).toFixed(6));
        }
      }
    })
  } else {
    biAlert(error, 'Error');
    return;
  }
  setContentVal();
}

// 保存intrinsics和extrinsics数据
function setContentVal() {
  //更新extrinsics数据
  $('.' + param_type + ' [name]').each(function () {
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
        channelList[dialogIndex][1][name] = $(this).val() == "" ? 0 : $(this).val();
        break;
      }
    }
  })
  biSetLocalVariable("video", JSON.stringify(channelList));
  setConfig();
}

// 更新intrinsics和extrinsics数据
function getContentVal(param_name) {
  //更新extrinsics数据
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

/*------------------Config------------------*/
//配置读取与存储 [type=number]值校正
$('body').on('change', '[name]', function () {
  setContentVal();
})
$('body').on('input', '[type = text]', function () {
  setContentVal();
}).on("blur", '[type = text]', function () {
  if(isNaN($(this).val())) $(this).val("0.000000");
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
    if (biGetLanguage() == 1) {
      $('[language]').each(function () {
        var value = $(this).attr('language');
        $(this).html(en[value]);
      });
      error = en["error_file"];
    } else {
      $('[language]').each(function () {
        var value = $(this).attr('language');
        $(this).html(cn[value]);
      });
      error = cn["error_file"];
    }
    loadConfig();
  }
}

function loadConfig() {
  param_type = channelList[dialogIndex]['0']['param_type'];
  getContentVal(param_type);
}