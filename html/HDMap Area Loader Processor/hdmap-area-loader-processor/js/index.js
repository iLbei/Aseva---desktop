var not_config = '';
function loadConfig(config) {
  if (config == null) return;
  //select
  $('[name="areaGnssChannel"]').val(config["areaGnssChannel"]);
  //多选框和单选框
  $('input').each(function () {
    var name = $(this).attr('name');
    if ($(this).attr('type') == 'radio') {
      if (config[name] == $(this).val()) {
        $(this).attr('checked', true);
        if (name == 'areaMapSource' && $(this).siblings('a').attr('name') != undefined && $(this).is(':checked')) {
          if (config['areaMapPath'] == '') {
            $(this).siblings('a').text(not_config);
          } else {
            $(this).siblings('a').text(config['areaMapPath']).attr("title",config['areaMapPath']);
          }
        }
      }
    } else {
      $(this).val(compareVal(this, config[name]));
    }
  })
}
function compareVal(obj, val) {
  var step = $(obj).attr('step').length > 2 ? $(obj).attr('step').length - 2 : 0,
    v = Number(val),
    min = Number($(obj).attr('min')),
    max = Number($(obj).attr('max'));
  if (isNaN(v)) { v = Number($(obj).attr('value')); }
  v = v < min ? min : v;
  v = v > max ? max : v;
  return (Math.round(v * Math.pow(10, step)) / Math.pow(10, step)).toFixed(step);
}
/**
 * 写配置
 */
function setConfig() {
  var text = "<?xml version=\"1.0\" encoding=\"utf-8\"?><root";
  // checkbox
  $('input').each(function () {
    if ($(this).attr('type') == 'radio') {
      var name = $(this).attr('name');
      if ($(this).is(':checked')) {
        text += " " + name + "=\"" + $('[name=' + name + ']:checked').val() + "\"";
        if (name == 'areaMapSource' && $(this).siblings('a').attr('name') != undefined) {
          text += ' ' + $(this).siblings('a').attr('name') + '=\"' + ($(this).text().indexOf('(') != -1 ? 'null' : $(this).siblings('a').text()) + '\" '
        }
      }
    } else {
      text += ' ' + $(this).attr('name') + '=\"' + $(this).val() + '\"'
    }
  })
  text += ' ' + 'areaGnssChannel' + '=\"' + $('[name=areaGnssChannel]').val() + '\"';
  text += "/>";
  biSetModuleConfig("hdmap-area-loader-processor.aspluginhdmaploadandconvert", text);
}

//点击选择文件夹
$('a').each(function () {
  $(this).click(function () {
    var name = $(this).attr('id');
    switch (name) {
      case 'external_hdMap':
        biSelectPath(name, BISelectPathType.OpenFile, null);
        break;
      case 'external_geo_json':
        biSelectPath(name, BISelectPathType.Directory, null);
        break;
      case 'external_shape_file':
        biSelectPath(name, BISelectPathType.Directory, null);
        break;
    }

  })
})
$('input[type=number]').blur(function () {
  $(this).val(compareVal(this, $(this).val()));
})
$('[name]').change(function () { setConfig() });
function biOnSelectedPath(key, path) {
  if (path == null) {
    return;
  } else {
    biQueryFileText(path);
    $('#' + key).text(path).attr("title", path);
  }
  setConfig();
}
function biOnInitEx(config, moduleConfigs) {
  $('[language]').each(function () {
    var value = $(this).attr('language');
    if (biGetLanguage() == 1) {
      $(this).text(en[value]);
      not_config = '<Not Configured>'
    } else {
      $(this).text(cn[value]);
      not_config = '<未配置>'
    }
  });
  for (var key in moduleConfigs) {
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(moduleConfigs[key], "text/xml");
    var countrys = xmlDoc.getElementsByTagName('root');
    var keys = countrys[0].attributes;
    var obj = new Object();
    for (var i = 0; i < keys.length; i++) {
      obj[keys[i].nodeName] = keys[i].nodeValue;
    }
    loadConfig(obj);
  }
}
