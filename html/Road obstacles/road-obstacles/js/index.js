var not_config = "";


/*----------配置读取与存储-----------*/
$('[name]').change(function () {
  if ($(this).is("[name=roEnable]")) checkboxChange("[name=roEnable]");
  setConfig();
});
$("[name=staticObjectsJsonFile]").click(function () {
  biSelectPath("staticObjectsJsonFile", 1, { ".json": "json" });
})
function biOnSelectedPath(key, paths) {
  if (Boolean(paths)) {
    $("[name=" + key + "]").text(paths).attr("title", paths).addClass("green");
  } else {
    $("[name=" + key + "]").text(not_config).removeClass("green").removeAttr("title");
  }
  setConfig();
}

//保存配置
function setConfig() {
  var text = "<?xml version=\"1.0\" encoding=\"utf-8\"?><root><config ";
  $('.container [name]').each(function () {
    var name = $(this).attr('name');
    var val = $(this).val();
    var type = $(this).attr('type');
    if (type == 'checkbox') {
      text += name + "=\"" + ($(this).is(':checked') ? "yes" : "no") + "\" ";
    } else if ($(this).is("a")) {
      text += name + "=\"" + $(this).text() + "\" ";
    } else {
      text += name + "=\"" + val + "\" ";
    }
  });
  text += " /></root>";
  biSetModuleConfig("road-obstacles.aspluginRoadObstacles", text);
}

function biOnInitEx(config, moduleConfigs) {
  if (biGetLanguage() == 1) {
    $('[language]').each(function () {
      var value = $(this).attr('language');
      $(this).text(en[value]);
    });
    not_config = "<Not configured>";
  } else {
    $('[language]').each(function () {
      var value = $(this).attr('language');
      $(this).text(cn[value]);
      not_config = "<未配置>";
    });
  }
  for (var key in moduleConfigs) {
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(moduleConfigs[key], "text/xml");
    var obj = new Object();
    var root = xmlDoc.getElementsByTagName('root');
    var keys = root[0].childNodes[0].attributes;
    for (var i = 0; i < keys.length; i++) {
      //获取root自身字节的属性
      obj[keys[i].nodeName] = keys[i].nodeValue;
    }
    loadConfig(obj);
  }
}
function loadConfig(obj) {
  $('.container [name]').each(function () {
    var val = obj[$(this).attr('name')];
    if (!Boolean(val)) return;
    var type = $(this).attr('type');
    if (type == 'checkbox') {
      $(this).prop('checked', val == 'yes');
      checkboxChange(this);
    } else if ($(this).is('a')) {
      if (!val == "" || val == "null") $(this).attr("title", val).text(val);
      biQueryFileExist(val);
    } else {
      $(this).val(val);
    }
  })
}
//部分界面Enable控制界面是否启用
function checkboxChange(obj) {
  if (!$(obj).is(':checked')) {
    $('ul>li:not(:first-child) [name]').addClass('disabled_background').attr('disabled', true);
    $("ul>li:not(:first-child) [language]").addClass('disabled');
  } else {
    $('ul>li:not(:first-child) [name]').removeClass('disabled_background').attr('disabled', false);
    $("ul>li:not(:first-child) [language]").removeClass('disabled');
  }
}
function biOnQueriedFileExist(exist, path) {
  $("[name=staticObjectsJsonFile]").addClass(exist ? "green" : "red");
}
