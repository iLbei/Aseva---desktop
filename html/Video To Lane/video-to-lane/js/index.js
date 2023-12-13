$('select').change(function () {
  setConfig();
});

function setConfig() {
  var text = "<?xml version=\"1.0\" encoding=\"utf-8\"?><root";
  $('select').each(function () {
    text += " " + $(this).attr('name') + "=\"" + $(this).val() + "\"";
  })
  text += "/>";
  biSetModuleConfig("video-to-lane.pluginvideotolane", text);
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
    }
    loadConfig(obj);
  }
}
function loadConfig(config) {
  if (config == null) return;
  $('select').each(function () {
    $(this).val(config[$(this).attr('name')])
  })
}
