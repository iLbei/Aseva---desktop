$("[name]").change(function () {
  setConfig()
});

$('.container').on("change", "input[type=number]", function () {
  $(this).val(compareVal(this, $(this).val()));
}).on('input', "input[type=number]", function (e) {
  if (e.which == undefined) {
    var step = $(this).attr("step").length - 2;
    var val = Number($(this).val());
    $(this).val(step > 0 ? val.toFixed(step) : val);
  }
  setConfig();
}).on('keypress', "input[type=number]", function (e) {
  if (!(e.charCode >= 48 && e.charCode <= 57) && !(e.charCode == 45 || e.charCode == 46)) return false;
})

function compareVal(obj, val) {
  var step = $(obj).attr('step').length > 2 ? $(obj).attr('step').length - 2 : 0;
  var v = Number(val);
  var newVal = "";
  if (isNaN(val) || !Boolean(val)) {
    newVal = Number($(obj).attr('value'));
  } else {
    var min = Number($(obj).attr('min')),
      max = Number($(obj).attr('max'));
    v = v < min ? min : v;
    v = v > max ? max : v;
    if (step > 0) {
      newVal = Math.round((Math.abs(v) * Math.pow(10, step)).toFixed(1)) / Math.pow(10, step);
      if (v < 0) newVal = -newVal;
    } else {
      newVal = Math.floor(v);
    }
  }
  return step > 0 ? newVal.toFixed(step) : newVal;
}

function loadConfig(config) {
  $('.container [name]').each(function () {
    var val = config[$(this).attr('name')];
    if (Boolean(val)) {
      var type = $(this).attr('type');
      if (type == 'checkbox') {
        $(this).prop('checked', val == 'yes');
      } else if (type == "number") {
        $(this).val(compareVal(this, val));
      } else {
        $(this).val(val);
      }
    }
  })
}

function setConfig() {
  var text = "<?xml version=\"1.0\" encoding=\"utf-8\"?><root ";
  $('.container [name]').each(function () {
    var name = $(this).attr('name');
    var val = $(this).val();
    var type = $(this).attr('type');
    if (type == 'checkbox') {
      text += name + "=\"" + ($(this).is(':checked') ? "yes" : "no") + "\" ";
    } else if (type == "number") {
      text += name + "=\"" + compareVal(this, val) + "\" ";
    } else {
      text += name + "=\"" + val + "\" ";
    }
  });
  text += " />";
  biSetModuleConfig("rs485gyl.plugin", text);
}

function biOnInitEx(config, moduleConfigs) {
  $('[language]').each(function () {
    var value = $(this).attr('language');
    if (biGetLanguage() == 1) {
      not_config = "<Not Configured>";
      $(this).text(en[value]);
    } else {
      not_config = "<未配置>";
      $(this).text(cn[value]);
    }
  });
  for (var key in moduleConfigs) {
    var parser = new DOMParser(); //创建一个空的xml文档对象
    var xmlDoc = parser.parseFromString(moduleConfigs[key], "text/xml"); //把名为modeleConfigs的字符串载入到解析器中
    var countrys = xmlDoc.getElementsByTagName('root'); //获取setconfig里面的root标签
    var keys = countrys[0].attributes; //获取root标签的属性名
    var obj = new Object();
    for (var i = 0; i < keys.length; i++) {
      obj[keys[i].nodeName] = keys[i].nodeValue;
    }
    loadConfig(obj);
  }
}