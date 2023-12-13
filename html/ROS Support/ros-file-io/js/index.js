/*---------------input [type=number]--------------*/
$('input[type=number]').on({
  "change": function () {
    $(this).val(compareVal(this, $(this).val()));
  },
  'input': function (e) {
    setConfig();
  },
  'keypress': function (e) {
    if (e.charCode < 48 || e.charCode > 57) return false;
  }
})
function compareVal(obj, val) {
  var step = $(obj).attr('step').length > 2 ? $(obj).attr('step').length - 2 : 0,
    v = Number(val),
    newVal = 0;
  if (isNaN(v)) {
    newVal = Number($(obj).attr('value'));
  } else {
    var min = Number($(obj).attr('min')),
      max = Number($(obj).attr('max'));
    v = v < min ? min : v;
    v = v > max ? max : v;
    newVal = Math.round(Math.abs(v) * Math.pow(10, step)) / Math.pow(10, step);
    if (v < 0) newVal = -newVal;
  }
  return newVal.toFixed(step);
}


/*----------配置读取与存储-----------*/
$('[name]').change(function () {
  setConfig();
});
//保存配置
function setConfig() {
  var ros = "<?xml version=\"1.0\" encoding=\"utf-8\"?><root ";
  $('.container>div:nth-child(1) [name]').each(function () {
    var name = $(this).attr('name');
    var val = $(this).val();
    var type = $(this).attr('type');
    if (type == 'checkbox') {
      ros += name + "=\"" + ($(this).is(':checked') ? "yes" : "no") + "\" ";
    } else if (type == "number") {
      ros += name + "=\"" + compareVal(this, val) + "\" ";
    }
  });
  ros += " />";
  biSetModuleConfig("ros-file-io.pluginros", ros);
  var ros2 = "<?xml version=\"1.0\" encoding=\"utf-8\"?><root ";
  $('.container>div:nth-child(2) [name]').each(function () {
    var name = $(this).attr('name');
    var type = $(this).attr('type');
    if (type == 'checkbox') {
      ros2 += name + "=\"" + ($(this).is(':checked') ? "yes" : "no") + "\" ";
    }
  });
  ros2 += " />";
  biSetModuleConfig("ros2-file-io.pluginros2", ros2);
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
    if (Boolean(val)) {
      var type = $(this).attr('type');
      if (type == 'checkbox') {
        $(this).prop('checked', val == 'yes');
      } else if (type == "number") {
        $(this).val(compareVal(this, val));
      }
    }
  })
}