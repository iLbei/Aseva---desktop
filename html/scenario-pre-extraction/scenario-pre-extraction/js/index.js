$('[name]').change(function () {
  setConfig();
});

$(".container").on("input", "input[type=number]", function (e) {
  var v = $(this).val();
  if (isNaN(e.which)) {
    $(this).attr("value", compareVal(this, v)).val(compareVal(this, v))
  } else {
    $(this).attr("value", v);
  }
  setConfig();
});

$(".container").on("blur", "input[type=number]", function () {
  $(this).attr("value", compareVal(this, $(this).val())).val(compareVal(this, $(this).val()));
});

function compareVal(obj, val) {
  var newVal = 0,
    step = $(obj).attr("step").length,
    min = Number($(obj).attr("min")),
    max = Number($(obj).attr("max"));
  if (isNaN(Number(val))) {
    newVal = Number($(obj).attr('value'));
  } else {
    if ($(obj).attr("name") == "range_distance") {
      min = 0;
      max = 100;
    } else {
      step = step - 2;
    }
    if (val > max) {
      val = max;
    } else if (val < min) {
      val = min;
    }
    if (step > 0) {
      newVal = Math.round(Math.abs(val) * Math.pow(10, step)) / Math.pow(10, step);
      if (val < 0) newVal = -newVal;
    } else {
      newVal = Math.floor(val);
    }
  };
  return step > 0 ? newVal.toFixed(step) : newVal;
}

function setConfig() {
  var text = "<?xml version=\"1.0\" encoding=\"utf-8\"?><root";
  $('[name]').each(function () {
    var key = $(this).attr('name');
    var type = $(this).attr('type');
    var val = $(this).val();
    if (type == "checkbox") {
      val = $(this).get(0).checked == true ? "1" : "0";
    } else if (type == "number") {
      val = key.indexOf('overlap') != -1 ? val / 100 : val;
    }
    text += " " + key + "=\"" + val + "\"";
  });
  text += " output_channel=\"-1\" output_channel_byLane=\"-1\" />";
  biSetModuleConfig("aspluginscenariopreextraction.scenarionpreextraction", text);
}

function loadConfig(config) {
  $('.container [name]').each(function () {
    var name = $(this).attr('name');
    var val = config[name];
    if (!Boolean(val)) return;
    var type = $(this).attr('type');
    if (type == 'checkbox') {
      $(this).prop('checked', val == 1);
    } else if (type == "number") {
      if (name.indexOf("overlap")!=-1) val = val * 100;
      $(this).val(compareVal(this, val));
    } else {
      $(this).val(val);
    }
  })
}

function biOnInitEx(config, moduleConfigs) {
  $('[language]').each(function () {
    var value = $(this).attr('language');
    $(this).text(biGetLanguage() == 1 ? en[value] : cn[value])
  });
  for (var key in moduleConfigs) {
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(moduleConfigs[key], "text/xml");
    var countrys = xmlDoc.getElementsByTagName('root');
    var keys = countrys[0].getAttributeNames();
    var obj = new Object();
    for (var i = 0; i < keys.length; i++) {
      obj[keys[i]] = countrys[0].getAttribute(keys[i]);
    };
    loadConfig(obj);
  }
}