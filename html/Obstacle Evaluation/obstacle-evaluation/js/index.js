//2023/11/17 v2.3.1 修改布局，设置溢出隐藏
$('input[type=number]').on({
  'blur': function (e) {
    $(this).val(compareVal(this, $(this).val()));
  },
  'keypress': function (e) {
    if (e.charCode == 101 || e.charCode == 43) {
      return false;
    }
  },
  "input": function () {
    setConfig();
  }
})
//有input type=number 情况下比较大小
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

/*----------配置读取与存储-----------*/
function enabledChange() {
  if ($("[name=oeEnable]").is(":checked")) {
    $('.container>ul').find('[language]').removeClass('disabled_a');
    $('.container>ul [name]').attr('disabled', false).removeClass('disabled disabled_background');
  } else {
    $('.container>ul').find('[language]').addClass('disabled_a');
    $('.container>ul [name]').attr('disabled', true).addClass('disabled disabled_background');
  }
}
// 表单内容改变保存配置
$('[name]').change(function () {
  if ($(this).attr("name") == "oeEnable") enabledChange();
  setConfig();
});
//保存配置
function setConfig() {
  var text = "<?xml version=\"1.0\" encoding=\"utf-8\"?><root><config ";
  $('.container [name]').each(function () {
    var name = $(this).attr('name');
    var val = $(this).val();
    if ($(this).attr('type') == 'checkbox') {
      text += name + "=\"" + ($(this).is(':checked') ? "yes" : "no") + "\" ";
    } else if ($(this).attr("type") == "number") {
      text += name + "=\"" + compareVal(this, val) + "\" ";
    } else {
      text += name + "=\"" + val + "\" ";
    }
  });
  text += "/></root>";
  biSetModuleConfig("obstacle-evaluation.aspluginobstacleevaluation", text);
}
//初始化
function biOnInitEx(config, moduleConfigs) {
  var lang = biGetLanguage() == 1 ? en : cn;
  $('[language]').each(function () {
    var value = $(this).attr('language');
    $(this).html(lang[value])
  });
  for (var key in moduleConfigs) {
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(moduleConfigs[key], "text/xml");
    var obj = new Object();
    var root = xmlDoc.getElementsByTagName('config');
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
      $(this).prop('checked', val == 'yes' ? true : false);
    } else if (type == "number") {
      $(this).val(compareVal(this, val));
    } else {
      $(this).val(val);
    }
  })
  enabledChange();
}
