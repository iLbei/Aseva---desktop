var not_config = "",
  empty = "";
$('input').on({
  'change': function () {
    if ($(this).attr('type') == 'number') $(this).val(compareVal(this, $(this).val()));
  },
  'keypress': function (e) {
    if (e.charCode < 45 || e.charCode > 57) return false;
  },
  'keyup': function () {
    setConfig();
  }
});
$('.container [name]').change(function () {
  setConfig();
});
$('[name="apaEnable"]').change(function () {
  checkboxChange(this);
})
$('a').on('click', function () {
  if ($(this).hasClass("disabled_a")) return;
  if ($(this).attr('name') == 'outputReportPath') {
    biSelectPath($(this).attr('name'), BISelectPathType.Directory, null);
  } else {
    var originID = '';
    if ($(this).text().indexOf(not_config) == -1) originID = $(this).attr('value');
    var scale = $(this).attr('scale');
    biSelectSignal($(this).attr('name'), originID, false, null, true, scale);
  }
})

function biOnSelectedSignal(key, valueSignalInfo, signBitSignalInfo, scale) {
  if (valueSignalInfo == null) {
    $('[name=' + key + ']').text(not_config).attr({
      'value': '',
      'scale': '1'
    }).removeClass('red green').removeAttr('title');
    setConfig();
  } else if (valueSignalInfo.typeName == undefined) {
    $('[name=' + key + ']').addClass('red').removeClass('green');
    setConfig();
  } else {
    $('[name=' + key + ']').attr('scale', scale).text(valueSignalInfo.signalName).attr('value', valueSignalInfo.id).attr('title', valueSignalInfo.typeName + ':' + valueSignalInfo.signalName).addClass('green');
    setConfig();
  }
}

function biOnInitEx(config, moduleConfigs) {
  $('[language]').each(function () {
    var value = $(this).attr('language');
    if (biGetLanguage() == 1) {
      not_config = "<Not Configured>";
      empty = "<Empty>"
      $(this).text(en[value]);
    } else {
      not_config = "<未配置>";
      empty = "<空>"
      $(this).text(cn[value]);
    }
  });
  for (var key in moduleConfigs) {
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(moduleConfigs[key], "text/xml");
    var countrys = xmlDoc.getElementsByTagName('config');
    var keys = countrys[0].attributes;
    var obj = new Object();
    for (var i = 0; i < keys.length; i++) {
      obj[keys[i].nodeName] = keys[i].nodeValue;
    };
    loadConfig(obj);
  }
}

function loadConfig(config) {
  if (config == null) return;
  $('.container [name]').each(function () {
    var name = $(this).attr("name"),
      type = $(this).attr("type"),
      val = config[$(this).attr('name')];
    if (type == "checkbox") {
      $(this).attr('checked', val == "yes");
    } else if (type == "number") {
      $(this).val(compareVal(this, val));
    } else if ($(this).is('a')) {
      if (name == 'outputReportPath') {
        if (['', "undefined", 'null'].includes(val)) {
          $(this).text(empty);
        } else {
          $(this).text(val).attr("title", val);
        };
      } else {
        if (['', "undefined", 'null'].includes(val)) {
          $(this).text(not_config);
        } else {
          $(this).attr('value', val).attr('scale', config[name + '_scale']).text(val.split(":")[2]).attr("title", val);
          // biQuerySignalInfo(name, val);
        }
      }
    }
  });
  checkboxChange($('[name=apaEnable]'));
}

function setConfig() {
  var text = "<?xml version=\"1.0\" encoding=\"utf-8\"?><root><config";
  $('.container [name]').each(function () {
    var key = $(this).attr('name');
    if ($(this).attr("type") == "checkbox") {
      text += " " + key + "=\"" + ($(this).get(0).checked ? "yes" : "no") + "\"";
    } else if ($(this).is('a')) {
      if (key != 'outputReportPath') {
        var scale = $(this).attr('scale'),
          val = $(this).attr('value');
        text += " " + key + "=\"" + ($(this).text().indexOf(not_config) == -1 ? val : 'null') + "\"";
        text += " " + key + "_scale=\"" + (scale != '' ? scale : '') + "\"";
      } else {
        text += " " + key + "=\"" + ($(this).text().indexOf(empty) == -1 ? $(this).text() : '') + "\"";
      }
    } else {
      text += " " + key + "=\"" + $(this).val() + "\"";
    }
  });
  text += " /></root>";
  biSetModuleConfig("apa-evaluation.aspluginapaevaluation", text);
}

function biOnSelectedPath(key, path) {
  if (path != null) {
    $('[name=' + key + ']').text(path).attr("title", path);
  } else {
    $('[name=' + key + ']').text(empty).removeAttr("title");
  }
  setConfig();
}

function checkboxChange(obj) {
  if (!$(obj).is(':checked')) {
    $('.content [name]').addClass('disabled_a').attr('disabled', true);
    $(".content [language]").addClass('disabled_a');
  } else {
    $('.content [name]').removeClass('disabled_a').attr('disabled', false);
    $(".content [language]").removeClass('disabled_a');
    $(".content a:not([name=outputReportPath])").each(function () {
      if ($(this).text().indexOf(not_config) == -1) $(this).addClass("green");
    })
  }
}

function biOnQueriedSignalInfo(key, signalInfo) {
  if (signalInfo != null) {
    $('[name=' + key + ']').addClass('green').removeClass('red').text(signalInfo.signalName).attr('title', signalInfo.typeName + ':' + signalInfo.signalName);
  } else {
    $('[name=' + key + ']').addClass('red').removeClass('green').text($('[name=' + key + ']').attr('value'));
  }
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