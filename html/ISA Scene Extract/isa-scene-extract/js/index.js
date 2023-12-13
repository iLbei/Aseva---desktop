// 2023/10/23 v1.0.0 首个版本
//仅步长=精确位数-1时适用
$("body").on("input", "input[type=number]", function (e) {
  var v = $(this).val();
  if (isNaN(e.which)) {
    $(this).attr("value", compareVal(this, v)).val(compareVal(this, v))
  } else {
    if (v !== 0 && Boolean(v)) $(this).attr("value", v);
  }
  setConfig();
});
$("body").on("blur", "input[type=number]", function () {
  $(this).attr("value", compareVal(this, $(this).val())).val(compareVal(this, $(this).val()));
});

function compareVal(obj, val) {
  val = val * 1;//解决科学计数法e计数法表示时不能正确识别的问题
  var newVal = 0;
  var name = $(obj).attr("name");
  var step = Number($(obj).attr("step").length) + 2;
  if (val !== 0 && (isNaN(val) || !Boolean(val))) {
    newVal = Number($(obj).attr('value'));
    return newVal.toFixed(step);
  } else {
    var min = 0,
      max = 100;
    switch (name) {
      case "sceneOffset": {
        min = -100;
        break;
      }
      default:
        break;
    }
    if (val > max) {
      return max.toFixed(step);
    } else if (val < min) {
      return min.toFixed(step);
    } else {
      //解决为负数时末尾输入5不能进行四舍五入
      newVal = Math.round(Math.abs(val) * Math.pow(10, step)) / Math.pow(10, step);
      if (val < 0) newVal = -newVal;
      if (step > 0) {
        var newValString = newVal.toString();
        var index = newValString.indexOf(".");
        if (index == -1) {
          return newVal.toFixed(step);
        } else {
          if (newValString.substring(index + 1).length == step) {
            return newVal;
          } else {
            return newVal + "0".repeat(step - (newValString.length - 2));
          }
        }
      } else {
        return newVal;
      }
    }
  }
}

/*----------配置读取与存储-----------*/
$('[name]').on("change", function () {
  if ($(this).attr("name") == "enableISASceneExtract") {
    checkboxChange(this);
  }
  setConfig();
});


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
      text += name + "=\"" + compareVal(this, val) + "\" ";
    }
  });
  text += " />";
  biSetModuleConfig("isa-scene-extract.isasceneextract", text);
}

function biOnInitEx(config, moduleConfigs) {
  var lang = biGetLanguage() == 1 ? en : zh;
  $('[language]').each(function () {
    var value = $(this).attr('language');
    $(this).text(lang[value])
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
  $('.container [name]').each(function () {
    var name = $(this).attr("name");
    var val = obj[name];
    if (!Boolean(val)) return;
    var type = $(this).attr('type');
    if (type == 'checkbox') {
      $(this).prop('checked', val == 'yes');
      checkboxChange(this);
    } else if (type == "number") {
      var v = compareVal(this, val);
      $(this).val(v).attr("value", v);
    }
  })
}

//部分界面Enable控制界面是否启用
function checkboxChange(obj) {
  if (!$(obj).is(':checked')) {
    $('ul>li [name]').addClass('disabled_background').attr('disabled', true);
    $("ul>li [language]").addClass('disabled_a');
  } else {
    $('ul>li [name]').removeClass('disabled_background').attr('disabled', false);
    $("ul>li [language]").removeClass('disabled_a');
  }
}