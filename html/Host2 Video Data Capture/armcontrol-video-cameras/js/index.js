var data_path = "";
$('[name]').change(function () {
  if ($(this).attr('name') == 'ip') return;
  if ($(this).attr("name") == "enabled") checkboxChange('[name=enabled]');
  setConfig();
});

function setConfig() {
  var text = "<?xml version=\"1.0\" encoding=\"utf-8\"?><root ";
  $(".container [name]").each(function () {
    var name = $(this).attr("name");
    var val = $(this).val();
    if ($(this).attr("type") == "checkbox") {
      val = $(this).is(":checked") ? "yes" : "no"
    }
    text += name + "=\"" + val + "\" ";
  })
  text += " dataPath=\"" + data_path + "\"/>";
  biSetModuleConfig("armcontrol-video-cameras.plugin", text);
}

function biOnInitEx(config, moduleConfigs) {
  data_path = Boolean(biGetDataPath()) ? biGetDataPath() : "";
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
    } else {
      if (["gop", "camera_fps"].includes(name)) {
        $(this).val(value == 0 ? -1 : value);
      } else {
        $(this).val(value);
      }
    }
  });
  checkboxChange('[name=enabled]');
}

function checkboxChange(obj) {
  if (!$(obj).is(':checked')) {
    $('.container>div:nth-child(2) [name]').addClass('disabled_background').attr('disabled', true);
    $(".container>div:nth-child(2) [language]").addClass('disabled');
  } else {
    $('.container>div:nth-child(2) [name]').removeClass('disabled_background').attr('disabled', false);
    $(".container>div:nth-child(2) [language]").removeClass('disabled');
  }
}