$('.container').on("change", "input[type=number]", function () {
  $(this).val(compareVal(this, $(this).val()));
}).on('input', "input[type=number]", function (e) {
  if (e.which == undefined) {
    var step = $(this).attr("step").length - 2;
    var val = Number($(this).val());
    $(this).val(step > 0 ? val.toFixed(step) : val);
  }
  setConfig();
}).on('keypress', "input[type=number]", function (e) {
  if (!(e.charCode >= 48 && e.charCode <= 57) && !(e.charCode == 45 || e.charCode == 46)) return false;
})
$('.container [name]').change(function () {
  setConfig();
});

$('[type=text]').bind("input propertychange", function () {
  var val = $(this).val();
  $(this).removeClass('red');
  if (!isNaN(val)) {
    val = Number($(this).val());
    var init = Number(String(val).substr(0, 1));
    if (init <= 3) {
      if (val > 2147483647) {
        $(this).addClass('red');
        return;
      }
      String(val).length <= 10 ? $(this).attr('value', val) : $(this).addClass('red');
    } else if (init == 4) {
      if (String(val).substr(1, 1) <= 2) {
        String(val).length <= 10 ? $(this).attr('value', val) : $(this).addClass('red');
      } else {
        String(val).length <= 9 ? $(this).attr('value', val) : $(this).addClass('red');
      }
    } else if (init >= 5) {
      String(val).length <= 9 ? $(this).attr('value', val) : $(this).addClass('red');
    }
  } else {
    $(this).addClass('red');
  }
  setConfig();
})

function biOnInitEx(config, moduleConfigs) {
  $('[language]').each(function () {
    var value = $(this).attr('language');
    $(this).html(biGetLanguage() == 1 ? en[value] : cn[value])
  });
  for (var key in moduleConfigs) {
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(moduleConfigs[key], "text/xml");
    var countrys = xmlDoc.getElementsByTagName('config');
    var keys = countrys[0].attributes;
    var obj = new Object();
    for (var i = 0; i < keys.length; i++) {
      obj[keys[i].nodeName] = keys[i].nodeValue;
    }
    loadConfig(obj);
  }
}

function loadConfig(config) {
  if (config == null) return;
  $('[name]').each(function () {
    var name = $(this).attr('name'),
      type = $(this).attr("type"),
      val = config[name];
    if (type == "checkbox") {
       $(this).attr('checked', val == "yes");
    } else if (type == "number") {
      $(this).val(compareVal(this, val));
    } else {
      $(this).attr('value', val).val(val);
    }
  });
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

function setConfig() {
  var text = "<?xml version=\"1.0\" encoding=\"utf-8\"?><root><config";
  $('[name]').each(function () {
    var v = '',
      type = $(this).attr("type");
    if (type == "checkbox") {
      v = $(this).get(0).checked ? "yes" : "no";
    } else {
      v = $(this).val();
    }
    text += " " + $(this).attr('name') + "=\"" + v + "\"";
  });
  text += "/></root>";
  biSetModuleConfig("tfminiplus.asplugintfminiplus", text);
}