var reg = /^(1\d{2}|2[0-4]\d|25[0-5]|[1-9]\d|[0-9])\.((1\d{2}|2[0-4]\d|25[0-5]|[1-9]\d|\d)\.){2}(1\d{2}|2[0-4]\d|25[0-5]|[1-9]\d|\d)$/;
// $(function(){
//   var lang = biGetLanguage() == 1 ? en : cn;
//   $('[language]').each(function () {
//     var value = $(this).attr('language');
//     $(this).text(lang[value]);
//   });
// })
$("[name]").change(function () {
  setConfig()
});
$('.container').on("keyup", "input[type=text]", function () {
  var val = $(this).val();
  reg.test(val) ? $(this).addClass('green').attr("value", $(this).val()).removeClass('red') : $(this).removeClass('green').addClass('red');
  if (!$(this).hasClass('red')) setConfig();
}).on("blur", "input[type=text]", function () {
  if ($(this).val() == "" || $(this).hasClass('red')) {
    $(this).val($(this).attr('value')).addClass('green').removeClass('red');
  } else {
    setConfig();
  }
})

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
    var name = $(this).attr('name');
    var val = config[name];
    if (!Boolean(val)) return;
    var type = $(this).attr('type');
    if (type == 'checkbox') {
      $(this).prop('checked', val == 'yes');
    } else if (type == "number") {
      $(this).val(compareVal(this, val));
    } else {
      if (name == "ip") $(this).addClass(reg.test(val) ? "green" : "red");
      $(this).val(val);
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
  biSetModuleConfig("fr-can-to-udp.plugincansend", text);
}

function biOnInitEx(config, moduleConfigs) {
  var lang = biGetLanguage() == 1 ? en : cn;
  $('[language]').each(function () {
    var value = $(this).attr('language');
    $(this).text(lang[value]);
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