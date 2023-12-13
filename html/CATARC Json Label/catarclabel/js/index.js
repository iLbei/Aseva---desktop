// 2023/8/15 v1.0.0 首个版本
// 2023/10/16 v1.1.0 新增直道半径[straight_line_radius];
/*----------配置读取与存储-----------*/
// 表单内容改变保存配置
$('[name]').change(function () {
  if ($(this).attr("name") == "enabled") enabledChange();
  setConfig();
});

$('.container').on("change", "input[type=number]", function () {
  $(this).val(compareVal(this, $(this).val()));
}).on('input', "input[type=number]", function (e) {
  if (e.which == undefined) {
    $(this).attr("value", $(this).val());
  } else {
    $(this).attr("value", compareVal(this, $(this).val()))
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


function enabledChange() {
  if ($("[name=enabled]").is(":checked")) {
    $('.container>ul').find('[language]').removeClass('disabled_a');
    $('.container>ul [name]').attr('disabled', false).removeClass('disabled disabled_background');
  } else {
    $('.container>ul').find('[language]').addClass('disabled_a');
    $('.container>ul [name]').attr('disabled', true).addClass('disabled disabled_background');
  }
}
//保存配置
function setConfig() {
  var text = "<?xml version=\"1.0\" encoding=\"utf-8\"?><root ";
  $('.container [name]').each(function () {
    var name = $(this).attr('name');
    var val = $(this).val();
    var type = $(this).attr('type');
    if (type == 'checkbox') {
      text += name + "=\"" + ($(this).is(':checked') ? "yes" : "no") + "\" ";
    } else if (type == "number") {
      text += name + "=\"" + $(this).attr("value") + "\" ";
    } else {
      text += name + "=\"" + val + "\" ";
    }
  });
  text += " />";
  biSetModuleConfig("catarclabel.plugin", text);
}

//初始化
function biOnInitEx(config, moduleConfigs) {
  var lang = biGetLanguage() == 1 ? en : zh;
  $('[language]').each(function () {
    var value = $(this).attr('language');
    $(this).text(lang[value]);
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
    var type = $(this).attr('type');
    if (type == 'checkbox') {
      $(this).prop('checked', val == 'yes');
    } else if (type == "number") {
      var v = compareVal(this, val);
      $(this).val(v).attr("value", v);
    } else {
      $(this).val(val);
    }
  })
  enabledChange();
}