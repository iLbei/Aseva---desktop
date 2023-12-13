// 2022/12/21 v1.0.0 首个版本
//  2023/10/24 v1.0.1 修复页面宽高问题并更新bi-common.js,commom.css
var dialogConfig = {};
$('[name]').change(function () {
  if ($(this).attr("name") == "wlan_enable") checkboxChange(this);
  setConfig();
});
function setConfig() {
  var text = "<?xml version=\"1.0\" encoding=\"utf-8\"?><root ";
  $('.container [name]').each(function () {
    var name = $(this).attr('name');
    var val = $(this).val();
    var type = $(this).attr('type');
    if (type == 'checkbox') {
      text += name + "=\"" + ($(this).is(':checked') ? "yes" : "no") + "\" ";
    } else {
      text += name + "=\"" + val + "\" ";
    }
  });
  text += "/>";
  biSetModuleConfig("wlan-info.aspluginwlaninfo", text);
}
function biOnInitEx(config, moduleConfigs) {
  var lang = biGetLanguage() == 1 ? en : zh;
  $('[language]').each(function () {
    var value = $(this).attr('language');
    $(this).html(lang[value]);
  });
  for (var key in moduleConfigs) {
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(moduleConfigs[key], "text/xml");
    var root = xmlDoc.getElementsByTagName('root');
    var keys = root[0].attributes;
    for (var i = 0; i < keys.length; i++) {
      dialogConfig[keys[i].nodeName] = root[0].getAttribute(keys[i]) == "null" ? "" : keys[i].nodeValue;
    }
  }
  loadConfig(dialogConfig);
  biQueryGlobalParameter("ASPluginWlan.ProfileNameList", "Not found");
}
function loadConfig(obj) {
  $('.container [name]').each(function () {
    var val = obj[$(this).attr('name')];
    if (!Boolean(val)) return;
    var type = $(this).attr('type');
    if (type == 'checkbox') {
      $(this).prop('checked', val == 'yes');
      checkboxChange(this);
    }
  })
}
function biOnQueriedGlobalParameter(id, value) {
  var val = value.split(",");
  for (var i of val) {
    $("[name=wlan_profileName]").append("<option value=\"" + i + "\">" + i + "</option>");
  }
  $("[name=wlan_profileName]").val(dialogConfig["wlan_profileName"]);
}
function checkboxChange(obj) {
  if (!$(obj).is(':checked')) {
    $('.container>div:nth-child(2) [name]').addClass('disabled_background').attr('disabled', true);
    $(".container>div:nth-child(2) [language]").addClass('disabled_a');
  } else {
    $('.container>div:nth-child(2) [name]').removeClass('disabled_background').attr('disabled', false);
    $(".container>div:nth-child(2) [language]").removeClass('disabled_a');
  }
}