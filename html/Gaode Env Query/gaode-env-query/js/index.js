$('[name]').change(function () {
  if ($(this).is("input[type=checkbox]")) isDisabled();
  setConfig();
});

function loadConfig(config) {
  if (config == null) return;
  $('[name]').each(function () {
    var name = $(this).attr('name');
    var val = config[name];
    if ($(this).attr('type') == 'checkbox') {
      if (val == 'true') $(this).attr('checked', true);
    } else {
      $(this).val(val);
    }
  });
  isDisabled();
}

function isDisabled() {
  if ($('[name=enable]').is(":checked")) {
    $('.container>div:nth-child(2) [name]').removeAttr("disabled");
    $('.container>div:nth-child(2) span').removeClass("disabled");
  } else {
    $('.container>div:nth-child(2) [name]').attr("disabled", true);
    $('.container>div:nth-child(2) span').addClass("disabled");
  }
}

function setConfig() {
  var text = "<?xml version=\"1.0\" encoding=\"utf-8\"?><root";
  $('[name]').each(function () {
    var key = $(this).attr('name');
    var val = $(this).val();
    if ($(this).attr('type') == "checkbox") {
      val = $(this).is(":checked") ? "true" : "false";
    }
    text += " " + key + "=\"" + val + "\"";
  });
  text += "/>";
  biSetModuleConfig("gaode-environment-query.plugingaodeenv", text);
}

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
