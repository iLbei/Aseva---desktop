// 2023/10/30 v1.2.0 更改为获取数据文件夹下面的event下面的所有文件夹路径

var reg = /^[a-zA-Z]:/,//true\ false/
  text = "",
  dataPath,
  input_file = [],
  erropath = "";

$('[name]').on('change', function () {
  setConfig();
});
$('button').click(function () {
  if (input_file.length == 0) {
    biAlert(erropath);
  } else {
    setConfig();
    biSetViewConfig(text);
    biRunStandaloneTask("XMprivacy protection", "xmprivacyprotection-task.pluginxmpp", text);
  }
})

function setConfig() {
  text = "<?xml version=\"1.0\" encoding=\"utf-8\"?><root ";
  $('[name]').each(function () {
    var name = $(this).attr('name');
    if ($(this).is('input[type=checkbox]')) {
      text += name + "=\"" + ($(this).is(":checked") ? 'yes' : 'no') + "\" ";
    }
  });
  text += "dataPath=\"" + input_file.join(",") + "\" ";
  text += "/>";
  biSetModuleConfig("xmprivacy-protection.pluginxmpp", text);
}

function biOnInitEx(config, moduleConfigs) {
  dataPath = biGetDataPath();
  var lang = biGetLanguage() == 1 ? en : zh;
  $('[language]').each(function () {
    var value = $(this).attr('language');
    $(this).text(lang[value])
  });
  erropath = lang["erropath"];
  var parser = new DOMParser();
  var xmlDoc = parser.parseFromString(moduleConfigs["xmprivacy-protection.pluginxmpp"], "text/xml");
  var conf = xmlDoc.getElementsByTagName('root');
  var keys = conf[0].attributes;
  var obj = {};
  for (var i = 0; i < keys.length; i++) {
    obj[keys[i].nodeName] = keys[i].nodeValue == "null" ? "" : keys[i].nodeValue;
  }
  loadConfig(obj);
  biQueryDirsInDirectory(dataPath + (reg.test(dataPath) ? "\\" : "/") + "event");
}

function biOnQueriedDirsInDirectory(dirs, path) {
  input_file = dirs[0].split("\n");
  setConfig();
}


function loadConfig(obj) {
  $('.container [name]').each(function () {
    var val = obj[$(this).attr('name')];
    var type = $(this).attr('type');
    if (type == 'checkbox') {
      $(this).prop('checked', val == 'yes');
    }
  })
}