$('[name="tsEnable"]').change(function () {
  checkboxChange(this);
})

/*----------配置读取与存储-----------*/
$('[name]').change(function () {
  setConfig();
});

//保存配置
function setConfig() {
  var text = "<?xml version=\"1.0\" encoding=\"utf-8\"?><root><config ";
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
  text += " /></root>";
  biSetModuleConfig("traffic-state.asplugintrafficstate", text);
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
    var keys = root[0].childNodes[0].attributes;
    for (var i = 0; i < keys.length; i++) {
      //获取root自身字节的属性
      obj[keys[i].nodeName] = keys[i].nodeValue;
    }
    loadConfig(obj);
  }
}

function loadConfig(obj) {
  if (obj == null) return;
  $('.container [name]').each(function () {
    var val = obj[$(this).attr('name')];
    var type = $(this).attr('type');
    if (type == 'checkbox') {
      $(this).prop('checked', val == 'yes');
      checkboxChange(this);
    } else {
      $(this).val(val);
    }
  })
}

function checkboxChange(obj) {
  if (!$(obj).is(':checked')) {
    $('ul>li:not(:first-child) [name]').addClass('disabled_background').attr('disabled', true);
    $("ul>li:not(:first-child) [language]").addClass('disabled');
  } else {
    $('ul>li:not(:first-child) [name]').removeClass('disabled_background').attr('disabled', false);
    $("ul>li:not(:first-child) [language]").removeClass('disabled');
  }
}