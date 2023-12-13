var idName = null,
  not_config = ""; //选择的元素的id名
$('select').change(function () {
  changeClassMode(this);
})
$("[name]").change(function () {
  setConfig()
});
$('[type=number]').on('blur', function () {
  $(this).val(compareVal(this, $(this).val()))
})
$('[language="not_config"]').on('mousedown', function (e) {
  if ($(this).hasClass('not_a')) return;
  if (1 == e.which || 3 == e.which) {
    selectSignals(this);
  }
})
$('[type=text]').bind('input propertychange', function () {
  checkTextValue(this)
}).on('blur', function () {
  var str = $(this).val();
  var v = Number(str);
  if (isNaN(v) || str == "") {
    $(this).val(" ").addClass('green');
  }
})

function loadConfig(config) {
  if (config == null) return;
  $("[name]").each(function () {
    var name = $(this).attr('name');
    var type = $(this).attr("type");
    var val = config[name];
    if ($(this).is("select")) {
      $(this).val(val);
      changeClassMode(this);
    } else if (type == "text") {
      $(this).val(val == 'null' ? "" : val).addClass('green');
    } else if (type == "number") {
      $(this).val(compareVal(this, config[name]));
    } else if (type == "checkbox") {
      $(this).attr("checked", val == "yes")
    } else if ($(this).is("a")) {
      var key = typeof $(this).attr('scale') == 'undefined' ? name : name + '_value';
      if (config[key] == 'null' || config[key] == undefined) {
        $(this).text(not_config);
      } else {
        var arr = config[key].split(':');
        $(this).text(arr[2]).attr("title",arr[2])
        if (typeof $(this).attr('scale') == 'undefined') {
          $(this).attr('val', config[key]);
        } else {
          var scale = key + '_scale';
          $(this).attr({
            'val': config[key],
            'scale': config[scale]
          });
        }
        if (!$(this).hasClass('not_a') && $(this).text().indexOf(not_config) == -1) {
          biQuerySignalInfo(name, config[key]);
        }
      }
    }
  })
}

function setConfig() {
  var text = "<?xml version=\"1.0\" encoding=\"utf-8\"?><root ";
  // enabled配置
  var m = $('[name=enabled]').is(':checked') ? "yes" : "no";
  text += " " + $('[name=enabled]').attr('name') + "=\"" + m + "\" ";
  //下拉框配置
  $('select').each(function () {
    if ($(this).attr('name') != undefined) {
      text += " " + $(this).attr('name') + "=\"" + $(this).val() + "\" ";
    }
  })
  //文本框配置
  $('[type=text]').each(function () {
    text += " " + $(this).attr('name') + "=\"" + $(this).val() + "\" ";
  })
  // number配置
  $('[type=number]').each(function () {
    text += " " + $(this).attr('name') + "=\"" + compareVal(this, $(this).val()) + "\" ";
  })
  //复选框配置
  var c = $('[name=connect_rs485]').is(':checked') ? "yes" : "no";
  text += " " + $('[name=connect_rs485]').attr('name') + "=\"" + c + "\" ";
  // Not configured配置
  $('a').each(function () {
    if ($(this).attr('name') == 'temperature' || $(this).attr('name') == 'illumination' || $(this).attr('name') == 'windspeed') {
      text += " " + $(this).attr('name') + '_value' + "=\"" + $(this).attr('val') + "\" ";
      if ($(this).attr('scale') != 'undefined') {
        text += " " + $(this).attr('name') + '_scale' + "=\"" + $(this).attr('scale') + "\" "
      }
    } else {
      text += " " + $(this).attr('name') + "=\"" + $(this).attr('val') + "\" ";
    }
  })
  text += " />";
  biSetModuleConfig("environment.pluginenvironment", text);
}

