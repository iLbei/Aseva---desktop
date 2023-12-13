var channels = [];
$('[name]').change(function () {
  if ($(this).attr('name') == 'ip') return;
  setConfig();
});
function setConfig() {
  var text = "<?xml version=\"1.0\" encoding=\"utf-8\"?><root";
  text += " connect" + "=\"" + ($('[name=connect]').get(0).checked == true ? "yes" : "no") + "\"";
  text += " ip" + "=\"" + $('[name=ip]').val() + "\"";
  text += " port" + "=\"" + ($('[name=port]').val() != '' ? parseInt($('[name=port]').val()) : "") + "\"";
  text += "/>";
  biSetModuleConfig("bluetooth-bracelet.bluetoothbracelet", text);
}
function biOnInitEx(config, moduleConfigs) {
  $('[language]').each(function () {
    var value = $(this).attr('language');
    $(this).html(biGetLanguage() == 1 ? en[value] : cn[value])
  });
  for (var key in moduleConfigs) {
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(moduleConfigs[key], "text/xml");
    var obj = new Object();
    var root = xmlDoc.getElementsByTagName('root');
    var keys = root[0].attributes;
    for (var i = 0; i < keys.length; i++) {
      if (root[0].getAttribute(keys[i]) == "null") {
        obj[keys[i]] = "";
      } else {
        obj[keys[i].nodeName] = keys[i].nodeValue;
      }
    }
    loadConfig(obj);
  }
}
function loadConfig(val) {
  if (val == null) return;
  $('[name=ip]').val(val['ip']).addClass('green');
  $('[name=port]').val(val['port']);
  if (val['connect'] == "yes") $('[name=connect]').attr('checked', true);
}
$('[type=text]').on("keyup", function () {
  var reg = /^([1-9]|([1-9][0-9])|(1[0-9][0-9])|(2[0-4][0-9])|(25[0-5]))(\.([0-9]|([1-9][0-9])|(1[0-9][0-9])|(2[0-4][0-9])|(25[0-5]))){3}$/;
  var val = $(this).val();
  reg.test(val) ? $(this).addClass('green').attr('value', val).removeClass('red') : $(this).removeClass('green').addClass('red');
  if (!$(this).hasClass('red')) setConfig();
}).blur(function () {
  if ($(this).val() == "" || $(this).hasClass('red')) {
    $(this).val($(this).attr('value')).addClass('green').removeClass('red');
  } else {
    setConfig();
  }
})