$('input').on({
  'change': function () {
    if ($(this).attr('type') == 'number') {
      $(this).val(compareVal(this, $(this).val()));
    }
  },
  'keypress': function (e) {
    if (e.charCode == 43) {
      return false;
    }
  }
});
$('.container [name]').change(function () {
  setConfig();
});
$('[name=in_channel_2],[name=in_channel_1]').change(function () {
  changeChannel($(this));
});
function biOnInitEx(config, moduleConfigs) {
  $('[language]').each(function () {
    var value = $(this).attr('language');
    $(this).html(biGetLanguage() == 1 ? en[value] : cn[value])
  });
  for (var key in moduleConfigs) {
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(moduleConfigs[key], "text/xml");
    var countrys = xmlDoc.getElementsByTagName('root');
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
  $('[name]').each(function () {
    var name = $(this).attr('name'),
      type = $(this).attr("type");
    if (type == "checkbox") {
      config[name] == "yes" ? $(this).attr('checked', true) : $(this).attr('checked', false);
    } else if (type == "number") {
      $(this).val(compareVal(this, config[name]));
    } else {
      $(this).val(config[name] == "null" ? "" : config[name]);
    }
  });
  biQueryChannelNames(1, 'point-map-v2', 6)
  changeChannel($('[name=in_channel_1]'));
  changeChannel($('[name=in_channel_2]'));
}
function changeChannel(obj) {
  if ($(obj).find('option[value=' + $(obj).val() + ']').html().indexOf('(Not') != -1) {
    $(obj).parent().prev().children().addClass("red");
  } else {
    $(obj).parent().prev().children().removeClass("red");
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

function setConfig() {
  var text = "<?xml version=\"1.0\" encoding=\"utf-8\"?><root";
  $('[name]').each(function () {
    var key = $(this).attr('name'),
      type = $(this).attr("type");
    if (type == "checkbox") {
      var n = $(this).get(0).checked ? "yes" : "no";
      text += " " + key + "=\"" + n + "\"";
    } else {
      var v = $(this).val() == "" ? null : $(this).val();
      text += " " + key + "=\"" + v + "\"";
    }
  });
  text += " />";
  biSetModuleConfig("rear-object-extraction.pluginlidar", text);
}
function biOnQueriedChannelNames(key, channelNames) {
  if (key == 1) {
    for (var k in channelNames) {
      if (channelNames[k] != '') {
        var option = 'option[value=' + k.substr(13) + ']';
        $('select').each(function () {
          if ($(this).attr('name') == 'in_channel_1' || $(this).attr('name') == 'in_channel_2') {
            $(this).find(option).html($(this).find(option).html().substr(0, 2) + channelNames[k]);
            changeChannel(this);
          }
        })
      }
    }
  }
}