function changeClassMode(obj) {
  var name = ' ';
  if ($(obj).attr('name') == 'temperature_source') {
    name = '[name=temperature_type]';
    if ($(obj).val() == "Signal") {
      $(name).removeAttr('disabled', true);
      $(name).next().removeClass('not_a');
      if ($(name).text().indexOf('(') == -1) {
        biQuerySignalInfo('temperature', $('[name=temperature]').attr('val'));
      }
    } else {
      $(name).attr('disabled', true);
      $(name).next().addClass('not_a').removeClass('red green');
    }
  } else if ($(obj).attr('name') == 'illumination_source') {
    name = '[name=illumination]'
    if ($(obj).val() == "Signal") {
      $(name).removeClass('not_a');
      if ($(name).text().indexOf('(') == -1) {
        biQuerySignalInfo('illumination', $('[name=illumination]').attr('val'));
      }
    } else {
      $(name).addClass('not_a').removeClass('red green');
    }
  } else if ($(obj).attr('name') == 'windspeed_source') {
    name = '[name=windspeed]'
    if ($(obj).val() == "Signal") {
      $(name).removeClass('not_a');
      if ($(name).text().indexOf('(') == -1) {
        biQuerySignalInfo('windspeed', $('[name=windspeed]').attr('val'));
      } else {
        $(name).removeClass('red green')
      }
    } else {
      $(name).addClass('not_a').removeClass('red green');
    }
  }
}

function checkTextValue(obj) {
  var str = $(obj).val();
  var v = Number(str);
  if (!isNaN(v)) {
    $(obj).addClass('green').attr('value', v);
  } else if (isNaN(v)) {
    $(obj).removeClass('green').addClass('red');
  }
}

function compareVal(obj, val) {
  var step = $(obj).attr('step').length > 2 ? $(obj).attr('step').length - 2 : 0;
  var v = Number(val);
  var newVal = "";
  if (isNaN(val) || !Boolean(val)) {
    newVal = Number($(obj).attr('value'));
  } else {
    var min = Number($(obj).attr('min')),
      max = Number($(obj).attr('max'));
    v = v < min ? min : v;
    v = v > max ? max : v;
    if (step > 0) {
      newVal = Math.round((Math.abs(v) * Math.pow(10, step)).toFixed(1)) / Math.pow(10, step);
      if (v < 0) newVal = -newVal;
    } else {
      newVal = Math.floor(v);
    }
  }
  return step > 0 ? newVal.toFixed(step) : newVal;
}

function selectSignals(obj) {
  var originID = null;
  if ($(obj).text().lastIndexOf('(') == -1) originID = $(obj).attr("val");
  idName = obj;
  if ($(obj).attr('scale') != undefined) {
    var scale = parseInt($(obj).attr('scale'));
    if ($(obj).attr('name') == 'temperature') {
      biSelectSignal("TargetSignal", originID, false, null, true, scale, "[°]");
    } else if ($(obj).attr('name') == 'illumination') {
      biSelectSignal("TargetSignal", originID, false, null, true, scale, "[lux]");
    } else if ($(obj).attr('name') == 'windspeed') {
      biSelectSignal("TargetSignal", originID, false, null, true, scale, "[m/s]");
    }
  } else {
    biSelectSignal("TargetSignal", originID, false, null, false, 1, "[°]");
  }
}

function biOnSelectedSignal(key, valueInfo, signBitInfo, scale) {
  if (key == "TargetSignal") {
    if (valueInfo == null) {
      $(idName).removeClass('red green').text(not_config).attr("val", '');
    } else if (valueInfo.typeName != undefined) {
      $(idName).text(valueInfo.signalName).attr("title", valueInfo.signalName);
      $(idName).attr("val", valueInfo.id);
      $(idName).addClass('green').attr('scale', scale);
    }
  }
  setConfig();
}

function biOnInitEx(config, moduleConfigs) {
  $('[language]').each(function () {
    var lang = biGetLanguage() == 1 ? en : cn;
    var value = $(this).attr('language');
    not_config = lang["not_config"];
    $(this).text(lang[value]);
  });
  for (var key in moduleConfigs) {
    var parser = new DOMParser(); //创建一个空的xml文档对象
    var xmlDoc = parser.parseFromString(moduleConfigs[key], "text/xml"); //把名为modeleConfigs的字符串载入到解析器中
    var countrys = xmlDoc.getElementsByTagName('root'); //获取setconfig里面的root标签
    var keys = countrys[0].attributes; //获取root标签的属性名
    var obj = new Object();
    for (var i = 0; i < keys.length; i++) {
      obj[keys[i].nodeName] = keys[i].nodeValue;
    }
    loadConfig(obj);
  }
}

function biOnQueriedSignalInfo(key, signalInfo) {
  if (signalInfo != null) {
    $('[name=' + key + ']').addClass('green').removeClass('red');
  } else {
    $('[name=' + key + ']').addClass('red').removeClass('green').text($('#' + key).attr('val'));
    $('[name=' + key + ']').removeAttr('title');
  }
  setConfig();
}