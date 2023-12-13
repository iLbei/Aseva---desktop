$('[name]').change(function () {
  if ($(this).attr("name") == "Enabled") checkboxChange('[name=Enabled]');
  setConfig();
});

/*---------------input [type=number]--------------*/
$('input[type=number]').on({
  "change": function () {
    $(this).val(compareVal(this, $(this).val()));
  },
  'input': function (e) {
    if (e.which == undefined) {
      var step = $(this).attr("step").length - 2;
      var val = Number($(this).val());
      $(this).val(step > 0 ? val.toFixed(step) : val);
    }
    setConfig();
  },
  'keypress': function (e) {
    if (!(e.charCode >= 48 && e.charCode <= 57) && !(e.charCode == 45 || e.charCode == 46)) {
      return false;
    }
  }
})

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
  var text = "<?xml version=\"1.0\" encoding=\"utf-8\"?><root ";
  $(".container [name]").each(function () {
    var name = $(this).attr("name");
    var val = $(this).val();
    var type = $(this).attr("type");
    if (type == "checkbox") {
      val = $(this).is(":checked") ? "yes" : "no"
    } else if (type == "number") {
      val = compareVal(this, $(this).val());
    }
    text += name + "=\"" + val + "\" ";
  })
  text += "/>";
  biSetModuleConfig("jerk.pluginjerk", text);
}

function biOnInitEx(config, moduleConfigs) {
  var lang = biGetLanguage() == 1 ? en : cn;
  $('[language]').each(function () {
    var value = $(this).attr('language');
    $(this).html(lang[value])
  });
  for (var key in moduleConfigs) {
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(moduleConfigs[key], "text/xml");
    var obj = new Object();
    var root = xmlDoc.getElementsByTagName('root');
    var keys = root[0].attributes;
    for (var i = 0; i < keys.length; i++) {
      obj[keys[i].nodeName] = root[0].getAttribute(keys[i]) == "null" ? "" : keys[i].nodeValue;
    }
    loadConfig(obj);
  }
}

function loadConfig(val) {
  if (val == null) return;
  $('[name]').each(function () {
    var name = $(this).attr('name');
    var type = $(this).attr('type');
    var value = val[name];
    if (type == 'checkbox') {
      $(this).attr('checked', value == "yes");
    } else if (type == "number") {
      $(this).val(compareVal(this, value));
    } else {
      $(this).val(value);
    }
  });
  checkboxChange('[name=Enabled]');
}

function checkboxChange(obj) {
  if (!$(obj).is(':checked')) {
    $('.container>ul>li:not(:first-child) [name]').addClass('disabled_background').attr('disabled', true);
    $(".container>ul>li:not(:first-child) [language]").addClass('disabled_a');
  } else {
    $('.container>ul>li:not(:first-child) [name]').removeClass('disabled_background').attr('disabled', false);
    $(".container>ul>li:not(:first-child) [language]").removeClass('disabled_a');
  }
}