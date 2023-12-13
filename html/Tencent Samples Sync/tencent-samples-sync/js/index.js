$('[name]').change(function () {
  setConfig();
})
function loadConfig(config) {
  if (config == null) return
  let obj = JSON.parse(config);
  obj.enable == "true" ? $('[name=enable]').attr('checked', true) : $('[name=enable]').removeAttr('checked');
  // 下拉框
  $('select').each(function () {
    if (typeof ($(this).attr('name')) == 'undefined') {
      $(this).val($(this).find('option').attr('value'));
    } else {
      $(this).val(obj[$(this).attr('name')]);
    }
  })
}

function setConfig() {
  let text = "<?xml version=\"1.0\" encoding=\"utf-8\"?><root";
  // enabled配置
  let m = $('[name=enable]').is(':checked') ? "true" : "false";
  text += " " + $('[name=enable]').attr('name') + "=\"" + m + "\"";
  //下拉框配置
  $('select').each(function () {
    if ($(this).attr('name') != undefined) {
      text += " " + $(this).attr('name') + "=\"" + $(this).val() + "\"";
    }
  })
  text += "/>";
  biSetModuleConfig("aspluginsamplessync.tencentsamplessync", text);
}
function biOnInitEx(config, moduleConfigs) {
  biSetViewSize(260, 100);
  let type = biGetLanguage();
  $('[language]').each(function () {
    let value = $(this).attr('language');
    $(this).html(type == 1?en[value]:cn[value]);
  });
  for (let key in moduleConfigs) {
    let parser = new DOMParser();
    let xmlDoc = parser.parseFromString(moduleConfigs[key], "text/xml");
    let countrys = xmlDoc.getElementsByTagName('root');
    let keys = countrys[0].getAttributeNames();
    let obj = new Object();
    for (let i = 0; i < keys.length; i++) {
      obj[keys[i]] = countrys[0].getAttribute(keys[i]);
    }
    loadConfig(JSON.stringify(obj));
  }
}