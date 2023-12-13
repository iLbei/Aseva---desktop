var not_config = "";
/*---------------input [type=text] 正则验证 ip--------------*/
$('[type=text]').on("keyup", function () {
  setConfig();
})
$("[name]").change(function(){
  setConfig();
})
$("a").click(function () {
  biSelectPath($(this).attr("name"), 1, {".json":"json"});
})

//保存配置
function setConfig() {
  var text = "<?xml version=\"1.0\" encoding=\"utf-8\"?><root><vsomeip1 ";
  $('.container [name]').each(function () {
    var name = $(this).attr('name');
    var val = $(this).val();
    var type = $(this).attr('type');
    if (type == 'checkbox') {
      text += name + "=\"" + ($(this).is(':checked') ? "yes" : "no") + "\" ";
    } else if (type == "number") {
      text += name + "=\"" + compareVal(this, val) + "\" ";
    } else if ($(this).is("a")) {
      text += name + "=\"" +( $(this).text().indexOf(not_config)!=-1?"null": $(this).text())+ "\" ";
    } else {
      text += name + "=\"" + val + "\" ";
    }
  });
  text += " /></root>";
  biSetModuleConfig("vsomeip-transmitter.aspluginvsomeiptransmitter", text);
}

function biOnInitEx(config, moduleConfigs) {
  if (biGetLanguage() == 1) {
    $('[language]').each(function () {
      var value = $(this).attr('language');
      $(this).text(en[value])
    });
    not_config = en["not_config"];
  } else {
    $('[language]').each(function () {
      var value = $(this).attr('language');
      $(this).text(cn[value]);
    });
    not_config = cn["not_config"];
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
    } else if (type == "number") {
      $(this).val(compareVal(this, val));
    } else if ($(this).is('a')) {
      $(this).attr("title", val == "" || val == "null" ? not_config : val).text(val == "" || val == "null" ? not_config : val);
    } else {
      $(this).val(val);
    }
  })
}

function biOnSelectedPath(key, path) {
  if (path == null) {
    $('[name=' + key + ']').removeAttr('title').text(not_config);
  } else {
    $('[name=' + key + ']').attr('title', path).text(path);
  };
  setConfig();
}